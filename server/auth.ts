import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { z } from "zod";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import connectPg from "connect-pg-simple";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Session configuration
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'durcheap-secret-key',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      // Remove maxAge to make it a session cookie (expires when browser closes)
      // maxAge: sessionTtl, // Commented out to enable automatic logout on browser close
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport Local Strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          console.log('🔍 Login attempt for email:', email);
          const user = await storage.getUserByEmail(email);
          
          if (!user) {
            console.log('❌ User not found for email:', email);
            return done(null, false, { message: 'Invalid email or password' });
          }
          
          console.log('✅ User found:', user.id, user.email);
          console.log('🔐 Checking password...');
          
          if (!user.password) {
            console.log('❌ User has no password set');
            return done(null, false, { message: 'Invalid email or password' });
          }
          
          const passwordMatch = await comparePasswords(password, user.password);
          console.log('🔐 Password match result:', passwordMatch);
          
          if (!passwordMatch) {
            console.log('❌ Password does not match');
            return done(null, false, { message: 'Invalid email or password' });
          }
          
          console.log('✅ Authentication successful for:', user.email);
          return done(null, user);
        } catch (error) {
          console.error('💥 Authentication error:', error);
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication routes
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const { email, password, username, firstName, lastName, role, referralCode } = req.body;

      // Validation
      if (!email || !password || !username || !firstName || !lastName) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Validate referral code if provided
      let validatedReferralCode = null;
      if (referralCode && referralCode.trim()) {
        const referrer = await storage.getUserByReferralCode(referralCode.trim());
        if (!referrer) {
          return res.status(400).json({ message: "Invalid referral code" });
        }
        validatedReferralCode = referralCode.trim();
      }

      // Create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        username,
        firstName,
        lastName,
        role: role || 'buyer',
        referredByCode: validatedReferralCode,
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      // Log user in
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: SelectUser, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }
        
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  // Update user profile (including default address)
  app.put("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const updateData = req.body;
      
      // Validation schema for user updates
      const updateUserSchema = z.object({
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        email: z.string().email().optional(),
        businessName: z.string().optional(),
        businessAddress: z.string().optional(),
        businessCity: z.string().optional(),
        businessState: z.string().optional(),
        businessZipCode: z.string().optional(),
        businessCountry: z.string().optional(),
        taxId: z.string().optional(),
        // Default address validation
        defaultAddress: z.string().min(1).optional(),
        defaultAddressLine2: z.string().optional(),
        defaultCity: z.string().min(1).optional(),
        defaultState: z.string().min(1).optional(),
        defaultZipCode: z.string().min(5).optional(),
        defaultCountry: z.string().min(1).optional(),
        defaultPhone: z.string().optional(),
      }).strict();

      // Validate the update data
      const validationResult = updateUserSchema.safeParse(updateData);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid input data",
          errors: validationResult.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      // Use the validated data directly (it's already safe)
      const safeUpdateData = validationResult.data;
      
      const updatedUser = await storage.updateUser(userId, safeUpdateData);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
}

// Authentication middleware
export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return next();
  }
  return res.status(401).json({ message: "Authentication required" });
}
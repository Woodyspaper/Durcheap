import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { twoFactorService } from "./twoFactorAuth";
import { nmiGateway } from "./payments/nationalProcessing";
import { insertProductSchema, insertReviewSchema, insertCartItemSchema, eventSubscriptionPlans, eventPostingRates, userEventSubscriptions, localEvents, users, taxRates, sellerTaxSettings, taxDocuments, taxTransactions, taxExemptCertificates, coupons, couponUsage, buyerMembershipPlans, buyerMemberships, membershipBenefits, membershipTransactions, products, orders, categories } from "@shared/schema";
import { eq, and, or, ilike, gte, lte, desc, asc, lt } from "drizzle-orm";
import { db } from "./db";
import { nanoid } from "nanoid";
import { seedDatabase } from "./seedData";
import { seedTaxRates, seedSampleTaxTransactions } from "./taxSeeds";
import { seedLocalEventsForPompanoBeach } from "./localEventSeeds";
import { taxDocumentGenerator } from "./taxDocuments";
import { z } from "zod";

// Function to seed buyer membership plans
async function seedBuyerMembershipPlans() {
  console.log("Seeding buyer membership plans...");
  
  const existingPlans = await db.select().from(buyerMembershipPlans);
  if (existingPlans.length > 0) {
    console.log("Membership plans already exist, skipping seed");
    return;
  }

  const membershipPlans = [
    {
      id: "durcheap_ultimate_rewards",
      name: "Durcheap Ultimate Rewards Membership",
      description: "Premium buyer membership with free shipping option on select orders, priority local search, verified local businesses, enhanced local delivery options, exclusive local deals, and priority customer support.",
      price: "4.99",
      billingInterval: "monthly",
      features: [
        "Free shipping option on select orders (10 per month)",
        "Priority local search results",
        "Verified local business access",
        "Enhanced local delivery options (20 per month)",
        "Exclusive local deals and discounts (50 per month)",
        "Priority customer support",
        "Early access to new features"
      ],
      isActive: true,
    }
  ];

  for (const plan of membershipPlans) {
    await db.insert(buyerMembershipPlans).values(plan);
  }
  
  console.log("Buyer membership plans seeded successfully");
}

// Function to seed subscription products
async function seedSubscriptionProducts() {
  console.log("Seeding subscription products...");
  
  const subscriptionProducts = [
    // Seller Subscription Plans
    {
      id: "subscription_pro",
      name: "Pro Subscription Plan",
      description: "Most popular for growing businesses - Unlimited listings, 7% commission, advanced seller tools, priority support, detailed analytics, local shipping incentives, and event marketing features.",
      price: "29.00",
      categoryId: "subscription_plans",
      sellerId: "system",
      stock: 999999,
      inventory: 999999,
      images: ["https://images.unsplash.com/photo-1563013544-824ae1b704d3"],
      brand: "Durcheap",
      isActive: true,
    },
    {
      id: "subscription_enterprise", 
      name: "Enterprise Subscription Plan",
      description: "For established businesses - Unlimited listings, 5% commission, enterprise seller tools, dedicated account manager, custom analytics, enhanced local incentives, API access, and premium event marketing.",
      price: "99.00",
      categoryId: "subscription_plans",
      sellerId: "system",
      stock: 999999,
      inventory: 999999,
      images: ["https://images.unsplash.com/photo-1556761175-b413da4baf72"],
      brand: "Durcheap",
      isActive: true,
    },
    
    // Event Marketing Subscriptions
    {
      id: "event_marketing_city",
      name: "City Event Marketing",
      description: "Reach customers in your city with targeted event marketing. Includes 5 events per month, basic analytics, and local promotion features.",
      price: "24.99",
      categoryId: "subscription_plans",
      sellerId: "system",
      stock: 999999,
      inventory: 999999,
      images: ["https://images.unsplash.com/photo-1540575467063-178a50c2df87"],
      brand: "Durcheap",
      isActive: true,
    },
    {
      id: "event_marketing_metro",
      name: "Metro Event Marketing",
      description: "Expand your reach across the metropolitan area. Includes 15 events per month, detailed analytics, sponsored listings, and priority placement.",
      price: "49.99",
      categoryId: "subscription_plans",
      sellerId: "system",
      stock: 999999,
      inventory: 999999,
      images: ["https://images.unsplash.com/photo-1559136555-9303baea8ebd"],
      brand: "Durcheap",
      isActive: true,
    },
    {
      id: "event_marketing_nationwide",
      name: "Nationwide Event Marketing",
      description: "Maximum exposure across the entire country. Unlimited events, premium analytics, featured placement, custom branding, and dedicated support.",
      price: "149.99",
      categoryId: "subscription_plans",
      sellerId: "system",
      stock: 999999,
      inventory: 999999,
      images: ["https://images.unsplash.com/photo-1551135049-8a33b5883817"],
      brand: "Durcheap",
      isActive: true,
    },

    // Single Event Advertising
    {
      id: "single_event_sponsored",
      name: "Sponsored Event Listing",
      description: "Promote a single event with sponsored placement, enhanced visibility, and priority positioning in search results for 30 days.",
      price: "29.99",
      categoryId: "subscription_plans",
      sellerId: "system",
      stock: 999999,
      inventory: 999999,
      images: ["https://images.unsplash.com/photo-1492684223066-81342ee5ff30"],
      brand: "Durcheap",
      isActive: true,
    },
    {
      id: "single_event_featured",
      name: "Featured Event Spotlight",
      description: "Maximum visibility for your event with featured placement on homepage, category pages, and premium positioning for 30 days.",
      price: "39.99",
      categoryId: "subscription_plans",
      sellerId: "system",
      stock: 999999,
      inventory: 999999,
      images: ["https://images.unsplash.com/photo-1505373877841-8d25f7d46678"],
      brand: "Durcheap",
      isActive: true,
    },

    // Professional Services
    {
      id: "tax_automation_service",
      name: "Tax Automation Service",
      description: "Comprehensive tax management including automated calculations, document generation, nexus tracking, and quarterly filing support.",
      price: "7.99",
      categoryId: "subscription_plans",
      sellerId: "system",
      stock: 999999,
      inventory: 999999,
      images: ["https://images.unsplash.com/photo-1554224155-6726b3ff858f"],
      brand: "Durcheap",
      isActive: true,
    },
    {
      id: "shipping_tools_premium",
      name: "Premium Shipping Tools",
      description: "Advanced shipping management with multi-carrier rate comparison, automated label generation, tracking, and analytics dashboard.",
      price: "4.99",
      categoryId: "subscription_plans",
      sellerId: "system",
      stock: 999999,
      inventory: 999999,
      images: ["https://images.unsplash.com/photo-1566576912321-d58ddd7a6088"],
      brand: "Durcheap",
      isActive: true,
    },
    {
      id: "white_label_enterprise",
      name: "Enterprise White-Label Marketplace",
      description: "Private enterprise white-label marketplace solution with complete customization, dedicated infrastructure, and 24/7 support.",
      price: "499.99",
      categoryId: "subscription_plans",
      sellerId: "system",
      stock: 999999,
      inventory: 999999,
      images: ["https://images.unsplash.com/photo-1460925895917-afdab827c52f"],
      brand: "Durcheap",
      isActive: false,
    },

    // Business Verification Services
    {
      id: "business_verification",
      name: "Business Verification",
      description: "Professional business verification service including documentation review, compliance checking, and verified seller badge.",
      price: "24.00",
      categoryId: "subscription_plans",
      sellerId: "system",
      stock: 999999,
      inventory: 999999,
      images: ["https://images.unsplash.com/photo-1450101499163-c8848c66ca85"],
      brand: "Durcheap",
      isActive: true,
    },
    {
      id: "local_plus_membership",
      name: "Local+ Membership",
      description: "Premium local marketplace features including priority local search placement, enhanced local delivery options, and exclusive local deals.",
      price: "4.99",
      categoryId: "subscription_plans",
      sellerId: "system",
      stock: 999999,
      inventory: 999999,
      images: ["https://images.unsplash.com/photo-1449824913935-59a10b8d2000"],
      brand: "Durcheap",
      isActive: true,
    },

    // API and Integration Services
    {
      id: "api_access_premium",
      name: "Premium API Access",
      description: "Full API access with higher rate limits, webhook support, real-time data sync, and priority technical support.",
      price: "49.99",
      categoryId: "subscription_plans",
      sellerId: "system",
      stock: 999999,
      inventory: 999999,
      images: ["https://images.unsplash.com/photo-1555949963-aa79dcee981c"],
      brand: "Durcheap",
      isActive: true,
    },
    {
      id: "analytics_pro",
      name: "Analytics Pro Suite",
      description: "Advanced analytics with custom reporting, competitor insights, market trends, customer behavior analysis, and export capabilities.",
      price: "39.99",
      categoryId: "subscription_plans",
      sellerId: "system",
      stock: 999999,
      inventory: 999999,
      images: ["https://images.unsplash.com/photo-1551288049-bebda4e38f71"],
      brand: "Durcheap",
      isActive: true,
    }
  ];

  const { products } = await import("@shared/schema");
  
  for (const product of subscriptionProducts) {
    try {
      const existingProduct = await db.select().from(products).where(eq(products.id, product.id));
      if (existingProduct.length === 0) {
        await db.insert(products).values(product);
        console.log(`Added subscription product: ${product.name}`);
      }
    } catch (error) {
      console.log(`Subscription product ${product.id} already exists, skipping`);
    }
  }
}

// Helper function to validate subscription plan features
function validateSubscriptionFeatures(subscriptionPlan: string, productData: any): { isValid: boolean; errors: string[]; filteredData: any } {
  const errors: string[] = [];
  const filteredData = { ...productData };
  
  // Define premium features by plan
  const premiumFeatures = {
    basic: ['name', 'description', 'price', 'categoryId', 'stock', 'inventory', 'condition', 'conditionDescription', 'country', 'state', 'city', 'zipCode', 'isLocal', 'brand'],
    pro: ['name', 'description', 'price', 'originalPrice', 'categoryId', 'stock', 'inventory', 'images', 'videoUrl', 'specifications', 'condition', 'conditionDescription', 'country', 'state', 'city', 'zipCode', 'isLocal', 'brand'],
    enterprise: ['name', 'description', 'price', 'originalPrice', 'categoryId', 'stock', 'inventory', 'images', 'videoUrl', 'specifications', 'condition', 'conditionDescription', 'country', 'state', 'city', 'zipCode', 'isLocal', 'brand', 'isSubscription', 'subscriptionFrequency', 'subscriptionBillingCycle', 'trialPeriodDays']
  };
  
  const allowedFields = premiumFeatures[subscriptionPlan as keyof typeof premiumFeatures] || premiumFeatures.basic;
  
  // Check for premium field violations and build error messages
  if (subscriptionPlan === 'basic') {
    if (productData.originalPrice && parseFloat(productData.originalPrice) > 0) {
      errors.push('Original price feature requires Pro or Enterprise plan');
      delete filteredData.originalPrice;
    }
    if (productData.videoUrl) {
      errors.push('Video URL feature requires Pro or Enterprise plan');
      delete filteredData.videoUrl;
    }
    if (productData.images && productData.images.length > 1) {
      errors.push('Multiple images feature requires Pro or Enterprise plan');
      filteredData.images = productData.images.slice(0, 1);
    }
    if (productData.specifications && Object.keys(productData.specifications).length > 0) {
      errors.push('Custom specifications feature requires Pro or Enterprise plan');
      delete filteredData.specifications;
    }
    if (productData.isSubscription) {
      errors.push('Subscription products feature requires Enterprise plan');
      delete filteredData.isSubscription;
      delete filteredData.subscriptionFrequency;
      delete filteredData.subscriptionBillingCycle;
      delete filteredData.trialPeriodDays;
    }
  } else if (subscriptionPlan === 'pro') {
    if (productData.isSubscription) {
      errors.push('Subscription products feature requires Enterprise plan');
      delete filteredData.isSubscription;
      delete filteredData.subscriptionFrequency;
      delete filteredData.subscriptionBillingCycle;
      delete filteredData.trialPeriodDays;
    }
  }
  
  // Convert price and originalPrice to strings for decimal fields
  if (filteredData.price && typeof filteredData.price === 'number') {
    filteredData.price = filteredData.price.toString();
  }
  if (filteredData.originalPrice && typeof filteredData.originalPrice === 'number') {
    filteredData.originalPrice = filteredData.originalPrice.toString();
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    filteredData
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Seed database with sample data
  await seedDatabase();
  await seedTaxRates();
  await seedSampleTaxTransactions();
  await seedSubscriptionProducts();
  await seedSampleCoupons();
  await seedBuyerMembershipPlans();
  
  // Seed event data
  try {
    const { seedEventData } = await import("./eventSeeds");
    await seedEventData();
    await seedLocalEventsForPompanoBeach();
  } catch (error) {
    console.log("Event seeding skipped - already exists");
  }

// Function to seed sample coupons
async function seedSampleCoupons() {
  console.log("Seeding sample coupons...");
  
  const existingCoupons = await db.select().from(coupons).limit(1);
  if (existingCoupons.length === 0) {
    await db.insert(coupons).values([
      {
        code: "WELCOME10",
        name: "Welcome 10% Off",
        description: "10% off your first order - new customers only",
        discountType: "percentage",
        discountValue: "10.00",
        minimumOrderAmount: "25.00",
        maximumDiscountAmount: "50.00",
        usageLimit: 1000,
        userUsageLimit: 1,
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        createdBy: "system",
      },
      {
        code: "SAVE20",
        name: "$20 Off Orders Over $100",
        description: "Get $20 off when you spend $100 or more",
        discountType: "fixed_amount",
        discountValue: "20.00",
        minimumOrderAmount: "100.00",
        usageLimit: 500,
        userUsageLimit: 3,
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        createdBy: "system",
      },
      {
        code: "FREESHIP",
        name: "Free Shipping",
        description: "Free shipping on any order",
        discountType: "free_shipping",
        discountValue: "0.00",
        minimumOrderAmount: "0.00",
        usageLimit: null, // unlimited
        userUsageLimit: 5,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        createdBy: "system",
      },
      {
        code: "FLASH25",
        name: "Flash Sale 25% Off",
        description: "Limited time 25% off everything - hurry!",
        discountType: "percentage",
        discountValue: "25.00",
        minimumOrderAmount: "50.00",
        maximumDiscountAmount: "100.00",
        usageLimit: 100,
        userUsageLimit: 1,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdBy: "system",
      },
      {
        code: "1YEARFREE",
        name: "1 Year Free Subscription Value",
        description: "Get up to 12 months worth of subscription services free (e.g., Pro plan: $348 value, Enterprise: $1,188 value). Discount limited to 1 year subscription value. One use per account.",
        discountType: "subscription_only",
        discountValue: "100.00",
        minimumOrderAmount: "0.00",
        usageLimit: 50, // Limited special promotion
        userUsageLimit: 1, // Strictly one per customer - no exceptions
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        createdBy: "system",
        applicableCategories: ["subscription_plans"], // Only applies to subscription categories
      }
    ]);
    console.log("Sample coupons added");
  } else {
    console.log("Coupons already exist, skipping seed");
  }
}

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      if (!userId) {
        return res.status(401).json({ message: "User ID not found" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Employee Management Routes (Admin Only)
  app.get('/api/admin/employees', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const currentUser = await storage.getUser(userId);
      
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const employees = await db.select({
        id: users.id,
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        role: users.role,
        twoFactorEnabled: users.twoFactorEnabled,
        subscriptionPlan: users.subscriptionPlan,
        subscriptionStatus: users.subscriptionStatus,
        businessName: users.businessName,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      }).from(users).orderBy(desc(users.createdAt));
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.post('/api/admin/employees', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const currentUser = await storage.getUser(userId);
      
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { email, role } = req.body;
      
      if (!email || !role) {
        return res.status(400).json({ message: "Email and role are required" });
      }

      if (!['buyer', 'seller', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role specified" });
      }

      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
      
      if (existingUser.length > 0) {
        // Update existing user's role
        const [updatedUser] = await db
          .update(users)
          .set({ role, updatedAt: new Date() })
          .where(eq(users.email, email))
          .returning();
        
        res.json({ message: "Employee role updated successfully", user: updatedUser });
      } else {
        // Create new user (they'll complete setup when they first log in)
        const [newUser] = await db
          .insert(users)
          .values({
            id: `pending_${Date.now()}`, // Temporary ID until they log in
            email,
            role,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
        
        res.json({ message: "Employee added successfully", user: newUser });
      }
    } catch (error) {
      console.error("Error adding employee:", error);
      res.status(500).json({ message: "Failed to add employee" });
    }
  });

  app.patch('/api/admin/employees/:employeeId/role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const currentUser = await storage.getUser(userId);
      
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { employeeId } = req.params;
      const { role } = req.body;
      
      if (!role || !['buyer', 'seller', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role specified" });
      }

      const [updatedUser] = await db
        .update(users)
        .set({ role, updatedAt: new Date() })
        .where(eq(users.id, employeeId))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.json({ message: "Employee role updated successfully", user: updatedUser });
    } catch (error) {
      console.error("Error updating employee role:", error);
      res.status(500).json({ message: "Failed to update employee role" });
    }
  });

  app.delete('/api/admin/employees/:employeeId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const currentUser = await storage.getUser(userId);
      
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { employeeId } = req.params;
      
      // Don't allow admin to remove their own access
      if (employeeId === userId) {
        return res.status(400).json({ message: "Cannot remove your own admin access" });
      }

      // Get the employee to check their current role
      const [employee] = await db.select().from(users).where(eq(users.id, employeeId)).limit(1);
      
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // If they're a seller, check for active products and orders
      if (employee.role === 'seller') {
        // Check for active products
        const activeProducts = await db.select().from(products).where(
          and(eq(products.sellerId, employeeId), eq(products.isActive, true))
        );

        // Check for pending/processing orders
        const activeOrders = await db.select().from(orders).where(
          and(
            eq(orders.sellerId, employeeId),
            or(
              eq(orders.status, 'pending'),
              eq(orders.status, 'processing'),
              eq(orders.status, 'shipped')
            )
          )
        );

        if (activeProducts.length > 0 || activeOrders.length > 0) {
          return res.status(400).json({
            message: "Cannot remove seller access",
            details: {
              activeProducts: activeProducts.length,
              activeOrders: activeOrders.length,
              suggestion: "Please transfer or complete all active products and orders first"
            }
          });
        }

        // Deactivate all their products to prevent new orders
        await db.update(products)
          .set({ isActive: false, updatedAt: new Date() })
          .where(eq(products.sellerId, employeeId));
      }

      // Set role back to buyer
      const [updatedUser] = await db
        .update(users)
        .set({ role: 'buyer', updatedAt: new Date() })
        .where(eq(users.id, employeeId))
        .returning();

      res.json({ 
        message: "Employee access revoked successfully",
        wasSellerWithProducts: employee.role === 'seller',
        productsDeactivated: employee.role === 'seller'
      });
    } catch (error) {
      console.error("Error removing employee:", error);
      res.status(500).json({ message: "Failed to remove employee" });
    }
  });

  // Seller Transition Management Routes
  app.get('/api/admin/sellers/transition-data', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const currentUser = await storage.getUser(userId);
      
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const sellers = await db.select().from(users).where(eq(users.role, 'seller'));
      const transitionData = [];

      for (const seller of sellers) {
        const activeProducts = await db.select().from(products).where(
          and(eq(products.sellerId, seller.id), eq(products.isActive, true))
        );

        const activeOrders = await db.select().from(orders).where(
          and(
            eq(orders.sellerId, seller.id),
            or(
              eq(orders.status, 'pending'),
              eq(orders.status, 'processing'),
              eq(orders.status, 'shipped')
            )
          )
        );

        transitionData.push({
          seller,
          activeProducts,
          activeOrders,
          canTransition: activeOrders.length === 0
        });
      }

      res.json(transitionData);
    } catch (error) {
      console.error("Error fetching seller transition data:", error);
      res.status(500).json({ message: "Failed to fetch seller data" });
    }
  });

  app.post('/api/admin/transfer-products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const currentUser = await storage.getUser(userId);
      
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { fromSellerId, toSellerId } = req.body;
      
      if (!fromSellerId || !toSellerId) {
        return res.status(400).json({ message: "Both seller IDs are required" });
      }

      // Verify target seller exists and has appropriate role
      const [targetSeller] = await db.select().from(users).where(eq(users.id, toSellerId)).limit(1);
      if (!targetSeller || !['seller', 'admin'].includes(targetSeller.role)) {
        return res.status(400).json({ message: "Invalid target seller" });
      }

      // Transfer all products
      const transferredProducts = await db
        .update(products)
        .set({ sellerId: toSellerId, updatedAt: new Date() })
        .where(eq(products.sellerId, fromSellerId))
        .returning();

      res.json({ 
        message: "Products transferred successfully",
        transferredCount: transferredProducts.length,
        fromSeller: fromSellerId,
        toSeller: toSellerId
      });
    } catch (error) {
      console.error("Error transferring products:", error);
      res.status(500).json({ message: "Failed to transfer products" });
    }
  });

  app.post('/api/admin/deactivate-products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const currentUser = await storage.getUser(userId);
      
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { sellerId } = req.body;
      
      if (!sellerId) {
        return res.status(400).json({ message: "Seller ID is required" });
      }

      // Deactivate all products for this seller
      const deactivatedProducts = await db
        .update(products)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(products.sellerId, sellerId))
        .returning();

      res.json({ 
        message: "Products deactivated successfully",
        deactivatedCount: deactivatedProducts.length
      });
    } catch (error) {
      console.error("Error deactivating products:", error);
      res.status(500).json({ message: "Failed to deactivate products" });
    }
  });

  // Cryptocurrency prices endpoint
  app.get("/api/crypto/prices", async (req, res) => {
    try {
      // Only fetch stablecoin prices for acceptable currency
      const cryptoIds = ['usd-coin', 'tether', 'dai', 'binance-usd'];
      
      const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds.join(',')}&vs_currencies=usd&include_24hr_change=true`;
      
      const response = await fetch(apiUrl);
      const priceData = await response.json();
      
      // Only include stablecoins as acceptable currency
      const cryptoMetadata = [
        { symbol: "usdc", name: "USD Coin", icon: "$", apiId: "usd-coin" },
        { symbol: "usdt", name: "Tether", icon: "₮", apiId: "tether" },
        { symbol: "dai", name: "Dai", icon: "◈", apiId: "dai" },
        { symbol: "busd", name: "Binance USD", icon: "🟡", apiId: "binance-usd" },
      ];
      
      const formattedRates = cryptoMetadata.map(crypto => {
        const apiData = priceData[crypto.apiId];
        return {
          symbol: crypto.symbol,
          name: crypto.name,
          icon: crypto.icon,
          price_usd: apiData?.usd || 0,
          percent_change_24h: apiData?.usd_24h_change || 0,
        };
      });
      
      res.json(formattedRates);
    } catch (error) {
      console.error("Error fetching crypto prices:", error);
      res.status(500).json({ message: "Failed to fetch cryptocurrency prices" });
    }
  });

  app.patch('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const updateData = req.body;
      
      // Update user profile
      const updatedUser = await storage.updateUser(userId, updateData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Category routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Categories endpoints
  app.get('/api/categories', async (req, res) => {
    try {
      const withSubcategories = req.query.includeSubcategories === 'true';
      const categories = withSubcategories 
        ? await storage.getCategoriesWithSubcategories()
        : await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get('/api/categories/:id', async (req, res) => {
    try {
      const category = await storage.getCategoryById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const filters = {
        category: req.query.category as string,
        search: req.query.search as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        sortBy: req.query.sortBy as string,
        limit: req.query.limit ? Number(req.query.limit) : 20,
        offset: req.query.offset ? Number(req.query.offset) : 0,
        // Shop local filters
        shopLocal: req.query.shopLocal === 'true',
        country: req.query.country as string,
        state: req.query.state as string,
        city: req.query.city as string,
        zipCode: req.query.zipCode as string,
        condition: req.query.condition as string,
        // User location for local prioritization
        userLocation: {
          country: req.query.userCountry as string,
          state: req.query.userState as string,
          city: req.query.userCity as string,
          zipCode: req.query.userZipCode as string,
        }
      };

      const result = await storage.getProducts(filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
        return res.status(403).json({ message: "Only sellers can create products" });
      }

      // Check listing limits for basic and pro users
      if (user.role !== 'admin') {
        const subscriptionInfo = await storage.getUserSubscriptionPlan(userId);
        const currentActiveListings = await storage.getActiveProductCountBySeller(userId);
        
        if (subscriptionInfo.limit !== -1 && currentActiveListings >= subscriptionInfo.limit) {
          const planNames = { basic: 'Basic', pro: 'Pro', enterprise: 'Enterprise' };
          const planName = planNames[subscriptionInfo.plan as keyof typeof planNames] || 'Basic';
          
          return res.status(403).json({ 
            message: `Listing limit reached. Your ${planName} plan allows ${subscriptionInfo.limit} active listings. You currently have ${currentActiveListings} active listings. Please upgrade your plan or deactivate some existing products.`,
            currentListings: currentActiveListings,
            maxListings: subscriptionInfo.limit,
            plan: subscriptionInfo.plan
          });
        }

        // Validate subscription plan features
        const subscriptionPlan = user.subscriptionPlan || 'basic';
        const featureValidation = validateSubscriptionFeatures(subscriptionPlan, req.body);
        
        if (!featureValidation.isValid) {
          return res.status(403).json({ 
            message: "Premium features not available on your current plan", 
            errors: featureValidation.errors,
            plan: subscriptionPlan
          });
        }

        // Use filtered data that removes disallowed fields
        const productData = insertProductSchema.parse({ ...featureValidation.filteredData, sellerId: userId });
        const product = await storage.createProduct(productData);
        res.status(201).json(product);
      } else {
        // Admin users bypass feature restrictions but still need proper data formatting
        const adminData = { ...req.body };
        if (adminData.price && typeof adminData.price === 'number') {
          adminData.price = adminData.price.toString();
        }
        if (adminData.originalPrice && typeof adminData.originalPrice === 'number') {
          adminData.originalPrice = adminData.originalPrice.toString();
        }
        
        const productData = insertProductSchema.parse({ ...adminData, sellerId: userId });
        const product = await storage.createProduct(productData);
        res.status(201).json(product);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      const product = await storage.getProductById(req.params.id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (!user || (user.role !== 'admin' && product.sellerId !== userId)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updateData = insertProductSchema.partial().parse(req.body);
      const updatedProduct = await storage.updateProduct(req.params.id, updateData);
      res.json(updatedProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      const product = await storage.getProductById(req.params.id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (!user || (user.role !== 'admin' && product.sellerId !== userId)) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Seller routes
  app.get('/api/seller/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
        return res.status(403).json({ message: "Access denied" });
      }

      const products = await storage.getProductsBySeller(userId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching seller products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get seller listing limits and current count
  app.get('/api/seller/listing-limits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
        return res.status(403).json({ message: "Access denied" });
      }

      const subscriptionInfo = await storage.getUserSubscriptionPlan(userId);
      const currentActiveListings = await storage.getActiveProductCountBySeller(userId);
      
      res.json({
        plan: subscriptionInfo.plan,
        maxListings: subscriptionInfo.limit,
        currentListings: currentActiveListings,
        remainingListings: subscriptionInfo.limit === -1 ? -1 : subscriptionInfo.limit - currentActiveListings,
        canAddMore: subscriptionInfo.limit === -1 || currentActiveListings < subscriptionInfo.limit
      });
    } catch (error) {
      console.error("Error fetching listing limits:", error);
      res.status(500).json({ message: "Failed to fetch listing limits" });
    }
  });

  // Review routes
  app.get('/api/products/:id/reviews', async (req, res) => {
    try {
      const reviews = await storage.getProductReviews(req.params.id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/products/:id/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        productId: req.params.id,
        userId,
      });

      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // User event management routes
  app.get('/api/user/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      // Mock event data - in production this would query event_posts table
      const mockEvents = [
        {
          id: 'event1',
          title: 'Tech Meetup Downtown',
          description: 'Join us for a tech meetup featuring the latest in AI and web development.',
          eventDate: '2025-01-30T18:00:00Z',
          location: 'Downtown Tech Hub, 123 Main St',
          category: 'Technology',
          price: 0,
          maxAttendees: 50,
          currentAttendees: 23,
          status: 'active',
          advertisingType: 'sponsored',
          views: 245,
          clicks: 34,
          conversions: 12,
          createdAt: '2025-01-15T10:00:00Z',
          imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400'
        },
        {
          id: 'event2',
          title: 'Art Gallery Opening',
          description: 'Exclusive opening of our new contemporary art exhibition.',
          eventDate: '2025-02-05T19:00:00Z',
          location: 'City Art Gallery, 456 Arts Ave',
          category: 'Arts & Culture',
          price: 25,
          maxAttendees: 100,
          currentAttendees: 67,
          status: 'active',
          advertisingType: 'featured',
          views: 892,
          clicks: 156,
          conversions: 45,
          createdAt: '2025-01-10T14:30:00Z',
          imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400'
        }
      ];
      res.json(mockEvents);
    } catch (error) {
      console.error('Error fetching user events:', error);
      res.status(500).json({ message: 'Failed to fetch events' });
    }
  });

  app.get('/api/user/events/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      // Mock analytics data
      const mockAnalytics = {
        totalViews: 1137,
        totalClicks: 190,
        totalConversions: 57,
        conversionRate: 30.0,
        averageEngagement: 16.7,
        recentEvents: [
          {
            id: 'event1',
            title: 'Tech Meetup Downtown',
            eventDate: '2025-01-30T18:00:00Z',
            views: 245,
            clicks: 34,
            conversions: 12
          },
          {
            id: 'event2',
            title: 'Art Gallery Opening',
            eventDate: '2025-02-05T19:00:00Z',
            views: 892,
            clicks: 156,
            conversions: 45
          }
        ]
      };
      res.json(mockAnalytics);
    } catch (error) {
      console.error('Error fetching event analytics:', error);
      res.status(500).json({ message: 'Failed to fetch analytics' });
    }
  });

  app.delete('/api/events/:eventId', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;
      console.log(`Deleting event ${eventId} for user ${userId}`);
      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ message: 'Failed to delete event' });
    }
  });

  app.patch('/api/events/:eventId/status', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId } = req.params;
      const { status } = req.body;
      const userId = req.user.id;
      console.log(`Updating event ${eventId} status to ${status} for user ${userId}`);
      res.json({ message: 'Event status updated successfully' });
    } catch (error) {
      console.error('Error updating event status:', error);
      res.status(500).json({ message: 'Failed to update event status' });
    }
  });

  // Social sharing analytics endpoint
  app.post('/api/events/analytics/share', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId, platform, message } = req.body;
      const userId = req.user.id;
      
      console.log(`Event ${eventId} shared on ${platform} by user ${userId}`);
      console.log(`Share message length: ${message.length} characters`);
      
      // In production, this would save to social_shares table
      res.json({ message: 'Share tracked successfully' });
    } catch (error) {
      console.error('Error tracking social share:', error);
      res.status(500).json({ message: 'Failed to track share' });
    }
  });

  // Cart routes
  app.get('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { productId, quantity } = req.body;

      if (!productId || !quantity || quantity < 1) {
        return res.status(400).json({ message: "Invalid product ID or quantity" });
      }

      const cartItem = await storage.addToCart(userId, productId, quantity);
      res.status(201).json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.put('/api/cart/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { quantity } = req.body;

      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }

      const cartItem = await storage.updateCartItem(req.params.id, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete('/api/cart/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.removeFromCart(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  app.delete('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.clearCart(userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Coupon code endpoints
  app.post("/api/coupons/validate", isAuthenticated, async (req: any, res) => {
    try {
      const { couponCode, cartTotal } = req.body;
      const userId = req.user.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validation = await storage.validateCoupon(couponCode, userId, cartTotal);
      res.json(validation);
    } catch (error: any) {
      console.error("Error validating coupon:", error);
      res.status(500).json({ message: "Failed to validate coupon" });
    }
  });

  app.post("/api/coupons/apply", isAuthenticated, async (req: any, res) => {
    try {
      const { couponCode, cartTotal, cartItems } = req.body;
      const userId = req.user.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await storage.applyCoupon(couponCode, userId, cartTotal, cartItems);
      res.json(result);
    } catch (error: any) {
      console.error("Error applying coupon:", error);
      res.status(500).json({ message: error.message || "Failed to apply coupon" });
    }
  });

  app.delete("/api/coupons/remove", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      await storage.removeCouponFromCart(userId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error removing coupon:", error);
      res.status(500).json({ message: "Failed to remove coupon" });
    }
  });

  // Checkout route - create order from cart items
  app.post('/api/checkout', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { shippingAddress, paymentMethod } = req.body;

      if (!shippingAddress || !paymentMethod) {
        return res.status(400).json({ message: "Shipping address and payment method are required" });
      }

      // Get user's cart items
      const cartItems = await storage.getCartItems(userId);
      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Calculate totals from cart items
      let subtotal = 0;
      const items = cartItems.map(cartItem => {
        const itemTotal = parseFloat(cartItem.product.price) * cartItem.quantity;
        subtotal += itemTotal;
        return {
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          price: parseFloat(cartItem.product.price)
        };
      });

      const tax = subtotal * 0.08; // 8% tax
      const total = subtotal + tax;

      // For multi-seller carts, use the first seller's ID or create a system seller
      const primarySellerId = cartItems[0]?.product?.sellerId || "system";

      const orderData = {
        userId,
        sellerId: primarySellerId,
        status: "pending",
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        total: total.toString(),
        shippingCost: "0",
        shippingAddress,
        paymentMethod,
      };

      // Create order from cart items
      const order = await storage.createOrder(orderData, items);
      
      // Clear cart after successful order
      await storage.clearCart(userId);

      return res.status(201).json(order);
    } catch (error) {
      console.error("Error processing checkout:", error);
      return res.status(500).json({ message: "Failed to process checkout" });
    }
  });

  // Order routes
  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { shippingAddress, paymentMethod, items } = req.body;

      if (!shippingAddress || !paymentMethod || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Invalid order data" });
      }

      // Calculate totals
      let subtotal = 0;
      for (const item of items) {
        subtotal += item.price * item.quantity;
      }
      const tax = subtotal * 0.08; // 8% tax
      const total = subtotal + tax;

      // For direct orders, determine seller from first item or use system
      const primarySellerId = items[0]?.sellerId || "system";

      const orderData = {
        userId,
        sellerId: primarySellerId,
        status: "pending",
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        total: total.toString(),
        shippingCost: "0",
        shippingAddress,
        paymentMethod,
      };

      const order = await storage.createOrder(orderData, items);
      
      // Clear cart after successful order
      await storage.clearCart(userId);

      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const order = await storage.getOrderById(req.params.id);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check if user owns this order or is admin
      const user = await storage.getUser(userId);
      if (order.userId !== userId && user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const allUsers = await db.select({
        id: users.id,
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        role: users.role,
        twoFactorEnabled: users.twoFactorEnabled,
        subscriptionPlan: users.subscriptionPlan,
        subscriptionStatus: users.subscriptionStatus,
        businessName: users.businessName,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      }).from(users).orderBy(desc(users.createdAt));
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.put('/api/admin/orders/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const order = await storage.updateOrderStatus(req.params.id, status);
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Seller product management routes

  app.patch("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const productId = req.params.id;
      
      const existingProduct = await storage.getProductById(productId);
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (existingProduct.sellerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const product = await storage.updateProduct(productId, req.body);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const productId = req.params.id;
      
      const existingProduct = await storage.getProductById(productId);
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (existingProduct.sellerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteProduct(productId);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  app.get("/api/seller/products", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const products = await storage.getSellerProducts(userId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching seller products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Bulk import products
  app.post('/api/products/bulk', isAuthenticated, async (req: any, res) => {
    try {
      const { products } = req.body;
      const userId = req.user?.id;
      const user = await storage.getUser(userId);

      if (!products || !Array.isArray(products)) {
        return res.status(400).json({ message: 'Products array is required' });
      }

      if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
        return res.status(403).json({ message: "Only sellers can import products" });
      }

      // Check listing limits for bulk import
      if (user.role !== 'admin') {
        const subscriptionInfo = await storage.getUserSubscriptionPlan(userId);
        const currentActiveListings = await storage.getActiveProductCountBySeller(userId);
        const productsToImport = products.length;

        if (subscriptionInfo.limit !== -1 && (currentActiveListings + productsToImport) > subscriptionInfo.limit) {
          const planNames = { basic: 'Basic', pro: 'Pro', enterprise: 'Enterprise' };
          const planName = planNames[subscriptionInfo.plan as keyof typeof planNames] || 'Basic';
          
          return res.status(403).json({ 
            message: `Bulk import would exceed listing limit. Your ${planName} plan allows ${subscriptionInfo.limit} active listings. You currently have ${currentActiveListings} active listings and are trying to import ${productsToImport} more products. Please upgrade your plan or reduce the number of products to import.`,
            currentListings: currentActiveListings,
            maxListings: subscriptionInfo.limit,
            productsToImport,
            plan: subscriptionInfo.plan
          });
        }

        // Validate subscription plan features for bulk import
        const subscriptionPlan = user.subscriptionPlan || 'basic';
        const featureViolations: string[] = [];
        
        // Pre-validate all products for subscription plan violations
        for (let i = 0; i < products.length; i++) {
          const productData = products[i];
          const featureValidation = validateSubscriptionFeatures(subscriptionPlan, productData);
          
          if (!featureValidation.isValid) {
            featureViolations.push(`Row ${i + 1}: ${featureValidation.errors.join(', ')}`);
          }
        }

        if (featureViolations.length > 0) {
          return res.status(403).json({ 
            message: "Bulk import contains premium features not available on your current plan", 
            errors: featureViolations.slice(0, 10), // Show first 10 violations
            totalViolations: featureViolations.length,
            plan: subscriptionPlan
          });
        }
      }

      const results = [];
      let created = 0;
      let errors = 0;

      for (const productData of products) {
        try {
          let processedData;

          if (user.role !== 'admin') {
            // Apply subscription plan filtering for non-admin users
            const subscriptionPlan = user.subscriptionPlan || 'basic';
            const featureValidation = validateSubscriptionFeatures(subscriptionPlan, productData);
            
            processedData = {
              ...featureValidation.filteredData,
              sellerId: userId,
              id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              stock: featureValidation.filteredData.inventory || 0,
              images: featureValidation.filteredData.images?.filter((url: string) => url.trim() !== '') || [featureValidation.filteredData.imageUrl].filter(Boolean),
            };
          } else {
            // Admin users bypass feature restrictions but still need proper data formatting
            const adminData = { ...productData };
            if (adminData.price && typeof adminData.price === 'number') {
              adminData.price = adminData.price.toString();
            }
            if (adminData.originalPrice && typeof adminData.originalPrice === 'number') {
              adminData.originalPrice = adminData.originalPrice.toString();
            }
            
            processedData = {
              ...adminData,
              sellerId: userId,
              id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              stock: adminData.inventory || 0,
              images: adminData.images?.filter((url: string) => url.trim() !== '') || [adminData.imageUrl].filter(Boolean),
            };
          }
          
          const product = await storage.createProduct(processedData);
          results.push({ success: true, product });
          created++;
        } catch (error: any) {
          results.push({ success: false, error: error.message });
          errors++;
        }
      }

      res.json({
        message: `Import completed: ${created} created, ${errors} errors`,
        created,
        errors,
        results
      });
    } catch (error) {
      console.error('Error importing products:', error);
      res.status(500).json({ message: 'Failed to import products' });
    }
  });

  // Export products
  app.get('/api/products/export', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const products = await storage.getSellerProducts(userId);

      // Format products for CSV export
      const exportData = products.map(product => ({
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId: product.categoryId,
        inventory: product.stock,
        imageUrl1: product.images?.[0] || '',
        imageUrl2: product.images?.[1] || '',
        imageUrl3: product.images?.[2] || '',
        imageUrl4: product.images?.[3] || '',
        imageUrl5: product.images?.[4] || '',
        videoUrl: product.videoUrl || '',
        brand: product.brand,
        condition: product.condition,
        conditionDescription: product.conditionDescription,
        country: product.country,
        state: product.state,
        city: product.city,
        zipCode: product.zipCode,
        isLocal: product.isLocal
      }));

      res.json({ products: exportData });
    } catch (error) {
      console.error('Error exporting products:', error);
      res.status(500).json({ message: 'Failed to export products' });
    }
  });

  // Wishlist routes
  app.get('/api/wishlist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      // For now, return empty array since we haven't implemented database storage yet
      res.json([]);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  app.post('/api/wishlist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { productId } = req.body;
      
      // For now, just return success
      res.json({ success: true, message: "Added to wishlist" });
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      res.status(500).json({ message: "Failed to add to wishlist" });
    }
  });

  app.delete('/api/wishlist/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      // For now, just return success
      res.json({ success: true, message: "Removed from wishlist" });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });



  app.post('/api/placeholder/earn', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { points, activity, description } = req.body;
      
      // For now, just return success
      res.json({ success: true, points, activity, description });
    } catch (error) {
      console.error("Error earning points:", error);
      res.status(500).json({ message: "Failed to earn points" });
    }
  });

  // Revenue and monetization routes
  app.get("/api/revenue/dashboard", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Calculate revenue metrics
      const orders = await storage.getAllOrders();
      const totalGMV = orders.reduce((sum, order) => sum + parseFloat(order.total || "0"), 0);
      const totalCommission = totalGMV * 0.08; // Average 8% commission
      const totalTransactions = orders.length;
      
      const revenueData = {
        totalGMV: totalGMV.toFixed(2),
        totalCommission: totalCommission.toFixed(2),
        totalTransactions,
        averageOrderValue: totalTransactions > 0 ? (totalGMV / totalTransactions).toFixed(2) : "0",
        commissionRate: "8%",
        monthlyGrowth: "12.5%", // This would be calculated from historical data
      };

      res.json(revenueData);
    } catch (error) {
      console.error("Error fetching revenue dashboard:", error);
      res.status(500).json({ message: "Failed to fetch revenue data" });
    }
  });

  app.get("/api/seller/subscription", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      
      // For now, return default subscription info
      // In a real implementation, this would check the database
      const subscription = {
        planType: "basic",
        status: "active",
        monthlyFee: "0",
        productsLimit: 13,
        featuresIncluded: [
          "List up to 13 products",
          "Standard support", 
          "Basic analytics",
          "10% commission rate"
        ],
        upgradeOptions: [
          {
            plan: "pro",
            price: "$29/month",
            features: [
              "Unlimited product listings",
              "Priority customer support", 
              "Advanced analytics and insights",
              "Featured product placements",
              "Bulk upload tools",
              "7% commission rate",
              "Local shipping incentives (orders $150+)*"
            ]
          },
          {
            plan: "enterprise",
            price: "$99/month",
            features: [
              "Everything in Pro",
              "API access for inventory management",
              "Dedicated account manager", 
              "Custom branding options",
              "Advanced marketing tools",
              "5% commission rate",
              "Local shipping incentives (orders $150+)*"
            ]
          }
        ]
      };

      res.json(subscription);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription data" });
    }
  });

  app.post("/api/seller/upgrade", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const { planType } = req.body;
      
      if (!["pro", "enterprise"].includes(planType)) {
        return res.status(400).json({ message: "Invalid plan type" });
      }

      // In a real implementation, this would:
      // 1. Process payment through Stripe/PayPal
      // 2. Update seller subscription in database
      // 3. Send confirmation email
      
      const monthlyFee = planType === "pro" ? "29" : "99";
      
      res.json({
        message: "Subscription upgraded successfully",
        planType,
        monthlyFee,
        status: "active"
      });
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      res.status(500).json({ message: "Failed to upgrade subscription" });
    }
  });

  // Commission calculation for orders
  app.get("/api/order/:orderId/commission", isAuthenticated, async (req, res) => {
    try {
      const { orderId } = req.params;
      const order = await storage.getOrderById(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Calculate commission based on category
      const commissionRates = {
        "Electronics": 0.08,
        "Fashion": 0.12,
        "Books": 0.15,
        "Home & Garden": 0.10,
        "Sports & Outdoors": 0.10,
        "Pro Tools & Supplies": 0.10,
        "Contractor Services": 0.05
      };

      const grossAmount = parseFloat(order.total || "0");
      
      // Get user's subscription plan to determine commission adjustments
      const userId = (req.user as any)?.id;
      const userPlan = await storage.getUserPlan(userId); // Would implement this method
      
      // Base commission rate (default for Basic plan: 10%)
      let commissionRate = 0.10; // Updated default rate for Basic plan
      
      // Apply subscription plan discounts
      if (userPlan?.planType === 'pro') {
        commissionRate = 0.07; // Pro plan: 7% base rate
      } else if (userPlan?.planType === 'enterprise') {
        commissionRate = 0.05; // Enterprise plan: 5% base rate
      }
      
      const commissionAmount = grossAmount * commissionRate;
      const paymentFee = grossAmount * 0.029 + 0.30; // 2.9% + $0.30
      const netAmount = grossAmount - commissionAmount - paymentFee;

      const feeBreakdown = {
        orderId,
        grossAmount: grossAmount.toFixed(2),
        commissionAmount: commissionAmount.toFixed(2),
        commissionRate: `${(commissionRate * 100).toFixed(1)}%`,
        paymentFeeAmount: paymentFee.toFixed(2),
        netAmount: netAmount.toFixed(2),
        breakdown: {
          "Gross Sale": `$${grossAmount.toFixed(2)}`,
          "Marketplace Commission": `-$${commissionAmount.toFixed(2)}`,
          "Payment Processing": `-$${paymentFee.toFixed(2)}`,
          "Net Payout": `$${netAmount.toFixed(2)}`
        }
      };

      res.json(feeBreakdown);
    } catch (error) {
      console.error("Error calculating commission:", error);
      res.status(500).json({ message: "Failed to calculate commission" });
    }
  });

  // Tax calculation routes
  app.get('/api/tax/rates/:state', async (req, res) => {
    try {
      const { state } = req.params;
      const { city, zipCode } = req.query;

      let taxRateQuery = db.select().from(taxRates)
        .where(and(
          eq(taxRates.state, state),
          eq(taxRates.isActive, true)
        ));

      if (city) {
        taxRateQuery = db.select().from(taxRates)
          .where(and(
            eq(taxRates.state, state),
            eq(taxRates.city, city as string),
            eq(taxRates.isActive, true)
          ));
      } else if (zipCode) {
        taxRateQuery = db.select().from(taxRates)
          .where(and(
            eq(taxRates.state, state),
            eq(taxRates.zipCode, zipCode as string),
            eq(taxRates.isActive, true)
          ));
      }

      const taxRate = await taxRateQuery;
      
      if (taxRate.length === 0) {
        // Return default state tax rate if no specific rate found
        const defaultRate = await db.select().from(taxRates)
          .where(and(
            eq(taxRates.state, state),
            eq(taxRates.isActive, true)
          ))
          .limit(1);
        
        res.json({ 
          taxRate: defaultRate[0] || { totalTaxRate: "0.0000" },
          location: { state, city, zipCode }
        });
      } else {
        res.json({ 
          taxRate: taxRate[0],
          location: { state, city, zipCode }
        });
      }
    } catch (error) {
      console.error("Error fetching tax rate:", error);
      res.status(500).json({ message: "Failed to fetch tax rate" });
    }
  });

  app.post('/api/tax/calculate', async (req, res) => {
    try {
      const { amount, sellerState, buyerState, buyerCity, buyerZipCode } = req.body;

      // Check if seller has tax nexus in buyer's state
      let shouldCollectTax = false;
      let taxRate = 0;

      // If seller and buyer are in same state, always collect tax
      if (sellerState === buyerState) {
        shouldCollectTax = true;
      }

      if (shouldCollectTax) {
        // Get tax rate for buyer's location
        let taxRateQuery = db.select().from(taxRates)
          .where(and(
            eq(taxRates.state, buyerState),
            eq(taxRates.isActive, true)
          ));

        if (buyerCity) {
          taxRateQuery = db.select().from(taxRates)
            .where(and(
              eq(taxRates.state, buyerState),
              eq(taxRates.city, buyerCity),
              eq(taxRates.isActive, true)
            ));
        } else if (buyerZipCode) {
          taxRateQuery = db.select().from(taxRates)
            .where(and(
              eq(taxRates.state, buyerState),
              eq(taxRates.zipCode, buyerZipCode),
              eq(taxRates.isActive, true)
            ));
        }

        const taxRateResult = await taxRateQuery.limit(1);
        
        if (taxRateResult.length > 0) {
          taxRate = parseFloat(taxRateResult[0].totalTaxRate);
        }
      }

      const taxAmount = parseFloat(amount) * taxRate;

      res.json({
        subtotal: parseFloat(amount).toFixed(2),
        taxRate: (taxRate * 100).toFixed(2) + '%',
        taxAmount: taxAmount.toFixed(2),
        total: (parseFloat(amount) + taxAmount).toFixed(2),
        shouldCollectTax,
        nexusState: sellerState === buyerState
      });
      
    } catch (error) {
      console.error("Error calculating tax:", error);
      res.status(500).json({ message: "Failed to calculate tax" });
    }
  });

  app.get('/api/tax/seller-settings/:sellerId', isAuthenticated, async (req, res) => {
    try {
      const { sellerId } = req.params;
      const userId = (req.user as any)?.id;

      // Only allow sellers to view their own tax settings or admins
      if (userId !== sellerId) {
        const user = await storage.getUser(userId);
        if (user?.role !== "admin") {
          return res.status(403).json({ message: "Unauthorized" });
        }
      }

      const settings = await db.select().from(sellerTaxSettings)
        .where(eq(sellerTaxSettings.sellerId, sellerId));

      res.json(settings);
    } catch (error) {
      console.error("Error fetching seller tax settings:", error);
      res.status(500).json({ message: "Failed to fetch seller tax settings" });
    }
  });

  app.post('/api/tax/seller-settings', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const { state, hasNexus, collectTax, taxId } = req.body;

      const setting = {
        id: nanoid(),
        sellerId: userId,
        state,
        hasNexus: hasNexus || true,
        collectTax: collectTax || true,
        taxId: taxId || null,
      };

      await db.insert(sellerTaxSettings).values(setting);

      res.json({ success: true, setting });
    } catch (error) {
      console.error("Error creating seller tax setting:", error);
      res.status(500).json({ message: "Failed to create seller tax setting" });
    }
  });

  // Tax transaction recording (called when orders are placed)
  app.post('/api/tax/record-transaction', async (req, res) => {
    try {
      const { orderId, sellerId, buyerId, saleAmount, taxAmount, taxRate, buyerState, buyerCity, buyerZipCode, sellerState } = req.body;

      const transactionDate = new Date();
      const taxYear = transactionDate.getFullYear();
      const taxQuarter = Math.ceil((transactionDate.getMonth() + 1) / 3);

      const taxTransaction = {
        id: nanoid(),
        orderId,
        sellerId,
        buyerId,
        saleAmount: parseFloat(saleAmount).toFixed(2),
        taxAmount: parseFloat(taxAmount).toFixed(2),
        taxRate: parseFloat(taxRate).toFixed(4),
        buyerState,
        buyerCity: buyerCity || null,
        buyerZipCode: buyerZipCode || null,
        sellerState,
        transactionDate,
        taxYear,
        taxQuarter,
        createdAt: new Date(),
      };

      await db.insert(taxTransactions).values(taxTransaction);

      res.json({ success: true, transactionId: taxTransaction.id });
    } catch (error) {
      console.error("Error recording tax transaction:", error);
      res.status(500).json({ message: "Failed to record tax transaction" });
    }
  });

  // Tax document generation endpoints
  app.post('/api/tax/generate-1099k/:sellerId', isAuthenticated, async (req, res) => {
    try {
      const { sellerId } = req.params;
      const { taxYear } = req.body;
      const userId = (req.user as any)?.id;

      // Only allow sellers to generate their own documents or admins
      if (userId !== sellerId) {
        const user = await storage.getUser(userId);
        if (user?.role !== "admin") {
          return res.status(403).json({ message: "Unauthorized" });
        }
      }

      const filePath = await taxDocumentGenerator.generate1099K(sellerId, taxYear || new Date().getFullYear());
      
      res.json({ 
        success: true, 
        message: "1099-K generated successfully",
        filePath: filePath.split('/').pop() // Return just filename for security
      });
    } catch (error) {
      console.error("Error generating 1099-K:", error);
      res.status(500).json({ message: "Failed to generate 1099-K" });
    }
  });

  app.post('/api/tax/generate-sales-tax-report/:sellerId', isAuthenticated, async (req, res) => {
    try {
      const { sellerId } = req.params;
      const { taxYear, taxPeriod } = req.body;
      const userId = (req.user as any)?.id;

      // Only allow sellers to generate their own documents or admins
      if (userId !== sellerId) {
        const user = await storage.getUser(userId);
        if (user?.role !== "admin") {
          return res.status(403).json({ message: "Unauthorized" });
        }
      }

      const filePath = await taxDocumentGenerator.generateSalesTaxReport(
        sellerId, 
        taxYear || new Date().getFullYear(),
        taxPeriod || 'Q1'
      );
      
      res.json({ 
        success: true, 
        message: "Sales tax report generated successfully",
        filePath: filePath.split('/').pop()
      });
    } catch (error) {
      console.error("Error generating sales tax report:", error);
      res.status(500).json({ message: "Failed to generate sales tax report" });
    }
  });

  app.post('/api/tax/generate-quarterly-summary/:sellerId', isAuthenticated, async (req, res) => {
    try {
      const { sellerId } = req.params;
      const { taxYear, quarter } = req.body;
      const userId = (req.user as any)?.id;

      // Only allow sellers to generate their own documents or admins
      if (userId !== sellerId) {
        const user = await storage.getUser(userId);
        if (user?.role !== "admin") {
          return res.status(403).json({ message: "Unauthorized" });
        }
      }

      const filePath = await taxDocumentGenerator.generateQuarterlySummary(
        sellerId, 
        taxYear || new Date().getFullYear(),
        quarter || 1
      );
      
      res.json({ 
        success: true, 
        message: "Quarterly summary generated successfully",
        filePath: filePath.split('/').pop()
      });
    } catch (error) {
      console.error("Error generating quarterly summary:", error);
      res.status(500).json({ message: "Failed to generate quarterly summary" });
    }
  });

  // Get seller's tax documents
  app.get('/api/tax/documents/:sellerId', isAuthenticated, async (req, res) => {
    try {
      const { sellerId } = req.params;
      const userId = (req.user as any)?.id;

      // Only allow sellers to view their own documents or admins
      if (userId !== sellerId) {
        const user = await storage.getUser(userId);
        if (user?.role !== "admin") {
          return res.status(403).json({ message: "Unauthorized" });
        }
      }

      const documents = await db.select().from(taxDocuments)
        .where(eq(taxDocuments.sellerId, sellerId))
        .orderBy(desc(taxDocuments.generatedAt));

      res.json(documents);
    } catch (error) {
      console.error("Error fetching tax documents:", error);
      res.status(500).json({ message: "Failed to fetch tax documents" });
    }
  });

  // Download tax document
  app.get('/api/tax/download/:documentId', isAuthenticated, async (req, res) => {
    try {
      const { documentId } = req.params;
      const userId = (req.user as any)?.id;

      const document = await db.select().from(taxDocuments)
        .where(eq(taxDocuments.id, documentId))
        .limit(1);

      if (!document[0]) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Only allow sellers to download their own documents or admins
      if (userId !== document[0].sellerId) {
        const user = await storage.getUser(userId);
        if (user?.role !== "admin") {
          return res.status(403).json({ message: "Unauthorized" });
        }
      }

      const filePath = `tax-documents/${document[0].filePath}`;
      res.download(filePath, document[0].filePath);
    } catch (error) {
      console.error("Error downloading tax document:", error);
      res.status(500).json({ message: "Failed to download tax document" });
    }
  });

  // Get tax transaction history for a seller
  app.get('/api/tax/transactions/:sellerId', isAuthenticated, async (req, res) => {
    try {
      const { sellerId } = req.params;
      const { taxYear, taxPeriod, limit = 100, offset = 0 } = req.query;
      const userId = (req.user as any)?.id;

      // Only allow sellers to view their own transactions or admins
      if (userId !== sellerId) {
        const user = await storage.getUser(userId);
        if (user?.role !== "admin") {
          return res.status(403).json({ message: "Unauthorized" });
        }
      }

      // Build conditions array
      const conditions = [eq(taxTransactions.sellerId, sellerId)];

      if (taxYear) {
        conditions.push(eq(taxTransactions.taxYear, parseInt(taxYear as string)));
      }

      if (taxPeriod && taxPeriod !== 'annual') {
        const quarter = parseInt(taxPeriod.toString().replace('Q', ''));
        conditions.push(eq(taxTransactions.taxQuarter, quarter));
      }

      const query = db.select().from(taxTransactions)
        .where(conditions.length === 1 ? conditions[0] : and(...conditions));

      const transactions = await query
        .orderBy(desc(taxTransactions.transactionDate))
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));

      res.json(transactions);
    } catch (error) {
      console.error("Error fetching tax transactions:", error);
      res.status(500).json({ message: "Failed to fetch tax transactions" });
    }
  });

  // Shipping routes
  app.post('/api/shipping/calculate', async (req, res) => {
    try {
      const { weight, dimensions, fromZip, toZip, serviceType } = req.body;
      
      // Mock shipping calculation
      const rates = [
        { carrier: "USPS", service: "Ground Advantage", price: "$8.45", days: "3-5 business days" },
        { carrier: "USPS", service: "Priority Mail", price: "$12.90", days: "1-3 business days" },
        { carrier: "UPS", service: "Ground", price: "$11.25", days: "3-5 business days" },
        { carrier: "UPS", service: "3 Day Select", price: "$16.80", days: "3 business days" },
        { carrier: "FedEx", service: "Ground", price: "$10.95", days: "3-5 business days" },
        { carrier: "FedEx", service: "Express Saver", price: "$18.45", days: "3 business days" },
        { carrier: "Local Delivery", service: "Same Day", price: "$7.99", days: "Same day" },
      ];
      
      res.json({ rates });
    } catch (error) {
      console.error("Error calculating shipping rates:", error);
      res.status(500).json({ message: "Failed to calculate shipping rates" });
    }
  });

  app.get('/api/shipping/labels', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      
      // Mock shipping labels
      const labels = [
        { id: "LBL001", order: "ORD-2024-001", carrier: "USPS", status: "printed", date: "2024-01-15" },
        { id: "LBL002", order: "ORD-2024-002", carrier: "UPS", status: "shipped", date: "2024-01-14" },
        { id: "LBL003", order: "ORD-2024-003", carrier: "FedEx", status: "delivered", date: "2024-01-13" },
      ];
      
      res.json({ labels });
    } catch (error) {
      console.error("Error fetching shipping labels:", error);
      res.status(500).json({ message: "Failed to fetch shipping labels" });
    }
  });

  app.post('/api/shipping/track', async (req, res) => {
    try {
      const { trackingNumber } = req.body;
      
      // Mock tracking data
      const tracking = {
        trackingNumber,
        status: "In Transit",
        carrier: "USPS",
        estimatedDelivery: "2024-01-18",
        events: [
          { status: "Label Created", timestamp: "2024-01-15T10:00:00Z", location: "Origin Facility" },
          { status: "Picked Up", timestamp: "2024-01-15T14:00:00Z", location: "Los Angeles, CA" },
          { status: "In Transit", timestamp: "2024-01-16T08:00:00Z", location: "Phoenix, AZ" }
        ]
      };
      
      res.json({ tracking });
    } catch (error) {
      console.error("Error tracking package:", error);
      res.status(500).json({ message: "Failed to track package" });
    }
  });

  // Payment processing routes with National Processing + NMI Gateway
  app.post('/api/payments/process', async (req, res) => {
    try {
      const { amount, paymentMethod, billingAddress, orderId, description } = req.body;
      
      // Process payment through NMI Gateway
      const paymentResult = await nmiGateway.processPayment({
        amount,
        cardNumber: paymentMethod.cardNumber,
        expiryMonth: paymentMethod.expiryMonth,
        expiryYear: paymentMethod.expiryYear,
        cvv: paymentMethod.cvv,
        billingAddress,
        orderId,
        description
      });
      
      if (paymentResult.success) {
        res.json({
          success: true,
          transactionId: paymentResult.transactionId,
          message: 'Payment processed successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: paymentResult.responseText
        });
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      res.status(500).json({ error: 'Payment processing failed' });
    }
  });

  // Subscription management routes
  app.post('/api/subscriptions/create', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const { planType, paymentMethod, billingAddress } = req.body;
      
      const planAmounts = {
        'pro': 29.00,
        'enterprise': 99.00,
        'local_plus': 4.99
      };
      
      // Create subscription through NMI Gateway
      const subscriptionResult = await nmiGateway.createSubscription({
        amount: planAmounts[planType as keyof typeof planAmounts],
        frequency: 'monthly' as const,
        customerId: userId,
        planName: planType,
        paymentMethod: paymentMethod,
        billingAddress: billingAddress
      });
      
      if (subscriptionResult.success) {
        // Update user's subscription status in database
        // await storage.updateUserSubscription(userId, subscriptionResult);
        
        res.json({
          success: true,
          subscription: subscriptionResult,
          message: 'Subscription created successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Subscription creation failed'
        });
      }
    } catch (error) {
      console.error('Subscription creation error:', error);
      res.status(500).json({ error: 'Subscription creation failed' });
    }
  });

  app.post('/api/subscriptions/cancel', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const { subscriptionId } = req.body;
      
      // Cancel subscription through NMI Gateway
      const cancelResult = await nmiGateway.cancelSubscription(subscriptionId);
      
      res.json(cancelResult);
    } catch (error) {
      console.error('Subscription cancellation error:', error);
      res.status(500).json({ error: 'Subscription cancellation failed' });
    }
  });

  // Commission payout routes
  app.post('/api/payouts/process', isAuthenticated, async (req, res) => {
    try {
      const sellerId = (req.user as any)?.claims?.sub;
      const { amount, bankAccount, description } = req.body;
      
      // Process payout through NMI Gateway
      const payoutResult = await nmiGateway.processPayout({
        sellerId,
        amount,
        bankAccount,
        description
      });
      
      res.json(payoutResult);
    } catch (error) {
      console.error('Payout processing error:', error);
      res.status(500).json({ error: 'Payout processing failed' });
    }
  });

  // Webhook endpoint for National Processing notifications
  app.post('/api/webhooks/payments', async (req, res) => {
    try {
      const signature = req.headers['x-np-signature'] as string;
      const payload = JSON.stringify(req.body);
      
      // Verify webhook signature from NMI
      const isValid = nmiGateway.verifyWebhookSignature(payload, signature);
      
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
      
      const { type, data } = req.body;
      
      switch (type) {
        case 'payment.succeeded':
          // Handle successful payment
          console.log('Payment succeeded:', data);
          break;
        case 'payment.failed':
          // Handle failed payment
          console.log('Payment failed:', data);
          break;
        case 'subscription.updated':
          // Handle subscription changes
          console.log('Subscription updated:', data);
          break;
        case 'payout.completed':
          // Handle completed payout
          console.log('Payout completed:', data);
          break;
        default:
          console.log('Unknown webhook type:', type);
      }
      
      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // Get today's events based on location
  app.get("/api/events/today", async (req, res) => {
    try {
      const { city, state, country = 'US' } = req.query;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      let query = db.select().from(localEvents)
        .where(
          and(
            eq(localEvents.isPublished, true),
            gte(localEvents.eventDate, today),
            lt(localEvents.eventDate, tomorrow)
          )
        )
        .orderBy(localEvents.eventDate)
        .limit(10);
      
      // Add location filtering if provided
      if (city && state) {
        query = db.select().from(localEvents)
          .where(
            and(
              eq(localEvents.isPublished, true),
              gte(localEvents.eventDate, today),
              lt(localEvents.eventDate, tomorrow),
              or(
                eq(localEvents.city, city as string),
                eq(localEvents.state, state as string),
                eq(localEvents.reachType, 'statewide'),
                eq(localEvents.reachType, 'national'),
                eq(localEvents.reachType, 'global')
              )
            )
          )
          .orderBy(localEvents.eventDate)
          .limit(10);
      }
      
      const events = await query;
      
      // Convert dates to strings and format data for frontend
      const formattedEvents = events.map(event => ({
        ...event,
        eventDate: event.eventDate.toISOString(),
        endDate: event.endDate?.toISOString(),
        price: event.price?.toString(),
      }));
      
      res.setHeader('Content-Type', 'application/json');
      res.json(formattedEvents);
    } catch (error) {
      console.error("Error fetching today's events:", error);
      res.status(500).json({ error: "Failed to fetch today's events" });
    }
  });

  // Event subscription plans
  app.get("/api/event-subscription-plans", async (req, res) => {
    try {
      const plans = await db.select().from(eventSubscriptionPlans);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching event subscription plans:", error);
      res.status(500).json({ error: "Failed to fetch event subscription plans" });
    }
  });

  // Event posting rates
  app.get("/api/event-posting-rates", async (req, res) => {
    try {
      const rates = await db.select().from(eventPostingRates);
      res.json(rates);
    } catch (error) {
      console.error("Error fetching event posting rates:", error);
      res.status(500).json({ error: "Failed to fetch event posting rates" });
    }
  });

  // Enhanced events endpoint with external aggregation
  app.get("/api/events", async (req, res) => {
    try {
      const { 
        city, 
        state, 
        zipCode, 
        category, 
        startDate, 
        endDate, 
        search,
        limit = '20',
        offset = '0'
      } = req.query;
      
      // Build all conditions first
      const conditions = [eq(localEvents.isPublished, true)];
      
      if (city) conditions.push(eq(localEvents.city, city as string));
      if (state) conditions.push(eq(localEvents.state, state as string));
      if (zipCode) conditions.push(eq(localEvents.zipCode, zipCode as string));
      if (category) conditions.push(eq(localEvents.category, category as string));
      if (search) {
        conditions.push(
          or(
            ilike(localEvents.title, `%${search as string}%`),
            ilike(localEvents.description, `%${search as string}%`)
          )!
        );
      }
      if (startDate) {
        conditions.push(gte(localEvents.eventDate, new Date(startDate as string)));
      }
      if (endDate) {
        conditions.push(lte(localEvents.eventDate, new Date(endDate as string)));
      }

      // Build query with all conditions
      const query = db.select({
        id: localEvents.id,
        title: localEvents.title,
        description: localEvents.description,
        eventDate: localEvents.eventDate,
        endDate: localEvents.endDate,
        location: localEvents.location,
        address: localEvents.address,
        city: localEvents.city,
        state: localEvents.state,
        zipCode: localEvents.zipCode,
        reachType: localEvents.reachType,
        category: localEvents.category,
        price: localEvents.price,
        currency: localEvents.currency,
        capacity: localEvents.capacity,
        registeredCount: localEvents.registeredCount,
        imageUrl: localEvents.imageUrl,
        websiteUrl: localEvents.websiteUrl,
        ticketUrl: localEvents.ticketUrl,
        socialLinks: localEvents.socialLinks,
        mediaLinks: localEvents.mediaLinks,
        tags: localEvents.tags,
        isFeatured: localEvents.isFeatured,
        createdAt: localEvents.createdAt,
        organizer: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email
        }
      }).from(localEvents)
      .leftJoin(users, eq(localEvents.organizerId, users.id))
      .where(conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : and(...conditions)) : undefined);

      const events = await query
        .orderBy(desc(localEvents.isFeatured), asc(localEvents.eventDate))
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));

      // If we have few local events, supplement with external events
      if (events.length < 5 && city && state) {
        try {
          const { EventAggregator } = await import('./eventAggregator');
          const aggregator = new EventAggregator();
          const externalEvents = await aggregator.aggregateEvents(city as string, state as string);
          
          // Convert external events to our format and add them
          const formattedExternalEvents = externalEvents.map(event => ({
            id: event.id,
            title: event.title,
            description: event.description,
            eventDate: event.eventDate,
            endDate: event.endDate,
            location: event.location,
            address: event.address,
            city: event.city,
            state: event.state,
            zipCode: event.zipCode,
            reachType: 'external',
            category: event.category,
            price: event.price,
            currency: event.currency,
            capacity: null,
            registeredCount: null,
            imageUrl: event.imageUrl,
            websiteUrl: event.websiteUrl,
            ticketUrl: event.ticketUrl,
            socialLinks: null,
            mediaLinks: null,
            tags: [event.source],
            isFeatured: false,
            createdAt: new Date(),
            organizer: {
              id: 'external',
              firstName: event.source,
              lastName: 'Events',
              email: null
            }
          }));

          // Merge local and external events, prioritizing local events
          const combinedEvents = [...events, ...formattedExternalEvents.slice(0, 10 - events.length)];
          res.json(combinedEvents);
        } catch (error) {
          console.error('Error fetching external events:', error);
          res.json(events); // Fall back to local events only
        }
      } else {
        res.json(events);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  // Get external events only (called by TodaysEventsSection)
  app.get("/api/events/external", async (req, res) => {
    try {
      const { city, state } = req.query;
      
      if (!city || !state) {
        return res.status(400).json({ error: "City and state are required" });
      }
      
      const { EventAggregator } = await import('./eventAggregator');
      const aggregator = new EventAggregator();
      const externalEvents = await aggregator.aggregateEvents(city as string, state as string);
      
      // Convert external events to match our LocalEvent interface
      const formattedExternalEvents = externalEvents.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        eventDate: event.eventDate.toISOString(),
        endDate: event.endDate?.toISOString(),
        location: event.location,
        address: event.address,
        city: event.city,
        state: event.state,
        category: event.category,
        price: event.price,
        capacity: null,
        registeredCount: null,
        imageUrl: event.imageUrl,
        reachType: 'external',
        source: event.source,
        websiteUrl: event.websiteUrl,
        ticketUrl: event.ticketUrl
      }));

      res.setHeader('Content-Type', 'application/json');
      res.json(formattedExternalEvents);
    } catch (error) {
      console.error("Error fetching external events:", error);
      res.status(500).json({ error: "Failed to fetch external events" });
    }
  });

  // Create event
  app.post("/api/events", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const eventData = {
        ...req.body,
        id: nanoid(),
        organizerId: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const [event] = await db.insert(localEvents).values(eventData).returning();
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ error: "Failed to create event" });
    }
  });

  // Get user's events
  app.get("/api/my-events", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const events = await db.select()
        .from(localEvents)
        .where(eq(localEvents.organizerId, userId))
        .orderBy(desc(localEvents.createdAt));
      
      res.json(events);
    } catch (error) {
      console.error("Error fetching user events:", error);
      res.status(500).json({ error: "Failed to fetch user events" });
    }
  });

  // Subscribe to event plan
  app.post("/api/event-subscription", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const { planId } = req.body;
      
      // Get user's subscription tier for discount calculation
      const user = await storage.getUser(userId);
      const userPlan = user?.subscriptionPlan || 'basic';
      
      // Calculate discount based on user tier
      let discountRate = 0;
      if (userPlan === 'pro') discountRate = 0.5; // 50% off
      if (userPlan === 'enterprise') discountRate = 0.75; // 75% off
      
      const renewalDate = new Date();
      renewalDate.setMonth(renewalDate.getMonth() + 1);
      
      const subscription = {
        id: nanoid(),
        userId,
        planId,
        postsUsed: 0,
        renewalDate,
        isActive: true,
        createdAt: new Date()
      };
      
      const [newSubscription] = await db.insert(userEventSubscriptions)
        .values(subscription)
        .returning();
      
      res.status(201).json({ 
        subscription: newSubscription, 
        discountRate,
        discountMessage: discountRate > 0 ? `${discountRate * 100}% discount applied for ${userPlan} users!` : null
      });
    } catch (error) {
      console.error("Error creating event subscription:", error);
      res.status(500).json({ error: "Failed to create event subscription" });
    }
  });

  // Enhanced Tax Document Generation API Endpoints
  
  // Generate 1099-K tax form
  app.post("/api/tax/generate-1099k/:userId", isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const { taxYear } = req.body;
      const requestUserId = (req.user as any)?.claims?.sub;
      
      if (userId !== requestUserId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { TaxDocumentGenerator } = await import("./taxDocuments");
      const generator = new TaxDocumentGenerator();
      
      const filePath = await generator.generate1099K(userId, taxYear || new Date().getFullYear());
      
      // Record document generation in database
      await db.insert(taxDocuments).values({
        sellerId: userId,
        documentType: "1099-K",
        taxYear: taxYear || new Date().getFullYear(),
        taxPeriod: "annual",
        filePath: filePath.split('/').pop() || '',
        status: "generated"
      });

      res.json({ 
        message: "1099-K generated successfully", 
        filePath,
        documentType: "1099-K",
        taxYear: taxYear || new Date().getFullYear()
      });
    } catch (error) {
      console.error("Error generating 1099-K:", error);
      res.status(500).json({ message: "Failed to generate 1099-K form" });
    }
  });

  // Generate quarterly sales tax report
  app.post("/api/tax/generate-quarterly/:userId", isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const { taxYear, quarter } = req.body;
      const requestUserId = (req.user as any)?.claims?.sub;
      
      if (userId !== requestUserId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { TaxDocumentGenerator } = await import("./taxDocuments");
      const generator = new TaxDocumentGenerator();
      
      const filePath = await generator.generateQuarterlySalesReport(userId, taxYear || new Date().getFullYear(), quarter || 1);
      
      // Record document generation in database
      await db.insert(taxDocuments).values({
        sellerId: userId,
        documentType: "quarterly_sales_report",
        taxYear: taxYear || new Date().getFullYear(),
        taxPeriod: `Q${quarter || 1}`,
        filePath: filePath.split('/').pop() || '',
        status: "generated"
      });

      res.json({ 
        message: "Quarterly sales report generated successfully", 
        filePath,
        documentType: "quarterly_sales_report",
        taxYear: taxYear || new Date().getFullYear(),
        quarter: quarter || 1
      });
    } catch (error) {
      console.error("Error generating quarterly report:", error);
      res.status(500).json({ message: "Failed to generate quarterly sales report" });
    }
  });

  // Get tax summary for a seller
  app.get("/api/tax/summary/:userId", isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const { taxYear } = req.query;
      const requestUserId = (req.user as any)?.claims?.sub;
      
      if (userId !== requestUserId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { TaxDocumentGenerator } = await import("./taxDocuments");
      const generator = new TaxDocumentGenerator();
      
      // Get tax summary data by querying transactions directly since getTaxSummary is private
      const year = parseInt(taxYear as string) || new Date().getFullYear();
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      
      const transactions = await db.select({
        saleAmount: taxTransactions.saleAmount,
        taxAmount: taxTransactions.taxAmount,
      })
      .from(taxTransactions)
      .where(and(
        eq(taxTransactions.sellerId, userId),
        gte(taxTransactions.createdAt, startDate),
        lte(taxTransactions.createdAt, endDate)
      ));
      
      const summary = {
        totalSales: transactions.reduce((sum, t) => sum + parseFloat(t.saleAmount), 0),
        totalTax: transactions.reduce((sum, t) => sum + parseFloat(t.taxAmount), 0),
        transactionCount: transactions.length,
        quarterlyBreakdown: {
          Q1: { sales: 0, tax: 0, transactions: 0 },
          Q2: { sales: 0, tax: 0, transactions: 0 },
          Q3: { sales: 0, tax: 0, transactions: 0 },
          Q4: { sales: 0, tax: 0, transactions: 0 }
        }
      };
      
      res.json(summary);
    } catch (error) {
      console.error("Error fetching tax summary:", error);
      res.status(500).json({ message: "Failed to fetch tax summary" });
    }
  });

  // Bulk generate all tax documents for a year
  app.post("/api/tax/generate-all/:userId", isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const { taxYear } = req.body;
      const requestUserId = (req.user as any)?.claims?.sub;
      
      if (userId !== requestUserId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { TaxDocumentGenerator } = await import("./taxDocuments");
      const generator = new TaxDocumentGenerator();
      
      const year = taxYear || new Date().getFullYear();
      const documents = [];

      // Generate 1099-K
      try {
        const form1099K = await generator.generate1099K(userId, year);
        documents.push({
          type: "1099-K",
          filePath: form1099K,
          period: "annual"
        });
        
        await db.insert(taxDocuments).values({
          sellerId: userId,
          documentType: "1099-K",
          taxYear: year,
          taxPeriod: "annual",
          filePath: form1099K.split('/').pop() || '',
          status: "generated"
        });
      } catch (error) {
        console.warn("Error generating 1099-K:", error);
      }

      // Generate quarterly reports
      for (let quarter = 1; quarter <= 4; quarter++) {
        try {
          const quarterlySales = await generator.generateQuarterlySalesReport(userId, year, quarter);
          documents.push({
            type: "quarterly_sales_report",
            filePath: quarterlySales,
            period: `Q${quarter}`
          });
          
          await db.insert(taxDocuments).values({
            sellerId: userId,
            documentType: "quarterly_sales_report",
            taxYear: year,
            taxPeriod: `Q${quarter}`,
            filePath: quarterlySales.split('/').pop() || '',
            status: "generated"
          });
        } catch (error) {
          console.warn(`Error generating Q${quarter} report:`, error);
        }
      }

      res.json({ 
        message: `Generated ${documents.length} tax documents for ${year}`,
        documents,
        taxYear: year
      });
    } catch (error) {
      console.error("Error generating all tax documents:", error);
      res.status(500).json({ message: "Failed to generate tax documents" });
    }
  });

  // Tax Exempt Certificate endpoints
  app.get("/api/tax/exempt-certificates/:userId", isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const certificates = await db.select()
        .from(taxExemptCertificates)
        .where(eq(taxExemptCertificates.userId, userId))
        .orderBy(desc(taxExemptCertificates.createdAt));
      
      res.json(certificates);
    } catch (error: any) {
      console.error("Error fetching tax exempt certificates:", error);
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });

  app.post("/api/tax/exempt-certificates/:userId", isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const multer = await import("multer");
      const path = await import("path");
      const fs = await import("fs").then(m => m.promises);
      
      // Configure multer for file upload
      const storage = multer.diskStorage({
        destination: async (req, file, cb) => {
          const uploadDir = path.join(process.cwd(), "tax-documents");
          await fs.mkdir(uploadDir, { recursive: true });
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
          cb(null, `tax-exempt-${uniqueSuffix}${path.extname(file.originalname)}`);
        }
      });
      
      const upload = multer.default({ 
        storage,
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
        fileFilter: (req, file, cb) => {
          const allowedTypes = /jpeg|jpg|png|pdf/;
          const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
          const mimetype = allowedTypes.test(file.mimetype);
          
          if (extname && mimetype) {
            return cb(null, true);
          } else {
            cb(new Error("Only PDF, JPG, JPEG, and PNG files are allowed"));
          }
        }
      }).single("certificate");
      
      upload(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ message: err.message });
        }
        
        try {
          const {
            certificateType,
            exemptionNumber,
            businessName,
            businessAddress,
            businessCity,
            businessState,
            businessZipCode,
            exemptStates,
            expirationDate
          } = req.body;
          
          const certificateData = {
            userId,
            certificateType,
            exemptionNumber,
            businessName,
            businessAddress,
            businessCity,
            businessState,
            businessZipCode,
            exemptStates: JSON.parse(exemptStates || "[]"),
            certificateFilePath: req.file?.path || null,
            expirationDate: expirationDate ? new Date(expirationDate) : null,
            isActive: true,
            verificationStatus: "pending"
          };
          
          const [certificate] = await db.insert(taxExemptCertificates)
            .values(certificateData)
            .returning();
          
          res.json(certificate);
        } catch (error: any) {
          console.error("Error creating tax exempt certificate:", error);
          res.status(500).json({ message: "Failed to create certificate" });
        }
      });
    } catch (error: any) {
      console.error("Error setting up file upload:", error);
      res.status(500).json({ message: "Failed to process upload" });
    }
  });

  // Analytics Pro Suite endpoints
  app.get("/api/analytics/pro", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { dateRange = "30d", category = "all" } = req.query;
      
      // Check if user has Analytics Pro subscription
      const user = await storage.getUser(userId);
      if (!user || (user.role !== "admin" && user.subscriptionPlan !== "analytics_pro")) {
        return res.status(403).json({ message: "Analytics Pro subscription required" });
      }

      // Mock comprehensive analytics data (in production, this would fetch real data)
      const analyticsData = {
        overview: {
          totalRevenue: Math.floor(Math.random() * 50000) + 10000,
          totalOrders: Math.floor(Math.random() * 500) + 100,
          totalViews: Math.floor(Math.random() * 10000) + 2000,
          conversionRate: Math.round((Math.random() * 5 + 1) * 10) / 10,
          revenueChange: Math.round((Math.random() * 20 - 10) * 10) / 10,
          ordersChange: Math.round((Math.random() * 30 - 15) * 10) / 10,
          viewsChange: Math.round((Math.random() * 25 - 12) * 10) / 10,
          conversionChange: Math.round((Math.random() * 10 - 5) * 10) / 10,
        },
        topProducts: [
          {
            id: "1",
            name: "Wireless Bluetooth Headphones",
            revenue: 4500,
            views: 1200,
            orders: 45,
            conversionRate: 3.8
          },
          {
            id: "2", 
            name: "Smart Fitness Tracker",
            revenue: 3200,
            views: 980,
            orders: 32,
            conversionRate: 3.3
          },
          {
            id: "3",
            name: "Portable Phone Charger",
            revenue: 2800,
            views: 850,
            orders: 28,
            conversionRate: 3.3
          }
        ],
        customerInsights: {
          newCustomers: Math.floor(Math.random() * 100) + 50,
          returningCustomers: Math.floor(Math.random() * 150) + 75,
          averageOrderValue: Math.floor(Math.random() * 100) + 75,
          topLocations: [
            { location: "New York, NY", orders: 45, revenue: 4500 },
            { location: "Los Angeles, CA", orders: 38, revenue: 3800 },
            { location: "Chicago, IL", orders: 29, revenue: 2900 }
          ]
        },
        competitorData: [
          { competitor: "Amazon", marketShare: 38, priceComparison: 15, rating: 4.3 },
          { competitor: "eBay", marketShare: 22, priceComparison: -8, rating: 4.1 },
          { competitor: "Walmart", marketShare: 18, priceComparison: 12, rating: 4.0 }
        ],
        marketTrends: [
          { trend: "Sustainable Electronics Growing", growth: 25, category: "Electronics", impact: "high" as const },
          { trend: "Remote Work Equipment Demand", growth: 18, category: "Office", impact: "medium" as const },
          { trend: "Health & Wellness Focus", growth: 22, category: "Health", impact: "high" as const }
        ]
      };

      res.json(analyticsData);
    } catch (error) {
      console.error("Analytics Pro error:", error);
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });

  app.post("/api/analytics/export", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { format, dateRange, category } = req.body;
      
      // Check if user has Analytics Pro subscription
      const user = await storage.getUser(userId);
      if (!user || (user.role !== "admin" && user.subscriptionPlan !== "analytics_pro")) {
        return res.status(403).json({ message: "Analytics Pro subscription required" });
      }

      if (format === "csv") {
        const csvData = `Date,Revenue,Orders,Views,Conversion Rate
2025-01-01,1250.00,12,450,2.7%
2025-01-02,1380.50,15,520,2.9%
2025-01-03,1120.25,11,390,2.8%`;
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="analytics-${dateRange}.csv"`);
        res.send(csvData);
      } else if (format === "pdf") {
        // In production, generate actual PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="analytics-${dateRange}.pdf"`);
        res.send("PDF export not yet implemented");
      } else {
        res.status(400).json({ message: "Invalid export format" });
      }
    } catch (error) {
      console.error("Analytics export error:", error);
      res.status(500).json({ message: "Failed to export analytics data" });
    }
  });

  // Business Verification endpoints
  app.get("/api/business-verification", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Mock verification data (in production, fetch from database)
      const mockVerification = {
        id: "bv_" + userId,
        businessName: "Sample Business LLC",
        businessType: "llc",
        taxId: "12-3456789",
        businessAddress: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "United States",
        phoneNumber: "(555) 123-4567",
        website: "https://samplebusiness.com",
        description: "We provide quality services to our customers",
        documentsUploaded: ["business_license.pdf", "tax_document.pdf"],
        status: "under_review",
        submittedAt: "2025-01-15T10:30:00Z",
        reviewedAt: null,
        reviewerNotes: null,
        verificationLevel: "standard",
        badgeUrl: null
      };
      
      res.json(mockVerification);
    } catch (error) {
      console.error("Business verification fetch error:", error);
      res.status(500).json({ message: "Failed to fetch business verification" });
    }
  });

  app.post("/api/business-verification/submit", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const verificationData = {
        ...req.body,
        userId,
        status: "pending",
        submittedAt: new Date().toISOString()
      };
      
      // In production, save to database
      const verification = {
        id: "bv_" + Date.now(),
        ...verificationData
      };
      
      res.json(verification);
    } catch (error) {
      console.error("Business verification submit error:", error);
      res.status(500).json({ message: "Failed to submit business verification" });
    }
  });

  app.post("/api/business-verification/upload", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // In production, handle actual file uploads with multer
      // For now, simulate document upload
      const mockDocuments = [
        {
          id: "doc_" + Date.now(),
          fileName: "business_license.pdf",
          fileType: "application/pdf",
          uploadedAt: new Date().toISOString(),
          status: "pending"
        }
      ];
      
      res.json({ message: "Documents uploaded successfully", documents: mockDocuments });
    } catch (error) {
      console.error("Document upload error:", error);
      res.status(500).json({ message: "Failed to upload documents" });
    }
  });

  app.get("/api/business-verification/documents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Mock documents data
      const mockDocuments = [
        {
          id: "doc_001",
          fileName: "business_license.pdf",
          fileType: "application/pdf",
          uploadedAt: "2025-01-15T10:30:00Z",
          status: "approved",
          notes: null
        },
        {
          id: "doc_002",
          fileName: "tax_document.pdf", 
          fileType: "application/pdf",
          uploadedAt: "2025-01-15T10:35:00Z",
          status: "pending",
          notes: null
        }
      ];
      
      res.json(mockDocuments);
    } catch (error) {
      console.error("Documents fetch error:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Referral program routes
  app.post('/api/referrals/generate-code', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { serviceType, serviceId } = req.body;

      if (!serviceType || !serviceId) {
        return res.status(400).json({ message: "Service type and service ID are required" });
      }

      const referralCode = await storage.createReferralCode(userId, serviceType, serviceId);
      res.json(referralCode);
    } catch (error) {
      console.error("Error generating referral code:", error);
      res.status(500).json({ message: "Failed to generate referral code" });
    }
  });

  app.get('/api/referrals/my-codes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const referralCodes = await storage.getUserReferralCodes(userId);
      res.json(referralCodes);
    } catch (error) {
      console.error("Error fetching referral codes:", error);
      res.status(500).json({ message: "Failed to fetch referral codes" });
    }
  });

  app.get('/api/referrals/my-referrals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const referrals = await storage.getUserReferrals(userId);
      res.json(referrals);
    } catch (error) {
      console.error("Error fetching referrals:", error);
      res.status(500).json({ message: "Failed to fetch referrals" });
    }
  });

  app.get('/api/referrals/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getUserReferralStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      res.status(500).json({ message: "Failed to fetch referral stats" });
    }
  });

  app.get('/api/referrals/rewards', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const rewards = await storage.getUserActiveRewards(userId);
      res.json(rewards);
    } catch (error) {
      console.error("Error fetching referral rewards:", error);
      res.status(500).json({ message: "Failed to fetch referral rewards" });
    }
  });

  app.post('/api/referrals/apply-code', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { code, serviceType, serviceId } = req.body;

      if (!code || !serviceType || !serviceId) {
        return res.status(400).json({ message: "Referral code, service type, and service ID are required" });
      }

      const referral = await storage.applyReferralCode(code, userId, serviceType, serviceId);
      res.json({
        message: "Referral code applied successfully!",
        referral,
        rewards: {
          referrer: `${referral.referrerRewardValue}% off for ${referral.referrerRewardDuration} months`,
          referee: `${referral.refereeRewardValue} month(s) free`
        }
      });
    } catch (error) {
      console.error("Error applying referral code:", error);
      res.status(400).json({ message: (error as Error).message || "Failed to apply referral code" });
    }
  });

  app.get('/api/referrals/validate/:code', async (req, res) => {
    try {
      const { code } = req.params;
      const referralCode = await storage.getReferralCodeByCode(code);
      
      if (!referralCode) {
        return res.status(404).json({ 
          valid: false, 
          message: "Invalid referral code" 
        });
      }

      res.json({
        valid: true,
        serviceType: referralCode.serviceType,
        serviceId: referralCode.serviceId,
        message: "Valid referral code"
      });
    } catch (error) {
      console.error("Error validating referral code:", error);
      res.status(500).json({ message: "Failed to validate referral code" });
    }
  });

  // Buyer Membership API endpoints
  app.get('/api/memberships/plans', async (req, res) => {
    try {
      const plans = await storage.getMembershipPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching membership plans:", error);
      res.status(500).json({ message: "Failed to fetch membership plans" });
    }
  });

  app.get('/api/memberships/current', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const membership = await storage.getCurrentMembership(userId);
      res.json(membership);
    } catch (error) {
      console.error("Error fetching current membership:", error);
      res.status(500).json({ message: "Failed to fetch current membership" });
    }
  });

  app.post('/api/memberships/subscribe', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { planId, paymentMethod, referralCode } = req.body;

      if (!planId || !paymentMethod) {
        return res.status(400).json({ message: "Plan ID and payment method are required" });
      }

      const subscription = await storage.createMembership(userId, planId, paymentMethod, referralCode);
      res.status(201).json(subscription);
    } catch (error) {
      console.error("Error creating membership subscription:", error);
      res.status(500).json({ message: "Failed to create membership subscription" });
    }
  });

  app.patch('/api/memberships/:membershipId/cancel', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { membershipId } = req.params;

      const membership = await storage.cancelMembership(membershipId, userId);
      res.json(membership);
    } catch (error) {
      console.error("Error cancelling membership:", error);
      res.status(500).json({ message: "Failed to cancel membership" });
    }
  });

  app.get('/api/memberships/:membershipId/benefits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { membershipId } = req.params;

      const benefits = await storage.getMembershipBenefits(membershipId, userId);
      res.json(benefits);
    } catch (error) {
      console.error("Error fetching membership benefits:", error);
      res.status(500).json({ message: "Failed to fetch membership benefits" });
    }
  });

  app.post('/api/memberships/:membershipId/benefits/use', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { membershipId } = req.params;
      const { benefitType, benefitValue } = req.body;

      const result = await storage.useMembershipBenefit(membershipId, userId, benefitType, benefitValue);
      res.json(result);
    } catch (error) {
      console.error("Error using membership benefit:", error);
      res.status(500).json({ message: "Failed to use membership benefit" });
    }
  });

  app.get('/api/memberships/:membershipId/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { membershipId } = req.params;

      const transactions = await storage.getMembershipTransactions(membershipId, userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching membership transactions:", error);
      res.status(500).json({ message: "Failed to fetch membership transactions" });
    }
  });

  // Commission Tracking and Balance Management Endpoints
  app.post('/api/user/generate-referral-code', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const referralCode = await storage.generateUniqueReferralCode(userId);
      res.json({ referralCode });
    } catch (error) {
      console.error("Error generating referral code:", error);
      res.status(500).json({ message: "Failed to generate referral code" });
    }
  });

  // Enhanced balance access with 2FA requirement
  app.get('/api/user/balance', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      // Check if 2FA is required for balance access
      if (user?.twoFactorEnabled) {
        const twoFactorToken = req.headers['x-2fa-token'] as string;
        if (!twoFactorToken) {
          return res.status(403).json({ 
            message: "Two-factor authentication required for balance access",
            requires2FA: true 
          });
        }

        // Verify 2FA token for balance access
        const isValid = await twoFactorService.validateBalanceAccess2FA(twoFactorToken);
        if (!isValid) {
          return res.status(403).json({ 
            message: "Invalid or expired two-factor authentication",
            requires2FA: true 
          });
        }
      }

      const balance = await storage.getUserBalance(userId);
      res.json(balance);
    } catch (error) {
      console.error("Error fetching user balance:", error);
      res.status(500).json({ message: "Failed to fetch balance" });
    }
  });

  // Enhanced balance transactions with 2FA requirement
  app.get('/api/user/balance/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      // Check if 2FA is required for balance access
      if (user?.twoFactorEnabled) {
        const twoFactorToken = req.headers['x-2fa-token'] as string;
        if (!twoFactorToken) {
          return res.status(403).json({ 
            message: "Two-factor authentication required for balance access",
            requires2FA: true 
          });
        }

        const isValid = await twoFactorService.validateBalanceAccess2FA(twoFactorToken);
        if (!isValid) {
          return res.status(403).json({ 
            message: "Invalid or expired two-factor authentication",
            requires2FA: true 
          });
        }
      }

      const { limit = 50, offset = 0 } = req.query;
      const transactions = await storage.getBalanceTransactions(
        userId, 
        parseInt(limit as string), 
        parseInt(offset as string)
      );
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching balance transactions:", error);
      res.status(500).json({ message: "Failed to fetch balance transactions" });
    }
  });

  app.post('/api/user/credit-balance', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { amount, description, referenceId, referenceType } = req.body;
      
      if (!amount || !description) {
        return res.status(400).json({ message: "Amount and description are required" });
      }

      const amountNumber = parseFloat(amount);
      if (isNaN(amountNumber) || amountNumber <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      await storage.creditUserBalance(userId, amountNumber, description, referenceId, referenceType);
      
      res.json({ 
        message: "Balance credited successfully",
        amount: amountNumber.toFixed(2) 
      });
    } catch (error) {
      console.error("Error crediting balance:", error);
      res.status(500).json({ message: "Failed to credit balance" });
    }
  });

  app.get('/api/user/banking-info', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bankingInfo = await storage.getUserBankingInfo(userId);
      res.json(bankingInfo);
    } catch (error) {
      console.error("Error fetching banking info:", error);
      res.status(500).json({ message: "Failed to fetch banking information" });
    }
  });

  app.post('/api/user/banking-info', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { bankName, accountType, routingNumber, accountNumber, accountHolderName } = req.body;
      
      const bankingInfo = await storage.addBankingInfo(userId, {
        bankName,
        accountType,
        routingNumber,
        accountNumber,
        accountHolderName,
      });
      
      res.json(bankingInfo);
    } catch (error) {
      console.error("Error adding banking info:", error);
      res.status(500).json({ message: "Failed to add banking information" });
    }
  });

  app.put('/api/user/banking-info/:bankingInfoId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { bankingInfoId } = req.params;
      const updates = req.body;
      
      const bankingInfo = await storage.updateBankingInfo(bankingInfoId, userId, updates);
      res.json(bankingInfo);
    } catch (error) {
      console.error("Error updating banking info:", error);
      res.status(500).json({ message: "Failed to update banking information" });
    }
  });

  app.delete('/api/user/banking-info/:bankingInfoId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { bankingInfoId } = req.params;
      
      await storage.deleteBankingInfo(bankingInfoId, userId);
      res.json({ message: "Banking information deleted successfully" });
    } catch (error) {
      console.error("Error deleting banking info:", error);
      res.status(500).json({ message: "Failed to delete banking information" });
    }
  });

  app.post('/api/user/withdraw', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { amount, bankingInfoId } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid withdrawal amount" });
      }
      
      await storage.withdrawBalance(userId, parseFloat(amount), bankingInfoId);
      res.json({ message: "Withdrawal processed successfully" });
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      res.status(500).json({ message: (error as Error).message || "Failed to process withdrawal" });
    }
  });

  app.post('/api/commissions/track', isAuthenticated, async (req: any, res) => {
    try {
      const { orderId, referralCode, revenueAmount } = req.body;
      
      // Find the referrer by referral code
      const referrer = await storage.getUserByReferralCode(referralCode);
      if (!referrer) {
        return res.status(404).json({ message: "Invalid referral code" });
      }
      
      const userId = req.user.id;
      const commissionAmount = parseFloat(revenueAmount) * 0.01; // 1% commission
      
      const commission = await storage.trackCommission(
        orderId,
        referrer.id,
        userId,
        referralCode,
        parseFloat(revenueAmount),
        commissionAmount
      );
      
      res.json(commission);
    } catch (error) {
      console.error("Error tracking commission:", error);
      res.status(500).json({ message: "Failed to track commission" });
    }
  });

  app.post('/api/commissions/process', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      // Only allow admins to process commissions
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.processCommissions();
      res.json({ message: "Commissions processed successfully" });
    } catch (error) {
      console.error("Error processing commissions:", error);
      res.status(500).json({ message: "Failed to process commissions" });
    }
  });

  app.get('/api/referrals/validate/:code', async (req, res) => {
    try {
      const { code } = req.params;
      const referrer = await storage.getUserByReferralCode(code);
      
      if (referrer) {
        res.json({ 
          valid: true, 
          referrerName: `${referrer.firstName || ''} ${referrer.lastName || ''}`.trim() || 'Durcheap User'
        });
      } else {
        res.json({ valid: false });
      }
    } catch (error) {
      console.error("Error validating referral code:", error);
      res.status(500).json({ message: "Failed to validate referral code" });
    }
  });

  // Search users for referral selection
  app.get('/api/users/search', async (req, res) => {
    try {
      const { q: query } = req.query;
      
      if (!query || typeof query !== 'string' || query.length < 2) {
        return res.json([]);
      }
      
      const users = await storage.searchUsersForReferral(query.toString());
      res.json(users);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  // CSV Export Users
  app.get('/api/admin/users/export', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const csvData = await storage.exportUsersToCSV();
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const filename = `Users_${timestamp}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvData);
    } catch (error) {
      console.error("Error exporting users:", error);
      res.status(500).json({ message: "Failed to export users" });
    }
  });

  // Test CSV Export (for testing purposes)
  app.get('/api/test/users/export', async (req, res) => {
    try {
      const csvData = await storage.exportUsersToCSV();
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Users_${timestamp}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvData);
    } catch (error) {
      console.error("Error exporting users:", error);
      res.status(500).json({ message: "Failed to export users" });
    }
  });

  // CSV Import Users
  app.post('/api/admin/users/import', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { csvData } = req.body;
      
      if (!csvData) {
        return res.status(400).json({ message: "CSV data is required" });
      }

      const result = await storage.importUsersFromCSV(csvData);
      res.json(result);
    } catch (error) {
      console.error("Error importing users:", error);
      res.status(500).json({ message: "Failed to import users" });
    }
  });

  // Independent Contractor Agreement endpoints
  app.get("/api/user/contractor-agreement", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const agreement = await storage.getContractorAgreement(userId);
      res.json(agreement);
    } catch (error: any) {
      console.error("Error fetching contractor agreement:", error);
      res.status(500).json({ message: "Failed to fetch contractor agreement" });
    }
  });

  app.post("/api/user/contractor-agreement", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const agreementData = req.body;
      
      const agreement = await storage.createContractorAgreement(userId, agreementData);
      res.json(agreement);
    } catch (error: any) {
      console.error("Error creating contractor agreement:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/user/contractor-agreement/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const updates = req.body;
      
      const agreement = await storage.updateContractorAgreement(userId, id, updates);
      res.json(agreement);
    } catch (error: any) {
      console.error("Error updating contractor agreement:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Tax Forms endpoints
  app.get("/api/user/tax-forms", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const forms = await storage.getTaxForms(userId);
      res.json(forms);
    } catch (error: any) {
      console.error("Error fetching tax forms:", error);
      res.status(500).json({ message: "Failed to fetch tax forms" });
    }
  });

  app.post("/api/user/tax-forms", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const formData = req.body;
      
      const form = await storage.createTaxForm(userId, formData);
      res.json(form);
    } catch (error: any) {
      console.error("Error creating tax form:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/user/tax-forms/:formType/:taxYear", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { formType, taxYear } = req.params;
      
      const form = await storage.getTaxForm(userId, formType, parseInt(taxYear));
      res.json(form);
    } catch (error: any) {
      console.error("Error fetching tax form:", error);
      res.status(500).json({ message: "Failed to fetch tax form" });
    }
  });

  app.put("/api/user/tax-forms/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const updates = req.body;
      
      const form = await storage.updateTaxForm(userId, id, updates);
      res.json(form);
    } catch (error: any) {
      console.error("Error updating tax form:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // User Branding Routes (Enterprise Feature)
  app.get('/api/user/branding', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || user.subscriptionPlan !== 'enterprise') {
        return res.status(403).json({ message: "Enterprise subscription required" });
      }

      const branding = await storage.getUserBranding(userId);
      res.json(branding || {});
    } catch (error) {
      console.error("Error fetching user branding:", error);
      res.status(500).json({ message: "Failed to fetch branding" });
    }
  });

  app.post('/api/user/branding', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || user.subscriptionPlan !== 'enterprise') {
        return res.status(403).json({ message: "Enterprise subscription required" });
      }

      const branding = await storage.saveUserBranding(userId, req.body);
      res.json(branding);
    } catch (error) {
      console.error("Error saving user branding:", error);
      res.status(500).json({ message: "Failed to save branding" });
    }
  });

  app.post('/api/upload/logo', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || user.subscriptionPlan !== 'enterprise') {
        return res.status(403).json({ message: "Enterprise subscription required" });
      }

      // In a real implementation, you would upload to a cloud storage service like AWS S3
      // For now, we'll return a placeholder URL based on the user's name
      const logoUrl = `https://via.placeholder.com/200x80/4F46E5/FFFFFF?text=${encodeURIComponent(user.firstName || 'Logo')}`;
      
      res.json({ url: logoUrl });
    } catch (error) {
      console.error("Error uploading logo:", error);
      res.status(500).json({ message: "Failed to upload logo" });
    }
  });

  // Accounting integration routes
  app.get("/api/accounting/plugins", isAuthenticated, async (req: any, res) => {
    try {
      // Mock plugins list since accounting module methods need to be implemented
      const plugins = [
        { getId: () => 'quickbooks', getName: () => 'QuickBooks', getDescription: () => 'QuickBooks integration', getSupportedFeatures: () => ['transactions', 'customers'], getPricingInfo: () => ({ price: '$29/month' }), getApiDocumentationUrl: () => 'https://developer.intuit.com' },
        { getId: () => 'xero', getName: () => 'Xero', getDescription: () => 'Xero integration', getSupportedFeatures: () => ['transactions', 'invoices'], getPricingInfo: () => ({ price: '$24/month' }), getApiDocumentationUrl: () => 'https://developer.xero.com' }
      ];
      
      res.json({
        success: true,
        plugins: plugins.map(plugin => ({
          id: plugin.getId(),
          name: plugin.getName(),
          description: plugin.getDescription(),
          features: plugin.getSupportedFeatures(),
          pricing: plugin.getPricingInfo(),
          documentation: plugin.getApiDocumentationUrl()
        }))
      });
    } catch (error) {
      console.error("Error listing accounting plugins:", error);
      res.status(500).json({ message: "Failed to list accounting plugins" });
    }
  });

  app.get("/api/accounting/integrations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const integrations = await storage.getAccountingIntegrations(userId);
      
      res.json({
        success: true,
        integrations
      });
    } catch (error) {
      console.error("Error fetching accounting integrations:", error);
      res.status(500).json({ message: "Failed to fetch accounting integrations" });
    }
  });

  app.post("/api/accounting/integrations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { pluginId } = req.body;
      
      // Mock plugin retrieval since accounting module methods need to be implemented
      const mockPlugins = {
        'quickbooks': { getName: () => 'QuickBooks' },
        'xero': { getName: () => 'Xero' }
      };
      const plugin = mockPlugins[pluginId as keyof typeof mockPlugins];
      
      if (!plugin) {
        return res.status(400).json({ message: "Invalid plugin ID" });
      }
      
      const integration = {
        userId,
        pluginId,
        pluginName: plugin.getName(),
        isEnabled: false,
        isConfigured: false,
        config: {},
        autoSyncEnabled: false,
        syncFrequency: 'weekly',
        syncTransactions: true,
        syncCustomers: true,
        syncInvoices: true,
        syncAccounts: false,
        accountMappings: {}
      };
      
      const result = await storage.createAccountingIntegration(integration);
      res.json({
        success: true,
        integration: result
      });
    } catch (error) {
      console.error("Error creating accounting integration:", error);
      res.status(500).json({ message: "Failed to create accounting integration" });
    }
  });

  app.put("/api/accounting/integrations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const integrationId = req.params.id;
      const updates = req.body;
      
      // Verify ownership
      const existing = await storage.getAccountingIntegration(integrationId, userId);
      if (!existing) {
        return res.status(404).json({ message: "Integration not found" });
      }
      
      const result = await storage.updateAccountingIntegration(integrationId, updates);
      res.json({
        success: true,
        integration: result
      });
    } catch (error) {
      console.error("Error updating accounting integration:", error);
      res.status(500).json({ message: "Failed to update accounting integration" });
    }
  });

  app.delete("/api/accounting/integrations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const integrationId = req.params.id;
      
      // Verify ownership
      const existing = await storage.getAccountingIntegration(integrationId, userId);
      if (!existing) {
        return res.status(404).json({ message: "Integration not found" });
      }
      
      await storage.deleteAccountingIntegration(integrationId);
      res.json({
        success: true,
        message: "Integration deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting accounting integration:", error);
      res.status(500).json({ message: "Failed to delete accounting integration" });
    }
  });

  app.post("/api/accounting/integrations/:id/test", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const integrationId = req.params.id;
      
      const integration = await storage.getAccountingIntegration(integrationId, userId);
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }
      
      const { accountingManager } = await import('./accounting/index');
      const plugin = accountingManager.getPlugin(integration.pluginId);
      
      if (!plugin) {
        return res.status(400).json({ message: "Plugin not found" });
      }
      
      await plugin.configure(integration.config || {});
      const testResult = await plugin.testConnection();
      
      res.json({
        success: true,
        connectionTest: testResult
      });
    } catch (error) {
      console.error("Error testing accounting integration:", error);
      res.status(500).json({ message: "Failed to test accounting integration" });
    }
  });

  app.post("/api/accounting/integrations/:id/export", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const integrationId = req.params.id;
      const { dataType, dateRange, options } = req.body;
      
      const integration = await storage.getAccountingIntegration(integrationId, userId);
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }
      
      // Create export record
      const exportRecord = {
        userId,
        integrationId,
        pluginId: integration.pluginId,
        exportType: dataType,
        status: 'pending',
        dateRangeStart: dateRange?.start ? new Date(dateRange.start) : undefined,
        dateRangeEnd: dateRange?.end ? new Date(dateRange.end) : undefined,
        recordsProcessed: 0,
        recordsSuccessful: 0,
        recordsFailed: 0,
        errors: [],
        warnings: [],
        metadata: {}
      };
      
      const exportResult = await storage.createAccountingExport(exportRecord);
      
      // Start export process asynchronously
      setImmediate(async () => {
        try {
          const { accountingManager } = await import('./accounting/index');
          const plugin = accountingManager.getPlugin(integration.pluginId);
          
          if (plugin) {
            await plugin.configure(integration.config || {});
            
            // Get data based on type and date range
            const accountingData = await storage.getAccountingData(userId, dataType, dateRange);
            
            // Perform export
            const result = await plugin.exportData(dataType, accountingData, options);
            
            // Update export record
            await storage.updateAccountingExport(exportResult.id, {
              status: result.success ? 'success' : 'failed',
              recordsProcessed: result.recordsProcessed,
              recordsSuccessful: result.recordsSuccessful,
              recordsFailed: result.recordsFailed,
              errors: result.errors,
              warnings: result.warnings,
              metadata: result.metadata,
              completedAt: new Date(),
              processingTime: result.metadata?.processingTime
            });
          }
        } catch (error) {
          console.error("Export process failed:", error);
          await storage.updateAccountingExport(exportResult.id, {
            status: 'failed',
            errors: [{ errorCode: 'EXPORT_FAILED', message: (error as Error).message, severity: 'error' }],
            completedAt: new Date()
          });
        }
      });
      
      res.json({
        success: true,
        exportId: exportResult.id,
        message: "Export started successfully"
      });
    } catch (error) {
      console.error("Error starting accounting export:", error);
      res.status(500).json({ message: "Failed to start accounting export" });
    }
  });

  app.get("/api/accounting/exports", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const exports = await storage.getAccountingExports(userId);
      
      res.json({
        success: true,
        exports
      });
    } catch (error) {
      console.error("Error fetching accounting exports:", error);
      res.status(500).json({ message: "Failed to fetch accounting exports" });
    }
  });

  app.get("/api/accounting/exports/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const exportId = req.params.id;
      
      const exportRecord = await storage.getAccountingExport(exportId, userId);
      if (!exportRecord) {
        return res.status(404).json({ message: "Export not found" });
      }
      
      res.json({
        success: true,
        export: exportRecord
      });
    } catch (error) {
      console.error("Error fetching accounting export:", error);
      res.status(500).json({ message: "Failed to fetch accounting export" });
    }
  });

  // Accounting plugin subscription routes
  app.get('/api/accounting/subscriptions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const subscriptions = await storage.getAccountingPluginSubscriptions(userId);
      res.json(subscriptions);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      res.status(500).json({ message: 'Failed to fetch subscriptions' });
    }
  });

  app.post('/api/accounting/subscriptions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { pluginId, pluginName } = req.body;

      // Check if user already has active subscription for this plugin
      const hasExisting = await storage.hasActivePluginSubscription(userId, pluginId);
      if (hasExisting) {
        return res.status(400).json({ message: 'Active subscription already exists for this plugin' });
      }

      // Create new subscription
      const subscription = await storage.createAccountingPluginSubscription({
        id: nanoid(),
        userId,
        pluginId,
        pluginName,
        status: 'active',
        monthlyFee: '9.99',
        billingCycle: 'monthly',
        autoRenew: true
      });

      res.status(201).json(subscription);
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ message: 'Failed to create subscription' });
    }
  });

  app.post('/api/accounting/subscriptions/:subscriptionId/cancel', isAuthenticated, async (req: any, res) => {
    try {
      const { subscriptionId } = req.params;
      const userId = req.user.id;

      const subscription = await storage.cancelAccountingPluginSubscription(subscriptionId, userId);
      res.json(subscription);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      res.status(500).json({ message: 'Failed to cancel subscription' });
    }
  });

  // Route to purchase accounting plugin subscription (add to cart)
  app.post('/api/cart/accounting-plugin', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { pluginId, pluginName } = req.body;

      // Check if user already has active subscription
      const hasExisting = await storage.hasActivePluginSubscription(userId, pluginId);
      if (hasExisting) {
        return res.status(400).json({ message: 'You already have an active subscription for this plugin' });
      }

      // Check if already in cart (look for matching product SKU)
      const cartItems = await storage.getCartItems(userId);
      const pluginSkuMap = {
        'quickbooks': 'DP-QB-SUB',
        'xero': 'DP-XR-SUB',
        'netsuite': 'DP-NS-SUB',
        'sage-intacct': 'DP-SI-SUB',
        'freshbooks': 'DP-FB-SUB'
      };

      const productSku = pluginSkuMap[pluginId as keyof typeof pluginSkuMap];
      if (!productSku) {
        return res.status(400).json({ message: 'Invalid plugin ID' });
      }

      // Find the product by SKU
      const products = await storage.getProducts({});
      const product = products.products.find(p => p.sku === productSku);
      if (!product) {
        return res.status(404).json({ message: 'Plugin product not found' });
      }

      // Check if already in cart
      const existingInCart = cartItems.find((item: any) => item.productId === product.id);
      if (existingInCart) {
        return res.status(400).json({ message: 'Plugin subscription is already in your cart' });
      }

      // Add to cart
      const cartItem = await storage.addToCart(userId, product.id, 1);

      res.status(201).json({ message: 'Plugin subscription added to cart', cartItem });
    } catch (error) {
      console.error('Error adding plugin to cart:', error);
      res.status(500).json({ message: 'Failed to add plugin to cart' });
    }
  });

  // Two-Factor Authentication Routes
  
  // Setup TOTP 2FA
  app.post('/api/auth/2fa/setup', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.twoFactorEnabled) {
        return res.status(400).json({ message: "Two-factor authentication is already enabled" });
      }

      const setup = await twoFactorService.setupTOTP(userId, user.email || '');
      res.json({
        qrCodeUrl: setup.qrCodeUrl,
        manualEntryKey: setup.manualEntryKey,
        backupCodes: setup.backupCodes
      });
    } catch (error) {
      console.error("Error setting up 2FA:", error);
      res.status(500).json({ message: "Failed to setup two-factor authentication" });
    }
  });

  // Verify and enable TOTP 2FA
  app.post('/api/auth/2fa/verify-setup', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: "Verification token is required" });
      }

      const clientInfo = {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      const result = await twoFactorService.verifyAndEnableTOTP(userId, token, clientInfo);
      
      if (result.success) {
        res.json({ message: "Two-factor authentication enabled successfully" });
      } else {
        res.status(400).json({ message: result.error });
      }
    } catch (error) {
      console.error("Error verifying 2FA setup:", error);
      res.status(500).json({ message: "Failed to verify two-factor authentication" });
    }
  });

  // Create 2FA verification session (for login)
  app.post('/api/auth/2fa/create-session', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { method = 'totp' } = req.body;
      
      const sessionToken = await twoFactorService.createVerificationSession(userId, method);
      res.json({ sessionToken, expiresIn: 600 }); // 10 minutes
    } catch (error) {
      console.error("Error creating 2FA session:", error);
      res.status(500).json({ message: "Failed to create verification session" });
    }
  });

  // Verify 2FA token during login or balance access
  app.post('/api/auth/2fa/verify', async (req, res) => {
    try {
      const { sessionToken, token } = req.body;
      
      if (!sessionToken || !token) {
        return res.status(400).json({ message: "Session token and verification code are required" });
      }

      const clientInfo = {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      const result = await twoFactorService.verifyLoginToken(sessionToken, token, clientInfo);
      
      if (result.success) {
        res.json({ 
          verified: true,
          token: result.token,
          message: "Two-factor authentication verified"
        });
      } else {
        res.status(400).json({ 
          verified: false,
          message: result.error,
          remainingAttempts: result.remainingAttempts
        });
      }
    } catch (error) {
      console.error("Error verifying 2FA token:", error);
      res.status(500).json({ message: "Failed to verify two-factor authentication" });
    }
  });

  // Disable 2FA
  app.post('/api/auth/2fa/disable', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { confirmationToken } = req.body;
      
      if (!confirmationToken) {
        return res.status(400).json({ message: "Confirmation token is required to disable 2FA" });
      }

      // Verify current 2FA token before disabling
      const user = await storage.getUser(userId);
      if (!user?.twoFactorEnabled) {
        return res.status(400).json({ message: "Two-factor authentication is not enabled" });
      }

      const clientInfo = {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      // First verify the token
      const sessionToken = await twoFactorService.createVerificationSession(userId, 'totp');
      const verification = await twoFactorService.verifyLoginToken(sessionToken, confirmationToken, clientInfo);
      
      if (!verification.success) {
        return res.status(400).json({ message: "Invalid confirmation token" });
      }

      const success = await twoFactorService.disable2FA(userId, clientInfo);
      
      if (success) {
        res.json({ message: "Two-factor authentication disabled successfully" });
      } else {
        res.status(500).json({ message: "Failed to disable two-factor authentication" });
      }
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      res.status(500).json({ message: "Failed to disable two-factor authentication" });
    }
  });

  // Regenerate backup codes
  app.post('/api/auth/2fa/backup-codes/regenerate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.twoFactorEnabled) {
        return res.status(400).json({ message: "Two-factor authentication is not enabled" });
      }

      const newBackupCodes = await twoFactorService.regenerateBackupCodes(userId);
      res.json({ backupCodes: newBackupCodes });
    } catch (error) {
      console.error("Error regenerating backup codes:", error);
      res.status(500).json({ message: "Failed to regenerate backup codes" });
    }
  });

  // Get 2FA status
  app.get('/api/auth/2fa/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        enabled: user.twoFactorEnabled || false,
        preferredMethod: user.twoFactorPreferredMethod || 'totp',
        backupEmail: user.twoFactorBackupEmail,
        phone: user.twoFactorPhone,
        lastUsed: user.twoFactorLastUsed,
        hasBackupCodes: user.twoFactorRecoveryCodes && (user.twoFactorRecoveryCodes as string[]).length > 0
      });
    } catch (error) {
      console.error("Error fetching 2FA status:", error);
      res.status(500).json({ message: "Failed to fetch two-factor authentication status" });
    }
  });

  // Send SMS verification (placeholder for future Twilio integration)
  app.post('/api/auth/2fa/sms/send', isAuthenticated, async (req: any, res) => {
    try {
      const { phone } = req.body;
      
      if (!phone) {
        return res.status(400).json({ message: "Phone number is required" });
      }

      const result = await twoFactorService.sendSMSVerification(phone);
      
      if (result.success) {
        res.json({ message: "SMS verification code sent successfully" });
      } else {
        res.status(400).json({ message: result.error });
      }
    } catch (error) {
      console.error("Error sending SMS verification:", error);
      res.status(500).json({ message: "Failed to send SMS verification" });
    }
  });

  // Send email verification (placeholder for future SendGrid integration)
  app.post('/api/auth/2fa/email/send', isAuthenticated, async (req: any, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email address is required" });
      }

      const result = await twoFactorService.sendEmailVerification(email);
      
      if (result.success) {
        res.json({ message: "Email verification code sent successfully" });
      } else {
        res.status(400).json({ message: result.error });
      }
    } catch (error) {
      console.error("Error sending email verification:", error);
      res.status(500).json({ message: "Failed to send email verification" });
    }
  });

  // Product image upload endpoint
  app.post('/api/products/upload-image', isAuthenticated, async (req: any, res) => {
    try {
      const multer = await import('multer');
      const { Storage } = await import('@google-cloud/storage');
      const path = await import('path');
      
      // Initialize Google Cloud Storage
      const storage = new Storage();
      const bucketName = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
      const bucket = storage.bucket(bucketName!);
      
      // Configure multer for memory storage (we'll upload to GCS directly)
      const upload = multer.default({
        storage: multer.memoryStorage(),
        limits: { 
          fileSize: 5 * 1024 * 1024, // 5MB limit
          files: 1 // Single file upload
        },
        fileFilter: (req, file, cb) => {
          const allowedTypes = /jpeg|jpg|png|webp|gif/i;
          const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
          const mimetype = allowedTypes.test(file.mimetype);
          
          if (extname && mimetype) {
            return cb(null, true);
          } else {
            cb(new Error("Only JPG, JPEG, PNG, WebP, and GIF image files are allowed"));
          }
        }
      }).single('image');

      upload(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ message: err.message });
        }

        if (!req.file) {
          return res.status(400).json({ message: "No image file provided" });
        }

        try {
          // Generate unique filename
          const timestamp = Date.now();
          const randomSuffix = Math.round(Math.random() * 1E9);
          const fileExtension = path.extname(req.file.originalname);
          const fileName = `product-images/${timestamp}-${randomSuffix}${fileExtension}`;

          // Create file reference in the public folder
          const file = bucket.file(`public/${fileName}`);
          
          // Upload file to GCS
          const stream = file.createWriteStream({
            metadata: {
              contentType: req.file.mimetype,
              cacheControl: 'public, max-age=31536000', // Cache for 1 year
            },
            public: true, // Make the file publicly accessible
          });

          stream.on('error', (error) => {
            console.error('Error uploading to GCS:', error);
            res.status(500).json({ message: "Failed to upload image" });
          });

          stream.on('finish', async () => {
            try {
              // Make the file public (just to be sure)
              await file.makePublic();
              
              // Get the public URL
              const publicUrl = `https://storage.googleapis.com/${bucketName}/public/${fileName}`;
              
              res.json({ 
                imageUrl: publicUrl,
                fileName: fileName,
                originalName: req.file!.originalname,
                size: req.file!.size
              });
            } catch (error) {
              console.error('Error making file public:', error);
              res.status(500).json({ message: "Image uploaded but failed to make public" });
            }
          });

          // Write the file data to the stream
          stream.end(req.file.buffer);
          
        } catch (error: any) {
          console.error('Error uploading product image:', error);
          res.status(500).json({ message: "Failed to upload image" });
        }
      });
    } catch (error: any) {
      console.error('Error setting up image upload:', error);
      res.status(500).json({ message: "Failed to initialize image upload" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

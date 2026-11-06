// cryptoRoutes.ts  —  Express routes for the converter components
  // Paste these into your Express app (app.ts / routes.ts)
  //
  // Dependencies already in package.json:
  //   express, node-fetch (or built-in fetch in Node 18+)
  //
  // You need a user balance table / storage layer.
  // A minimal Drizzle schema is shown at the bottom of this file.

  import { Router, Request, Response } from "express";

  const router = Router();

  // ─── 1. GET /api/crypto/prices ────────────────────────────────────────────────
  // Returns live stablecoin prices from CoinGecko (free, no API key required)
  router.get("/api/crypto/prices", async (_req: Request, res: Response) => {
    try {
      const ids = ["usd-coin", "tether", "dai", "binance-usd"];
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=usd&include_24hr_change=true`;

      const response = await fetch(url);
      const priceData: any = await response.json();

      const meta = [
        { symbol: "usdc", name: "USD Coin",     icon: "$",  apiId: "usd-coin"     },
        { symbol: "usdt", name: "Tether",        icon: "₮",  apiId: "tether"       },
        { symbol: "dai",  name: "Dai",           icon: "◈",  apiId: "dai"          },
        { symbol: "busd", name: "Binance USD",   icon: "🟡", apiId: "binance-usd"  },
      ];

      const rates = meta.map((c) => ({
        symbol:            c.symbol,
        name:              c.name,
        icon:              c.icon,
        price_usd:         priceData[c.apiId]?.usd             ?? 1.00,
        percent_change_24h:priceData[c.apiId]?.usd_24h_change  ?? 0,
      }));

      res.json(rates);
    } catch (err) {
      console.error("crypto prices error:", err);
      // Fallback — stablecoins are always ~$1
      res.json([
        { symbol: "usdc", name: "USD Coin",   icon: "$",  price_usd: 1.00, percent_change_24h: 0 },
        { symbol: "usdt", name: "Tether",     icon: "₮",  price_usd: 1.00, percent_change_24h: 0 },
        { symbol: "dai",  name: "Dai",        icon: "◈",  price_usd: 1.00, percent_change_24h: 0 },
        { symbol: "busd", name: "Binance USD",icon: "🟡", price_usd: 1.00, percent_change_24h: 0 },
      ]);
    }
  });

  // ─── 2. GET /api/user/balance ─────────────────────────────────────────────────
  // Returns the authenticated user's balance.
  // Replace `storage.getUserBalance` with your own DB call.
  router.get("/api/user/balance", isAuthenticated, async (req: any, res: Response) => {
    try {
      const balance = await storage.getUserBalance(req.user.id);
      res.json(balance);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch balance" });
    }
  });

  // ─── 3. POST /api/user/credit-balance ────────────────────────────────────────
  // Credits the converted USD (after fees) to the user's account.
  // Body: { amount: string, description: string, referenceType: string }
  router.post("/api/user/credit-balance", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { amount, description, referenceId, referenceType } = req.body;
      if (!amount || !description) return res.status(400).json({ message: "amount and description required" });

      const parsed = parseFloat(amount);
      if (isNaN(parsed) || parsed <= 0) return res.status(400).json({ message: "Invalid amount" });

      await storage.creditUserBalance(req.user.id, parsed, description, referenceId, referenceType);
      res.json({ message: "Balance credited", amount: parsed.toFixed(2) });
    } catch (err) {
      res.status(500).json({ message: "Failed to credit balance" });
    }
  });

  export default router;

  // ─── Minimal Drizzle schema for user balances ─────────────────────────────────
  /*
  import { pgTable, text, decimal, timestamp } from "drizzle-orm/pg-core";
  import { nanoid } from "nanoid";

  export const userBalances = pgTable("user_balances", {
    id:               text("id").primaryKey().$defaultFn(() => nanoid()),
    userId:           text("user_id").notNull().unique(),
    availableBalance: decimal("available_balance", { precision: 10, scale: 2 }).default("0.00").notNull(),
    pendingBalance:   decimal("pending_balance",   { precision: 10, scale: 2 }).default("0.00").notNull(),
    totalEarned:      decimal("total_earned",      { precision: 10, scale: 2 }).default("0.00").notNull(),
    totalWithdrawn:   decimal("total_withdrawn",   { precision: 10, scale: 2 }).default("0.00").notNull(),
    updatedAt:        timestamp("updated_at").defaultNow(),
  });
  */
  
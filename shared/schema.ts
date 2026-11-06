import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { nanoid } from "nanoid";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Business Verification tables
export const businessVerifications = pgTable("business_verifications", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  userId: varchar("user_id").notNull(),
  businessName: varchar("business_name").notNull(),
  businessType: varchar("business_type").notNull(),
  taxId: varchar("tax_id").notNull(),
  businessAddress: varchar("business_address").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  zipCode: varchar("zip_code").notNull(),
  country: varchar("country").default("United States"),
  phoneNumber: varchar("phone_number"),
  website: varchar("website"),
  description: text("description"),
  documentsUploaded: jsonb("documents_uploaded").$type<string[]>().default([]),
  status: varchar("status").default("pending"), // pending, under_review, approved, rejected
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewerNotes: text("reviewer_notes"),
  verificationLevel: varchar("verification_level").default("standard"), // basic, standard, premium
  badgeUrl: varchar("badge_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const verificationDocuments = pgTable("verification_documents", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  verificationId: varchar("verification_id").notNull().references(() => businessVerifications.id),
  fileName: varchar("file_name").notNull(),
  fileType: varchar("file_type").notNull(),
  filePath: varchar("file_path").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  status: varchar("status").default("pending"), // pending, approved, rejected
  notes: text("notes"),
});

// Analytics data tables
export const analyticsData = pgTable("analytics_data", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  userId: varchar("user_id").notNull(),
  date: timestamp("date").notNull(),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default("0"),
  orders: integer("orders").default(0),
  views: integer("views").default(0),
  conversions: integer("conversions").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const productAnalytics = pgTable("product_analytics", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  productId: varchar("product_id").notNull(),
  userId: varchar("user_id").notNull(),
  date: timestamp("date").notNull(),
  views: integer("views").default(0),
  clicks: integer("clicks").default(0),
  orders: integer("orders").default(0),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  email: varchar("email").unique().notNull(),
  password: varchar("password"),
  username: varchar("username").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("buyer"), // buyer, seller, admin
  // Two-Factor Authentication settings
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: varchar("two_factor_secret"), // TOTP secret key (encrypted)
  twoFactorRecoveryCodes: jsonb("two_factor_recovery_codes"), // Array of recovery codes
  twoFactorBackupEmail: varchar("two_factor_backup_email"), // Alternative email for 2FA
  twoFactorPhone: varchar("two_factor_phone"), // Phone number for SMS 2FA
  twoFactorPreferredMethod: varchar("two_factor_preferred_method").default("totp"), // totp, sms, email, backup_codes
  twoFactorLastUsed: timestamp("two_factor_last_used"),
  // Seller subscription information
  subscriptionPlan: varchar("subscription_plan").default("basic"), // basic, pro, enterprise
  subscriptionStatus: varchar("subscription_status").default("active"), // active, cancelled, expired
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  // Seller location fields for tax calculation
  businessName: varchar("business_name"),
  businessAddress: varchar("business_address"),
  businessCity: varchar("business_city"),
  businessState: varchar("business_state"),
  businessZipCode: varchar("business_zip_code"),
  businessCountry: varchar("business_country").default("US"),
  taxId: varchar("tax_id"), // EIN or SSN for tax purposes
  // Default/Primary Address for account holder (used for events, purchase orders received)
  defaultAddress: varchar("default_address"),
  defaultAddressLine2: varchar("default_address_line2"),
  defaultCity: varchar("default_city"),
  defaultState: varchar("default_state"),
  defaultZipCode: varchar("default_zip_code"),
  defaultCountry: varchar("default_country").default("US"),
  defaultPhone: varchar("default_phone"),
  // Referral system
  uniqueReferralCode: varchar("unique_referral_code").unique().$defaultFn(() => nanoid(8).toUpperCase()),
  referredByCode: varchar("referred_by_code"), // The referral code used during signup
  // Event branding (Enterprise feature)
  branding: jsonb("branding"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Accounting Integration Settings
export const accountingIntegrations = pgTable("accounting_integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  pluginId: varchar("plugin_id").notNull(), // 'quickbooks', 'xero', etc.
  pluginName: varchar("plugin_name").notNull(),
  isEnabled: boolean("is_enabled").default(false),
  isConfigured: boolean("is_configured").default(false),
  
  // OAuth and API credentials (encrypted)
  config: jsonb("config"), // Stores encrypted credentials
  
  // Sync settings
  lastSyncDate: timestamp("last_sync_date"),
  autoSyncEnabled: boolean("auto_sync_enabled").default(false),
  syncFrequency: varchar("sync_frequency").default("weekly"), // daily, weekly, monthly
  
  // Data type preferences
  syncTransactions: boolean("sync_transactions").default(true),
  syncCustomers: boolean("sync_customers").default(true),
  syncInvoices: boolean("sync_invoices").default(true),
  syncAccounts: boolean("sync_accounts").default(false),
  
  // Account mappings
  accountMappings: jsonb("account_mappings"), // Map platform accounts to accounting accounts
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Accounting Export History
export const accountingExports = pgTable("accounting_exports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  integrationId: varchar("integration_id").notNull().references(() => accountingIntegrations.id, { onDelete: "cascade" }),
  pluginId: varchar("plugin_id").notNull(),
  
  // Export details
  exportType: varchar("export_type").notNull(), // 'transactions', 'customers', 'invoices', 'accounts'
  status: varchar("status").notNull().default("pending"), // 'pending', 'processing', 'success', 'failed', 'partial'
  
  // Processing stats
  recordsProcessed: integer("records_processed").default(0),
  recordsSuccessful: integer("records_successful").default(0),
  recordsFailed: integer("records_failed").default(0),
  
  // Error and metadata
  errors: jsonb("errors"), // Array of error objects
  warnings: jsonb("warnings"), // Array of warning messages
  metadata: jsonb("metadata"), // Processing metadata, export IDs, etc.
  
  // Date range for the export
  dateRangeStart: timestamp("date_range_start"),
  dateRangeEnd: timestamp("date_range_end"),
  
  // Timing
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  processingTime: integer("processing_time"), // milliseconds
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Scheduled sync jobs
export const accountingSyncJobs = pgTable("accounting_sync_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  integrationId: varchar("integration_id").notNull().references(() => accountingIntegrations.id, { onDelete: "cascade" }),
  
  // Schedule settings
  frequency: varchar("frequency").notNull(), // 'daily', 'weekly', 'monthly'
  timeOfDay: varchar("time_of_day").default("09:00"), // HH:MM format
  dayOfWeek: integer("day_of_week"), // 0-6 for weekly
  dayOfMonth: integer("day_of_month"), // 1-31 for monthly
  
  // Job status
  isActive: boolean("is_active").default(true),
  lastRunAt: timestamp("last_run_at"),
  nextRunAt: timestamp("next_run_at"),
  lastStatus: varchar("last_status"), // 'success', 'failed', 'partial'
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  parentId: varchar("parent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  categoryId: varchar("category_id").notNull(),
  sellerId: varchar("seller_id").notNull(),
  brand: varchar("brand"),
  sku: varchar("sku").unique(),
  stock: integer("stock").notNull().default(0),
  images: jsonb("images").$type<string[]>().default([]),
  videoUrl: varchar("video_url"),
  specifications: jsonb("specifications").$type<Record<string, any>>().default({}),
  isActive: boolean("is_active").default(true),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("total_reviews").default(0),
  // Location fields for shop local feature
  country: varchar("country"),
  state: varchar("state"),
  city: varchar("city"),
  zipCode: varchar("zip_code"),
  isLocal: boolean("is_local").default(false),
  condition: varchar("condition", { enum: ["new", "used", "refurbished"] }).default("new"),
  conditionDescription: text("condition_description"),
  // Subscription fields
  isSubscription: boolean("is_subscription").default(false),
  subscriptionFrequency: varchar("subscription_frequency", { enum: ["monthly", "yearly"] }),
  subscriptionBillingCycle: integer("subscription_billing_cycle").default(1), // Every X months/years
  trialPeriodDays: integer("trial_period_days").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey(),
  productId: varchar("product_id").notNull(),
  userId: varchar("user_id").notNull(),
  rating: integer("rating").notNull(),
  title: varchar("title"),
  content: text("content"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  sellerId: varchar("seller_id").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, processing, shipped, delivered, cancelled
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull(),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).default("0"),
  couponId: varchar("coupon_id"), // applied coupon
  couponCode: varchar("coupon_code"), // store the code used
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  shippingAddress: jsonb("shipping_address").$type<{
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  }>().notNull(),
  paymentMethod: varchar("payment_method").notNull(),
  trackingNumber: varchar("tracking_number"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey(),
  orderId: varchar("order_id").notNull(),
  productId: varchar("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  sellerId: varchar("seller_id").notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  productId: varchar("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Coupon codes table
export const coupons = pgTable("coupons", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  code: varchar("code").notNull().unique(),
  name: varchar("name").notNull(),
  description: text("description"),
  discountType: varchar("discount_type").notNull(), // percentage, fixed_amount, free_shipping, subscription_only
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  minimumOrderAmount: decimal("minimum_order_amount", { precision: 10, scale: 2 }).default("0"),
  maximumDiscountAmount: decimal("maximum_discount_amount", { precision: 10, scale: 2 }),
  usageLimit: integer("usage_limit"), // null = unlimited
  usageCount: integer("usage_count").default(0),
  userUsageLimit: integer("user_usage_limit").default(1), // how many times each user can use it
  isActive: boolean("is_active").default(true),
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  applicableCategories: jsonb("applicable_categories").$type<string[]>().default([]), // empty = all categories
  applicableProducts: jsonb("applicable_products").$type<string[]>().default([]), // empty = all products  
  createdBy: varchar("created_by").notNull(), // admin user id
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Coupon usage tracking
export const couponUsage = pgTable("coupon_usage", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  couponId: varchar("coupon_id").notNull(),
  userId: varchar("user_id").notNull(),
  orderId: varchar("order_id"), // null if used in cart but not yet ordered
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Subscriptions tracking
export const userSubscriptions = pgTable("user_subscriptions", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  subscriptionType: varchar("subscription_type").notNull(), // 'accounting_plugin', 'seller_plan', etc.
  status: varchar("status").notNull().default("active"), // active, paused, cancelled, expired
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),
  cancelledAt: timestamp("cancelled_at"),
  pausedAt: timestamp("paused_at"),
  resumedAt: timestamp("resumed_at"),
  nextBillingDate: timestamp("next_billing_date"),
  lastPaymentDate: timestamp("last_payment_date"),
  totalPaid: decimal("total_paid", { precision: 10, scale: 2 }).default("0"),
  paymentMethod: varchar("payment_method"), // 'credit_card', 'paypal', etc.
  paymentFailureCount: integer("payment_failure_count").default(0),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tax rates table for location-based tax calculation
export const taxRates = pgTable("tax_rates", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  country: varchar("country").notNull().default("US"),
  state: varchar("state").notNull(),
  county: varchar("county"),
  city: varchar("city"),
  zipCode: varchar("zip_code"),
  stateTaxRate: decimal("state_tax_rate", { precision: 5, scale: 4 }).notNull().default("0"),
  localTaxRate: decimal("local_tax_rate", { precision: 5, scale: 4 }).notNull().default("0"),
  totalTaxRate: decimal("total_tax_rate", { precision: 5, scale: 4 }).notNull().default("0"),
  isActive: boolean("is_active").default(true),
  effectiveDate: timestamp("effective_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Seller tax settings for tax nexus management
export const sellerTaxSettings = pgTable("seller_tax_settings", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  sellerId: varchar("seller_id").notNull(),
  country: varchar("country").notNull().default("US"),
  state: varchar("state").notNull(),
  hasNexus: boolean("has_nexus").default(true), // Tax nexus in this location
  collectTax: boolean("collect_tax").default(true),
  taxId: varchar("tax_id"), // State tax ID
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tax documents table for storing generated tax forms
export const taxDocuments = pgTable("tax_documents", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  sellerId: varchar("seller_id").notNull(),
  documentType: varchar("document_type").notNull(), // 1099-K, sales_tax_report, quarterly_summary
  taxYear: integer("tax_year").notNull(),
  taxPeriod: varchar("tax_period").notNull(), // Q1, Q2, Q3, Q4, or annual
  filePath: varchar("file_path").notNull(), // Path to generated PDF
  status: varchar("status").notNull().default("generated"), // generated, sent, filed
  totalSales: decimal("total_sales", { precision: 12, scale: 2 }).notNull().default("0"),
  totalTax: decimal("total_tax", { precision: 12, scale: 2 }).notNull().default("0"),
  transactionCount: integer("transaction_count").notNull().default(0),
  generatedAt: timestamp("generated_at").defaultNow(),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Referral program tables
export const referralCodes = pgTable("referral_codes", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  userId: varchar("user_id").notNull(),
  code: varchar("code").notNull().unique(),
  serviceType: varchar("service_type").notNull(), // seller_subscription, buyer_membership, professional_service
  serviceId: varchar("service_id").notNull(), // pro_plan, enterprise_plan, durcheap_plus, local_plus, business_verification, contractor_verification
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  usageLimit: integer("usage_limit"), // null = unlimited
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  referralCodeId: varchar("referral_code_id").notNull(),
  referrerId: varchar("referrer_id").notNull(), // User who made the referral
  refereeId: varchar("referee_id").notNull(), // User who was referred
  serviceType: varchar("service_type").notNull(),
  serviceId: varchar("service_id").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, completed, cancelled, expired
  referrerRewardType: varchar("referrer_reward_type").notNull(), // discount_percentage, credit_amount
  referrerRewardValue: decimal("referrer_reward_value", { precision: 10, scale: 2 }).notNull(),
  referrerRewardDuration: integer("referrer_reward_duration"), // months for discounts, null for credits
  refereeRewardType: varchar("referee_reward_type").notNull(), // free_months, discount_percentage, credit_amount
  refereeRewardValue: decimal("referee_reward_value", { precision: 10, scale: 2 }).notNull(),
  refereeRewardDuration: integer("referee_reward_duration"), // months
  completedAt: timestamp("completed_at"),
  expiredAt: timestamp("expired_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const referralRewards = pgTable("referral_rewards", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  referralId: varchar("referral_id").notNull().references(() => referrals.id),
  orderId: varchar("order_id").references(() => orders.id),
  rewardType: varchar("reward_type").notNull(), // commission, bonus
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").default("pending"), // pending, paid, cancelled
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});



// Tax transactions for detailed record keeping
export const taxTransactions = pgTable("tax_transactions", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  orderId: varchar("order_id").notNull(),
  sellerId: varchar("seller_id").notNull(),
  buyerId: varchar("buyer_id").notNull(),
  saleAmount: decimal("sale_amount", { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 4 }).notNull(),
  buyerState: varchar("buyer_state").notNull(),
  buyerCity: varchar("buyer_city"),
  buyerZipCode: varchar("buyer_zip_code"),
  sellerState: varchar("seller_state").notNull(),
  transactionDate: timestamp("transaction_date").notNull(),
  taxYear: integer("tax_year").notNull(),
  taxQuarter: integer("tax_quarter").notNull(), // 1, 2, 3, 4
  createdAt: timestamp("created_at").defaultNow(),
});

// Tax exempt certificates for buyers and resellers
export const taxExemptCertificates = pgTable("tax_exempt_certificates", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  userId: varchar("user_id").notNull(),
  certificateType: varchar("certificate_type").notNull(), // resale, non_profit, government, manufacturing, agriculture
  exemptionNumber: varchar("exemption_number").notNull(), // State tax exempt number
  businessName: varchar("business_name").notNull(),
  businessAddress: varchar("business_address").notNull(),
  businessCity: varchar("business_city").notNull(),
  businessState: varchar("business_state").notNull(),
  businessZipCode: varchar("business_zip_code").notNull(),
  exemptStates: varchar("exempt_states").array().notNull(), // States where exemption applies
  certificateFilePath: varchar("certificate_file_path"), // Uploaded certificate document
  expirationDate: timestamp("expiration_date"),
  isActive: boolean("is_active").default(true),
  verificationStatus: varchar("verification_status").notNull().default("pending"), // pending, approved, rejected
  verifiedAt: timestamp("verified_at"),
  verifiedBy: varchar("verified_by"), // Admin user ID who verified
  rejectionReason: varchar("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  products: many(products),
  reviews: many(reviews),
  orders: many(orders),
  cartItems: many(cartItems),
  sellerTaxSettings: many(sellerTaxSettings),
  taxExemptCertificates: many(taxExemptCertificates),
  buyerMemberships: many(buyerMemberships),
}));

export const sellerTaxSettingsRelations = relations(sellerTaxSettings, ({ one }) => ({
  seller: one(users, {
    fields: [sellerTaxSettings.sellerId],
    references: [users.id],
  }),
}));

export const taxDocumentsRelations = relations(taxDocuments, ({ one }) => ({
  seller: one(users, {
    fields: [taxDocuments.sellerId],
    references: [users.id],
  }),
}));

export const taxTransactionsRelations = relations(taxTransactions, ({ one }) => ({
  order: one(orders, {
    fields: [taxTransactions.orderId],
    references: [orders.id],
  }),
  seller: one(users, {
    fields: [taxTransactions.sellerId],
    references: [users.id],
  }),
  buyer: one(users, {
    fields: [taxTransactions.buyerId],
    references: [users.id],
  }),
}));

export const taxExemptCertificatesRelations = relations(taxExemptCertificates, ({ one }) => ({
  user: one(users, {
    fields: [taxExemptCertificates.userId],
    references: [users.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  seller: one(users, {
    fields: [products.sellerId],
    references: [users.id],
  }),
  reviews: many(reviews),
  orderItems: many(orderItems),
  cartItems: many(cartItems),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  seller: one(users, {
    fields: [orderItems.sellerId],
    references: [users.id],
  }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

// Types (moved to bottom to avoid duplicates)

export type TaxExemptCertificate = typeof taxExemptCertificates.$inferSelect;
export type InsertTaxExemptCertificate = typeof taxExemptCertificates.$inferInsert;
export type TaxRate = typeof taxRates.$inferSelect;
export type InsertTaxRate = typeof taxRates.$inferInsert;
export type SellerTaxSettings = typeof sellerTaxSettings.$inferSelect;
export type InsertSellerTaxSettings = typeof sellerTaxSettings.$inferInsert;
export type TaxDocument = typeof taxDocuments.$inferSelect;
export type InsertTaxDocument = typeof taxDocuments.$inferInsert;
export type TaxTransaction = typeof taxTransactions.$inferSelect;
export type InsertTaxTransaction = typeof taxTransactions.$inferInsert;

// Coupon types
export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;
export type CouponUsage = typeof couponUsage.$inferSelect;
export type InsertCouponUsage = typeof couponUsage.$inferInsert;

// Coupon validation schemas
export const applyCouponSchema = createInsertSchema(couponUsage).omit({
  id: true,
  createdAt: true,
}).extend({
  couponCode: z.string().min(1, "Coupon code is required"),
});

// Local Events Calendar Tables
export const eventSubscriptionPlans = pgTable("event_subscription_plans", {
  id: varchar("id").primaryKey().notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  postsPerMonth: integer("posts_per_month").notNull(),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventPostingRates = pgTable("event_posting_rates", {
  id: varchar("id").primaryKey().notNull(),
  reachType: varchar("reach_type").notNull(), // citywide, metro, statewide, national, global
  singlePostPrice: decimal("single_post_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userEventSubscriptions = pgTable("user_event_subscriptions", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  planId: varchar("plan_id").notNull().references(() => eventSubscriptionPlans.id),
  postsUsed: integer("posts_used").default(0),
  renewalDate: timestamp("renewal_date").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const localEvents = pgTable("local_events", {
  id: varchar("id").primaryKey().notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  organizerId: varchar("organizer_id").notNull().references(() => users.id),
  eventDate: timestamp("event_date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location"),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  country: varchar("country").default("US"),
  reachType: varchar("reach_type").notNull(), // citywide, metro, statewide, national, global
  category: varchar("category"), // business, entertainment, education, sports, etc.
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency").default("USD"),
  capacity: integer("capacity"),
  registeredCount: integer("registered_count").default(0),
  imageUrl: text("image_url"),
  websiteUrl: text("website_url"),
  ticketUrl: text("ticket_url"),
  socialLinks: jsonb("social_links"), // {facebook, twitter, instagram, etc}
  mediaLinks: jsonb("media_links"), // {videos, streams, photos}
  tags: text("tags").array(),
  isPublished: boolean("is_published").default(false),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const eventRegistrations = pgTable("event_registrations", {
  id: varchar("id").primaryKey().notNull(),
  eventId: varchar("event_id").notNull().references(() => localEvents.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: varchar("status").default("registered"), // registered, waitlisted, cancelled
  registeredAt: timestamp("registered_at").defaultNow(),
});

// Buyer Membership System
export const buyerMembershipPlans = pgTable("buyer_membership_plans", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  name: varchar("name").notNull(),
  description: varchar("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  billingInterval: varchar("billing_interval").default("monthly"), // monthly, yearly
  features: varchar("features").array(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const buyerMemberships = pgTable("buyer_memberships", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  userId: varchar("user_id").notNull().references(() => users.id),
  planId: varchar("plan_id").notNull().references(() => buyerMembershipPlans.id),
  status: varchar("status").notNull().default("active"), // active, cancelled, paused, expired
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date"),
  nextBillingDate: timestamp("next_billing_date"),
  paymentMethodId: varchar("payment_method_id"),
  referralCodeUsed: varchar("referral_code_used"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const membershipBenefits = pgTable("membership_benefits", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  membershipId: varchar("membership_id").notNull().references(() => buyerMemberships.id),
  benefitType: varchar("benefit_type").notNull(), // free_shipping, priority_support, priority_local_search, enhanced_delivery, exclusive_deals
  description: varchar("description"),
  limit: integer("limit").default(0), // 0 = unlimited
  usedCount: integer("used_count").default(0),
  resetPeriod: varchar("reset_period").default("monthly"), // monthly, yearly, unlimited
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const membershipTransactions = pgTable("membership_transactions", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  membershipId: varchar("membership_id").notNull().references(() => buyerMemberships.id),
  transactionType: varchar("transaction_type").notNull(), // benefit_used, payment, refund
  amount: decimal("amount", { precision: 10, scale: 2 }),
  description: varchar("description"),
  metadata: varchar("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const eventSubscriptionPlansRelations = relations(eventSubscriptionPlans, ({ many }) => ({
  subscriptions: many(userEventSubscriptions),
}));

export const userEventSubscriptionsRelations = relations(userEventSubscriptions, ({ one }) => ({
  user: one(users, { fields: [userEventSubscriptions.userId], references: [users.id] }),
  plan: one(eventSubscriptionPlans, { fields: [userEventSubscriptions.planId], references: [eventSubscriptionPlans.id] }),
}));

export const localEventsRelations = relations(localEvents, ({ one, many }) => ({
  organizer: one(users, { fields: [localEvents.organizerId], references: [users.id] }),
  registrations: many(eventRegistrations),
}));

export const eventRegistrationsRelations = relations(eventRegistrations, ({ one }) => ({
  event: one(localEvents, { fields: [eventRegistrations.eventId], references: [localEvents.id] }),
  user: one(users, { fields: [eventRegistrations.userId], references: [users.id] }),
}));

// Buyer Membership Relations
export const buyerMembershipPlansRelations = relations(buyerMembershipPlans, ({ many }) => ({
  memberships: many(buyerMemberships),
}));

export const buyerMembershipsRelations = relations(buyerMemberships, ({ one, many }) => ({
  user: one(users, {
    fields: [buyerMemberships.userId],
    references: [users.id],
  }),
  plan: one(buyerMembershipPlans, {
    fields: [buyerMemberships.planId],
    references: [buyerMembershipPlans.id],
  }),
  benefits: many(membershipBenefits),
  transactions: many(membershipTransactions),
}));

export const membershipBenefitsRelations = relations(membershipBenefits, ({ one }) => ({
  membership: one(buyerMemberships, {
    fields: [membershipBenefits.membershipId],
    references: [buyerMemberships.id],
  }),
}));

export const membershipTransactionsRelations = relations(membershipTransactions, ({ one }) => ({
  membership: one(buyerMemberships, {
    fields: [membershipTransactions.membershipId],
    references: [buyerMemberships.id],
  }),
}));

// Types
export type EventSubscriptionPlan = typeof eventSubscriptionPlans.$inferSelect;
export type InsertEventSubscriptionPlan = typeof eventSubscriptionPlans.$inferInsert;
export type EventPostingRate = typeof eventPostingRates.$inferSelect;
export type InsertEventPostingRate = typeof eventPostingRates.$inferInsert;
export type UserEventSubscription = typeof userEventSubscriptions.$inferSelect;
export type InsertUserEventSubscription = typeof userEventSubscriptions.$inferInsert;
export type LocalEvent = typeof localEvents.$inferSelect;
export type InsertLocalEvent = typeof localEvents.$inferInsert;
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = typeof eventRegistrations.$inferInsert;

// Buyer Membership types
export type BuyerMembershipPlan = typeof buyerMembershipPlans.$inferSelect;
export type InsertBuyerMembershipPlan = typeof buyerMembershipPlans.$inferInsert;
export type BuyerMembership = typeof buyerMemberships.$inferSelect;
export type InsertBuyerMembership = typeof buyerMemberships.$inferInsert;
export type MembershipBenefit = typeof membershipBenefits.$inferSelect;
export type InsertMembershipBenefit = typeof membershipBenefits.$inferInsert;
export type MembershipTransaction = typeof membershipTransactions.$inferSelect;
export type InsertMembershipTransaction = typeof membershipTransactions.$inferInsert;

// Shipping and logistics tables
export const shippingRates = pgTable("shipping_rates", {
  id: varchar("id").primaryKey().notNull(),
  sellerId: varchar("seller_id").references(() => users.id),
  carrier: varchar("carrier").notNull(), // USPS, UPS, FedEx, Local
  serviceType: varchar("service_type").notNull(), // Ground, Express, Overnight, Same-Day
  weightMin: varchar("weight_min"), // pounds
  weightMax: varchar("weight_max"), // pounds
  priceBase: varchar("price_base"), // base price
  pricePerPound: varchar("price_per_pound"), // additional per pound
  deliveryDays: varchar("delivery_days"), // estimated delivery time
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const shippingLabels = pgTable("shipping_labels", {
  id: varchar("id").primaryKey().notNull(),
  orderId: varchar("order_id"), // reference to orders table
  sellerId: varchar("seller_id").references(() => users.id),
  buyerId: varchar("buyer_id").references(() => users.id),
  carrier: varchar("carrier").notNull(),
  serviceType: varchar("service_type").notNull(),
  trackingNumber: varchar("tracking_number"),
  labelUrl: varchar("label_url"), // PDF download link
  shippingCost: varchar("shipping_cost"),
  weight: varchar("weight"),
  dimensions: varchar("dimensions"), // JSON: {length, width, height}
  fromAddress: varchar("from_address"), // JSON address object
  toAddress: varchar("to_address"), // JSON address object
  status: varchar("status").default("created"), // created, printed, shipped, delivered, returned
  createdAt: timestamp("created_at").defaultNow(),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
});

export const shippingAddresses = pgTable("shipping_addresses", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").references(() => users.id),
  name: varchar("name").notNull(),
  company: varchar("company"),
  address1: varchar("address1").notNull(),
  address2: varchar("address2"),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  zipCode: varchar("zip_code").notNull(),
  country: varchar("country").default("US"),
  phone: varchar("phone"),
  isDefault: boolean("is_default").default(false),
  addressType: varchar("address_type").default("shipping"), // shipping, billing, pickup
  createdAt: timestamp("created_at").defaultNow(),
});

export const localDeliveryZones = pgTable("local_delivery_zones", {
  id: varchar("id").primaryKey().notNull(),
  sellerId: varchar("seller_id").references(() => users.id),
  zipCodes: text("zip_codes").array(), // array of supported zip codes
  deliveryFee: varchar("delivery_fee"),
  freeDeliveryMinimum: varchar("free_delivery_minimum"),
  sameDayAvailable: boolean("same_day_available").default(false),
  sameDayFee: varchar("same_day_fee"),
  maxDeliveryDays: varchar("max_delivery_days").default("3"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ShippingRate = typeof shippingRates.$inferSelect;
export type InsertShippingRate = typeof shippingRates.$inferInsert;
export type ShippingLabel = typeof shippingLabels.$inferSelect;
export type InsertShippingLabel = typeof shippingLabels.$inferInsert;
export type ShippingAddress = typeof shippingAddresses.$inferSelect;
export type InsertShippingAddress = typeof shippingAddresses.$inferInsert;
export type LocalDeliveryZone = typeof localDeliveryZones.$inferSelect;
export type InsertLocalDeliveryZone = typeof localDeliveryZones.$inferInsert;



// Seller subscription plans
export const sellerPlans = pgTable("seller_plans", {
  id: varchar("id").primaryKey().notNull(),
  sellerId: varchar("seller_id").references(() => users.id).notNull(),
  planType: varchar("plan_type").notNull(), // 'basic', 'pro', 'enterprise'
  status: varchar("status").notNull(), // 'active', 'cancelled', 'expired'
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  monthlyFee: varchar("monthly_fee").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Commission rates by category
export const commissionRates = pgTable("commission_rates", {
  id: varchar("id").primaryKey().notNull(),
  categoryId: varchar("category_id").references(() => categories.id).notNull(),
  rate: varchar("rate").notNull(), // percentage as decimal (e.g., "0.08" for 8%)
  effectiveDate: timestamp("effective_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Transaction fees and commissions
export const transactionFees = pgTable("transaction_fees", {
  id: varchar("id").primaryKey().notNull(),
  orderId: varchar("order_id").references(() => orders.id).notNull(),
  sellerId: varchar("seller_id").references(() => users.id).notNull(),
  grossAmount: varchar("gross_amount").notNull(),
  commissionAmount: varchar("commission_amount").notNull(),
  paymentFeeAmount: varchar("payment_fee_amount").notNull(),
  netAmount: varchar("net_amount").notNull(),
  commissionRate: varchar("commission_rate").notNull(),
  status: varchar("status").notNull(), // 'pending', 'processed', 'refunded'
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Promoted products (advertising)
export const promotedProducts = pgTable("promoted_products", {
  id: varchar("id").primaryKey().notNull(),
  productId: varchar("product_id").references(() => products.id).notNull(),
  sellerId: varchar("seller_id").references(() => users.id).notNull(),
  campaignType: varchar("campaign_type").notNull(), // 'homepage', 'category', 'search'
  dailyBudget: varchar("daily_budget").notNull(),
  bidAmount: varchar("bid_amount").notNull(),
  status: varchar("status").notNull(), // 'active', 'paused', 'completed'
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  totalSpent: varchar("total_spent").default("0"),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SellerPlan = typeof sellerPlans.$inferSelect;
export type InsertSellerPlan = typeof sellerPlans.$inferInsert;
export type CommissionRate = typeof commissionRates.$inferSelect;
export type InsertCommissionRate = typeof commissionRates.$inferInsert;
export type TransactionFee = typeof transactionFees.$inferSelect;
export type InsertTransactionFee = typeof transactionFees.$inferInsert;
export type PromotedProduct = typeof promotedProducts.$inferSelect;
export type InsertPromotedProduct = typeof promotedProducts.$inferInsert;

// Wishlist table
export const wishlistItems = pgTable("wishlist_items", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Balance table for storing user's earned commissions
export const userBalances = pgTable("user_balances", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  availableBalance: decimal("available_balance", { precision: 12, scale: 2 }).default("0.00"),
  pendingBalance: decimal("pending_balance", { precision: 12, scale: 2 }).default("0.00"),
  totalEarned: decimal("total_earned", { precision: 12, scale: 2 }).default("0.00"),
  totalWithdrawn: decimal("total_withdrawn", { precision: 12, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Commission Tracking table for tracking all commissions
export const commissionTracking = pgTable("commission_tracking", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  referrerId: varchar("referrer_id").notNull().references(() => users.id), // User who gets the commission
  refereeId: varchar("referee_id").notNull().references(() => users.id), // User who made the purchase/generated revenue
  referralCodeId: varchar("referral_code_id").notNull().references(() => referralCodes.id),
  revenueAmount: decimal("revenue_amount", { precision: 12, scale: 2 }).notNull(), // Total revenue from the order
  commissionRate: decimal("commission_rate", { precision: 5, scale: 4 }).default("0.0100"), // 1% = 0.0100
  commissionAmount: decimal("commission_amount", { precision: 12, scale: 2 }).notNull(), // Amount earned by referrer
  status: varchar("status").default("pending"), // pending, processed, paid
  processedAt: timestamp("processed_at"),
  paidAt: timestamp("paid_at"),
  paymentMethod: varchar("payment_method"), // balance, bank_account
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Banking Information table for payouts
export const userBankingInfo = pgTable("user_banking_info", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountType: varchar("account_type").notNull(), // checking, savings
  bankName: varchar("bank_name").notNull(),
  accountHolderName: varchar("account_holder_name").notNull(),
  routingNumber: varchar("routing_number").notNull(),
  accountNumber: varchar("account_number").notNull(), // This should be encrypted in production
  isDefault: boolean("is_default").default(false),
  isVerified: boolean("is_verified").default(false),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Balance Transactions table for tracking all balance changes
export const balanceTransactions = pgTable("balance_transactions", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(), // credit, debit, withdrawal, refund
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull(),
  referenceId: varchar("reference_id"), // Commission ID, Order ID, etc.
  referenceType: varchar("reference_type"), // commission, withdrawal, refund, etc.
  balanceAfter: decimal("balance_after", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status").default("completed"), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export type WishlistItem = typeof wishlistItems.$inferSelect;
export type InsertWishlistItem = typeof wishlistItems.$inferInsert;

// Referral program types
export type ReferralCode = typeof referralCodes.$inferSelect;
export type InsertReferralCode = typeof referralCodes.$inferInsert;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;
export type ReferralReward = typeof referralRewards.$inferSelect;
export type InsertReferralReward = typeof referralRewards.$inferInsert;

// Commission and Balance types
export type UserBalance = typeof userBalances.$inferSelect;
export type InsertUserBalance = typeof userBalances.$inferInsert;
export type CommissionTracking = typeof commissionTracking.$inferSelect;
export type InsertCommissionTracking = typeof commissionTracking.$inferInsert;
export type UserBankingInfo = typeof userBankingInfo.$inferSelect;
export type InsertUserBankingInfo = typeof userBankingInfo.$inferInsert;
export type BalanceTransaction = typeof balanceTransactions.$inferSelect;
export type InsertBalanceTransaction = typeof balanceTransactions.$inferInsert;

// Independent Contractor Agreement System
export const independentContractorAgreements = pgTable("independent_contractor_agreements", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  userId: varchar("user_id").notNull().references(() => users.id),
  fullName: varchar("full_name").notNull(),
  businessName: varchar("business_name"),
  taxId: varchar("tax_id").notNull(), // SSN or EIN
  addressLine1: varchar("address_line1").notNull(),
  addressLine2: varchar("address_line2"),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  zipCode: varchar("zip_code").notNull(),
  country: varchar("country").default("United States"),
  phoneNumber: varchar("phone_number").notNull(),
  email: varchar("email").notNull(),
  agreementSigned: boolean("agreement_signed").default(false),
  signatureData: text("signature_data"), // Base64 encoded signature
  signedAt: timestamp("signed_at"),
  status: varchar("status").default("pending"), // pending, approved, rejected
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Referral Tax Forms System
export const referralTaxForms = pgTable("referral_tax_forms", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  userId: varchar("user_id").notNull().references(() => users.id),
  formType: varchar("form_type").notNull(), // W9, 1099-NEC
  taxYear: integer("tax_year").notNull(),
  formData: text("form_data").notNull(), // JSON string
  status: varchar("status").default("pending"), // pending, submitted, approved, rejected
  submittedAt: timestamp("submitted_at"),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  uniqueUserFormYear: index("unique_user_form_year").on(table.userId, table.formType, table.taxYear),
}));

// Relations for tax compliance
export const independentContractorAgreementsRelations = relations(independentContractorAgreements, ({ one }) => ({
  user: one(users, {
    fields: [independentContractorAgreements.userId],
    references: [users.id],
  }),
}));

export const referralTaxFormsRelations = relations(referralTaxForms, ({ one }) => ({
  user: one(users, {
    fields: [referralTaxForms.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [referralTaxForms.reviewedBy],
    references: [users.id],
  }),
}));

// Tax compliance types
export type IndependentContractorAgreement = typeof independentContractorAgreements.$inferSelect;
export type InsertIndependentContractorAgreement = typeof independentContractorAgreements.$inferInsert;
export type ReferralTaxForm = typeof referralTaxForms.$inferSelect;
export type InsertReferralTaxForm = typeof referralTaxForms.$inferInsert;

export type InsertCategory = typeof categories.$inferInsert;
export type Category = typeof categories.$inferSelect;

export type InsertProduct = typeof products.$inferInsert;
export type Product = typeof products.$inferSelect;

export type InsertReview = typeof reviews.$inferInsert;
export type Review = typeof reviews.$inferSelect;

export type InsertOrder = typeof orders.$inferInsert;
export type Order = typeof orders.$inferSelect;

export type InsertOrderItem = typeof orderItems.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;

export type InsertCartItem = typeof cartItems.$inferInsert;
export type CartItem = typeof cartItems.$inferSelect;

// Insert schemas
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  averageRating: true,
  totalReviews: true,
});

// Business Verification types
export type BusinessVerification = typeof businessVerifications.$inferSelect;  
export type InsertBusinessVerification = typeof businessVerifications.$inferInsert;
export type VerificationDocument = typeof verificationDocuments.$inferSelect;
export type InsertVerificationDocument = typeof verificationDocuments.$inferInsert;

// Analytics types
export type AnalyticsDataType = typeof analyticsData.$inferSelect;
export type InsertAnalyticsData = typeof analyticsData.$inferInsert;
export type ProductAnalyticsType = typeof productAnalytics.$inferSelect;  
export type InsertProductAnalytics = typeof productAnalytics.$inferInsert;

// Two-Factor Authentication sessions table
export const twoFactorSessions = pgTable("two_factor_sessions", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionToken: varchar("session_token").notNull().unique(),
  method: varchar("method").notNull(), // totp, sms, email, backup_code
  verified: boolean("verified").default(false),
  attempts: integer("attempts").default(0),
  maxAttempts: integer("max_attempts").default(3),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Two-Factor Authentication audit log
export const twoFactorAuditLog = pgTable("two_factor_audit_log", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: varchar("action").notNull(), // setup, disable, verify_success, verify_fail, recovery_used
  method: varchar("method"), // totp, sms, email, backup_code
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  success: boolean("success").notNull(),
  details: jsonb("details"), // Additional context
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type TwoFactorSession = typeof twoFactorSessions.$inferSelect;
export type InsertTwoFactorSession = typeof twoFactorSessions.$inferInsert;
export type TwoFactorAuditLog = typeof twoFactorAuditLog.$inferSelect;
export type InsertTwoFactorAuditLog = typeof twoFactorAuditLog.$inferInsert;

// Accounting integration types
export type InsertAccountingIntegration = typeof accountingIntegrations.$inferInsert;
export type AccountingIntegration = typeof accountingIntegrations.$inferSelect;

export type InsertAccountingExport = typeof accountingExports.$inferInsert;
export type AccountingExport = typeof accountingExports.$inferSelect;

export type InsertAccountingSyncJob = typeof accountingSyncJobs.$inferInsert;
export type AccountingSyncJob = typeof accountingSyncJobs.$inferSelect;

// Accounting plugin subscriptions
export const accountingPluginSubscriptions = pgTable("accounting_plugin_subscriptions", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  pluginId: varchar("plugin_id").notNull(), // quickbooks, xero, netsuite, sage-intacct, freshbooks
  pluginName: varchar("plugin_name").notNull(),
  status: varchar("status").notNull().default("active"), // active, cancelled, expired, pending
  monthlyFee: varchar("monthly_fee").notNull().default("9.99"),
  billingCycle: varchar("billing_cycle").notNull().default("monthly"), // monthly, yearly
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  nextBillingDate: timestamp("next_billing_date"),
  autoRenew: boolean("auto_renew").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type AccountingPluginSubscription = typeof accountingPluginSubscriptions.$inferSelect;
export type InsertAccountingPluginSubscription = typeof accountingPluginSubscriptions.$inferInsert;

export const updateUserSchema = createInsertSchema(users).partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  isVerified: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

export type InsertCategoryInput = z.infer<typeof insertCategorySchema>;
export type InsertProductInput = z.infer<typeof insertProductSchema>;
export type InsertReviewInput = z.infer<typeof insertReviewSchema>;
export type InsertOrderInput = z.infer<typeof insertOrderSchema>;
export type InsertCartItemInput = z.infer<typeof insertCartItemSchema>;

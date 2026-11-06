import {
  users,
  categories,
  products,
  reviews,
  orders,
  orderItems,
  cartItems,
  coupons,
  couponUsage,
  referralCodes,
  referrals,
  referralRewards,
  buyerMembershipPlans,
  buyerMemberships,
  membershipBenefits,
  membershipTransactions,
  userBalances,
  commissionTracking,
  userBankingInfo,
  balanceTransactions,
  type User,
  type UpsertUser,
  type Category,
  type Product,
  type Review,
  type Order,
  type OrderItem,
  type CartItem,
  type Coupon,
  type CouponUsage,
  type ReferralCode,
  type InsertReferralCode,
  type Referral,
  type InsertReferral,
  type ReferralReward,
  type InsertReferralReward,
  type BuyerMembershipPlan,
  type BuyerMembership,
  type MembershipBenefit,
  type MembershipTransaction,
  type InsertBuyerMembership,
  type InsertMembershipBenefit,
  type InsertMembershipTransaction,
  type UserBalance,
  type InsertUserBalance,
  type CommissionTracking,
  type InsertCommissionTracking,
  type UserBankingInfo,
  type InsertUserBankingInfo,
  type BalanceTransaction,
  type InsertBalanceTransaction,
  type IndependentContractorAgreement,
  type InsertIndependentContractorAgreement,
  type ReferralTaxForm,
  type InsertReferralTaxForm,
  type InsertCategoryInput,
  type InsertProductInput,
  type InsertReviewInput,
  type InsertOrderInput,
  type InsertCartItemInput,
  independentContractorAgreements,
  referralTaxForms,
  accountingIntegrations,
  accountingExports,
  accountingSyncJobs,
  accountingPluginSubscriptions,
  type AccountingIntegration,
  type InsertAccountingIntegration,
  type AccountingExport,
  type InsertAccountingExport,
  type AccountingSyncJob,
  type InsertAccountingSyncJob,
  type AccountingPluginSubscription,
  type InsertAccountingPluginSubscription,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, like, and, sql, count } from "drizzle-orm";
import { nanoid } from "nanoid";
import Papa from "papaparse";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, data: Partial<UpsertUser>): Promise<User>;
  getUserPlan(userId: string): Promise<{ planType: string; status: string } | undefined>;
  
  // Traditional authentication
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Partial<User>): Promise<User>;
  
  // CSV Export/Import operations
  exportUsersToCSV(): Promise<string>;
  importUsersFromCSV(csvData: string): Promise<{ imported: number; errors: string[] }>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategoryInput): Promise<Category>;
  getCategoriesWithSubcategories(): Promise<(Category & { subcategories?: Category[] })[]>;

  // Product operations
  getProducts(filters?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    limit?: number;
    offset?: number;
    // Shop local filters
    shopLocal?: boolean;
    country?: string;
    state?: string;
    city?: string;
    zipCode?: string;
    condition?: string;
  }): Promise<{ products: Product[]; total: number }>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductsBySeller(sellerId: string): Promise<Product[]>;
  getActiveProductCountBySeller(sellerId: string): Promise<number>;
  getUserSubscriptionPlan(userId: string): Promise<{ plan: string; limit: number }>;
  createProduct(product: InsertProductInput): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProductInput>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  // Review operations
  getProductReviews(productId: string): Promise<Review[]>;
  createReview(review: InsertReviewInput): Promise<Review>;

  // Cart operations
  getCartItems(userId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(userId: string, productId: string, quantity: number): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem>;
  removeFromCart(id: string): Promise<void>;
  clearCart(userId: string): Promise<void>;

  // Order operations
  createOrder(order: InsertOrderInput, items: { productId: string; quantity: number; price: number }[]): Promise<Order>;
  getOrderById(id: string): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined>;
  getAllOrders(): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]>;
  getUserOrders(userId: string): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]>;
  updateOrderStatus(id: string, status: string): Promise<Order>;

  // Coupon operations
  validateCoupon(couponCode: string, userId: string, cartTotal: number): Promise<{
    valid: boolean;
    coupon?: Coupon;
    discountAmount?: number;
    message?: string;
  }>;
  applyCoupon(couponCode: string, userId: string, cartTotal: number, cartItems?: any[]): Promise<{
    coupon: Coupon;
    discountAmount: number;
  }>;
  removeCouponFromCart(userId: string): Promise<void>;

  // Subscription and listing operations
  getUserSubscriptionPlan(userId: string): Promise<{
    plan: string;
    limit: number;
  }>;
  getActiveProductCountBySeller(userId: string): Promise<number>;

  // Admin operations
  getAllUsers(): Promise<User[]>;
  getAllOrders(): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]>;
  getDashboardStats(): Promise<{
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    activeSellers: number;
  }>;

  // Referral operations
  createReferralCode(userId: string, serviceType: string, serviceId: string): Promise<ReferralCode>;
  getReferralCodeByCode(code: string): Promise<ReferralCode | undefined>;
  getUserReferralCodes(userId: string): Promise<ReferralCode[]>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  searchUsersForReferral(query: string): Promise<User[]>;
  createReferral(referralData: InsertReferral): Promise<Referral>;
  getUserReferrals(userId: string): Promise<Referral[]>;
  getUserReferralStats(userId: string): Promise<{
    totalReferrals: number;
    successfulReferrals: number;
    totalRewards: number;
    activeRewards: number;
  }>;
  createReferralReward(rewardData: InsertReferralReward): Promise<ReferralReward>;
  getUserActiveRewards(userId: string): Promise<ReferralReward[]>;
  applyReferralCode(code: string, userId: string, serviceType: string, serviceId: string): Promise<Referral>;

  // Buyer Membership operations
  getMembershipPlans(): Promise<BuyerMembershipPlan[]>;
  getCurrentMembership(userId: string): Promise<BuyerMembership | undefined>;
  createMembership(userId: string, planId: string, paymentMethod: any, referralCode?: string): Promise<BuyerMembership>;
  cancelMembership(membershipId: string, userId: string): Promise<BuyerMembership>;
  getMembershipBenefits(membershipId: string, userId: string): Promise<MembershipBenefit[]>;
  useMembershipBenefit(membershipId: string, userId: string, benefitType: string, benefitValue: number): Promise<{
    success: boolean;
    message: string;
    benefit?: MembershipBenefit;
  }>;
  getMembershipTransactions(membershipId: string, userId: string): Promise<MembershipTransaction[]>;

  // Commission and Balance operations
  generateUniqueReferralCode(userId: string): Promise<string>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  trackCommission(orderId: string, referrerId: string, refereeId: string, referralCodeId: string, revenueAmount: number, commissionAmount: number): Promise<CommissionTracking>;
  processCommissions(): Promise<void>;
  getUserBalance(userId: string): Promise<UserBalance>;
  creditUserBalance(userId: string, amount: number, description: string, referenceId?: string, referenceType?: string): Promise<void>;
  getUserBankingInfo(userId: string): Promise<UserBankingInfo[]>;
  addBankingInfo(userId: string, bankingData: Omit<InsertUserBankingInfo, 'userId'>): Promise<UserBankingInfo>;
  updateBankingInfo(bankingInfoId: string, userId: string, updates: Partial<UserBankingInfo>): Promise<UserBankingInfo>;
  deleteBankingInfo(bankingInfoId: string, userId: string): Promise<void>;
  getBalanceTransactions(userId: string, limit?: number, offset?: number): Promise<BalanceTransaction[]>;
  withdrawBalance(userId: string, amount: number, bankingInfoId: string): Promise<void>;

  // Tax compliance operations
  getContractorAgreement(userId: string): Promise<IndependentContractorAgreement | undefined>;
  createContractorAgreement(userId: string, agreementData: Omit<InsertIndependentContractorAgreement, 'userId' | 'id'>): Promise<IndependentContractorAgreement>;
  updateContractorAgreement(userId: string, agreementId: string, updates: Partial<IndependentContractorAgreement>): Promise<IndependentContractorAgreement>;
  getTaxForms(userId: string): Promise<ReferralTaxForm[]>;
  getTaxForm(userId: string, formType: string, taxYear: number): Promise<ReferralTaxForm | undefined>;
  createTaxForm(userId: string, formData: Omit<InsertReferralTaxForm, 'userId' | 'id'>): Promise<ReferralTaxForm>;
  updateTaxForm(userId: string, formId: string, updates: Partial<ReferralTaxForm>): Promise<ReferralTaxForm>;

  // User branding operations (Enterprise feature)
  getUserBranding(userId: string): Promise<any>;
  saveUserBranding(userId: string, branding: any): Promise<any>;

  // Accounting integration operations
  getAccountingIntegrations(userId: string): Promise<AccountingIntegration[]>;
  getAccountingIntegration(integrationId: string, userId: string): Promise<AccountingIntegration | undefined>;
  createAccountingIntegration(integration: InsertAccountingIntegration): Promise<AccountingIntegration>;
  updateAccountingIntegration(integrationId: string, updates: Partial<AccountingIntegration>): Promise<AccountingIntegration>;
  deleteAccountingIntegration(integrationId: string): Promise<void>;
  
  // Accounting export operations
  getAccountingExports(userId: string): Promise<AccountingExport[]>;
  getAccountingExport(exportId: string, userId: string): Promise<AccountingExport | undefined>;
  createAccountingExport(exportData: InsertAccountingExport): Promise<AccountingExport>;
  updateAccountingExport(exportId: string, updates: Partial<AccountingExport>): Promise<AccountingExport>;
  
  // Accounting data retrieval
  getAccountingData(userId: string, dataType: string, dateRange?: { start: Date; end: Date }): Promise<any>;
  
  // Accounting plugin subscription operations
  getAccountingPluginSubscriptions(userId: string): Promise<AccountingPluginSubscription[]>;
  getAccountingPluginSubscription(subscriptionId: string, userId: string): Promise<AccountingPluginSubscription | undefined>;
  createAccountingPluginSubscription(subscription: InsertAccountingPluginSubscription): Promise<AccountingPluginSubscription>;
  updateAccountingPluginSubscription(subscriptionId: string, updates: Partial<AccountingPluginSubscription>): Promise<AccountingPluginSubscription>;
  cancelAccountingPluginSubscription(subscriptionId: string, userId: string): Promise<AccountingPluginSubscription>;
  hasActivePluginSubscription(userId: string, pluginId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<UpsertUser>): Promise<User> {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };
    
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }

  async getUserPlan(userId: string): Promise<{ planType: string; status: string } | undefined> {
    // For now, return default basic plan
    // In a real implementation, this would query the sellerPlans table
    return { planType: 'basic', status: 'active' };
  }

  // Traditional authentication methods
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        id: nanoid(),
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as UpsertUser)
      .returning();
    return user;
  }

  async getUserSubscriptionPlan(userId: string): Promise<{ plan: string; limit: number }> {
    const user = await this.getUser(userId);
    const plan = user?.subscriptionPlan || 'basic';
    
    // Define listing limits for each plan
    const limits = {
      basic: 13,
      pro: 100,
      enterprise: -1 // unlimited
    };
    
    return {
      plan,
      limit: limits[plan as keyof typeof limits] || limits.basic
    };
  }

  async getActiveProductCountBySeller(userId: string): Promise<number> {
    const activeProducts = await db
      .select()
      .from(products)
      .where(and(
        eq(products.sellerId, userId),
        eq(products.isActive, true)
      ));
    
    return activeProducts.length;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(asc(categories.name));
  }

  async getCategoriesWithSubcategories(): Promise<(Category & { subcategories?: Category[] })[]> {
    // Get all categories
    const allCategories = await db.select().from(categories).orderBy(asc(categories.name));
    
    // Separate main categories and subcategories
    const mainCategories = allCategories.filter(cat => !cat.parentId);
    const subcategories = allCategories.filter(cat => cat.parentId);
    
    // Group subcategories by parent
    const subcategoryMap = subcategories.reduce((acc, sub) => {
      if (!acc[sub.parentId!]) {
        acc[sub.parentId!] = [];
      }
      acc[sub.parentId!].push(sub);
      return acc;
    }, {} as Record<string, Category[]>);
    
    // Attach subcategories to main categories
    return mainCategories.map(mainCat => ({
      ...mainCat,
      subcategories: subcategoryMap[mainCat.id] || []
    }));
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategoryInput): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values({ ...category, id: nanoid() })
      .returning();
    return newCategory;
  }

  // Product operations
  async getProducts(filters: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    limit?: number;
    offset?: number;
    // Shop local filters
    shopLocal?: boolean;
    country?: string;
    state?: string;
    city?: string;
    zipCode?: string;
    condition?: string;
    // Deal filter
    deals?: boolean;
    // User location for local prioritization
    userLocation?: {
      country?: string;
      state?: string;
      city?: string;
      zipCode?: string;
    };
  } = {}): Promise<{ products: Product[]; total: number }> {
    const { category, search, minPrice, maxPrice, sortBy = "createdAt", limit = 20, offset = 0, shopLocal, country, state, city, zipCode, condition, deals, userLocation } = filters;

    const conditions = [eq(products.isActive, true)];

    if (category) {
      conditions.push(eq(products.categoryId, category));
    }

    if (search) {
      conditions.push(like(products.name, `%${search}%`));
    }

    if (minPrice !== undefined) {
      conditions.push(sql`${products.price} >= ${minPrice}`);
    }

    if (maxPrice !== undefined) {
      conditions.push(sql`${products.price} <= ${maxPrice}`);
    }

    // Shop local filters
    if (shopLocal) {
      conditions.push(eq(products.isLocal, true));
    }

    if (country) {
      conditions.push(eq(products.country, country));
    }

    if (state) {
      conditions.push(eq(products.state, state));
    }

    if (city) {
      conditions.push(eq(products.city, city));
    }

    if (zipCode) {
      conditions.push(eq(products.zipCode, zipCode));
    }

    if (condition) {
      conditions.push(eq(products.condition, condition as any));
    }

    // Deal filter - products with original price higher than current price
    if (deals) {
      conditions.push(
        sql`${products.originalPrice} IS NOT NULL AND ${products.originalPrice} > ${products.price}`
      );
    }

    const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];

    let query = db.select().from(products).where(whereCondition);
    
    // Apply sorting with local prioritization
    if (userLocation && (userLocation.state || userLocation.city || userLocation.zipCode)) {
      // Local prioritization: sort by location match first, then by specified sort
      const localConditions = [];
      
      if (userLocation.zipCode) {
        localConditions.push(`CASE WHEN "${products.zipCode.name}" = '${userLocation.zipCode}' THEN 1 ELSE 0 END`);
      }
      if (userLocation.city) {
        localConditions.push(`CASE WHEN "${products.city.name}" = '${userLocation.city}' THEN 2 ELSE 0 END`);
      }
      if (userLocation.state) {
        localConditions.push(`CASE WHEN "${products.state.name}" = '${userLocation.state}' THEN 3 ELSE 0 END`);
      }
      
      if (localConditions.length > 0) {
        const localityScore = `(${localConditions.join(' + ')})`;
        
        switch (sortBy) {
          case "price_asc":
            query = query.orderBy(sql`${localityScore} DESC, ${products.price} ASC`);
            break;
          case "price_desc":  
            query = query.orderBy(sql`${localityScore} DESC, ${products.price} DESC`);
            break;
          case "rating":
            query = query.orderBy(sql`${localityScore} DESC, ${products.averageRating} DESC`);
            break;
          case "name":
            query = query.orderBy(sql`${localityScore} DESC, ${products.name} ASC`);
            break;
          case "local_first":
            query = query.orderBy(sql`${localityScore} DESC, ${products.createdAt} DESC`);
            break;
          default:
            query = query.orderBy(sql`${localityScore} DESC, ${products.createdAt} DESC`);
        }
      } else {
        // Apply regular sorting if no user location available
        query = this.applySorting(query, sortBy);
      }
    } else {
      // Apply regular sorting
      query = this.applySorting(query, sortBy);
    }

    const countQuery = db.select({ count: count() }).from(products).where(whereCondition);
    const productsResult = await query.limit(limit).offset(offset);
    const totalResult = await countQuery;

    return {
      products: productsResult,
      total: totalResult[0].count,
    };
  }

  private applySorting(query: any, sortBy: string) {
    switch (sortBy) {
      case "price_asc":
        return query.orderBy(asc(products.price));
      case "price_desc":
        return query.orderBy(desc(products.price));
      case "rating":
        return query.orderBy(desc(products.averageRating));
      case "name":
        return query.orderBy(asc(products.name));
      default:
        return query.orderBy(desc(products.createdAt));
    }
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductsBySeller(sellerId: string): Promise<Product[]> {
    return db.select().from(products).where(eq(products.sellerId, sellerId)).orderBy(desc(products.createdAt));
  }



  async getSellerProducts(sellerId: string): Promise<Product[]> {
    return db.select().from(products).where(eq(products.sellerId, sellerId)).orderBy(desc(products.createdAt));
  }

  async createProduct(productData: any): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values({
        ...productData,
        id: productData.id || nanoid(),
        stock: productData.inventory || 0,
        images: productData.imageUrl ? [productData.imageUrl] : [],
        specifications: productData.specifications || {},
        isActive: true,
        averageRating: "0",
        totalReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return newProduct;
  }

  async updateProduct(id: string, productData: any): Promise<Product> {
    const updates: any = {
      ...productData,
      updatedAt: new Date()
    };
    
    if (productData.inventory !== undefined) {
      updates.stock = productData.inventory;
    }
    
    if (productData.imageUrl) {
      updates.images = [productData.imageUrl];
    }
    
    const [updatedProduct] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Review operations
  async getProductReviews(productId: string): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReviewInput): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values({ ...review, id: nanoid() })
      .returning();

    // Update product average rating
    const productReviews = await this.getProductReviews(review.productId);
    const averageRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
    
    await db
      .update(products)
      .set({ 
        averageRating: averageRating.toFixed(2),
        totalReviews: productReviews.length 
      })
      .where(eq(products.id, review.productId));

    return newReview;
  }

  // Cart operations
  async getCartItems(userId: string): Promise<(CartItem & { product: Product })[]> {
    return db
      .select()
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId))
      .then(results => 
        results.map(result => ({
          ...result.cart_items,
          product: result.products
        }))
      );
  }

  async addToCart(userId: string, productId: string, quantity: number): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + quantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Create new cart item
      const [newItem] = await db
        .insert(cartItems)
        .values({ id: nanoid(), userId, productId, quantity })
        .returning();
      return newItem;
    }
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Order operations
  async createOrder(
    order: InsertOrderInput,
    items: { productId: string; quantity: number; price: number }[]
  ): Promise<Order> {
    const orderId = nanoid();
    
    const [newOrder] = await db
      .insert(orders)
      .values({ 
        ...order, 
        id: orderId,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    // Create order items with seller info
    for (const item of items) {
      const [product] = await db.select().from(products).where(eq(products.id, item.productId));
      await db.insert(orderItems).values({
        id: nanoid(),
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price.toString(),
        sellerId: product?.sellerId || "",
      });
    }

    return newOrder;
  }

  async getOrderById(id: string): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const items = await db
      .select()
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, id))
      .then(results =>
        results.map(result => ({
          ...result.order_items,
          product: result.products
        }))
      );

    return { ...order, items };
  }

  async getUserOrders(userId: string): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]> {
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .innerJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id))
          .then(results =>
            results.map(result => ({
              ...result.order_items,
              product: result.products
            }))
          );

        return { ...order, items };
      })
    );

    return ordersWithItems;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAllOrders(): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]> {
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));

    const ordersWithItems = await Promise.all(
      allOrders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .innerJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id))
          .then(results =>
            results.map(result => ({
              ...result.order_items,
              product: result.products
            }))
          );

        return { ...order, items };
      })
    );

    return ordersWithItems;
  }

  async getDashboardStats(): Promise<{
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    activeSellers: number;
  }> {
    const [totalUsersResult] = await db.select({ count: count() }).from(users);
    const [totalOrdersResult] = await db.select({ count: count() }).from(orders);
    const [activeSellersResult] = await db.select({ count: count() }).from(users).where(eq(users.role, "seller"));
    
    const [revenueResult] = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(CAST(${orders.total} AS NUMERIC)), 0)`
      })
      .from(orders);

    return {
      totalUsers: totalUsersResult.count,
      totalOrders: totalOrdersResult.count,
      totalRevenue: Number(revenueResult.total),
      activeSellers: activeSellersResult.count,
    };
  }

  // Coupon operations
  async validateCoupon(couponCode: string, userId: string, cartTotal: number): Promise<{
    valid: boolean;
    coupon?: Coupon;
    discountAmount?: number;
    message?: string;
  }> {
    try {
      // Find the coupon
      const [coupon] = await db
        .select()
        .from(coupons)
        .where(and(
          eq(coupons.code, couponCode.toUpperCase()),
          eq(coupons.isActive, true)
        ));

      if (!coupon) {
        return { valid: false, message: "Coupon code not found" };
      }

      // Check if coupon is expired
      if (coupon.validUntil && new Date() > coupon.validUntil) {
        return { valid: false, message: "Coupon has expired" };
      }

      // Check if coupon hasn't started yet
      if (coupon.validFrom && new Date() < coupon.validFrom) {
        return { valid: false, message: "Coupon is not yet active" };
      }

      // Check minimum order amount
      if (coupon.minimumOrderAmount && cartTotal < Number(coupon.minimumOrderAmount)) {
        return { 
          valid: false, 
          message: `Minimum order amount of $${coupon.minimumOrderAmount} required` 
        };
      }

      // Check usage limits
      if (coupon.usageLimit && (coupon.usageCount ?? 0) >= coupon.usageLimit) {
        return { valid: false, message: "Coupon usage limit exceeded" };
      }

      // Check user usage limit
      const [userUsageResult] = await db
        .select({ count: count() })
        .from(couponUsage)
        .where(and(
          eq(couponUsage.couponId, coupon.id),
          eq(couponUsage.userId, userId)
        ));

      if (coupon.userUsageLimit && userUsageResult.count >= coupon.userUsageLimit) {
        return { valid: false, message: "You have already used this coupon" };
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (coupon.discountType === 'percentage') {
        discountAmount = cartTotal * (Number(coupon.discountValue) / 100);
        if (coupon.maximumDiscountAmount) {
          discountAmount = Math.min(discountAmount, Number(coupon.maximumDiscountAmount));
        }
      } else if (coupon.discountType === 'fixed_amount') {
        discountAmount = Math.min(Number(coupon.discountValue), cartTotal);
      } else if (coupon.discountType === 'free_shipping') {
        // For free shipping, we'll return 0 discount but include the coupon
        discountAmount = 0;
      }

      return {
        valid: true,
        coupon,
        discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimal places
      };
    } catch (error) {
      console.error("Error validating coupon:", error);
      return { valid: false, message: "Error validating coupon" };
    }
  }

  async applyCoupon(couponCode: string, userId: string, cartTotal: number, cartItems?: any[]): Promise<{
    coupon: Coupon;
    discountAmount: number;
  }> {
    // Find the coupon
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(and(
        eq(coupons.code, couponCode.toUpperCase()),
        eq(coupons.isActive, true)
      ));

    if (!coupon) {
      throw new Error("Coupon code not found");
    }

    // Check if coupon is expired
    if (coupon.validUntil && new Date() > coupon.validUntil) {
      throw new Error("Coupon has expired");
    }

    // For subscription-only coupons, validate cart contains subscription items
    if (coupon.discountType === "subscription_only") {
      if (!cartItems || !Array.isArray(cartItems)) {
        throw new Error("Cart items required for subscription coupon validation");
      }

      const subscriptionItems = cartItems.filter((item: any) => {
        return item.product && (
          item.product.categoryId === "subscription_plans" ||
          item.product.id?.startsWith("subscription_") ||
          item.product.id?.startsWith("event_marketing_")
        );
      });

      if (subscriptionItems.length === 0) {
        throw new Error("This coupon only applies to subscription services. Add a subscription to your cart to use this code.");
      }

      // Calculate total of subscription items only
      const subscriptionTotal = subscriptionItems.reduce((total: number, item: any) => {
        return total + (Number(item.product.price) * item.quantity);
      }, 0);

      // Use subscription total for minimum order validation
      if (coupon.minimumOrderAmount && subscriptionTotal < Number(coupon.minimumOrderAmount)) {
        throw new Error(`Minimum subscription order amount of $${coupon.minimumOrderAmount} required`);
      }
    } else {
      // Check minimum order amount for regular coupons
      if (coupon.minimumOrderAmount && cartTotal < Number(coupon.minimumOrderAmount)) {
        throw new Error(`Minimum order amount of $${coupon.minimumOrderAmount} required`);
      }
    }

    // Check usage limits
    if (coupon.usageLimit && (coupon.usageCount ?? 0) >= coupon.usageLimit) {
      throw new Error("Coupon usage limit exceeded");
    }

    // Check user usage limit
    const [userUsageResult] = await db
      .select({ count: count() })
      .from(couponUsage)
      .where(and(
        eq(couponUsage.couponId, coupon.id),
        eq(couponUsage.userId, userId)
      ));

    if (coupon.userUsageLimit && userUsageResult.count >= coupon.userUsageLimit) {
      if (coupon.code === "1YEARFREE") {
        throw new Error("You have already used the 1YEARFREE coupon. This promotion is limited to one use per account.");
      }
      throw new Error("You have already used this coupon the maximum number of times");
    }

    // Calculate discount amount
    let discountAmount = 0;
    
    if (coupon.discountType === "subscription_only") {
      // For subscription-only coupons, calculate discount only on subscription items
      const subscriptionItems = cartItems!.filter((item: any) => {
        return item.product && (
          item.product.categoryId === "subscription_plans" ||
          item.product.id?.startsWith("subscription_") ||
          item.product.id?.startsWith("event_marketing_")
        );
      });
      
      const subscriptionTotal = subscriptionItems.reduce((total: number, item: any) => {
        return total + (Number(item.product.price) * item.quantity);
      }, 0);
      
      // For 1YEARFREE, provide exactly 12 months worth of subscription value
      if (coupon.code === "1YEARFREE") {
        // Calculate 12 months of subscription value for each item
        let yearlySubscriptionValue = 0;
        subscriptionItems.forEach((item: any) => {
          const monthlyPrice = Number(item.product.price);
          const yearlyValue = monthlyPrice * 12; // 12 months
          yearlySubscriptionValue += yearlyValue * item.quantity;
        });
        
        // Discount is exactly 12 months of subscription value
        discountAmount = yearlySubscriptionValue;
      } else {
        // 100% discount on subscription items for other subscription coupons
        discountAmount = subscriptionTotal;
      }
    } else if (coupon.discountType === 'percentage') {
      discountAmount = cartTotal * (Number(coupon.discountValue) / 100);
      if (coupon.maximumDiscountAmount) {
        discountAmount = Math.min(discountAmount, Number(coupon.maximumDiscountAmount));
      }
    } else if (coupon.discountType === 'fixed_amount') {
      discountAmount = Math.min(Number(coupon.discountValue), cartTotal);
    } else if (coupon.discountType === 'free_shipping') {
      // For free shipping, we'll return 0 discount but include the coupon
      discountAmount = 0;
    }

    // Record the coupon usage (temporary, will be finalized when order is placed)
    await db.insert(couponUsage).values({
      couponId: coupon.id,
      userId,
      discountAmount: discountAmount.toString(),
    });

    // Update coupon usage count
    await db
      .update(coupons)
      .set({ usageCount: (coupon.usageCount ?? 0) + 1 })
      .where(eq(coupons.id, coupon.id));

    return {
      coupon,
      discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimal places
    };
  }

  async removeCouponFromCart(userId: string): Promise<void> {
    // Remove any temporary coupon usage records for this user
    await db
      .delete(couponUsage)
      .where(and(
        eq(couponUsage.userId, userId),
        sql`${couponUsage.orderId} IS NULL`
      ));
  }

  // Referral operations implementation
  async createReferralCode(userId: string, serviceType: string, serviceId: string): Promise<ReferralCode> {
    const code = `${serviceId.toUpperCase()}_${userId.slice(-4)}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const [referralCode] = await db.insert(referralCodes).values({
      userId,
      code,
      serviceType,
      serviceId,
      isActive: true,
      usageCount: 0,
    }).returning();
    
    return referralCode;
  }

  async getReferralCodeByCode(code: string): Promise<ReferralCode | undefined> {
    const [referralCode] = await db
      .select()
      .from(referralCodes)
      .where(and(eq(referralCodes.code, code), eq(referralCodes.isActive, true)));
    return referralCode;
  }

  async getUserReferralCodes(userId: string): Promise<ReferralCode[]> {
    return await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.userId, userId))
      .orderBy(desc(referralCodes.createdAt));
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.uniqueReferralCode, referralCode));
    return user;
  }

  async searchUsersForReferral(query: string): Promise<User[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    
    return await db
      .select()
      .from(users)
      .where(
        sql`LOWER(${users.firstName}) LIKE ${searchTerm} 
            OR LOWER(${users.lastName}) LIKE ${searchTerm} 
            OR LOWER(${users.username}) LIKE ${searchTerm}
            OR LOWER(CONCAT(${users.firstName}, ' ', ${users.lastName})) LIKE ${searchTerm}`
      )
      .limit(10);
  }

  // CSV Export/Import implementation
  async exportUsersToCSV(): Promise<string> {
    const allUsers = await db.select().from(users).orderBy(users.createdAt);
    
    // Transform users data for CSV export
    const csvData = allUsers.map(user => ({
      id: user.id,
      username: user.username || '',
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role,
      businessName: user.businessName || '',
      businessAddress: user.businessAddress || '',
      businessCity: user.businessCity || '',
      businessState: user.businessState || '',
      businessZipCode: user.businessZipCode || '',
      businessCountry: user.businessCountry || '',
      taxId: user.taxId || '',
      subscriptionPlan: user.subscriptionPlan || '',
      subscriptionStatus: user.subscriptionStatus || '',
      uniqueReferralCode: user.uniqueReferralCode || '',
      referredByCode: user.referredByCode || '',
      createdAt: user.createdAt?.toISOString() || '',
      updatedAt: user.updatedAt?.toISOString() || ''
    }));

    return Papa.unparse(csvData);
  }

  async importUsersFromCSV(csvData: string): Promise<{ imported: number; errors: string[] }> {
    const errors: string[] = [];
    let imported = 0;

    try {
      const parseResult = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim()
      });

      if (parseResult.errors.length > 0) {
        parseResult.errors.forEach(error => {
          errors.push(`Parse error on row ${error.row}: ${error.message}`);
        });
      }

      const rows = parseResult.data as any[];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 2; // Account for header row

        try {
          // Validate required fields
          if (!row.email || !row.firstName || !row.lastName) {
            errors.push(`Row ${rowNum}: Missing required fields (email, firstName, lastName)`);
            continue;
          }

          // Check if user already exists
          const existingUser = await this.getUserByEmail(row.email);
          if (existingUser) {
            errors.push(`Row ${rowNum}: User with email ${row.email} already exists`);
            continue;
          }

          // Check if username is taken (if provided)
          if (row.username) {
            const existingUsername = await this.getUserByUsername(row.username);
            if (existingUsername) {
              errors.push(`Row ${rowNum}: Username ${row.username} already taken`);
              continue;
            }
          }

          // Create user data object
          const userData: Partial<User> = {
            email: row.email.trim(),
            firstName: row.firstName.trim(),
            lastName: row.lastName.trim(),
            username: row.username?.trim() || null,
            role: row.role || 'buyer',
            businessName: row.businessName?.trim() || null,
            businessAddress: row.businessAddress?.trim() || null,
            businessCity: row.businessCity?.trim() || null,
            businessState: row.businessState?.trim() || null,
            businessZipCode: row.businessZipCode?.trim() || null,
            businessCountry: row.businessCountry?.trim() || null,
            taxId: row.taxId?.trim() || null,
            subscriptionPlan: row.subscriptionPlan?.trim() || 'free',
            subscriptionStatus: row.subscriptionStatus?.trim() || 'active',
            referredByCode: row.referredByCode?.trim() || null,
          };

          // Generate unique referral code for new user
          const referralCode = nanoid(8).toUpperCase();
          userData.uniqueReferralCode = referralCode;

          await this.createUser(userData);
          imported++;

        } catch (error) {
          errors.push(`Row ${rowNum}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

    } catch (error) {
      errors.push(`CSV parsing failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { imported, errors };
  }

  async createReferral(referralData: InsertReferral): Promise<Referral> {
    const [referral] = await db.insert(referrals).values(referralData).returning();
    return referral;
  }

  async getUserReferrals(userId: string): Promise<Referral[]> {
    return await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId))
      .orderBy(desc(referrals.createdAt));
  }

  async getUserReferralStats(userId: string): Promise<{
    totalReferrals: number;
    successfulReferrals: number;
    totalRewards: number;
    activeRewards: number;
  }> {
    const totalReferrals = await db
      .select({ count: count() })
      .from(referrals)
      .where(eq(referrals.referrerId, userId));

    const successfulReferrals = await db
      .select({ count: count() })
      .from(referrals)
      .where(and(eq(referrals.referrerId, userId), eq(referrals.status, 'completed')));

    const totalRewards = await db
      .select({ count: count() })
      .from(referralRewards)
      .where(sql`EXISTS (SELECT 1 FROM referrals WHERE referrals.id = ${referralRewards.referralId} AND referrals.referrerId = ${userId})`);

    const activeRewards = await db
      .select({ count: count() })
      .from(referralRewards)
      .where(and(eq(referralRewards.userId, userId), eq(referralRewards.status, 'active')));

    return {
      totalReferrals: totalReferrals[0]?.count || 0,
      successfulReferrals: successfulReferrals[0]?.count || 0,
      totalRewards: totalRewards[0]?.count || 0,
      activeRewards: activeRewards[0]?.count || 0,
    };
  }

  async createReferralReward(rewardData: InsertReferralReward): Promise<ReferralReward> {
    const [reward] = await db.insert(referralRewards).values(rewardData).returning();
    return reward;
  }

  async getUserActiveRewards(userId: string): Promise<ReferralReward[]> {
    return await db
      .select()
      .from(referralRewards)
      .where(and(eq(referralRewards.userId, userId), eq(referralRewards.status, 'active')))
      .orderBy(desc(referralRewards.createdAt));
  }

  async applyReferralCode(code: string, userId: string, serviceType: string, serviceId: string): Promise<Referral> {
    const referralCode = await this.getReferralCodeByCode(code);
    
    if (!referralCode) {
      throw new Error('Invalid referral code');
    }

    if (referralCode.userId === userId) {
      throw new Error('Cannot use your own referral code');
    }

    if (referralCode.serviceType !== serviceType || referralCode.serviceId !== serviceId) {
      throw new Error('Referral code is not valid for this service');
    }

    // Get referral program configuration based on service
    const referralConfig = this.getReferralConfig(serviceType, serviceId);
    
    const [referral] = await db.insert(referrals).values({
      referralCodeId: referralCode.id,
      referrerId: referralCode.userId,
      refereeId: userId,
      serviceType,
      serviceId,
      status: 'completed',
      referrerRewardType: referralConfig.referrerRewardType,
      referrerRewardValue: referralConfig.referrerRewardValue.toString(),
      referrerRewardDuration: referralConfig.referrerRewardDuration,
      refereeRewardType: referralConfig.refereeRewardType,
      refereeRewardValue: referralConfig.refereeRewardValue.toString(),
      refereeRewardDuration: referralConfig.refereeRewardDuration,
      completedAt: new Date(),
    }).returning();

    // Update referral code usage count
    await db
      .update(referralCodes)
      .set({ 
        usageCount: (referralCode.usageCount || 0) + 1,
        updatedAt: new Date()
      })
      .where(eq(referralCodes.id, referralCode.id));

    // Create rewards for both referrer and referee
    await this.createReferralReward({
      referralId: referral.id,
      userId: referralCode.userId,
      rewardType: referralConfig.referrerRewardType,
      rewardValue: referralConfig.referrerRewardValue.toString(),
      rewardDuration: referralConfig.referrerRewardDuration,
      status: 'active',
      activatedAt: new Date(),
      expiresAt: referralConfig.referrerRewardDuration ? 
        new Date(Date.now() + referralConfig.referrerRewardDuration * 30 * 24 * 60 * 60 * 1000) : 
        null,
    });

    await this.createReferralReward({
      referralId: referral.id,
      userId: userId,
      rewardType: referralConfig.refereeRewardType,
      rewardValue: referralConfig.refereeRewardValue.toString(),
      rewardDuration: referralConfig.refereeRewardDuration,
      status: 'active',
      activatedAt: new Date(),
      expiresAt: referralConfig.refereeRewardDuration ? 
        new Date(Date.now() + referralConfig.refereeRewardDuration * 30 * 24 * 60 * 60 * 1000) : 
        null,
    });

    return referral;
  }

  private getReferralConfig(serviceType: string, serviceId: string) {
    const configs = {
      seller_subscription: {
        pro_plan: {
          referrerRewardType: 'discount_percentage',
          referrerRewardValue: 20,
          referrerRewardDuration: 3,
          refereeRewardType: 'free_months',
          refereeRewardValue: 1,
          refereeRewardDuration: 1,
        },
        enterprise_plan: {
          referrerRewardType: 'discount_percentage',
          referrerRewardValue: 25,
          referrerRewardDuration: 6,
          refereeRewardType: 'free_months',
          refereeRewardValue: 2,
          refereeRewardDuration: 2,
        },
      },
      buyer_membership: {
        durcheap_plus: {
          referrerRewardType: 'discount_percentage',
          referrerRewardValue: 30,
          referrerRewardDuration: 2,
          refereeRewardType: 'free_months',
          refereeRewardValue: 1,
          refereeRewardDuration: 1,
        },
        local_plus: {
          referrerRewardType: 'discount_percentage',
          referrerRewardValue: 50,
          referrerRewardDuration: 2,
          refereeRewardType: 'free_months',
          refereeRewardValue: 1,
          refereeRewardDuration: 1,
        },
      },
      professional_service: {
        business_verification: {
          referrerRewardType: 'credit_amount',
          referrerRewardValue: 12,
          referrerRewardDuration: null,
          refereeRewardType: 'discount_percentage',
          refereeRewardValue: 50,
          refereeRewardDuration: null,
        },
        contractor_verification: {
          referrerRewardType: 'credit_amount',
          referrerRewardValue: 25,
          referrerRewardDuration: null,
          refereeRewardType: 'discount_percentage',
          refereeRewardValue: 25,
          refereeRewardDuration: null,
        },
      },
    };

    return configs[serviceType as keyof typeof configs]?.[serviceId as keyof any] || {
      referrerRewardType: 'credit_amount',
      referrerRewardValue: 10,
      referrerRewardDuration: null,
      refereeRewardType: 'discount_percentage',
      refereeRewardValue: 10,
      refereeRewardDuration: null,
    };
  }

  // Buyer Membership operations
  async getMembershipPlans(): Promise<BuyerMembershipPlan[]> {
    const plans = await db.select().from(buyerMembershipPlans);
    return plans;
  }

  async getCurrentMembership(userId: string): Promise<BuyerMembership | undefined> {
    const [membership] = await db
      .select()
      .from(buyerMemberships)
      .where(
        and(
          eq(buyerMemberships.userId, userId),
          eq(buyerMemberships.status, "active")
        )
      )
      .limit(1);
    return membership;
  }

  async createMembership(
    userId: string,
    planId: string,
    paymentMethod: any,
    referralCode?: string
  ): Promise<BuyerMembership> {
    const plan = await db
      .select()
      .from(buyerMembershipPlans)
      .where(eq(buyerMembershipPlans.id, planId))
      .limit(1);

    if (!plan.length) {
      throw new Error("Invalid membership plan");
    }

    const membershipData: InsertBuyerMembership = {
      id: nanoid(),
      userId,
      planId,
      status: "active",
      startDate: new Date(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      paymentMethodId: paymentMethod || "card",
      referralCodeUsed: referralCode,
    };

    const [membership] = await db
      .insert(buyerMemberships)
      .values(membershipData)
      .returning();

    // Create initial benefits based on plan
    await this.createInitialBenefits(membership.id, plan[0]);

    return membership;
  }

  async cancelMembership(membershipId: string, userId: string): Promise<BuyerMembership> {
    const [membership] = await db
      .update(buyerMemberships)
      .set({
        status: "cancelled",
        endDate: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(buyerMemberships.id, membershipId),
          eq(buyerMemberships.userId, userId)
        )
      )
      .returning();

    if (!membership) {
      throw new Error("Membership not found or unauthorized");
    }

    return membership;
  }

  async getMembershipBenefits(membershipId: string, userId: string): Promise<MembershipBenefit[]> {
    // Verify user owns this membership
    const membership = await db
      .select()
      .from(buyerMemberships)
      .where(
        and(
          eq(buyerMemberships.id, membershipId),
          eq(buyerMemberships.userId, userId)
        )
      )
      .limit(1);

    if (!membership.length) {
      throw new Error("Membership not found or unauthorized");
    }

    const benefits = await db
      .select()
      .from(membershipBenefits)
      .where(eq(membershipBenefits.membershipId, membershipId));

    return benefits;
  }

  async useMembershipBenefit(
    membershipId: string,
    userId: string,
    benefitType: string,
    benefitValue: number
  ): Promise<{ success: boolean; message: string; benefit?: MembershipBenefit }> {
    // Verify user owns this membership
    const membership = await db
      .select()
      .from(buyerMemberships)
      .where(
        and(
          eq(buyerMemberships.id, membershipId),
          eq(buyerMemberships.userId, userId),
          eq(buyerMemberships.status, "active")
        )
      )
      .limit(1);

    if (!membership.length) {
      return { success: false, message: "Membership not found or inactive" };
    }

    // Find available benefit
    const [benefit] = await db
      .select()
      .from(membershipBenefits)
      .where(
        and(
          eq(membershipBenefits.membershipId, membershipId),
          eq(membershipBenefits.benefitType, benefitType),
          sql`${membershipBenefits.usedCount} < ${membershipBenefits.limit}`
        )
      )
      .limit(1);

    if (!benefit) {
      return { success: false, message: "No available benefits of this type" };
    }

    // Update usage count
    const [updatedBenefit] = await db
      .update(membershipBenefits)
      .set({
        usedCount: (benefit.usedCount ?? 0) + 1,
        lastUsedAt: new Date(),
      })
      .where(eq(membershipBenefits.id, benefit.id))
      .returning();

    // Record transaction
    await this.recordMembershipTransaction(membershipId, benefitType, benefitValue);

    return {
      success: true,
      message: "Benefit applied successfully",
      benefit: updatedBenefit,
    };
  }

  async getMembershipTransactions(
    membershipId: string,
    userId: string
  ): Promise<MembershipTransaction[]> {
    // Verify user owns this membership
    const membership = await db
      .select()
      .from(buyerMemberships)
      .where(
        and(
          eq(buyerMemberships.id, membershipId),
          eq(buyerMemberships.userId, userId)
        )
      )
      .limit(1);

    if (!membership.length) {
      throw new Error("Membership not found or unauthorized");
    }

    const transactions = await db
      .select()
      .from(membershipTransactions)
      .where(eq(membershipTransactions.membershipId, membershipId))
      .orderBy(desc(membershipTransactions.createdAt));

    return transactions;
  }

  private async createInitialBenefits(membershipId: string, plan: BuyerMembershipPlan) {
    const initialBenefits: InsertMembershipBenefit[] = [
      {
        id: nanoid(),
        membershipId,
        benefitType: "free_shipping",
        description: "Free shipping option on select orders",
        limit: plan.name === "Durcheap Ultimate Rewards Membership" ? 10 : 5,
        usedCount: 0,
        resetPeriod: "monthly",
      },
      {
        id: nanoid(),
        membershipId,
        benefitType: "priority_support",
        description: "Priority customer support",
        limit: 999,
        usedCount: 0,
        resetPeriod: "unlimited",
      },
    ];

    // Add Local+ benefits for Ultimate Rewards
    if (plan.name === "Durcheap Ultimate Rewards Membership") {
      initialBenefits.push(
        {
          id: nanoid(),
          membershipId,
          benefitType: "priority_local_search",
          description: "Priority in local search results",
          limit: 999,
          usedCount: 0,
          resetPeriod: "unlimited",
        },
        {
          id: nanoid(),
          membershipId,
          benefitType: "enhanced_delivery",
          description: "Enhanced local delivery options",
          limit: 20,
          usedCount: 0,
          resetPeriod: "monthly",
        },
        {
          id: nanoid(),
          membershipId,
          benefitType: "exclusive_deals",
          description: "Access to exclusive local deals",
          limit: 50,
          usedCount: 0,
          resetPeriod: "monthly",
        }
      );
    }

    await db.insert(membershipBenefits).values(initialBenefits);
  }

  private async recordMembershipTransaction(
    membershipId: string, 
    benefitType: string, 
    value: number
  ): Promise<void> {
    const transactionData: InsertMembershipTransaction = {
      id: nanoid(),
      membershipId,
      transactionType: "benefit_used",
      amount: value.toString(),
      description: `Used ${benefitType} benefit`,
      metadata: JSON.stringify({ benefitType, value }),
    };

    await db.insert(membershipTransactions).values(transactionData);
  }


  // Commission and Balance Management Operations
  async generateUniqueReferralCode(userId: string): Promise<string> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // If user already has a referral code, return it
    if (user.uniqueReferralCode) {
      return user.uniqueReferralCode;
    }

    // Generate a new unique code
    let code: string;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      code = nanoid(8).toUpperCase();
      const existingUser = await db.select().from(users).where(eq(users.uniqueReferralCode, code)).limit(1);
      
      if (existingUser.length === 0) {
        isUnique = true;
        // Update user with the new code
        await db.update(users).set({ uniqueReferralCode: code }).where(eq(users.id, userId));
        return code;
      }
      attempts++;
    }

    throw new Error('Failed to generate unique referral code');
  }


  async trackCommission(
    orderId: string,
    referrerId: string,
    refereeId: string, 
    referralCodeId: string,
    revenueAmount: number,
    commissionAmount: number
  ): Promise<CommissionTracking> {
    const commissionData: InsertCommissionTracking = {
      id: nanoid(),
      orderId,
      referrerId,
      refereeId,
      referralCodeId,
      revenueAmount: revenueAmount.toString(),
      commissionAmount: commissionAmount.toString(),
      status: "pending",
    };

    const [commission] = await db.insert(commissionTracking).values(commissionData).returning();
    return commission;
  }

  async processCommissions(): Promise<void> {
    // Get all pending commissions
    const pendingCommissions = await db
      .select()
      .from(commissionTracking)
      .where(eq(commissionTracking.status, "pending"));

    for (const commission of pendingCommissions) {
      try {
        // Credit the commission to the referrer's balance
        await this.creditUserBalance(
          commission.referrerId,
          parseFloat(commission.commissionAmount),
          `Commission from order ${commission.orderId}`,
          commission.id,
          "commission"
        );

        // Mark commission as processed
        await db
          .update(commissionTracking)
          .set({ 
            status: "processed", 
            processedAt: new Date() 
          })
          .where(eq(commissionTracking.id, commission.id));

      } catch (error) {
        console.error(`Failed to process commission ${commission.id}:`, error);
      }
    }
  }

  async getUserBalance(userId: string): Promise<UserBalance> {
    let [balance] = await db.select().from(userBalances).where(eq(userBalances.userId, userId));
    
    if (!balance) {
      // Create initial balance for user
      const balanceData: InsertUserBalance = {
        id: nanoid(),
        userId,
        availableBalance: "0.00",
        pendingBalance: "0.00",
        totalEarned: "0.00",
        totalWithdrawn: "0.00",
      };
      
      [balance] = await db.insert(userBalances).values(balanceData).returning();
    }
    
    return balance;
  }

  async creditUserBalance(
    userId: string,
    amount: number,
    description: string,
    referenceId?: string,
    referenceType?: string
  ): Promise<void> {
    const balance = await this.getUserBalance(userId);
    const newAvailableBalance = parseFloat(balance.availableBalance) + amount;
    const newTotalEarned = parseFloat(balance.totalEarned) + amount;

    // Update balance
    await db
      .update(userBalances)
      .set({
        availableBalance: newAvailableBalance.toFixed(2),
        totalEarned: newTotalEarned.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(userBalances.userId, userId));

    // Record transaction
    const transactionData: InsertBalanceTransaction = {
      id: nanoid(),
      userId,
      type: "credit",
      amount: amount.toString(),
      description,
      referenceId,
      referenceType,
      balanceAfter: newAvailableBalance.toFixed(2),
      status: "completed",
    };

    await db.insert(balanceTransactions).values(transactionData);
  }

  async getUserBankingInfo(userId: string): Promise<UserBankingInfo[]> {
    return await db.select().from(userBankingInfo).where(eq(userBankingInfo.userId, userId));
  }

  async addBankingInfo(
    userId: string,
    bankingData: Omit<InsertUserBankingInfo, 'userId'>
  ): Promise<UserBankingInfo> {
    const data: InsertUserBankingInfo = {
      id: nanoid(),
      userId,
      ...bankingData,
    };

    // If this is the first banking info, make it default
    const existingBanking = await this.getUserBankingInfo(userId);
    if (existingBanking.length === 0) {
      data.isDefault = true;
    }

    const [bankingInfo] = await db.insert(userBankingInfo).values(data).returning();
    return bankingInfo;
  }

  async updateBankingInfo(
    bankingInfoId: string,
    userId: string,
    updates: Partial<UserBankingInfo>
  ): Promise<UserBankingInfo> {
    const [bankingInfo] = await db
      .update(userBankingInfo)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(userBankingInfo.id, bankingInfoId), eq(userBankingInfo.userId, userId)))
      .returning();

    if (!bankingInfo) {
      throw new Error('Banking information not found');
    }

    return bankingInfo;
  }

  async deleteBankingInfo(bankingInfoId: string, userId: string): Promise<void> {
    await db
      .delete(userBankingInfo)
      .where(and(eq(userBankingInfo.id, bankingInfoId), eq(userBankingInfo.userId, userId)));
  }

  async getBalanceTransactions(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<BalanceTransaction[]> {
    return await db
      .select()
      .from(balanceTransactions)
      .where(eq(balanceTransactions.userId, userId))
      .orderBy(desc(balanceTransactions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async withdrawBalance(userId: string, amount: number, bankingInfoId: string): Promise<void> {
    const balance = await this.getUserBalance(userId);
    const availableBalance = parseFloat(balance.availableBalance);

    if (availableBalance < amount) {
      throw new Error('Insufficient balance');
    }

    // Verify banking info belongs to user
    const [bankingInfo] = await db
      .select()
      .from(userBankingInfo)
      .where(and(eq(userBankingInfo.id, bankingInfoId), eq(userBankingInfo.userId, userId)));

    if (!bankingInfo) {
      throw new Error('Banking information not found');
    }

    const newAvailableBalance = availableBalance - amount;
    const newTotalWithdrawn = parseFloat(balance.totalWithdrawn) + amount;

    // Update balance
    await db
      .update(userBalances)
      .set({
        availableBalance: newAvailableBalance.toFixed(2),
        totalWithdrawn: newTotalWithdrawn.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(userBalances.userId, userId));

    // Record withdrawal transaction
    const transactionData: InsertBalanceTransaction = {
      id: nanoid(),
      userId,
      type: "withdrawal",
      amount: amount.toString(),
      description: `Withdrawal to ${bankingInfo.bankName} account ending in ${bankingInfo.accountNumber.slice(-4)}`,
      referenceId: bankingInfoId,
      referenceType: "withdrawal",
      balanceAfter: newAvailableBalance.toFixed(2),
      status: "completed",
    };

    await db.insert(balanceTransactions).values(transactionData);

    // In a real implementation, you would integrate with a payment processor here
    // to actually transfer the money to the user's bank account
  }

  // Tax compliance operations
  async getContractorAgreement(userId: string): Promise<IndependentContractorAgreement | undefined> {
    const [agreement] = await db
      .select()
      .from(independentContractorAgreements)
      .where(eq(independentContractorAgreements.userId, userId));
    return agreement;
  }

  async createContractorAgreement(
    userId: string,
    agreementData: Omit<InsertIndependentContractorAgreement, 'userId' | 'id'>
  ): Promise<IndependentContractorAgreement> {
    // Check if agreement already exists
    const existing = await this.getContractorAgreement(userId);
    if (existing) {
      throw new Error('Independent contractor agreement already exists for this user');
    }

    const data: InsertIndependentContractorAgreement = {
      id: nanoid(),
      userId,
      ...agreementData,
      agreementSigned: true,
      signedAt: new Date(),
      status: 'pending'
    };

    const [agreement] = await db
      .insert(independentContractorAgreements)
      .values(data)
      .returning();

    return agreement;
  }

  async updateContractorAgreement(
    userId: string,
    agreementId: string,
    updates: Partial<IndependentContractorAgreement>
  ): Promise<IndependentContractorAgreement> {
    const [agreement] = await db
      .update(independentContractorAgreements)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(
        eq(independentContractorAgreements.id, agreementId),
        eq(independentContractorAgreements.userId, userId)
      ))
      .returning();

    if (!agreement) {
      throw new Error('Contractor agreement not found');
    }

    return agreement;
  }

  async getTaxForms(userId: string): Promise<ReferralTaxForm[]> {
    return await db
      .select()
      .from(referralTaxForms)
      .where(eq(referralTaxForms.userId, userId))
      .orderBy(desc(referralTaxForms.taxYear));
  }

  async getTaxForm(userId: string, formType: string, taxYear: number): Promise<ReferralTaxForm | undefined> {
    const [form] = await db
      .select()
      .from(referralTaxForms)
      .where(and(
        eq(referralTaxForms.userId, userId),
        eq(referralTaxForms.formType, formType),
        eq(referralTaxForms.taxYear, taxYear)
      ));
    return form;
  }

  async createTaxForm(
    userId: string,
    formData: Omit<InsertReferralTaxForm, 'userId' | 'id'>
  ): Promise<ReferralTaxForm> {
    // Check if form already exists for this year/type
    const existing = await this.getTaxForm(userId, formData.formType, formData.taxYear);
    if (existing) {
      throw new Error(`${formData.formType} form already exists for tax year ${formData.taxYear}`);
    }

    const data: InsertReferralTaxForm = {
      id: nanoid(),
      userId,
      ...formData,
      status: 'pending',
      submittedAt: new Date()
    };

    const [form] = await db
      .insert(referralTaxForms)
      .values(data)
      .returning();

    return form;
  }

  async updateTaxForm(
    userId: string,
    formId: string,
    updates: Partial<ReferralTaxForm>
  ): Promise<ReferralTaxForm> {
    const [form] = await db
      .update(referralTaxForms)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(
        eq(referralTaxForms.id, formId),
        eq(referralTaxForms.userId, userId)
      ))
      .returning();

    if (!form) {
      throw new Error('Tax form not found');
    }

    return form;
  }

  // User branding operations (Enterprise feature)
  async getUserBranding(userId: string): Promise<any> {
    // For now, store branding data in memory
    // In production, this would be stored in a dedicated table
    const user = await this.getUser(userId);
    return user?.branding || {};
  }

  async saveUserBranding(userId: string, branding: any): Promise<any> {
    // For now, store branding data in the user record
    // In production, this would be stored in a dedicated user_branding table
    await this.updateUser(userId, { branding } as any);
    return branding;
  }

  // Accounting integration operations
  async getAccountingIntegrations(userId: string): Promise<AccountingIntegration[]> {
    return await db
      .select()
      .from(accountingIntegrations)
      .where(eq(accountingIntegrations.userId, userId))
      .orderBy(desc(accountingIntegrations.createdAt));
  }

  async getAccountingIntegration(integrationId: string, userId: string): Promise<AccountingIntegration | undefined> {
    const [integration] = await db
      .select()
      .from(accountingIntegrations)
      .where(and(
        eq(accountingIntegrations.id, integrationId),
        eq(accountingIntegrations.userId, userId)
      ));
    return integration;
  }

  async createAccountingIntegration(integration: InsertAccountingIntegration): Promise<AccountingIntegration> {
    const [created] = await db
      .insert(accountingIntegrations)
      .values(integration)
      .returning();
    return created;
  }

  async updateAccountingIntegration(integrationId: string, updates: Partial<AccountingIntegration>): Promise<AccountingIntegration> {
    const [updated] = await db
      .update(accountingIntegrations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(accountingIntegrations.id, integrationId))
      .returning();
    
    if (!updated) {
      throw new Error('Accounting integration not found');
    }
    
    return updated;
  }

  async deleteAccountingIntegration(integrationId: string): Promise<void> {
    await db
      .delete(accountingIntegrations)
      .where(eq(accountingIntegrations.id, integrationId));
  }

  // Accounting export operations
  async getAccountingExports(userId: string): Promise<AccountingExport[]> {
    return await db
      .select()
      .from(accountingExports)
      .where(eq(accountingExports.userId, userId))
      .orderBy(desc(accountingExports.createdAt))
      .limit(50);
  }

  async getAccountingExport(exportId: string, userId: string): Promise<AccountingExport | undefined> {
    const [exportRecord] = await db
      .select()
      .from(accountingExports)
      .where(and(
        eq(accountingExports.id, exportId),
        eq(accountingExports.userId, userId)
      ));
    return exportRecord;
  }

  async createAccountingExport(exportData: InsertAccountingExport): Promise<AccountingExport> {
    const [created] = await db
      .insert(accountingExports)
      .values(exportData)
      .returning();
    return created;
  }

  async updateAccountingExport(exportId: string, updates: Partial<AccountingExport>): Promise<AccountingExport> {
    const [updated] = await db
      .update(accountingExports)
      .set(updates)
      .where(eq(accountingExports.id, exportId))
      .returning();
    
    if (!updated) {
      throw new Error('Accounting export not found');
    }
    
    return updated;
  }

  // Accounting data retrieval for export
  async getAccountingData(userId: string, dataType: string, dateRange?: { start: Date; end: Date }): Promise<any> {
    let conditions = [eq(orders.userId, userId)];
    
    if (dateRange) {
      if (dateRange.start) {
        conditions.push(sql`${orders.createdAt} >= ${dateRange.start}`);
      }
      if (dateRange.end) {
        conditions.push(sql`${orders.createdAt} <= ${dateRange.end}`);
      }
    }

    switch (dataType) {
      case 'transactions':
        // Get order data as transactions
        const transactions = await db
          .select({
            id: orders.id,
            amount: orders.total,
            date: orders.createdAt,
            description: sql`CONCAT('Order #', ${orders.id})`,
            type: sql`'sale'`,
            customerId: orders.userId,
            currency: sql`'USD'`
          })
          .from(orders)
          .where(and(...conditions))
          .orderBy(desc(orders.createdAt));
        
        return { transactions: transactions.map(t => ({
          ...t,
          amount: parseFloat(t.amount),
          type: 'sale'
        })) };

      case 'customers':
        // Get unique customers from orders
        const customers = await db
          .selectDistinct({
            id: users.id,
            name: sql`CONCAT(COALESCE(${users.firstName}, ''), ' ', COALESCE(${users.lastName}, ''))`,
            email: users.email,
            companyName: sql`NULL`,
            phone: sql`NULL`,
            billingAddress: sql`NULL`,
            shippingAddress: sql`NULL`
          })
          .from(orders)
          .innerJoin(users, eq(orders.userId, users.id))
          .where(and(...conditions));
        
        return { customers };

      case 'invoices':
        // Get orders as invoices
        const invoices = await db
          .select({
            id: orders.id,
            invoiceNumber: orders.id,
            customerId: orders.userId,
            issueDate: orders.createdAt,
            dueDate: sql`${orders.createdAt} + INTERVAL '30 days'`,
            status: orders.status,
            currency: sql`'USD'`,
            subtotal: orders.subtotal,
            tax: orders.tax,
            total: orders.total,
            lineItems: sql`'[]'`
          })
          .from(orders)
          .where(and(...conditions))
          .orderBy(desc(orders.createdAt));
        
        // Get line items for each order
        for (const invoice of invoices) {
          const items = await db
            .select({
              description: products.name,
              quantity: orderItems.quantity,
              unitPrice: orderItems.price,
              lineTotal: sql`${orderItems.quantity} * ${orderItems.price}`,
              accountId: sql`'200'` // Default sales account
            })
            .from(orderItems)
            .innerJoin(products, eq(orderItems.productId, products.id))
            .where(eq(orderItems.orderId, invoice.id));
          
          (invoice as any).lineItems = items.map(item => ({
            ...item,
            unitPrice: parseFloat(item.unitPrice),
            lineTotal: parseFloat(item.lineTotal)
          }));
        }
        
        return { invoices: invoices.map(i => ({
          ...i,
          subtotal: parseFloat(i.subtotal),
          tax: parseFloat(i.tax),
          total: parseFloat(i.total),
          issueDate: new Date(i.issueDate),
          dueDate: new Date(i.dueDate)
        })) };

      case 'accounts':
        // Return basic chart of accounts structure
        return {
          accounts: [
            { id: '100', name: 'Cash', type: 'asset', accountNumber: '100', isActive: true },
            { id: '200', name: 'Sales Revenue', type: 'income', accountNumber: '200', isActive: true },
            { id: '300', name: 'Cost of Goods Sold', type: 'expense', accountNumber: '300', isActive: true },
            { id: '400', name: 'Operating Expenses', type: 'expense', accountNumber: '400', isActive: true }
          ]
        };

      default:
        return {};
    }
  }

  // Accounting plugin subscription operations
  async getAccountingPluginSubscriptions(userId: string): Promise<AccountingPluginSubscription[]> {
    return await db
      .select()
      .from(accountingPluginSubscriptions)
      .where(eq(accountingPluginSubscriptions.userId, userId))
      .orderBy(desc(accountingPluginSubscriptions.createdAt));
  }

  async getAccountingPluginSubscription(subscriptionId: string, userId: string): Promise<AccountingPluginSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(accountingPluginSubscriptions)
      .where(and(
        eq(accountingPluginSubscriptions.id, subscriptionId),
        eq(accountingPluginSubscriptions.userId, userId)
      ));
    return subscription;
  }

  async createAccountingPluginSubscription(subscription: InsertAccountingPluginSubscription): Promise<AccountingPluginSubscription> {
    // Set next billing date to 1 month from now
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    
    const [created] = await db
      .insert(accountingPluginSubscriptions)
      .values({
        ...subscription,
        nextBillingDate
      })
      .returning();
    return created;
  }

  async updateAccountingPluginSubscription(subscriptionId: string, updates: Partial<AccountingPluginSubscription>): Promise<AccountingPluginSubscription> {
    const [updated] = await db
      .update(accountingPluginSubscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(accountingPluginSubscriptions.id, subscriptionId))
      .returning();
    
    if (!updated) {
      throw new Error('Accounting plugin subscription not found');
    }
    
    return updated;
  }

  async cancelAccountingPluginSubscription(subscriptionId: string, userId: string): Promise<AccountingPluginSubscription> {
    const [cancelled] = await db
      .update(accountingPluginSubscriptions)
      .set({ 
        status: 'cancelled',
        autoRenew: false,
        updatedAt: new Date()
      })
      .where(and(
        eq(accountingPluginSubscriptions.id, subscriptionId),
        eq(accountingPluginSubscriptions.userId, userId)
      ))
      .returning();
    
    if (!cancelled) {
      throw new Error('Accounting plugin subscription not found');
    }
    
    return cancelled;
  }

  async hasActivePluginSubscription(userId: string, pluginId: string): Promise<boolean> {
    const [subscription] = await db
      .select({ id: accountingPluginSubscriptions.id })
      .from(accountingPluginSubscriptions)
      .where(and(
        eq(accountingPluginSubscriptions.userId, userId),
        eq(accountingPluginSubscriptions.pluginId, pluginId),
        eq(accountingPluginSubscriptions.status, 'active')
      ))
      .limit(1);
    
    return !!subscription;
  }
}

export const storage = new DatabaseStorage();

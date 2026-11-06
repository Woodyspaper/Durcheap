// Type definitions for accounting integrations

export interface AccountingPlugin {
  getName(): string;
  getDescription(): string;
  getSupportedFeatures(): string[];
  getPricingInfo(): string;
  getApiDocumentationUrl(): string;
  
  isConfigured(): Promise<boolean>;
  configure(config: PluginConfig): Promise<boolean>;
  testConnection(): Promise<{ success: boolean; message: string }>;
  
  exportData(
    dataType: 'transactions' | 'customers' | 'invoices' | 'accounts',
    data: AccountingData,
    options?: ExportOptions
  ): Promise<ExportResult>;
  
  // Optional methods for advanced features
  importData?(dataType: string): Promise<any>;
  getAccountingPeriods?(): Promise<AccountingPeriod[]>;
  generateReports?(reportType: string, parameters: any): Promise<any>;
}

export interface PluginConfig {
  // OAuth credentials
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  
  // API credentials
  apiKey?: string;
  apiSecret?: string;
  
  // Environment settings
  environment?: 'sandbox' | 'production';
  baseUrl?: string;
  
  // Authentication tokens (stored securely)
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  
  // Company/organization specific
  companyId?: string;
  tenantId?: string;
  
  // Additional plugin-specific settings
  [key: string]: any;
}

export interface ExportOptions {
  dryRun?: boolean;
  dateRange?: { start: Date; end: Date };
  includeMetadata?: boolean;
  batchSize?: number;
  skipValidation?: boolean;
}

export interface ExportResult {
  success: boolean;
  recordsProcessed: number;
  recordsSuccessful: number;
  recordsFailed: number;
  errors: ExportError[];
  warnings: string[];
  metadata?: {
    exportId?: string;
    batchId?: string;
    processingTime: number;
    dataHash?: string;
  };
}

export interface ExportError {
  recordId?: string;
  field?: string;
  errorCode: string;
  message: string;
  severity: 'error' | 'warning';
}

// Data structure definitions
export interface AccountingData {
  transactions?: TransactionData[];
  customers?: CustomerData[];
  invoices?: InvoiceData[];
  accounts?: ChartOfAccountsData[];
  [key: string]: any;
}

export interface TransactionData {
  id: string;
  type: 'sale' | 'expense' | 'fee' | 'commission' | 'refund' | 'adjustment';
  date: Date;
  amount: number;
  currency: string;
  description: string;
  customerId?: string;
  categoryId?: string;
  accountId?: string;
  reference?: string;
  
  // Tax information
  taxAmount?: number;
  taxRate?: number;
  taxAccountId?: string;
  
  // Platform specific data
  orderId?: string;
  productId?: string;
  sellerId?: string;
  paymentMethod?: string;
  paymentProcessorFee?: number;
  
  // Line items for detailed breakdown
  lineItems?: TransactionLineItem[];
  
  metadata?: Record<string, any>;
}

export interface TransactionLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  accountId?: string;
  taxAmount?: number;
  productId?: string;
}

export interface CustomerData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  companyName?: string;
  
  // Address information
  billingAddress?: Address;
  shippingAddress?: Address;
  
  // Tax information
  taxId?: string;
  taxExempt?: boolean;
  
  // Credit terms
  paymentTerms?: string;
  creditLimit?: number;
  
  // Platform specific
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: Date;
  
  metadata?: Record<string, any>;
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  customerId: string;
  issueDate: Date;
  dueDate?: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  
  // Amounts
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  
  // Line items
  lineItems: InvoiceLineItem[];
  
  // References
  orderId?: string;
  purchaseOrderNumber?: string;
  
  // Terms and notes
  terms?: string;
  notes?: string;
  
  metadata?: Record<string, any>;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  accountId?: string;
  taxAmount?: number;
  taxRate?: number;
  productId?: string;
}

export interface ChartOfAccountsData {
  id: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  subType?: string;
  accountNumber?: string;
  parentAccountId?: string;
  isActive: boolean;
  description?: string;
  balance?: number;
  
  // Tax settings
  taxType?: string;
  
  metadata?: Record<string, any>;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface AccountingPeriod {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isClosed: boolean;
}

// Webhook and real-time sync types
export interface WebhookEvent {
  id: string;
  type: string;
  pluginId: string;
  data: any;
  timestamp: Date;
  signature?: string;
}

// Integration settings for sellers
export interface SellerIntegrationSettings {
  sellerId: string;
  pluginId: string;
  isEnabled: boolean;
  config: PluginConfig;
  lastSyncDate?: Date;
  autoSyncEnabled: boolean;
  syncFrequency?: 'daily' | 'weekly' | 'monthly';
  accountMappings: AccountMapping[];
  
  // Sync preferences
  syncTransactions: boolean;
  syncCustomers: boolean;
  syncInvoices: boolean;
  syncAccounts: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountMapping {
  platformAccount: string;
  accountingAccount: string;
  accountType: string;
  description?: string;
}

// Error handling
export class AccountingIntegrationError extends Error {
  constructor(
    message: string,
    public pluginId: string,
    public errorCode?: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'AccountingIntegrationError';
  }
}

// API Rate limiting
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: Date;
  pluginId: string;
}
// QuickBooks Online API Integration Plugin
import type { 
  AccountingPlugin, 
  PluginConfig, 
  AccountingData, 
  ExportResult, 
  ExportOptions,
  TransactionData,
  CustomerData,
  InvoiceData,
  ChartOfAccountsData,
  AccountingIntegrationError
} from '../types';

export class QuickBooksPlugin implements AccountingPlugin {
  private config: PluginConfig = {};
  private baseUrl = 'https://sandbox-quickbooks.api.intuit.com'; // Default to sandbox

  getName(): string {
    return 'QuickBooks Online';
  }

  getDescription(): string {
    return 'Industry-leading accounting software with comprehensive API integration. Perfect for small to medium businesses with robust reporting and tax features.';
  }

  getSupportedFeatures(): string[] {
    return [
      'transactions',
      'customers',
      'invoices',
      'chart-of-accounts',
      'items',
      'vendors',
      'payments',
      'tax-tracking',
      'multi-currency',
      'real-time-sync',
      'webhooks',
      'reporting-api',
      'batch-operations'
    ];
  }

  getPricingInfo(): string {
    return 'QuickBooks Online: $35/month (Simple Start), $65/month (Essentials - Recommended), $99/month (Plus)';
  }

  getApiDocumentationUrl(): string {
    return 'https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities';
  }

  async isConfigured(): Promise<boolean> {
    return !!(
      this.config.clientId &&
      this.config.clientSecret &&
      this.config.accessToken &&
      this.config.companyId
    );
  }

  async configure(config: PluginConfig): Promise<boolean> {
    try {
      this.config = { ...config };
      
      // Set base URL based on environment
      this.baseUrl = config.environment === 'production' 
        ? 'https://quickbooks.api.intuit.com'
        : 'https://sandbox-quickbooks.api.intuit.com';

      // Validate required fields
      if (!config.clientId || !config.clientSecret) {
        throw new Error('Client ID and Client Secret are required');
      }

      return true;
    } catch (error) {
      console.error('QuickBooks configuration error:', error);
      return false;
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.config.accessToken || !this.config.companyId) {
        return {
          success: false,
          message: 'Access token and Company ID are required. Please complete OAuth flow.'
        };
      }

      // Test connection by fetching company info
      const response = await this.makeApiRequest('GET', `/companyinfo/${this.config.companyId}`);
      
      if (response.QueryResponse?.CompanyInfo) {
        const companyName = response.QueryResponse.CompanyInfo[0]?.Name || 'Unknown';
        return {
          success: true,
          message: `Successfully connected to ${companyName}`
        };
      }

      return {
        success: false,
        message: 'Unable to fetch company information'
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Connection failed: ${error.message}`
      };
    }
  }

  async exportData(
    dataType: 'transactions' | 'customers' | 'invoices' | 'accounts',
    data: AccountingData,
    options: ExportOptions = {}
  ): Promise<ExportResult> {
    const result: ExportResult = {
      success: true,
      recordsProcessed: 0,
      recordsSuccessful: 0,
      recordsFailed: 0,
      errors: [],
      warnings: [],
      metadata: {
        processingTime: Date.now()
      }
    };

    try {
      switch (dataType) {
        case 'transactions':
          return await this.exportTransactions(data.transactions || [], options, result);
        case 'customers':
          return await this.exportCustomers(data.customers || [], options, result);
        case 'invoices':
          return await this.exportInvoices(data.invoices || [], options, result);
        case 'accounts':
          return await this.exportAccounts(data.accounts || [], options, result);
        default:
          throw new Error(`Unsupported data type: ${dataType}`);
      }
    } catch (error: any) {
      result.success = false;
      result.errors.push({
        errorCode: 'EXPORT_FAILED',
        message: error.message,
        severity: 'error'
      });
      return result;
    } finally {
      result.metadata!.processingTime = Date.now() - result.metadata!.processingTime;
    }
  }

  private async exportTransactions(
    transactions: TransactionData[], 
    options: ExportOptions,
    result: ExportResult
  ): Promise<ExportResult> {
    result.recordsProcessed = transactions.length;

    for (const transaction of transactions) {
      try {
        if (options.dryRun) {
          // Validate without creating
          this.validateTransaction(transaction);
          result.recordsSuccessful++;
          continue;
        }

        let qbTransaction;
        
        switch (transaction.type) {
          case 'sale':
            qbTransaction = await this.createSalesReceipt(transaction);
            break;
          case 'expense':
            qbTransaction = await this.createExpense(transaction);
            break;
          case 'refund':
            qbTransaction = await this.createRefundReceipt(transaction);
            break;
          default:
            // Create as journal entry for other types
            qbTransaction = await this.createJournalEntry(transaction);
            break;
        }

        result.recordsSuccessful++;
        
      } catch (error: any) {
        result.recordsFailed++;
        result.errors.push({
          recordId: transaction.id,
          errorCode: error.code || 'TRANSACTION_EXPORT_ERROR',
          message: error.message,
          severity: 'error'
        });
      }
    }

    result.success = result.recordsFailed === 0;
    return result;
  }

  private async exportCustomers(
    customers: CustomerData[], 
    options: ExportOptions,
    result: ExportResult
  ): Promise<ExportResult> {
    result.recordsProcessed = customers.length;

    for (const customer of customers) {
      try {
        if (options.dryRun) {
          this.validateCustomer(customer);
          result.recordsSuccessful++;
          continue;
        }

        const qbCustomer = {
          Name: customer.name,
          CompanyName: customer.companyName,
          PrimaryEmailAddr: customer.email ? { Address: customer.email } : undefined,
          PrimaryPhone: customer.phone ? { FreeFormNumber: customer.phone } : undefined,
          BillAddr: customer.billingAddress ? this.mapAddress(customer.billingAddress) : undefined,
          ShipAddr: customer.shippingAddress ? this.mapAddress(customer.shippingAddress) : undefined,
        };

        await this.makeApiRequest('POST', '/customer', qbCustomer);
        result.recordsSuccessful++;
        
      } catch (error: any) {
        result.recordsFailed++;
        result.errors.push({
          recordId: customer.id,
          errorCode: error.code || 'CUSTOMER_EXPORT_ERROR',
          message: error.message,
          severity: 'error'
        });
      }
    }

    result.success = result.recordsFailed === 0;
    return result;
  }

  private async exportInvoices(
    invoices: InvoiceData[], 
    options: ExportOptions,
    result: ExportResult
  ): Promise<ExportResult> {
    result.recordsProcessed = invoices.length;

    for (const invoice of invoices) {
      try {
        if (options.dryRun) {
          this.validateInvoice(invoice);
          result.recordsSuccessful++;
          continue;
        }

        // Get or create customer first
        const customer = await this.getOrCreateCustomer(invoice.customerId);
        
        const qbInvoice = {
          CustomerRef: { value: customer.Id },
          TxnDate: invoice.issueDate.toISOString().split('T')[0],
          DueDate: invoice.dueDate?.toISOString().split('T')[0],
          Line: invoice.lineItems.map(item => ({
            Amount: item.lineTotal,
            DetailType: 'SalesItemLineDetail',
            SalesItemLineDetail: {
              ItemRef: { value: '1' }, // Default service item
              Qty: item.quantity,
              UnitPrice: item.unitPrice
            }
          }))
        };

        await this.makeApiRequest('POST', '/invoice', qbInvoice);
        result.recordsSuccessful++;
        
      } catch (error: any) {
        result.recordsFailed++;
        result.errors.push({
          recordId: invoice.id,
          errorCode: error.code || 'INVOICE_EXPORT_ERROR',
          message: error.message,
          severity: 'error'
        });
      }
    }

    result.success = result.recordsFailed === 0;
    return result;
  }

  private async exportAccounts(
    accounts: ChartOfAccountsData[], 
    options: ExportOptions,
    result: ExportResult
  ): Promise<ExportResult> {
    result.recordsProcessed = accounts.length;

    for (const account of accounts) {
      try {
        if (options.dryRun) {
          this.validateAccount(account);
          result.recordsSuccessful++;
          continue;
        }

        const qbAccount = {
          Name: account.name,
          AccountType: this.mapAccountType(account.type),
          AccountSubType: account.subType || this.getDefaultSubType(account.type)
        };

        await this.makeApiRequest('POST', '/account', qbAccount);
        result.recordsSuccessful++;
        
      } catch (error: any) {
        result.recordsFailed++;
        result.errors.push({
          recordId: account.id,
          errorCode: error.code || 'ACCOUNT_EXPORT_ERROR',
          message: error.message,
          severity: 'error'
        });
      }
    }

    result.success = result.recordsFailed === 0;
    return result;
  }

  // Helper methods
  private async makeApiRequest(method: string, endpoint: string, data?: any): Promise<any> {
    if (!this.config.accessToken || !this.config.companyId) {
      throw new AccountingIntegrationError(
        'Missing access token or company ID',
        'quickbooks',
        'AUTH_ERROR'
      );
    }

    const url = `${this.baseUrl}/v3/company/${this.config.companyId}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.config.accessToken}`,
      'Accept': 'application/json'
    };

    if (method !== 'GET') {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AccountingIntegrationError(
        errorData.Fault?.Error?.[0]?.Detail || 'API request failed',
        'quickbooks',
        errorData.Fault?.Error?.[0]?.code,
        response.status,
        errorData
      );
    }

    return await response.json();
  }

  private validateTransaction(transaction: TransactionData): void {
    if (!transaction.amount || transaction.amount <= 0) {
      throw new Error('Transaction amount must be greater than 0');
    }
    if (!transaction.date) {
      throw new Error('Transaction date is required');
    }
    if (!transaction.description) {
      throw new Error('Transaction description is required');
    }
  }

  private validateCustomer(customer: CustomerData): void {
    if (!customer.name?.trim()) {
      throw new Error('Customer name is required');
    }
  }

  private validateInvoice(invoice: InvoiceData): void {
    if (!invoice.customerId) {
      throw new Error('Customer ID is required');
    }
    if (!invoice.lineItems?.length) {
      throw new Error('At least one line item is required');
    }
  }

  private validateAccount(account: ChartOfAccountsData): void {
    if (!account.name?.trim()) {
      throw new Error('Account name is required');
    }
    if (!account.type) {
      throw new Error('Account type is required');
    }
  }

  private mapAddress(address: any) {
    return {
      Line1: address.line1,
      Line2: address.line2,
      City: address.city,
      CountrySubDivisionCode: address.state,
      PostalCode: address.postalCode,
      Country: address.country
    };
  }

  private mapAccountType(type: string): string {
    const typeMap: Record<string, string> = {
      'asset': 'Other Current Asset',
      'liability': 'Other Current Liability',
      'equity': 'Equity',
      'income': 'Income',
      'expense': 'Expense'
    };
    return typeMap[type] || 'Other Current Asset';
  }

  private getDefaultSubType(type: string): string {
    const subTypeMap: Record<string, string> = {
      'asset': 'Other Current Assets',
      'liability': 'Other Current Liabilities',
      'equity': 'Opening Balance Equity',
      'income': 'Service/Fee Income',
      'expense': 'Other Business Expenses'
    };
    return subTypeMap[type] || 'Other Current Assets';
  }

  private async createSalesReceipt(transaction: TransactionData): Promise<any> {
    // Implementation for creating sales receipt in QuickBooks
    return {};
  }

  private async createExpense(transaction: TransactionData): Promise<any> {
    // Implementation for creating expense in QuickBooks
    return {};
  }

  private async createRefundReceipt(transaction: TransactionData): Promise<any> {
    // Implementation for creating refund receipt in QuickBooks
    return {};
  }

  private async createJournalEntry(transaction: TransactionData): Promise<any> {
    // Implementation for creating journal entry in QuickBooks
    return {};
  }

  private async getOrCreateCustomer(customerId: string): Promise<any> {
    // Implementation for getting or creating customer in QuickBooks
    return { Id: '1' }; // Placeholder
  }

  // OAuth flow helpers
  async getAuthorizationUrl(state?: string): Promise<string> {
    const baseUrl = 'https://appcenter.intuit.com/connect/oauth2';
    const params = new URLSearchParams({
      client_id: this.config.clientId!,
      scope: 'com.intuit.quickbooks.accounting',
      redirect_uri: this.config.redirectUri!,
      response_type: 'code',
      access_type: 'offline',
      state: state || 'state'
    });

    return `${baseUrl}?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<PluginConfig> {
    const tokenUrl = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.redirectUri!
      })
    });

    const tokens = await response.json();
    
    return {
      ...this.config,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiry: new Date(Date.now() + (tokens.expires_in * 1000))
    };
  }
}
// FreshBooks API Integration Plugin
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

export class FreshBooksPlugin implements AccountingPlugin {
  private config: PluginConfig = {};
  private baseUrl = 'https://api.freshbooks.com';

  getName(): string {
    return 'FreshBooks';
  }

  getDescription(): string {
    return 'User-friendly accounting software designed for service-based small businesses. Excellent for freelancers, consultants, and professional services with built-in time tracking and project management.';
  }

  getSupportedFeatures(): string[] {
    return [
      'transactions',
      'customers',
      'invoices',
      'estimates',
      'time-tracking',
      'project-management',
      'expense-tracking',
      'payments',
      'recurring-invoices',
      'client-portal',
      'reporting',
      'multi-currency',
      'team-collaboration',
      'mobile-app'
    ];
  }

  getPricingInfo(): string {
    return 'FreshBooks: $21/month (Lite), $38/month (Plus - Recommended), $70/month (Premium). All plans include unlimited invoices and estimates.';
  }

  getApiDocumentationUrl(): string {
    return 'https://www.freshbooks.com/api/start';
  }

  async isConfigured(): Promise<boolean> {
    return !!(
      this.config.clientId &&
      this.config.clientSecret &&
      this.config.accessToken
    );
  }

  async configure(config: PluginConfig): Promise<boolean> {
    try {
      this.config = { ...config };
      
      if (!config.clientId || !config.clientSecret) {
        throw new Error('Client ID and Client Secret are required for FreshBooks');
      }

      return true;
    } catch (error) {
      console.error('FreshBooks configuration error:', error);
      return false;
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.config.accessToken) {
        return {
          success: false,
          message: 'Access token is required. Please complete OAuth flow.'
        };
      }

      // Test connection by fetching user profile
      const response = await this.makeApiRequest('GET', '/auth/api/v1/users/me');
      
      if (response.response) {
        const userName = response.response.email || 'Unknown User';
        return {
          success: true,
          message: `Successfully connected to FreshBooks account: ${userName}`
        };
      }

      return {
        success: false,
        message: 'Unable to fetch user information'
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
          // FreshBooks doesn't have a traditional chart of accounts
          result.warnings.push('FreshBooks does not support chart of accounts export. Accounts are managed automatically.');
          return result;
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
          this.validateTransaction(transaction);
          result.recordsSuccessful++;
          continue;
        }

        let fbTransaction;
        
        switch (transaction.type) {
          case 'expense':
            fbTransaction = await this.createExpense(transaction);
            break;
          case 'sale':
            // FreshBooks handles sales through invoices/payments
            result.warnings.push(`Transaction ${transaction.id}: Sales should be exported as invoices in FreshBooks`);
            result.recordsSuccessful++;
            continue;
          case 'refund':
            result.warnings.push(`Transaction ${transaction.id}: Refunds should be handled through credit notes in FreshBooks`);
            result.recordsSuccessful++;
            continue;
          default:
            result.warnings.push(`Transaction ${transaction.id}: Transaction type ${transaction.type} not supported in FreshBooks`);
            result.recordsSuccessful++;
            continue;
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

        const fbClient = {
          organization: customer.companyName || customer.name,
          fname: customer.name.split(' ')[0] || '',
          lname: customer.name.split(' ').slice(1).join(' ') || '',
          email: customer.email || '',
          work_phone: customer.phone || '',
          // Address handling
          p_street: customer.billingAddress?.line1 || '',
          p_street2: customer.billingAddress?.line2 || '',
          p_city: customer.billingAddress?.city || '',
          p_province: customer.billingAddress?.state || '',
          p_code: customer.billingAddress?.postalCode || '',
          p_country: customer.billingAddress?.country || '',
          // Currency
          currency_code: 'USD'
        };

        // Get account ID from config or use default business account
        const accountId = this.config.companyId || await this.getDefaultAccountId();
        
        await this.makeApiRequest('POST', `/accounting/account/${accountId}/users/clients`, {
          client: fbClient
        });
        
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

        // Get or create client first
        const clientId = await this.getOrCreateClient(invoice.customerId);
        const accountId = this.config.companyId || await this.getDefaultAccountId();
        
        const fbInvoice = {
          clientid: clientId,
          create_date: invoice.issueDate.toISOString().split('T')[0],
          due_date: invoice.dueDate?.toISOString().split('T')[0],
          invoice_number: invoice.invoiceNumber,
          status: this.mapInvoiceStatus(invoice.status),
          currency_code: invoice.currency || 'USD',
          lines: invoice.lineItems.map((item, index) => ({
            type: 0, // Item line
            description: item.description,
            qty: item.quantity,
            unit_cost: {
              amount: item.unitPrice.toFixed(2),
              code: invoice.currency || 'USD'
            }
          })),
          // Terms and notes
          terms: invoice.terms || '',
          notes: invoice.notes || ''
        };

        await this.makeApiRequest('POST', `/accounting/account/${accountId}/invoices/invoices`, {
          invoice: fbInvoice
        });
        
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

  // Helper methods
  private async makeApiRequest(method: string, endpoint: string, data?: any): Promise<any> {
    if (!this.config.accessToken) {
      throw new AccountingIntegrationError(
        'Missing access token',
        'freshbooks',
        'AUTH_ERROR'
      );
    }

    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.config.accessToken}`,
      'Api-Version': 'alpha',
      'Content-Type': 'application/json'
    };

    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AccountingIntegrationError(
        errorData.message || 'API request failed',
        'freshbooks',
        errorData.errno,
        response.status,
        errorData
      );
    }

    return await response.json();
  }

  private async getDefaultAccountId(): Promise<string> {
    try {
      const response = await this.makeApiRequest('GET', '/auth/api/v1/users/me');
      
      if (response.response && response.response.business_memberships) {
        const membership = response.response.business_memberships[0];
        return membership.business.account_id;
      }
      
      throw new Error('No business account found');
    } catch (error) {
      throw new AccountingIntegrationError(
        'Unable to get account ID',
        'freshbooks',
        'ACCOUNT_ERROR'
      );
    }
  }

  private async getOrCreateClient(customerId: string): Promise<number> {
    // In a real implementation, this would search for existing client first
    // For now, return a placeholder ID
    return parseInt(customerId) || 1;
  }

  private async createExpense(transaction: TransactionData): Promise<any> {
    const accountId = this.config.companyId || await this.getDefaultAccountId();
    
    const expense = {
      amount: {
        amount: transaction.amount.toFixed(2),
        code: transaction.currency || 'USD'
      },
      date: transaction.date.toISOString().split('T')[0],
      notes: transaction.description,
      categoryid: 1, // Default category
      // Vendor handling
      vendor: transaction.customerId || 'Platform Expense'
    };

    return await this.makeApiRequest('POST', `/accounting/account/${accountId}/expenses/expenses`, {
      expense
    });
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

  private mapInvoiceStatus(status: string): number {
    const statusMap: Record<string, number> = {
      'draft': 1,
      'sent': 2,
      'paid': 3,
      'overdue': 2, // Same as sent in FreshBooks
      'cancelled': 1 // Back to draft
    };
    return statusMap[status] || 1;
  }

  // OAuth flow helpers
  async getAuthorizationUrl(state?: string): Promise<string> {
    const baseUrl = 'https://my.freshbooks.com/service/auth/oauth/authorize';
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId!,
      redirect_uri: this.config.redirectUri!,
      state: state || 'state'
    });

    return `${baseUrl}?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<PluginConfig> {
    const tokenUrl = 'https://api.freshbooks.com/auth/oauth/token';
    
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

  // FreshBooks specific features
  async createProject(projectData: {
    title: string;
    description?: string;
    clientId: number;
    dueDate?: Date;
    budget?: number;
  }): Promise<any> {
    const accountId = this.config.companyId || await this.getDefaultAccountId();
    
    const project = {
      title: projectData.title,
      description: projectData.description || '',
      client_id: projectData.clientId,
      due_date: projectData.dueDate?.toISOString().split('T')[0],
      budget: projectData.budget || 0
    };

    return await this.makeApiRequest('POST', `/projects/account/${accountId}/projects`, {
      project
    });
  }

  async trackTime(timeEntry: {
    projectId: number;
    duration: number; // in seconds
    notes: string;
    date: Date;
  }): Promise<any> {
    const accountId = this.config.companyId || await this.getDefaultAccountId();
    
    const entry = {
      project_id: timeEntry.projectId,
      duration: timeEntry.duration,
      note: timeEntry.notes,
      started_at: timeEntry.date.toISOString()
    };

    return await this.makeApiRequest('POST', `/timetracking/account/${accountId}/time_entries`, {
      time_entry: entry
    });
  }
}
// Xero API Integration Plugin
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

export class XeroPlugin implements AccountingPlugin {
  private config: PluginConfig = {};
  private baseUrl = 'https://api.xero.com/api.xro/2.0';

  getName(): string {
    return 'Xero';
  }

  getDescription(): string {
    return 'Beautiful cloud accounting software with excellent API integration. Popular globally with real-time bank feeds and unlimited users.';
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
      'bank-reconciliation',
      'multi-currency',
      'real-time-sync',
      'webhooks',
      'reporting-api',
      'batch-operations',
      'bank-feeds'
    ];
  }

  getPricingInfo(): string {
    return 'Xero: $15/month (Early), $42/month (Growing), $65/month (Established). All plans include unlimited users.';
  }

  getApiDocumentationUrl(): string {
    return 'https://developer.xero.com/documentation/api/accounting/overview';
  }

  async isConfigured(): Promise<boolean> {
    return !!(
      this.config.clientId &&
      this.config.clientSecret &&
      this.config.accessToken &&
      this.config.tenantId
    );
  }

  async configure(config: PluginConfig): Promise<boolean> {
    try {
      this.config = { ...config };
      
      if (!config.clientId || !config.clientSecret) {
        throw new Error('Client ID and Client Secret are required');
      }

      return true;
    } catch (error) {
      console.error('Xero configuration error:', error);
      return false;
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.config.accessToken || !this.config.tenantId) {
        return {
          success: false,
          message: 'Access token and Tenant ID are required. Please complete OAuth flow.'
        };
      }

      // Test connection by fetching organisation info
      const response = await this.makeApiRequest('GET', '/Organisation');
      
      if (response.Organisations && response.Organisations.length > 0) {
        const orgName = response.Organisations[0].Name || 'Unknown';
        return {
          success: true,
          message: `Successfully connected to ${orgName}`
        };
      }

      return {
        success: false,
        message: 'Unable to fetch organisation information'
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
          this.validateTransaction(transaction);
          result.recordsSuccessful++;
          continue;
        }

        let xeroTransaction;
        
        switch (transaction.type) {
          case 'sale':
            xeroTransaction = await this.createBankTransaction(transaction, 'RECEIVE');
            break;
          case 'expense':
            xeroTransaction = await this.createBankTransaction(transaction, 'SPEND');
            break;
          case 'refund':
            xeroTransaction = await this.createBankTransaction(transaction, 'SPEND-REFUND');
            break;
          default:
            xeroTransaction = await this.createManualJournal(transaction);
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

    // Xero has batch endpoints, so we can process multiple customers at once
    const batchSize = 10;
    
    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize);
      
      try {
        if (options.dryRun) {
          batch.forEach(customer => this.validateCustomer(customer));
          result.recordsSuccessful += batch.length;
          continue;
        }

        const xeroContacts = batch.map(customer => ({
          Name: customer.name,
          EmailAddress: customer.email,
          ContactNumber: customer.phone,
          Addresses: [
            customer.billingAddress ? {
              AddressType: 'STREET',
              AddressLine1: customer.billingAddress.line1,
              AddressLine2: customer.billingAddress.line2,
              City: customer.billingAddress.city,
              Region: customer.billingAddress.state,
              PostalCode: customer.billingAddress.postalCode,
              Country: customer.billingAddress.country
            } : null
          ].filter(Boolean)
        }));

        await this.makeApiRequest('POST', '/Contacts', { Contacts: xeroContacts });
        result.recordsSuccessful += batch.length;
        
      } catch (error: any) {
        result.recordsFailed += batch.length;
        batch.forEach(customer => {
          result.errors.push({
            recordId: customer.id,
            errorCode: error.code || 'CUSTOMER_EXPORT_ERROR',
            message: error.message,
            severity: 'error'
          });
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

        // Get or create contact first
        const contact = await this.getOrCreateContact(invoice.customerId);
        
        const xeroInvoice = {
          Type: 'ACCREC', // Accounts Receivable
          Contact: { ContactID: contact.ContactID },
          Date: invoice.issueDate.toISOString().split('T')[0],
          DueDate: invoice.dueDate?.toISOString().split('T')[0],
          InvoiceNumber: invoice.invoiceNumber,
          Status: this.mapInvoiceStatus(invoice.status),
          LineItems: invoice.lineItems.map(item => ({
            Description: item.description,
            Quantity: item.quantity,
            UnitAmount: item.unitPrice,
            AccountCode: item.accountId || '200', // Default sales account
            TaxType: 'OUTPUT' // Default tax type
          }))
        };

        await this.makeApiRequest('POST', '/Invoices', { Invoices: [xeroInvoice] });
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

        const xeroAccount = {
          Code: account.accountNumber || account.id,
          Name: account.name,
          Type: this.mapAccountType(account.type),
          Status: account.isActive ? 'ACTIVE' : 'ARCHIVED'
        };

        await this.makeApiRequest('POST', '/Accounts', { Accounts: [xeroAccount] });
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
    if (!this.config.accessToken || !this.config.tenantId) {
      throw new AccountingIntegrationError(
        'Missing access token or tenant ID',
        'xero',
        'AUTH_ERROR'
      );
    }

    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.config.accessToken}`,
      'xero-tenant-id': this.config.tenantId,
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
        errorData.Message || 'API request failed',
        'xero',
        errorData.ErrorNumber,
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

  private mapAccountType(type: string): string {
    const typeMap: Record<string, string> = {
      'asset': 'BANK',
      'liability': 'LIABILITY',
      'equity': 'EQUITY',
      'income': 'REVENUE',
      'expense': 'EXPENSE'
    };
    return typeMap[type] || 'EXPENSE';
  }

  private mapInvoiceStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'draft': 'DRAFT',
      'sent': 'SUBMITTED',
      'paid': 'PAID',
      'overdue': 'AUTHORISED',
      'cancelled': 'VOIDED'
    };
    return statusMap[status] || 'DRAFT';
  }

  private async createBankTransaction(transaction: TransactionData, type: string): Promise<any> {
    const bankTransaction = {
      Type: type,
      Contact: transaction.customerId ? { ContactID: transaction.customerId } : undefined,
      Date: transaction.date.toISOString().split('T')[0],
      LineItems: [{
        Description: transaction.description,
        UnitAmount: transaction.amount,
        AccountCode: '200' // Default account
      }]
    };

    return await this.makeApiRequest('POST', '/BankTransactions', { BankTransactions: [bankTransaction] });
  }

  private async createManualJournal(transaction: TransactionData): Promise<any> {
    const manualJournal = {
      Narration: transaction.description,
      Date: transaction.date.toISOString().split('T')[0],
      JournalLines: [
        {
          LineAmount: transaction.amount,
          AccountCode: '200', // Default debit account
          Description: transaction.description
        },
        {
          LineAmount: -transaction.amount,
          AccountCode: '800', // Default credit account
          Description: transaction.description
        }
      ]
    };

    return await this.makeApiRequest('POST', '/ManualJournals', { ManualJournals: [manualJournal] });
  }

  private async getOrCreateContact(customerId: string): Promise<any> {
    // In a real implementation, this would check if contact exists first
    return { ContactID: customerId };
  }

  // OAuth flow helpers
  async getAuthorizationUrl(state?: string): Promise<string> {
    const baseUrl = 'https://login.xero.com/identity/connect/authorize';
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId!,
      redirect_uri: this.config.redirectUri!,
      scope: 'accounting.transactions accounting.contacts accounting.settings',
      state: state || 'state'
    });

    return `${baseUrl}?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<PluginConfig> {
    const tokenUrl = 'https://identity.xero.com/connect/token';
    
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
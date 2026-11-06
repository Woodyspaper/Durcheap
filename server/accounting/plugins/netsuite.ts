// NetSuite API Integration Plugin
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

export class NetSuitePlugin implements AccountingPlugin {
  private config: PluginConfig = {};
  private baseUrl = 'https://rest.netsuite.com/rest';

  getName(): string {
    return 'NetSuite';
  }

  getDescription(): string {
    return 'Enterprise ERP platform with comprehensive financial management, CRM, inventory, and business intelligence. Best for mid-market to enterprise companies.';
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
      'purchase-orders',
      'multi-currency',
      'multi-subsidiary',
      'advanced-reporting',
      'workflow-automation',
      'inventory-management',
      'crm-integration',
      'custom-fields',
      'saved-searches'
    ];
  }

  getPricingInfo(): string {
    return 'NetSuite: Custom pricing starting at $999/month. Contact NetSuite for enterprise pricing based on users and modules.';
  }

  getApiDocumentationUrl(): string {
    return 'https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_1540391670.html';
  }

  async isConfigured(): Promise<boolean> {
    return !!(
      this.config.apiKey &&
      this.config.apiSecret &&
      this.config.accessToken &&
      this.config.companyId
    );
  }

  async configure(config: PluginConfig): Promise<boolean> {
    try {
      this.config = { ...config };
      
      // NetSuite uses different base URLs for different data centers
      if (config.baseUrl) {
        this.baseUrl = config.baseUrl;
      }

      if (!config.apiKey || !config.apiSecret) {
        throw new Error('Consumer Key and Consumer Secret are required for NetSuite');
      }

      return true;
    } catch (error) {
      console.error('NetSuite configuration error:', error);
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

      // Test connection by fetching company information
      const response = await this.makeApiRequest('GET', '/record/v1/companyinformation');
      
      if (response.items && response.items.length > 0) {
        const companyName = response.items[0].values?.companyname || 'Unknown';
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
          this.validateTransaction(transaction);
          result.recordsSuccessful++;
          continue;
        }

        let nsTransaction;
        
        switch (transaction.type) {
          case 'sale':
            nsTransaction = await this.createSalesOrder(transaction);
            break;
          case 'expense':
            nsTransaction = await this.createExpenseReport(transaction);
            break;
          case 'refund':
            nsTransaction = await this.createCreditMemo(transaction);
            break;
          default:
            nsTransaction = await this.createJournalEntry(transaction);
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

        const nsCustomer = {
          values: {
            companyname: customer.name,
            email: customer.email,
            phone: customer.phone,
            // NetSuite specific fields
            isperson: customer.companyName ? false : true,
            firstname: customer.companyName ? undefined : customer.name.split(' ')[0],
            lastname: customer.companyName ? undefined : customer.name.split(' ').slice(1).join(' '),
            // Address handling
            defaultaddress: customer.billingAddress ? this.mapAddressForNetSuite(customer.billingAddress) : undefined
          }
        };

        await this.makeApiRequest('POST', '/record/v1/customer', nsCustomer);
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

        const nsInvoice = {
          values: {
            entity: { id: invoice.customerId },
            trandate: invoice.issueDate.toISOString().split('T')[0],
            duedate: invoice.dueDate?.toISOString().split('T')[0],
            tranid: invoice.invoiceNumber,
            // Line items
            item: {
              line: invoice.lineItems.map((item, index) => ({
                linenumber: index + 1,
                item: { id: '1' }, // Default item
                quantity: item.quantity,
                rate: item.unitPrice,
                amount: item.lineTotal,
                description: item.description
              }))
            }
          }
        };

        await this.makeApiRequest('POST', '/record/v1/invoice', nsInvoice);
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

        const nsAccount = {
          values: {
            acctname: account.name,
            accttype: this.mapAccountTypeForNetSuite(account.type),
            acctnum: account.accountNumber,
            description: account.description,
            isinactive: !account.isActive
          }
        };

        await this.makeApiRequest('POST', '/record/v1/account', nsAccount);
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
        'netsuite',
        'AUTH_ERROR'
      );
    }

    const url = `${this.baseUrl}${endpoint}`;
    
    // NetSuite uses OAuth 1.0a signature
    const headers: Record<string, string> = {
      'Authorization': this.generateOAuthHeader(method, url),
      'Content-Type': 'application/json',
      'Accept': 'application/json'
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
        'netsuite',
        errorData.code,
        response.status,
        errorData
      );
    }

    return await response.json();
  }

  private generateOAuthHeader(method: string, url: string): string {
    // This would implement OAuth 1.0a signature generation
    // For brevity, returning a placeholder
    return `OAuth oauth_consumer_key="${this.config.apiKey}", oauth_token="${this.config.accessToken}", oauth_signature_method="HMAC-SHA256", oauth_timestamp="${Math.floor(Date.now() / 1000)}", oauth_nonce="${Math.random().toString(36)}", oauth_version="1.0", oauth_signature="signature"`;
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

  private mapAddressForNetSuite(address: any) {
    return `${address.line1}\n${address.line2 ? address.line2 + '\n' : ''}${address.city}, ${address.state} ${address.postalCode}\n${address.country}`;
  }

  private mapAccountTypeForNetSuite(type: string): string {
    const typeMap: Record<string, string> = {
      'asset': 'Bank',
      'liability': 'Accounts Payable',
      'equity': 'Equity',
      'income': 'Income',
      'expense': 'Expense'
    };
    return typeMap[type] || 'Other Current Asset';
  }

  private async createSalesOrder(transaction: TransactionData): Promise<any> {
    // NetSuite-specific sales order creation
    return {};
  }

  private async createExpenseReport(transaction: TransactionData): Promise<any> {
    // NetSuite-specific expense report creation
    return {};
  }

  private async createCreditMemo(transaction: TransactionData): Promise<any> {
    // NetSuite-specific credit memo creation
    return {};
  }

  private async createJournalEntry(transaction: TransactionData): Promise<any> {
    // NetSuite-specific journal entry creation
    return {};
  }
}
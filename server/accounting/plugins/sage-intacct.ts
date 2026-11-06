// Sage Intacct API Integration Plugin
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

export class SageIntacctPlugin implements AccountingPlugin {
  private config: PluginConfig = {};
  private baseUrl = 'https://api.intacct.com/ia/xml/xmlgw.phtml';

  getName(): string {
    return 'Sage Intacct';
  }

  getDescription(): string {
    return 'Advanced cloud financial management platform designed for mid-market businesses. Excellent for multi-entity consolidation and complex financial reporting.';
  }

  getSupportedFeatures(): string[] {
    return [
      'transactions',
      'customers',
      'invoices',
      'chart-of-accounts',
      'vendors',
      'payments',
      'multi-entity',
      'project-accounting',
      'revenue-recognition',
      'financial-consolidation',
      'advanced-reporting',
      'workflow-automation',
      'audit-trail',
      'custom-dimensions',
      'inter-company-transactions'
    ];
  }

  getPricingInfo(): string {
    return 'Sage Intacct: Custom pricing based on modules and users. Contact Sage for enterprise pricing starting around $500/month per entity.';
  }

  getApiDocumentationUrl(): string {
    return 'https://developer.intacct.com/web-services/';
  }

  async isConfigured(): Promise<boolean> {
    return !!(
      this.config.apiKey &&
      this.config.apiSecret &&
      this.config.companyId
    );
  }

  async configure(config: PluginConfig): Promise<boolean> {
    try {
      this.config = { ...config };
      
      if (!config.apiKey || !config.apiSecret || !config.companyId) {
        throw new Error('Sender ID, Sender Password, and Company ID are required for Sage Intacct');
      }

      return true;
    } catch (error) {
      console.error('Sage Intacct configuration error:', error);
      return false;
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.config.apiKey || !this.config.apiSecret || !this.config.companyId) {
        return {
          success: false,
          message: 'Sender ID, Sender Password, and Company ID are required.'
        };
      }

      // Test connection by getting company info
      const xmlRequest = this.buildXmlRequest('get_list', 'company', {});
      const response = await this.makeApiRequest(xmlRequest);
      
      if (response.success) {
        return {
          success: true,
          message: `Successfully connected to Sage Intacct company ${this.config.companyId}`
        };
      }

      return {
        success: false,
        message: 'Unable to connect to Sage Intacct'
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

        let xmlRequest;
        
        switch (transaction.type) {
          case 'sale':
            xmlRequest = this.buildXmlRequest('create', 'arpayment', this.mapSaleTransaction(transaction));
            break;
          case 'expense':
            xmlRequest = this.buildXmlRequest('create', 'apbill', this.mapExpenseTransaction(transaction));
            break;
          case 'refund':
            xmlRequest = this.buildXmlRequest('create', 'arinvoice', this.mapRefundTransaction(transaction));
            break;
          default:
            xmlRequest = this.buildXmlRequest('create', 'glbatch', this.mapJournalEntry(transaction));
            break;
        }

        await this.makeApiRequest(xmlRequest);
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

        const customerData = {
          customerid: customer.id,
          name: customer.name,
          displaycontact: {
            contactname: customer.name,
            email1: customer.email,
            phone1: customer.phone
          },
          mailaddress: customer.billingAddress ? {
            address1: customer.billingAddress.line1,
            address2: customer.billingAddress.line2,
            city: customer.billingAddress.city,
            state: customer.billingAddress.state,
            zip: customer.billingAddress.postalCode,
            country: customer.billingAddress.country
          } : undefined
        };

        const xmlRequest = this.buildXmlRequest('create', 'customer', customerData);
        await this.makeApiRequest(xmlRequest);
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

        const invoiceData = {
          customerid: invoice.customerId,
          datecreated: {
            year: invoice.issueDate.getFullYear(),
            month: invoice.issueDate.getMonth() + 1,
            day: invoice.issueDate.getDate()
          },
          termname: 'Net 30',
          arinvoiceitems: {
            lineitem: invoice.lineItems.map(item => ({
              accountlabel: item.accountId || 'Sales',
              amount: item.lineTotal,
              memo: item.description,
              quantity: item.quantity,
              price: item.unitPrice
            }))
          }
        };

        const xmlRequest = this.buildXmlRequest('create', 'arinvoice', invoiceData);
        await this.makeApiRequest(xmlRequest);
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

        const accountData = {
          accountno: account.accountNumber || account.id,
          title: account.name,
          accounttype: this.mapAccountTypeForIntacct(account.type),
          normalbalance: this.getNormalBalance(account.type),
          status: account.isActive ? 'active' : 'inactive'
        };

        const xmlRequest = this.buildXmlRequest('create', 'glaccount', accountData);
        await this.makeApiRequest(xmlRequest);
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
  private buildXmlRequest(operation: string, objectType: string, data: any): string {
    const timestamp = new Date().toISOString();
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<request>
  <control>
    <senderid>${this.config.apiKey}</senderid>
    <password>${this.config.apiSecret}</password>
    <controlid>${timestamp}</controlid>
    <uniqueid>false</uniqueid>
    <dtdversion>3.0</dtdversion>
  </control>
  <operation transaction="true">
    <authentication>
      <login>
        <userid>${this.config.apiKey}</userid>
        <companyid>${this.config.companyId}</companyid>
        <password>${this.config.apiSecret}</password>
      </login>
    </authentication>
    <content>
      <function controlid="${timestamp}-${objectType}">
        <${operation}_${objectType}>
          ${this.objectToXml(data)}
        </${operation}_${objectType}>
      </function>
    </content>
  </operation>
</request>`;
  }

  private objectToXml(obj: any, indent: string = '          '): string {
    let xml = '';
    
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue;
      
      if (typeof value === 'object' && !Array.isArray(value)) {
        xml += `${indent}<${key}>\n`;
        xml += this.objectToXml(value, indent + '  ');
        xml += `${indent}</${key}>\n`;
      } else if (Array.isArray(value)) {
        value.forEach(item => {
          xml += `${indent}<${key}>\n`;
          xml += this.objectToXml(item, indent + '  ');
          xml += `${indent}</${key}>\n`;
        });
      } else {
        xml += `${indent}<${key}>${this.escapeXml(String(value))}</${key}>\n`;
      }
    }
    
    return xml;
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private async makeApiRequest(xmlData: string): Promise<any> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
        'Accept': 'application/xml'
      },
      body: xmlData
    });

    if (!response.ok) {
      throw new AccountingIntegrationError(
        'API request failed',
        'sage-intacct',
        'HTTP_ERROR',
        response.status
      );
    }

    const responseText = await response.text();
    
    // Parse XML response (simplified)
    if (responseText.includes('<error>')) {
      throw new AccountingIntegrationError(
        'Sage Intacct API error',
        'sage-intacct',
        'API_ERROR'
      );
    }

    return { success: true, data: responseText };
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

  private mapAccountTypeForIntacct(type: string): string {
    const typeMap: Record<string, string> = {
      'asset': 'balancesheet',
      'liability': 'balancesheet',
      'equity': 'balancesheet',
      'income': 'incomestatement',
      'expense': 'incomestatement'
    };
    return typeMap[type] || 'balancesheet';
  }

  private getNormalBalance(type: string): string {
    const balanceMap: Record<string, string> = {
      'asset': 'debit',
      'liability': 'credit',
      'equity': 'credit',
      'income': 'credit',
      'expense': 'debit'
    };
    return balanceMap[type] || 'debit';
  }

  private mapSaleTransaction(transaction: TransactionData): any {
    return {
      customerid: transaction.customerId || 'DEFAULT',
      paymentamount: transaction.amount,
      translationtype: transaction.currency || 'USD',
      paymentdate: {
        year: transaction.date.getFullYear(),
        month: transaction.date.getMonth() + 1,
        day: transaction.date.getDate()
      }
    };
  }

  private mapExpenseTransaction(transaction: TransactionData): any {
    return {
      vendorid: transaction.customerId || 'DEFAULT',
      datecreated: {
        year: transaction.date.getFullYear(),
        month: transaction.date.getMonth() + 1,
        day: transaction.date.getDate()
      },
      apbillitems: {
        lineitem: [{
          accountlabel: 'Office Expenses',
          amount: transaction.amount,
          memo: transaction.description
        }]
      }
    };
  }

  private mapRefundTransaction(transaction: TransactionData): any {
    return {
      customerid: transaction.customerId || 'DEFAULT',
      datecreated: {
        year: transaction.date.getFullYear(),
        month: transaction.date.getMonth() + 1,
        day: transaction.date.getDate()
      },
      arinvoiceitems: {
        lineitem: [{
          accountlabel: 'Sales Returns',
          amount: -Math.abs(transaction.amount),
          memo: transaction.description
        }]
      }
    };
  }

  private mapJournalEntry(transaction: TransactionData): any {
    return {
      journal: 'GJ',
      batch_date: {
        year: transaction.date.getFullYear(),
        month: transaction.date.getMonth() + 1,
        day: transaction.date.getDate()
      },
      entries: {
        glentry: [
          {
            accountno: '1000',
            tr_type: 'debit',
            amount: transaction.amount,
            memo: transaction.description
          },
          {
            accountno: '4000',
            tr_type: 'credit',
            amount: transaction.amount,
            memo: transaction.description
          }
        ]
      }
    };
  }
}
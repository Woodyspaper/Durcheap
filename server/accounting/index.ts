// Accounting Integration System
// Main entry point for all accounting software integrations

import { QuickBooksPlugin } from './plugins/quickbooks';
import { XeroPlugin } from './plugins/xero';
import { NetSuitePlugin } from './plugins/netsuite';
import { SageIntacctPlugin } from './plugins/sage-intacct';
import { FreshBooksPlugin } from './plugins/freshbooks';
import type { 
  AccountingPlugin, 
  AccountingData, 
  ExportResult, 
  PluginConfig,
  TransactionData,
  CustomerData,
  InvoiceData,
  ChartOfAccountsData
} from './types';

export class AccountingIntegrationManager {
  private plugins: Map<string, AccountingPlugin> = new Map();

  constructor() {
    this.registerPlugins();
  }

  private registerPlugins() {
    this.plugins.set('quickbooks', new QuickBooksPlugin());
    this.plugins.set('xero', new XeroPlugin());
    this.plugins.set('netsuite', new NetSuitePlugin());
    this.plugins.set('sage-intacct', new SageIntacctPlugin());
    this.plugins.set('freshbooks', new FreshBooksPlugin());
  }

  async getAvailablePlugins(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    features: string[];
    pricing: string;
    apiDocUrl: string;
    isConfigured: boolean;
  }>> {
    const pluginInfo = [];
    
    for (const [id, plugin] of this.plugins) {
      pluginInfo.push({
        id,
        name: plugin.getName(),
        description: plugin.getDescription(),
        features: plugin.getSupportedFeatures(),
        pricing: plugin.getPricingInfo(),
        apiDocUrl: plugin.getApiDocumentationUrl(),
        isConfigured: await plugin.isConfigured()
      });
    }
    
    return pluginInfo;
  }

  async configurePlugin(pluginId: string, config: PluginConfig): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }
    
    return await plugin.configure(config);
  }

  async testConnection(pluginId: string): Promise<{ success: boolean; message: string }> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }
    
    return await plugin.testConnection();
  }

  async exportData(
    pluginId: string, 
    dataType: 'transactions' | 'customers' | 'invoices' | 'accounts',
    data: AccountingData,
    options?: {
      dryRun?: boolean;
      dateRange?: { start: Date; end: Date };
      includeMetadata?: boolean;
    }
  ): Promise<ExportResult> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const isConfigured = await plugin.isConfigured();
    if (!isConfigured) {
      throw new Error(`Plugin ${pluginId} is not configured. Please configure it first.`);
    }

    // Test connection before export
    const connectionTest = await plugin.testConnection();
    if (!connectionTest.success) {
      throw new Error(`Connection failed: ${connectionTest.message}`);
    }

    // Perform the export
    return await plugin.exportData(dataType, data, options);
  }

  async syncData(
    pluginId: string,
    sellerId: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<{
    transactions: ExportResult;
    customers: ExportResult;
    invoices: ExportResult;
    accounts?: ExportResult;
  }> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    // Get data from our system for the seller
    const accountingData = await this.getSellerAccountingData(sellerId, dateRange);

    // Export all data types
    const results = {
      transactions: await plugin.exportData('transactions', accountingData.transactions),
      customers: await plugin.exportData('customers', accountingData.customers),
      invoices: await plugin.exportData('invoices', accountingData.invoices),
    };

    // Chart of accounts export (if supported by plugin)
    if (plugin.getSupportedFeatures().includes('chart-of-accounts')) {
      results.accounts = await plugin.exportData('accounts', accountingData.accounts);
    }

    return results;
  }

  private async getSellerAccountingData(sellerId: string, dateRange?: { start: Date; end: Date }) {
    // This would integrate with your existing database
    // For now, returning structured placeholder that shows the data format
    return {
      transactions: {
        sales: [], // Sales transactions from orders
        expenses: [], // Business expenses
        fees: [], // Platform fees, payment processing fees
        commissions: [], // Commission payments
        refunds: [] // Refunds and returns
      },
      customers: [], // Customer data
      invoices: [], // Invoice data
      accounts: [] // Chart of accounts mapping
    };
  }

  async getExportHistory(sellerId: string, pluginId?: string): Promise<Array<{
    id: string;
    pluginId: string;
    pluginName: string;
    exportType: string;
    status: 'success' | 'failed' | 'partial';
    recordsProcessed: number;
    errors: string[];
    exportedAt: Date;
    metadata?: any;
  }>> {
    // Implementation would query export history from database
    return [];
  }

  async scheduleAutoSync(
    sellerId: string,
    pluginId: string,
    frequency: 'daily' | 'weekly' | 'monthly',
    options: {
      time?: string; // HH:MM format
      dayOfWeek?: number; // 0-6 for weekly
      dayOfMonth?: number; // 1-31 for monthly
    }
  ): Promise<string> {
    // Implementation would create scheduled jobs
    return 'schedule-id';
  }

  getPlugin(pluginId: string): AccountingPlugin | undefined {
    return this.plugins.get(pluginId);
  }
}

export const accountingManager = new AccountingIntegrationManager();

export * from './types';
export * from './plugins/quickbooks';
export * from './plugins/xero';
export * from './plugins/netsuite';
export * from './plugins/sage-intacct';
export * from './plugins/freshbooks';
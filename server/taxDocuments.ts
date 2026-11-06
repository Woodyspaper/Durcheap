import PDFDocument from 'pdfkit';
import fs from 'fs-extra';
import path from 'path';
import { db } from './db';
import { taxDocuments, taxTransactions, orders, orderItems, users } from '@shared/schema';
import { eq, and, gte, lte, sum, count } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Ensure tax documents directory exists
const TAX_DOCS_DIR = path.join(process.cwd(), 'tax-documents');
fs.ensureDirSync(TAX_DOCS_DIR);

export interface TaxSummary {
  totalSales: number;
  totalTax: number;
  transactionCount: number;
  quarterlyBreakdown: {
    Q1: { sales: number; tax: number; transactions: number };
    Q2: { sales: number; tax: number; transactions: number };
    Q3: { sales: number; tax: number; transactions: number };
    Q4: { sales: number; tax: number; transactions: number };
  };
}

export interface Transaction {
  orderId: string;
  date: Date;
  buyerState: string;
  saleAmount: number;
  taxAmount: number;
  taxRate: number;
}

export class TaxDocumentGenerator {
  
  // Generate 1099-K form for sellers
  async generate1099K(sellerId: string, taxYear: number): Promise<string> {
    const summary = await this.getTaxSummary(sellerId, taxYear);
    const seller = await db.select().from(users).where(eq(users.id, sellerId)).limit(1);
    
    if (!seller[0]) {
      throw new Error('Seller not found');
    }

    const doc = new PDFDocument({ margin: 50 });
    const fileName = `1099-K_${sellerId}_${taxYear}.pdf`;
    const filePath = path.join(TAX_DOCS_DIR, fileName);
    
    doc.pipe(fs.createWriteStream(filePath));

    // Header
    doc.fontSize(16).text('Form 1099-K', 50, 50);
    doc.fontSize(12).text(`Payment Card and Third Party Network Transactions`, 50, 70);
    doc.text(`Tax Year: ${taxYear}`, 50, 90);

    // Payer Information (Marketplace)
    doc.text('PAYER\'S Information:', 50, 130);
    doc.text('Durcheap Marketplace', 50, 150);
    doc.text('123 Commerce Street', 50, 170);
    doc.text('San Francisco, CA 94102', 50, 190);
    doc.text('EIN: 12-3456789', 50, 210);

    // Payee Information (Seller)
    doc.text('PAYEE\'S Information:', 300, 130);
    doc.text(`${seller[0].firstName} ${seller[0].lastName}`, 300, 150);
    doc.text(`${seller[0].businessName || 'Individual Seller'}`, 300, 170);
    doc.text(`Email: ${seller[0].email}`, 300, 190);
    doc.text(`Tax ID: ${seller[0].taxId || 'Not Provided'}`, 300, 210);

    // Payment Information
    doc.text('Payment Information:', 50, 260);
    doc.text(`1a. Gross amount of payment card/third party network transactions: $${summary.totalSales.toFixed(2)}`, 50, 280);
    doc.text(`1b. Card not present transactions: $${summary.totalSales.toFixed(2)}`, 50, 300);
    doc.text(`2. Merchant category code: 5999`, 50, 320);
    doc.text(`3. Number of payment transactions: ${summary.transactionCount}`, 50, 340);
    doc.text(`4. Federal income tax withheld: $0.00`, 50, 360);

    // Quarterly Breakdown
    doc.text('Quarterly Breakdown:', 50, 400);
    let yPos = 420;
    Object.entries(summary.quarterlyBreakdown).forEach(([quarter, data]) => {
      doc.text(`${quarter}: Sales: $${data.sales.toFixed(2)}, Transactions: ${data.transactions}`, 50, yPos);
      yPos += 20;
    });

    // Important Notes
    doc.text('Important Information:', 50, 520);
    doc.fontSize(10).text('• This form is provided for informational purposes only', 50, 540);
    doc.text('• You may be required to report this income on your tax return', 50, 555);
    doc.text('• Consult your tax advisor for specific guidance', 50, 570);
    doc.text('• Keep this form with your tax records', 50, 585);

    doc.end();

    // Save to database
    await this.saveTaxDocument(sellerId, '1099-K', taxYear, 'annual', fileName, summary);

    return filePath;
  }

  // Generate sales tax report for a specific period
  async generateSalesTaxReport(sellerId: string, taxYear: number, taxPeriod: string): Promise<string> {
    const startDate = this.getStartDate(taxYear, taxPeriod);
    const endDate = this.getEndDate(taxYear, taxPeriod);
    
    const transactions = await this.getTransactionsForPeriod(sellerId, startDate, endDate);
    const seller = await db.select().from(users).where(eq(users.id, sellerId)).limit(1);
    
    if (!seller[0]) {
      throw new Error('Seller not found');
    }

    const doc = new PDFDocument({ margin: 50 });
    const fileName = `sales_tax_report_${sellerId}_${taxYear}_${taxPeriod}.pdf`;
    const filePath = path.join(TAX_DOCS_DIR, fileName);
    
    doc.pipe(fs.createWriteStream(filePath));

    // Header
    doc.fontSize(16).text('Sales Tax Report', 50, 50);
    doc.fontSize(12).text(`${seller[0].businessName || `${seller[0].firstName} ${seller[0].lastName}`}`, 50, 70);
    doc.text(`Period: ${taxPeriod} ${taxYear}`, 50, 90);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 50, 110);

    // Summary
    const totalSales = transactions.reduce((sum, t) => sum + t.saleAmount, 0);
    const totalTax = transactions.reduce((sum, t) => sum + t.taxAmount, 0);
    
    doc.text('Summary:', 50, 150);
    doc.text(`Total Taxable Sales: $${totalSales.toFixed(2)}`, 50, 170);
    doc.text(`Total Tax Collected: $${totalTax.toFixed(2)}`, 50, 190);
    doc.text(`Number of Transactions: ${transactions.length}`, 50, 210);

    // By State Breakdown
    const stateBreakdown = this.groupTransactionsByState(transactions);
    doc.text('Tax Collection by State:', 50, 250);
    
    let yPos = 270;
    Object.entries(stateBreakdown).forEach(([state, data]) => {
      doc.text(`${state}: Sales: $${data.sales.toFixed(2)}, Tax: $${data.tax.toFixed(2)}`, 50, yPos);
      yPos += 20;
    });

    // Transaction Details
    doc.text('Transaction Details:', 50, yPos + 30);
    yPos += 50;
    
    // Table headers
    doc.text('Date', 50, yPos);
    doc.text('Order ID', 120, yPos);
    doc.text('State', 200, yPos);
    doc.text('Sales Amount', 250, yPos);
    doc.text('Tax Rate', 330, yPos);
    doc.text('Tax Amount', 400, yPos);
    yPos += 20;

    // Draw line
    doc.moveTo(50, yPos).lineTo(500, yPos).stroke();
    yPos += 10;

    // Transaction rows
    transactions.slice(0, 50).forEach(transaction => { // Limit to first 50 for space
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }
      
      doc.fontSize(9);
      doc.text(transaction.date.toLocaleDateString(), 50, yPos);
      doc.text(transaction.orderId.substring(0, 12), 120, yPos);
      doc.text(transaction.buyerState, 200, yPos);
      doc.text(`$${transaction.saleAmount.toFixed(2)}`, 250, yPos);
      doc.text(`${(transaction.taxRate * 100).toFixed(2)}%`, 330, yPos);
      doc.text(`$${transaction.taxAmount.toFixed(2)}`, 400, yPos);
      yPos += 15;
    });

    if (transactions.length > 50) {
      doc.text(`... and ${transactions.length - 50} more transactions`, 50, yPos + 20);
    }

    doc.end();

    // Save to database
    const summary = { totalSales, totalTax, transactionCount: transactions.length };
    await this.saveTaxDocument(sellerId, 'sales_tax_report', taxYear, taxPeriod, fileName, summary);

    return filePath;
  }

  // Generate quarterly sales tax report specifically
  async generateQuarterlySalesReport(sellerId: string, taxYear: number, quarter: number): Promise<string> {
    const taxPeriod = `Q${quarter}`;
    const startDate = new Date(taxYear, (quarter - 1) * 3, 1);
    const endDate = new Date(taxYear, quarter * 3, 0);
    
    const transactions = await this.getTransactionsForPeriod(sellerId, startDate, endDate);
    const seller = await db.select().from(users).where(eq(users.id, sellerId)).limit(1);
    
    if (!seller[0]) {
      throw new Error('Seller not found');
    }

    const doc = new PDFDocument({ margin: 50 });
    const fileName = `quarterly_sales_report_${sellerId}_${taxYear}_Q${quarter}.pdf`;
    const filePath = path.join(TAX_DOCS_DIR, fileName);
    
    doc.pipe(fs.createWriteStream(filePath));

    // Header
    doc.fontSize(16).text(`Q${quarter} ${taxYear} Sales Tax Report`, 50, 50);
    doc.fontSize(12).text(`${seller[0].businessName || `${seller[0].firstName} ${seller[0].lastName}`}`, 50, 70);
    doc.text(`Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, 50, 90);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 50, 110);

    // Summary
    const totalSales = transactions.reduce((sum, t) => sum + t.saleAmount, 0);
    const totalTax = transactions.reduce((sum, t) => sum + t.taxAmount, 0);
    
    doc.text('Quarterly Summary:', 50, 150);
    doc.text(`Total Taxable Sales: $${totalSales.toFixed(2)}`, 50, 170);
    doc.text(`Total Tax Collected: $${totalTax.toFixed(2)}`, 50, 190);
    doc.text(`Number of Transactions: ${transactions.length}`, 50, 210);
    doc.text(`Average Transaction: $${transactions.length > 0 ? (totalSales / transactions.length).toFixed(2) : '0.00'}`, 50, 230);

    // By State Breakdown
    const stateBreakdown = this.groupTransactionsByState(transactions);
    doc.text('Tax Collection by State:', 50, 270);
    
    let yPos = 290;
    Object.entries(stateBreakdown).forEach(([state, data]) => {
      doc.text(`${state}: Sales: $${data.sales.toFixed(2)}, Tax: $${data.tax.toFixed(2)} (${(data.taxRate * 100).toFixed(2)}%)`, 50, yPos);
      yPos += 20;
    });

    // Transaction Table
    doc.text('Transaction Details:', 50, yPos + 30);
    yPos += 50;
    
    // Table headers
    doc.fontSize(10);
    doc.text('Date', 50, yPos);
    doc.text('Order ID', 120, yPos);
    doc.text('State', 200, yPos);
    doc.text('Sales Amount', 250, yPos);
    doc.text('Tax Rate', 330, yPos);
    doc.text('Tax Amount', 400, yPos);
    yPos += 20;

    // Draw line
    doc.moveTo(50, yPos).lineTo(500, yPos).stroke();
    yPos += 10;

    // Transaction rows
    transactions.forEach(transaction => {
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }
      
      doc.fontSize(9);
      doc.text(transaction.date.toLocaleDateString(), 50, yPos);
      doc.text(transaction.orderId.substring(0, 12), 120, yPos);
      doc.text(transaction.buyerState, 200, yPos);
      doc.text(`$${transaction.saleAmount.toFixed(2)}`, 250, yPos);
      doc.text(`${(transaction.taxRate * 100).toFixed(2)}%`, 330, yPos);
      doc.text(`$${transaction.taxAmount.toFixed(2)}`, 400, yPos);
      yPos += 15;
    });

    // Footer with compliance note
    if (yPos > 650) {
      doc.addPage();
      yPos = 50;
    }
    
    doc.fontSize(8);
    doc.text('Note: This report is generated automatically based on your marketplace transactions.', 50, yPos + 40);
    doc.text('Please consult with a tax professional for specific compliance requirements.', 50, yPos + 55);

    doc.end();

    // Save to database
    const summary = { totalSales, totalTax, transactionCount: transactions.length };
    await this.saveTaxDocument(sellerId, 'quarterly_sales_report', taxYear, taxPeriod, fileName, summary);

    return filePath;
  }

  // Generate quarterly summary report
  async generateQuarterlySummary(sellerId: string, taxYear: number, quarter: number): Promise<string> {
    const taxPeriod = `Q${quarter}`;
    const startDate = new Date(taxYear, (quarter - 1) * 3, 1);
    const endDate = new Date(taxYear, quarter * 3, 0);
    
    const transactions = await this.getTransactionsForPeriod(sellerId, startDate, endDate);
    const seller = await db.select().from(users).where(eq(users.id, sellerId)).limit(1);
    
    if (!seller[0]) {
      throw new Error('Seller not found');
    }

    const doc = new PDFDocument({ margin: 50 });
    const fileName = `quarterly_summary_${sellerId}_${taxYear}_Q${quarter}.pdf`;
    const filePath = path.join(TAX_DOCS_DIR, fileName);
    
    doc.pipe(fs.createWriteStream(filePath));

    // Header
    doc.fontSize(16).text(`Q${quarter} ${taxYear} Tax Summary`, 50, 50);
    doc.fontSize(12).text(`${seller[0].businessName || `${seller[0].firstName} ${seller[0].lastName}`}`, 50, 70);
    doc.text(`Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, 50, 90);

    // Key Metrics
    const totalSales = transactions.reduce((sum, t) => sum + t.saleAmount, 0);
    const totalTax = transactions.reduce((sum, t) => sum + t.taxAmount, 0);
    
    doc.text('Key Metrics:', 50, 130);
    doc.text(`Gross Sales: $${totalSales.toFixed(2)}`, 70, 150);
    doc.text(`Tax Collected: $${totalTax.toFixed(2)}`, 70, 170);
    doc.text(`Net Sales: $${(totalSales - totalTax).toFixed(2)}`, 70, 190);
    doc.text(`Transaction Count: ${transactions.length}`, 70, 210);
    doc.text(`Average Order Value: $${transactions.length > 0 ? (totalSales / transactions.length).toFixed(2) : '0.00'}`, 70, 230);

    // Monthly Breakdown
    const monthlyData = this.groupTransactionsByMonth(transactions);
    doc.text('Monthly Breakdown:', 50, 270);
    
    let yPos = 290;
    Object.entries(monthlyData).forEach(([month, data]) => {
      doc.text(`${month}: $${data.sales.toFixed(2)} sales, $${data.tax.toFixed(2)} tax`, 70, yPos);
      yPos += 20;
    });

    // State Tax Summary
    const stateBreakdown = this.groupTransactionsByState(transactions);
    doc.text('State Tax Summary:', 50, yPos + 20);
    yPos += 40;
    
    Object.entries(stateBreakdown).forEach(([state, data]) => {
      doc.text(`${state}: $${data.sales.toFixed(2)} taxable sales, $${data.tax.toFixed(2)} tax collected`, 70, yPos);
      yPos += 20;
    });

    // Important Reminders
    doc.text('Tax Filing Reminders:', 50, yPos + 30);
    yPos += 50;
    doc.fontSize(10);
    doc.text('• Quarterly tax payments may be due by the 15th of the month following the quarter end', 70, yPos);
    doc.text('• Keep detailed records of all transactions and tax collected', 70, yPos + 15);
    doc.text('• Consult your tax advisor for specific filing requirements in your state', 70, yPos + 30);
    doc.text('• Consider estimated tax payments to avoid penalties', 70, yPos + 45);

    doc.end();

    // Save to database
    const summary = { totalSales, totalTax, transactionCount: transactions.length };
    await this.saveTaxDocument(sellerId, 'quarterly_summary', taxYear, taxPeriod, fileName, summary);

    return filePath;
  }

  private async getTaxSummary(sellerId: string, taxYear: number): Promise<TaxSummary> {
    // Get all transactions for the year
    const transactions = await db.select().from(taxTransactions)
      .where(and(
        eq(taxTransactions.sellerId, sellerId),
        eq(taxTransactions.taxYear, taxYear)
      ));

    const totalSales = transactions.reduce((sum, t) => sum + parseFloat(t.saleAmount), 0);
    const totalTax = transactions.reduce((sum, t) => sum + parseFloat(t.taxAmount), 0);
    const transactionCount = transactions.length;

    // Group by quarters
    const quarterlyBreakdown = {
      Q1: { sales: 0, tax: 0, transactions: 0 },
      Q2: { sales: 0, tax: 0, transactions: 0 },
      Q3: { sales: 0, tax: 0, transactions: 0 },
      Q4: { sales: 0, tax: 0, transactions: 0 },
    };

    transactions.forEach(t => {
      const quarter = `Q${t.taxQuarter}` as keyof typeof quarterlyBreakdown;
      quarterlyBreakdown[quarter].sales += parseFloat(t.saleAmount);
      quarterlyBreakdown[quarter].tax += parseFloat(t.taxAmount);
      quarterlyBreakdown[quarter].transactions += 1;
    });

    return {
      totalSales,
      totalTax,
      transactionCount,
      quarterlyBreakdown
    };
  }

  private async getTransactionsForPeriod(sellerId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    const transactions = await db.select().from(taxTransactions)
      .where(and(
        eq(taxTransactions.sellerId, sellerId),
        gte(taxTransactions.transactionDate, startDate),
        lte(taxTransactions.transactionDate, endDate)
      ));

    return transactions.map(t => ({
      orderId: t.orderId,
      date: t.transactionDate,
      buyerState: t.buyerState,
      saleAmount: parseFloat(t.saleAmount),
      taxAmount: parseFloat(t.taxAmount),
      taxRate: parseFloat(t.taxRate)
    }));
  }

  private groupTransactionsByState(transactions: Transaction[]) {
    return transactions.reduce((acc, t) => {
      if (!acc[t.buyerState]) {
        acc[t.buyerState] = { sales: 0, tax: 0, transactions: 0 };
      }
      acc[t.buyerState].sales += t.saleAmount;
      acc[t.buyerState].tax += t.taxAmount;
      acc[t.buyerState].transactions += 1;
      return acc;
    }, {} as Record<string, { sales: number; tax: number; transactions: number }>);
  }

  private groupTransactionsByMonth(transactions: Transaction[]) {
    return transactions.reduce((acc, t) => {
      const month = t.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = { sales: 0, tax: 0, transactions: 0 };
      }
      acc[month].sales += t.saleAmount;
      acc[month].tax += t.taxAmount;
      acc[month].transactions += 1;
      return acc;
    }, {} as Record<string, { sales: number; tax: number; transactions: number }>);
  }

  private getStartDate(taxYear: number, taxPeriod: string): Date {
    if (taxPeriod === 'annual') return new Date(taxYear, 0, 1);
    if (taxPeriod === 'Q1') return new Date(taxYear, 0, 1);
    if (taxPeriod === 'Q2') return new Date(taxYear, 3, 1);
    if (taxPeriod === 'Q3') return new Date(taxYear, 6, 1);
    if (taxPeriod === 'Q4') return new Date(taxYear, 9, 1);
    throw new Error('Invalid tax period');
  }

  private getEndDate(taxYear: number, taxPeriod: string): Date {
    if (taxPeriod === 'annual') return new Date(taxYear + 1, 0, 0);
    if (taxPeriod === 'Q1') return new Date(taxYear, 3, 0);
    if (taxPeriod === 'Q2') return new Date(taxYear, 6, 0);
    if (taxPeriod === 'Q3') return new Date(taxYear, 9, 0);
    if (taxPeriod === 'Q4') return new Date(taxYear + 1, 0, 0);
    throw new Error('Invalid tax period');
  }

  private async saveTaxDocument(
    sellerId: string, 
    documentType: string, 
    taxYear: number, 
    taxPeriod: string, 
    fileName: string,
    summary: { totalSales: number; totalTax: number; transactionCount: number }
  ) {
    const document = {
      id: nanoid(),
      sellerId,
      documentType,
      taxYear,
      taxPeriod,
      filePath: fileName,
      status: 'generated',
      totalSales: summary.totalSales.toFixed(2),
      totalTax: summary.totalTax.toFixed(2),
      transactionCount: summary.transactionCount,
      generatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(taxDocuments).values(document);
  }
}

export const taxDocumentGenerator = new TaxDocumentGenerator();
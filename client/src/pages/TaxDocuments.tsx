import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { useLocation, Link } from "wouter";
import { Download, FileText, TrendingUp, DollarSign, Calendar, Receipt, Star } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Layout } from "@/components/Layout";

interface TaxDocument {
  id: string;
  documentType: string;
  taxYear: number;
  taxPeriod: string;
  filePath: string;
  status: string;
  totalSales: string;
  totalTax: string;
  transactionCount: number;
  generatedAt: string;
}

interface TaxTransaction {
  id: string;
  orderId: string;
  saleAmount: string;
  taxAmount: string;
  taxRate: string;
  buyerState: string;
  buyerCity: string;
  transactionDate: string;
}

export default function TaxDocuments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPeriod, setSelectedPeriod] = useState("Q1");
  const { addToCart } = useCart();
  const [, setLocation] = useLocation();

  const handleUpgrade = async () => {
    try {
      await addToCart("tax_automation_service", 1);
      toast({
        title: "Added to Cart",
        description: "Tax Automation Service added to your cart successfully!",
      });
      setLocation('/cart');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add service to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fetch tax documents
  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: [`/api/tax/documents/${user?.id}`],
    enabled: !!user?.id,
  });

  // Fetch tax transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: [`/api/tax/transactions/${user?.id}`, { taxYear: selectedYear, limit: 50 }],
    enabled: !!user?.id,
  });

  // Generate 1099-K mutation
  const generate1099K = useMutation({
    mutationFn: async (taxYear: number) => {
      const response = await apiRequest("POST", `/api/tax/generate-1099k/${user?.id}`, { taxYear });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "1099-K Generated",
        description: "Your 1099-K form has been generated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/tax/documents/${user?.id}`] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/auth";
        }, 500);
        return;
      }
      toast({
        title: "Generation Failed",
        description: "Failed to generate 1099-K form. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Generate sales tax report mutation
  const generateSalesTaxReport = useMutation({
    mutationFn: async ({ taxYear, taxPeriod }: { taxYear: number; taxPeriod: string }) => {
      const response = await apiRequest("POST", `/api/tax/generate-sales-tax-report/${user?.id}`, {
        taxYear,
        taxPeriod,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sales Tax Report Generated",
        description: "Your sales tax report has been generated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/tax/documents/${user?.id}`] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/auth";
        }, 500);
        return;
      }
      toast({
        title: "Generation Failed",
        description: "Failed to generate sales tax report. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Generate quarterly sales report mutation
  const generateQuarterly = useMutation({
    mutationFn: async ({ taxYear, quarter }: { taxYear: number; quarter: number }) => {
      const response = await apiRequest("POST", `/api/tax/generate-quarterly/${user?.id}`, { taxYear, quarter });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Quarterly Report Generated",
        description: "Your quarterly sales report has been generated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/tax/documents/${user?.id}`] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/auth";
        }, 500);
        return;
      }
      toast({
        title: "Generation Failed",
        description: "Failed to generate quarterly sales report. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Generate all documents mutation
  const generateAllDocuments = useMutation({
    mutationFn: async (taxYear: number) => {
      const response = await apiRequest("POST", `/api/tax/generate-all/${user?.id}`, { taxYear });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "All Documents Generated",
        description: `Generated ${data.documents?.length || 0} tax documents for ${data.taxYear}.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/tax/documents/${user?.id}`] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/auth";
        }, 500);
        return;
      }
      toast({
        title: "Generation Failed",
        description: "Failed to generate tax documents. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Get tax summary query
  const { data: taxSummary } = useQuery({
    queryKey: [`/api/tax/summary/${user?.id}`, { taxYear: selectedYear }],
    enabled: !!user?.id,
  });

  const downloadDocument = async (documentId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/tax/download/${documentId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Download Started",
          description: "Your tax document is being downloaded.",
        });
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download tax document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case '1099-K':
        return '1099-K Form';
      case 'sales_tax_report':
        return 'Sales Tax Report';
      case 'quarterly_summary':
        return 'Quarterly Summary';
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'generated':
        return <Badge variant="default">Generated</Badge>;
      case 'sent':
        return <Badge variant="secondary">Sent</Badge>;
      case 'filed':
        return <Badge variant="outline">Filed</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  // Calculate summary stats from transactions
  const totalSales = transactions?.reduce((sum: number, t: TaxTransaction) => sum + parseFloat(t.saleAmount), 0) || 0;
  const totalTax = transactions?.reduce((sum: number, t: TaxTransaction) => sum + parseFloat(t.taxAmount), 0) || 0;
  const transactionCount = transactions?.length || 0;

  if (!user || user.role !== 'seller') {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p>Tax documents are only available to sellers.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tax Documents</h1>
          <p className="text-muted-foreground">Manage your tax documents and compliance</p>
        </div>
      </div>

      {/* Premium Tax Automation Upgrade */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-amazon-orange">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Star className="h-8 w-8 text-amazon-orange" />
              <div>
                <h3 className="text-xl font-bold text-amazon-dark">Tax Automation Service</h3>
                <p className="text-gray-600">Automate calculations, generate documents, and streamline compliance</p>
                <Badge className="mt-2 bg-amazon-orange text-white">$7.99/month</Badge>
              </div>
            </div>
            <Button 
              onClick={handleUpgrade}
              className="bg-amazon-orange hover:bg-orange-600 text-white"
            >
              Upgrade Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sales ({selectedYear})</p>
                <p className="text-2xl font-bold">${totalSales.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Receipt className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tax Collected</p>
                <p className="text-2xl font-bold">${totalTax.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">{transactionCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Documents</p>
                <p className="text-2xl font-bold">{documents?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Generate Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Tax Documents</CardTitle>
            <CardDescription>
              Create and download your tax compliance documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 1099-K Generation */}
            <div className="space-y-2">
              <h4 className="font-medium">1099-K Form</h4>
              <p className="text-sm text-muted-foreground">
                Annual form for payment card and third-party network transactions
              </p>
              <div className="flex items-center space-x-2">
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  onClick={() => generate1099K.mutate(selectedYear)}
                  disabled={generate1099K.isPending}
                >
                  {generate1099K.isPending ? "Generating..." : "Generate 1099-K"}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Sales Tax Report */}
            <div className="space-y-2">
              <h4 className="font-medium">Sales Tax Report</h4>
              <p className="text-sm text-muted-foreground">
                Detailed sales tax collection report by period
              </p>
              <div className="flex items-center space-x-2">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Q1">Q1</SelectItem>
                    <SelectItem value="Q2">Q2</SelectItem>
                    <SelectItem value="Q3">Q3</SelectItem>
                    <SelectItem value="Q4">Q4</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => generateSalesTaxReport.mutate({ taxYear: selectedYear, taxPeriod: selectedPeriod })}
                  disabled={generateSalesTaxReport.isPending}
                >
                  {generateSalesTaxReport.isPending ? "Generating..." : "Generate Report"}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Quarterly Summary */}
            <div className="space-y-2">
              <h4 className="font-medium">Quarterly Summary</h4>
              <p className="text-sm text-muted-foreground">
                Comprehensive quarterly tax and sales summary
              </p>
              <div className="flex items-center space-x-2">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Q1">Q1</SelectItem>
                    <SelectItem value="Q2">Q2</SelectItem>
                    <SelectItem value="Q3">Q3</SelectItem>
                    <SelectItem value="Q4">Q4</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => generateQuarterlySummary.mutate({ 
                    taxYear: selectedYear, 
                    quarter: parseInt(selectedPeriod.replace('Q', ''))
                  })}
                  disabled={generateQuarterlySummary.isPending}
                >
                  {generateQuarterlySummary.isPending ? "Generating..." : "Generate Summary"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generated Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Documents</CardTitle>
            <CardDescription>
              Your generated tax documents and reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            {documentsLoading ? (
              <p className="text-center py-4">Loading documents...</p>
            ) : documents && documents.length > 0 ? (
              <div className="space-y-4">
                {documents.map((doc: TaxDocument) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{getDocumentTypeLabel(doc.documentType)}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.taxPeriod} {doc.taxYear} • ${parseFloat(doc.totalSales).toFixed(2)} sales
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Generated {new Date(doc.generatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(doc.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadDocument(doc.id, doc.filePath)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tax documents generated yet</p>
                <p className="text-sm text-muted-foreground">Generate your first document using the form on the left</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Tax Transactions</CardTitle>
          <CardDescription>
            Your recent taxable transactions for {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <p className="text-center py-4">Loading transactions...</p>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-6 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
                <div>Date</div>
                <div>Order ID</div>
                <div>Location</div>
                <div>Sale Amount</div>
                <div>Tax Rate</div>
                <div>Tax Amount</div>
              </div>
              {transactions.slice(0, 10).map((transaction: TaxTransaction) => (
                <div key={transaction.id} className="grid grid-cols-6 gap-4 text-sm py-2">
                  <div>{new Date(transaction.transactionDate).toLocaleDateString()}</div>
                  <div className="font-mono text-xs">{transaction.orderId.substring(0, 12)}...</div>
                  <div>{transaction.buyerCity}, {transaction.buyerState}</div>
                  <div>${parseFloat(transaction.saleAmount).toFixed(2)}</div>
                  <div>{(parseFloat(transaction.taxRate) * 100).toFixed(2)}%</div>
                  <div>${parseFloat(transaction.taxAmount).toFixed(2)}</div>
                </div>
              ))}
              {transactions.length > 10 && (
                <p className="text-sm text-muted-foreground text-center pt-4">
                  ... and {transactions.length - 10} more transactions
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tax transactions found for {selectedYear}</p>
              <p className="text-sm text-muted-foreground">Tax transactions will appear here after you make sales</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* See All Options CTA */}
      <div className="mt-12 text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
        <h3 className="text-2xl font-bold mb-4">Explore All Options</h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          View our complete range of subscription plans, tools, and services to find the perfect combination for your business.
        </p>
        <Link href="/all-options">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            See All Options
          </Button>
        </Link>
      </div>
    </div>
    </Layout>
  );
}
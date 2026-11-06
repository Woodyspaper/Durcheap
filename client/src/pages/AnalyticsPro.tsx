import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Eye, 
  Download, 
  Calendar,
  ArrowUp,
  ArrowDown,
  Filter,
  RefreshCw,
  FileText,
  PieChart,
  LineChart
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalViews: number;
    conversionRate: number;
    revenueChange: number;
    ordersChange: number;
    viewsChange: number;
    conversionChange: number;
  };
  salesData: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    revenue: number;
    views: number;
    orders: number;
    conversionRate: number;
  }>;
  customerInsights: {
    newCustomers: number;
    returningCustomers: number;
    averageOrderValue: number;
    topLocations: Array<{
      location: string;
      orders: number;
      revenue: number;
    }>;
  };
  competitorData: Array<{
    competitor: string;
    marketShare: number;
    priceComparison: number;
    rating: number;
  }>;
  marketTrends: Array<{
    trend: string;
    growth: number;
    category: string;
    impact: "high" | "medium" | "low";
  }>;
}

export default function AnalyticsPro() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState("30d");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isExporting, setIsExporting] = useState(false);

  const { data: analyticsData, isLoading, refetch } = useQuery({
    queryKey: ["/api/analytics/pro", dateRange, selectedCategory],
    enabled: !!user,
  });

  const handleExport = async (format: "csv" | "pdf") => {
    setIsExporting(true);
    try {
      const response = await apiRequest("POST", "/api/analytics/export", {
        format,
        dateRange,
        category: selectedCategory,
      });
      
      const responseBlob = await response.blob();
      const blob = new Blob([responseBlob], { 
        type: format === "pdf" ? "application/pdf" : "text/csv" 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-report-${dateRange}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Complete",
        description: `Analytics report exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export analytics report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Analytics Pro Suite</h1>
            <p className="text-gray-600">Please log in to access advanced analytics.</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Check if user has Analytics Pro subscription
  const hasAnalyticsPro = user?.role === "admin" || false; // Simplified for now

  if (!hasAnalyticsPro) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-2xl mx-auto">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-blue-600" />
            <h1 className="text-3xl font-bold mb-4">Analytics Pro Suite</h1>
            <p className="text-xl text-gray-600 mb-8">
              Unlock advanced analytics, custom reporting, and competitor insights to grow your business.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Advanced Reporting
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-left space-y-2">
                    <li>• Custom date ranges and filters</li>
                    <li>• Revenue and sales forecasting</li>
                    <li>• Product performance analysis</li>
                    <li>• Customer behavior insights</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Competitor Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-left space-y-2">
                    <li>• Market share analysis</li>
                    <li>• Price comparison tools</li>
                    <li>• Trend identification</li>
                    <li>• Export capabilities</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <Button size="lg" onClick={() => window.location.href = "/all-options"}>
              Upgrade to Analytics Pro - $39.99/month
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const data = analyticsData as AnalyticsData;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              Analytics Pro Suite
            </h1>
            <p className="text-gray-600 mt-2">Advanced business intelligence and reporting</p>
          </div>
          
          <div className="flex gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="12m">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleExport("csv")}
              disabled={isExporting}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleExport("pdf")}
              disabled={isExporting}
            >
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="competitors">Competitors</TabsTrigger>
              <TabsTrigger value="trends">Market Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold">${data?.overview?.totalRevenue?.toLocaleString() || "0"}</p>
                        <div className="flex items-center mt-1">
                          {(data?.overview?.revenueChange || 0) > 0 ? (
                            <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-red-600 mr-1" />
                          )}
                          <span className={`text-sm ${(data?.overview?.revenueChange || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {Math.abs(data?.overview?.revenueChange || 0)}%
                          </span>
                        </div>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Orders</p>
                        <p className="text-2xl font-bold">{data?.overview?.totalOrders?.toLocaleString() || "0"}</p>
                        <div className="flex items-center mt-1">
                          {(data?.overview?.ordersChange || 0) > 0 ? (
                            <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-red-600 mr-1" />
                          )}
                          <span className={`text-sm ${(data?.overview?.ordersChange || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {Math.abs(data?.overview?.ordersChange || 0)}%
                          </span>
                        </div>
                      </div>
                      <ShoppingCart className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Views</p>
                        <p className="text-2xl font-bold">{data?.overview?.totalViews?.toLocaleString() || "0"}</p>
                        <div className="flex items-center mt-1">
                          {(data?.overview?.viewsChange || 0) > 0 ? (
                            <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-red-600 mr-1" />
                          )}
                          <span className={`text-sm ${(data?.overview?.viewsChange || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {Math.abs(data?.overview?.viewsChange || 0)}%
                          </span>
                        </div>
                      </div>
                      <Eye className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                        <p className="text-2xl font-bold">{data?.overview?.conversionRate?.toFixed(1) || "0"}%</p>
                        <div className="flex items-center mt-1">
                          {(data?.overview?.conversionChange || 0) > 0 ? (
                            <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-red-600 mr-1" />
                          )}
                          <span className={`text-sm ${(data?.overview?.conversionChange || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {Math.abs(data?.overview?.conversionChange || 0)}%
                          </span>
                        </div>
                      </div>
                      <TrendingUp className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue Chart Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Revenue Trend
                  </CardTitle>
                  <CardDescription>Daily revenue for the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">Revenue chart visualization would appear here</p>
                      <p className="text-sm text-gray-400 mt-1">Integrated with Chart.js or similar library</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Products</CardTitle>
                  <CardDescription>Products ranked by revenue in the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.topProducts?.length ? data.topProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-medium">{product.name}</h3>
                            <p className="text-sm text-gray-600">{product.orders} orders • {product.views} views</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${product.revenue.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{product.conversionRate.toFixed(1)}% conversion</p>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500">No product data available for the selected period</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customers" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>New Customers</span>
                      <span className="font-semibold">{data?.customerInsights?.newCustomers || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Returning Customers</span>
                      <span className="font-semibold">{data?.customerInsights?.returningCustomers || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Order Value</span>
                      <span className="font-semibold">${data?.customerInsights?.averageOrderValue || 0}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Locations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data?.customerInsights?.topLocations?.map((location, index) => (
                        <div key={location.location} className="flex items-center justify-between">
                          <span className="text-sm">{location.location}</span>
                          <div className="text-right">
                            <p className="text-sm font-medium">{location.orders} orders</p>
                            <p className="text-xs text-gray-600">${location.revenue.toLocaleString()}</p>
                          </div>
                        </div>
                      )) || (
                        <p className="text-gray-500 text-center">No location data available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="competitors" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Competitor Analysis</CardTitle>
                  <CardDescription>Market positioning and competitive intelligence</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.competitorData?.length ? data.competitorData.map((competitor) => (
                      <div key={competitor.competitor} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{competitor.competitor}</h3>
                          <p className="text-sm text-gray-600">Market Share: {competitor.marketShare}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">Price: {competitor.priceComparison > 0 ? '+' : ''}{competitor.priceComparison}%</p>
                          <p className="text-sm">Rating: {competitor.rating}/5</p>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500">Competitor analysis data will appear here</p>
                        <p className="text-sm text-gray-400 mt-1">Data collected from public sources and market research</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Market Trends</CardTitle>
                  <CardDescription>Industry trends and growth opportunities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.marketTrends?.length ? data.marketTrends.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{trend.trend}</h3>
                          <p className="text-sm text-gray-600">{trend.category}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={trend.impact === "high" ? "default" : trend.impact === "medium" ? "secondary" : "outline"}>
                            {trend.impact} impact
                          </Badge>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">{trend.growth > 0 ? '+' : ''}{trend.growth}%</p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500">Market trend analysis will appear here</p>
                        <p className="text-sm text-gray-400 mt-1">Based on industry data and consumer behavior patterns</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
}
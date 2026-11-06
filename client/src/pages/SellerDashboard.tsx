import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Plus, 
  Edit, 
  Eye,
  ShoppingCart,
  Star,
  ArrowRight,
  ExternalLink,
  BarChart3,
  Shield
} from "lucide-react";
import { Link } from "wouter";

export default function SellerDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-amazon-dark">Seller Dashboard</h1>
          <Button className="bg-amazon-orange hover:bg-amazon-orange/90" asChild>
            <Link href="/add-product">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2,450</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">+7 from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8</div>
              <p className="text-xs text-muted-foreground">Based on 156 reviews</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Products */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Product List */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded"></div>
                  <div>
                    <h3 className="font-semibold">Wireless Headphones</h3>
                    <p className="text-sm text-gray-600">Electronics • SKU: WH001</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant="outline">Active</Badge>
                  <span className="font-semibold">$89.99</span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded"></div>
                  <div>
                    <h3 className="font-semibold">Smart Watch</h3>
                    <p className="text-sm text-gray-600">Electronics • SKU: SW002</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant="outline">Active</Badge>
                  <span className="font-semibold">$199.99</span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded"></div>
                  <div>
                    <h3 className="font-semibold">Running Shoes</h3>
                    <p className="text-sm text-gray-600">Fashion • SKU: RS003</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary">Draft</Badge>
                  <span className="font-semibold">$129.99</span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-amazon-orange" />
                Product Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Add new products, update inventory, and manage your catalog
              </p>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/manage-products">
                  Manage Products
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2 text-amazon-orange" />
                Order Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                View and process customer orders, handle shipping
              </p>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/orders">
                  View Orders
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-amazon-orange" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Track sales performance and customer insights
              </p>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/revenue">
                  View Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-amazon-orange" />
                Analytics Pro Suite
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Advanced analytics with competitor insights and market trends
              </p>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/analytics-pro">
                  Access Pro Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-amazon-orange" />
                Business Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Get official verification with trust badges and compliance tools
              </p>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/business-verification">
                  Get Verified
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Guide */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Getting Started as a Seller</CardTitle>
            <p className="text-sm text-gray-600">Follow these steps to set up your seller account and start selling</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start space-x-3 group">
                <div className="w-6 h-6 bg-amazon-orange text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Complete your seller profile</h4>
                      <p className="text-sm text-gray-600 mb-2">Add business information, tax details, and payment preferences</p>
                    </div>
                    <Button size="sm" className="bg-amazon-orange hover:bg-orange-600" asChild>
                      <Link href="/account">
                        Complete Profile
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 group">
                <div className="w-6 h-6 bg-amazon-orange text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Add your first product</h4>
                      <p className="text-sm text-gray-600 mb-2">Create detailed product listings with high-quality images</p>
                    </div>
                    <Button size="sm" className="bg-amazon-orange hover:bg-orange-600" asChild>
                      <Link href="/add-product">
                        Add Product
                        <Plus className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 group">
                <div className="w-6 h-6 bg-amazon-orange text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Set up shipping and fulfillment</h4>
                      <p className="text-sm text-gray-600 mb-2">Configure shipping options and fulfillment preferences</p>
                    </div>
                    <Button size="sm" className="bg-amazon-orange hover:bg-orange-600" asChild>
                      <Link href="/shipping">
                        Configure Shipping
                        <Package className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 group">
                <div className="w-6 h-6 bg-amazon-orange text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Choose your seller plan</h4>
                      <p className="text-sm text-gray-600 mb-2">Upgrade to Pro or Enterprise for better commission rates</p>
                    </div>
                    <Button size="sm" className="bg-amazon-orange hover:bg-orange-600" asChild>
                      <Link href="/subscription">
                        View Plans
                        <TrendingUp className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 group">
                <div className="w-6 h-6 bg-amazon-orange text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Set up tax documents</h4>
                      <p className="text-sm text-gray-600 mb-2">Configure tax settings and download required forms</p>
                    </div>
                    <Button size="sm" className="bg-amazon-orange hover:bg-orange-600" asChild>
                      <Link href="/tax-documents">
                        Tax Setup
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 group">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">+</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Get business verification</h4>
                      <p className="text-sm text-gray-600 mb-2">Earn trust badges and enhance credibility with official verification</p>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/business-verification">
                        Get Verified
                        <Shield className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 group">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">★</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Access advanced analytics</h4>
                      <p className="text-sm text-gray-600 mb-2">Track competitors, analyze market trends, and optimize performance</p>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/analytics-pro">
                        Pro Analytics
                        <BarChart3 className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-2">Need Help?</h5>
              <p className="text-sm text-blue-700 mb-3">
                Get started with our comprehensive seller resources and support
              </p>
              <div className="flex space-x-3">
                <Button size="sm" variant="outline" asChild>
                  <Link href="/help">
                    Help Center
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/seller" className="text-blue-600">
                    Seller Guide
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
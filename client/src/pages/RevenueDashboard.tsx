import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, Users, ShoppingCart, CreditCard, Target } from 'lucide-react';
import { Layout } from '@/components/Layout';

interface RevenueData {
  totalGMV: string;
  totalCommission: string;
  totalTransactions: number;
  averageOrderValue: string;
  commissionRate: string;
  monthlyGrowth: string;
}

export default function RevenueDashboard() {
  const { data: revenueData, isLoading } = useQuery<RevenueData>({
    queryKey: ['/api/revenue/dashboard'],
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const revenueMetrics = [
    {
      title: 'Total GMV',
      value: `$${revenueData?.totalGMV || '0'}`,
      description: 'Gross Merchandise Volume',
      icon: DollarSign,
      trend: '+15.2%',
      color: 'text-green-600'
    },
    {
      title: 'Commission Revenue',
      value: `$${revenueData?.totalCommission || '0'}`,
      description: 'Platform earnings',
      icon: TrendingUp,
      trend: '+12.5%',
      color: 'text-blue-600'
    },
    {
      title: 'Total Transactions',
      value: revenueData?.totalTransactions?.toLocaleString() || '0',
      description: 'Completed orders',
      icon: ShoppingCart,
      trend: '+8.3%',
      color: 'text-purple-600'
    },
    {
      title: 'Average Order Value',
      value: `$${revenueData?.averageOrderValue || '0'}`,
      description: 'Per transaction',
      icon: CreditCard,
      trend: '+5.1%',
      color: 'text-orange-600'
    },
    {
      title: 'Commission Rate',
      value: revenueData?.commissionRate || '8%',
      description: 'Average marketplace fee',
      icon: Target,
      trend: 'Stable',
      color: 'text-gray-600'
    },
    {
      title: 'Monthly Growth',
      value: revenueData?.monthlyGrowth || '12.5%',
      description: 'Revenue increase',
      icon: TrendingUp,
      trend: '+2.1%',
      color: 'text-green-600'
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Revenue Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Monitor marketplace performance and monetization metrics
          </p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-600">
          Live Data
        </Badge>
      </div>

      {/* Revenue Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {revenueMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.description}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-xs text-green-600 font-medium">
                  {metric.trend}
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  vs last month
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Streams Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Streams</CardTitle>
            <CardDescription>
              Breakdown of platform monetization sources
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Commission on Sales</span>
                <div className="text-right">
                  <div className="font-semibold">$24,580</div>
                  <div className="text-xs text-muted-foreground">68% of revenue</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Seller Subscriptions</span>
                <div className="text-right">
                  <div className="font-semibold">$8,900</div>
                  <div className="text-xs text-muted-foreground">25% of revenue</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Payment Processing</span>
                <div className="text-right">
                  <div className="font-semibold">$2,520</div>
                  <div className="text-xs text-muted-foreground">7% of revenue</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commission by Category</CardTitle>
            <CardDescription>
              Commission rates and performance by product category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Electronics (8%)</span>
                <div className="text-right">
                  <div className="font-semibold">$9,840</div>
                  <div className="text-xs text-muted-foreground">1,230 orders</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Fashion (12%)</span>
                <div className="text-right">
                  <div className="font-semibold">$7,320</div>
                  <div className="text-xs text-muted-foreground">610 orders</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Books (15%)</span>
                <div className="text-right">
                  <div className="font-semibold">$4,950</div>
                  <div className="text-xs text-muted-foreground">330 orders</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Home & Garden (10%)</span>
                <div className="text-right">
                  <div className="font-semibold">$2,470</div>
                  <div className="text-xs text-muted-foreground">247 orders</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Sports & Outdoors (10%)</span>
                <div className="text-right">
                  <div className="font-semibold">$1,890</div>
                  <div className="text-xs text-muted-foreground">189 orders</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Pro Tools & Supplies (10%)</span>
                <div className="text-right">
                  <div className="font-semibold">$2,750</div>
                  <div className="text-xs text-muted-foreground">275 orders</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Contractor Services (5%)</span>
                <div className="text-right">
                  <div className="font-semibold">$1,425</div>
                  <div className="text-xs text-muted-foreground">285 orders</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Performance Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Key Performance Indicators</CardTitle>
          <CardDescription>
            Essential metrics for marketplace health and growth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">87%</div>
              <div className="text-sm text-muted-foreground">Take Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">$47.20</div>
              <div className="text-sm text-muted-foreground">ARPU</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">$240</div>
              <div className="text-sm text-muted-foreground">Customer LTV</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">94%</div>
              <div className="text-sm text-muted-foreground">Seller Retention</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Plans Performance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Seller Subscriptions</CardTitle>
            <CardDescription>
              Performance of seller subscription plans
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">2,340</div>
              <div className="text-sm text-muted-foreground mb-2">Basic Plan</div>
              <Badge variant="secondary">Free</Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">187</div>
              <div className="text-sm text-muted-foreground mb-2">Pro Plan</div>
              <Badge variant="default">$29/month</Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">23</div>
              <div className="text-sm text-muted-foreground mb-2">Enterprise</div>
              <Badge variant="secondary">$99/month</Badge>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-sm text-muted-foreground">
              Monthly Recurring Revenue: <span className="font-semibold">$8,710</span>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </Layout>
  );
}
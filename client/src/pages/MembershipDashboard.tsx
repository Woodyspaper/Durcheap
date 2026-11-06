import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Calendar, CreditCard, Gift, Shield, Star, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Layout } from "@/components/Layout";

interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  billingInterval: string;
  features: string[];
  isActive: boolean;
}

interface CurrentMembership {
  id: string;
  planId: string;
  status: string;
  startDate: string;
  endDate?: string;
  nextBillingDate: string;
  paymentMethodId: string;
  plan?: MembershipPlan;
}

interface MembershipBenefit {
  id: string;
  benefitType: string;
  description: string;
  limit: number;
  usedCount: number;
  resetPeriod: string;
  lastUsedAt?: string;
}

interface MembershipTransaction {
  id: string;
  transactionType: string;
  amount?: string;
  description: string;
  createdAt: string;
}

export default function MembershipDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get available membership plans
  const { data: plans = [], isLoading: plansLoading } = useQuery<MembershipPlan[]>({
    queryKey: ["/api/memberships/plans"],
    enabled: isAuthenticated,
  });

  // Get current membership
  const { data: currentMembership, isLoading: membershipLoading } = useQuery<CurrentMembership | null>({
    queryKey: ["/api/memberships/current"],
    enabled: isAuthenticated,
  });

  // Get membership benefits if user has active membership
  const { data: benefits = [], isLoading: benefitsLoading } = useQuery<MembershipBenefit[]>({
    queryKey: ["/api/memberships", currentMembership?.id, "benefits"],
    enabled: isAuthenticated && !!currentMembership?.id,
  });

  // Get membership transactions if user has active membership
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<MembershipTransaction[]>({
    queryKey: ["/api/memberships", currentMembership?.id, "transactions"],
    enabled: isAuthenticated && !!currentMembership?.id,
  });

  // Subscribe to membership mutation
  const subscribeMutation = useMutation({
    mutationFn: async (data: { planId: string; paymentMethod: string }) => {
      return apiRequest("POST", "/api/memberships/subscribe", data);
    },
    onSuccess: () => {
      toast({
        title: "Subscription Successful!",
        description: "Welcome to Durcheap Ultimate Rewards Membership!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/memberships/current"] });
    },
    onError: (error: any) => {
      toast({
        title: "Subscription Failed",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
    },
  });

  // Cancel membership mutation
  const cancelMutation = useMutation({
    mutationFn: async (membershipId: string) => {
      return apiRequest("PATCH", `/api/memberships/${membershipId}/cancel`, {});
    },
    onSuccess: () => {
      toast({
        title: "Membership Cancelled",
        description: "Your membership has been cancelled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/memberships/current"] });
    },
    onError: (error: any) => {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel membership",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
                <p className="text-muted-foreground mb-4">
                  Please sign in to access your membership dashboard.
                </p>
                <Button onClick={() => window.location.href = "/auth"}>
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const isLoading = plansLoading || membershipLoading;

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Membership Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your Durcheap Ultimate Rewards Membership and track your benefits.
        </p>
      </div>

      {!currentMembership ? (
        // No active membership - show subscription options
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Join Durcheap Ultimate Rewards Membership
              </CardTitle>
              <CardDescription>
                Unlock exclusive benefits and save on every order with premium membership features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {plans.map((plan: MembershipPlan) => (
                  <Card key={plan.id} className="border-2 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold">{plan.name}</h3>
                          <p className="text-muted-foreground">{plan.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">${plan.price}</div>
                          <div className="text-sm text-muted-foreground">per {plan.billingInterval}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-6">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Button 
                        onClick={() => subscribeMutation.mutate({ 
                          planId: plan.id, 
                          paymentMethod: "card" 
                        })}
                        disabled={subscribeMutation.isPending}
                        className="w-full"
                      >
                        {subscribeMutation.isPending ? "Processing..." : "Start Membership"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Active membership - show dashboard
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Membership Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Plan</p>
                    <p className="text-lg font-semibold">Durcheap Ultimate Rewards</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={currentMembership.status === 'active' ? 'default' : 'secondary'}>
                      {currentMembership.status.charAt(0).toUpperCase() + currentMembership.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Next Billing</p>
                    <p className="text-lg font-semibold">
                      {new Date(currentMembership.nextBillingDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {!benefitsLoading && benefits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-green-500" />
                    Monthly Benefits Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {benefits.map((benefit: MembershipBenefit) => (
                      <div key={benefit.id}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{benefit.description}</span>
                          <span className="text-sm text-muted-foreground">
                            {benefit.usedCount} / {benefit.limit === 0 ? '∞' : benefit.limit}
                          </span>
                        </div>
                        <Progress 
                          value={benefit.limit === 0 ? 0 : (benefit.usedCount / benefit.limit) * 100} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="benefits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Benefits</CardTitle>
                <CardDescription>
                  Track your membership benefits and usage.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {benefitsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
                    ))}
                  </div>
                ) : benefits.length === 0 ? (
                  <p className="text-muted-foreground">No benefits data available.</p>
                ) : (
                  <div className="space-y-4">
                    {benefits.map((benefit: MembershipBenefit) => (
                      <Card key={benefit.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{benefit.description}</h3>
                              <p className="text-sm text-muted-foreground">
                                Resets {benefit.resetPeriod}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold">
                                {benefit.usedCount} / {benefit.limit === 0 ? '∞' : benefit.limit}
                              </p>
                              {benefit.lastUsedAt && (
                                <p className="text-xs text-muted-foreground">
                                  Last used: {new Date(benefit.lastUsedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Billing Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Fee</p>
                      <p className="text-2xl font-bold">$4.99</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Method</p>
                      <p className="text-lg">{currentMembership.paymentMethodId}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        toast({
                          title: "Feature Coming Soon",
                          description: "Payment method updates will be available soon.",
                        });
                      }}
                    >
                      Update Payment Method
                    </Button>
                    
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (confirm("Are you sure you want to cancel your membership?")) {
                          cancelMutation.mutate(currentMembership.id);
                        }
                      }}
                      disabled={cancelMutation.isPending}
                    >
                      {cancelMutation.isPending ? "Cancelling..." : "Cancel Membership"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                    ))}
                  </div>
                ) : transactions.length === 0 ? (
                  <p className="text-muted-foreground">No transaction history available.</p>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction: MembershipTransaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {transaction.amount ? `$${transaction.amount}` : '—'}
                          </p>
                          <Badge variant="outline">
                            {transaction.transactionType.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
    </Layout>
  );
}
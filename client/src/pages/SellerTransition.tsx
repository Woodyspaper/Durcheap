import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Store,
  Package,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  User,
} from "lucide-react";
import type { Product, Order, User as UserType } from "@shared/schema";

interface SellerTransitionData {
  seller: UserType;
  activeProducts: Product[];
  activeOrders: Order[];
  canTransition: boolean;
}

export default function SellerTransition() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSellerId, setSelectedSellerId] = useState<string>("");
  const [targetUserId, setTargetUserId] = useState<string>("");

  // Fetch sellers with transition data
  const { data: sellers = [], isLoading: sellersLoading } = useQuery<SellerTransitionData[]>({
    queryKey: ["/api/admin/sellers/transition-data"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  // Fetch potential target users (other sellers or admins)
  const { data: targetUsers = [], isLoading: targetUsersLoading } = useQuery<UserType[]>({
    queryKey: ["/api/admin/users", "sellers-admins"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  // Transfer products mutation
  const transferProductsMutation = useMutation({
    mutationFn: async ({ fromSellerId, toSellerId }: { fromSellerId: string; toSellerId: string }) => {
      return await apiRequest("POST", "/api/admin/transfer-products", {
        fromSellerId,
        toSellerId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Products Transferred",
        description: "All products have been successfully transferred.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sellers/transition-data"] });
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
        title: "Transfer Failed",
        description: "Could not transfer products. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Deactivate all products mutation
  const deactivateProductsMutation = useMutation({
    mutationFn: async (sellerId: string) => {
      return await apiRequest("POST", "/api/admin/deactivate-products", { sellerId });
    },
    onSuccess: () => {
      toast({
        title: "Products Deactivated",
        description: "All products have been deactivated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sellers/transition-data"] });
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
        title: "Deactivation Failed",
        description: "Could not deactivate products. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-16 w-16 text-red-300 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
              <p className="text-gray-600 mb-6">
                You need administrator privileges to access seller transition tools.
              </p>
              <Button onClick={() => window.location.href = "/"}>
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const selectedSeller = sellers.find(s => s.seller.id === selectedSellerId);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Seller Transition Management</h1>
            <p className="text-gray-600 mt-2">
              Manage seller account transitions and product transfers
            </p>
          </div>
          <Button onClick={() => window.location.href = "/admin/employees"} variant="outline">
            <User className="h-4 w-4 mr-2" />
            Back to Employee Management
          </Button>
        </div>

        {/* Seller Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Seller for Transition</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedSellerId} onValueChange={setSelectedSellerId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a seller to manage..." />
              </SelectTrigger>
              <SelectContent>
                {sellers.map((sellerData) => (
                  <SelectItem key={sellerData.seller.id} value={sellerData.seller.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>
                        {sellerData.seller.firstName} {sellerData.seller.lastName} ({sellerData.seller.email})
                      </span>
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge variant="outline">
                          {sellerData.activeProducts.length} products
                        </Badge>
                        <Badge variant="outline">
                          {sellerData.activeOrders.length} orders
                        </Badge>
                        {sellerData.canTransition ? (
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Ready
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Blocked
                          </Badge>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Seller Details and Actions */}
        {selectedSeller && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Seller Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Seller Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">{selectedSeller.seller.firstName} {selectedSeller.seller.lastName}</h3>
                  <p className="text-gray-600">{selectedSeller.seller.email}</p>
                  <p className="text-sm text-gray-500">
                    Business: {selectedSeller.seller.businessName || "Not specified"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded">
                    <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedSeller.activeProducts.length}
                    </div>
                    <div className="text-sm text-blue-700">Active Products</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded">
                    <ShoppingCart className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-yellow-600">
                      {selectedSeller.activeOrders.length}
                    </div>
                    <div className="text-sm text-yellow-700">Pending Orders</div>
                  </div>
                </div>

                {!selectedSeller.canTransition && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      This seller cannot be transitioned yet due to pending orders. 
                      Wait for orders to complete or transfer them first.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Transition Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Transition Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedSeller.activeProducts.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Product Management</h3>
                    
                    {/* Transfer Products */}
                    <div className="border rounded p-4">
                      <h4 className="font-medium mb-2">Transfer Products to Another Seller</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Move all products to another seller to maintain business continuity.
                      </p>
                      <div className="flex space-x-2">
                        <Select value={targetUserId} onValueChange={setTargetUserId}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select target seller..." />
                          </SelectTrigger>
                          <SelectContent>
                            {targetUsers
                              .filter(u => u.id !== selectedSeller.seller.id && (u.role === 'seller' || u.role === 'admin'))
                              .map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.firstName} {user.lastName} ({user.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() => transferProductsMutation.mutate({
                            fromSellerId: selectedSeller.seller.id,
                            toSellerId: targetUserId
                          })}
                          disabled={!targetUserId || transferProductsMutation.isPending}
                        >
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Transfer
                        </Button>
                      </div>
                    </div>

                    {/* Deactivate Products */}
                    <div className="border rounded p-4">
                      <h4 className="font-medium mb-2">Deactivate All Products</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Deactivate all products to prevent new orders (reversible action).
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => deactivateProductsMutation.mutate(selectedSeller.seller.id)}
                        disabled={deactivateProductsMutation.isPending}
                      >
                        Deactivate Products
                      </Button>
                    </div>
                  </div>
                )}

                {selectedSeller.canTransition && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      This seller is ready for role transition. You can safely remove their seller access 
                      from the Employee Management page.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
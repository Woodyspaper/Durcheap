import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { TaxExemptCertificate } from "@/components/TaxExemptCertificate";
import { LocationSettings } from "@/components/LocationSettings";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isUnauthorizedError } from "@/lib/authUtils";

import {
  User as UserIcon,
  Package,
  MapPin,
  CreditCard,
  Heart,
  Settings,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Star,
  Shield,
  Store,
  Edit,
  Plus,
  Eye,
} from "lucide-react";
import type { Order, OrderItem, Product, User } from "@shared/schema";

export default function Account() {
  const { user, isLoading: authLoading, error: authError } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Profile form schema
  const profileFormSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email"),
    businessName: z.string().optional(),
    businessAddress: z.string().optional(),
    businessCity: z.string().optional(),
    businessState: z.string().optional(),
    businessZipCode: z.string().optional(),
    businessCountry: z.string().optional(),
    taxId: z.string().optional(),
  });

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      businessName: user?.businessName || "",
      businessAddress: user?.businessAddress || "",
      businessCity: user?.businessCity || "",
      businessState: user?.businessState || "",
      businessZipCode: user?.businessZipCode || "",
      businessCountry: user?.businessCountry || "US",
      taxId: user?.taxId || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileFormSchema>) => {
      return await apiRequest("PATCH", `/api/auth/user`, data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Payment method form schema
  const paymentMethodSchema = z.object({
    cardNumber: z.string().min(16, "Card number must be at least 16 digits").max(19, "Card number is too long"),
    expiryMonth: z.string().min(2, "Select expiry month"),
    expiryYear: z.string().min(4, "Select expiry year"),
    cvv: z.string().min(3, "CVV must be at least 3 digits").max(4, "CVV is too long"),
    cardholderName: z.string().min(1, "Cardholder name is required"),
    billingAddress: z.string().min(1, "Billing address is required"),
    billingCity: z.string().min(1, "Billing city is required"),
    billingState: z.string().min(1, "Billing state is required"),
    billingZipCode: z.string().min(5, "ZIP code must be at least 5 digits"),
    isDefault: z.boolean().optional(),
  });

  const [showAddPayment, setShowAddPayment] = useState(false);
  const paymentForm = useForm<z.infer<typeof paymentMethodSchema>>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      cardholderName: "",
      billingAddress: "",
      billingCity: "",
      billingState: "",
      billingZipCode: "",
      isDefault: false,
    },
  });

  // Address form schema
  const addressSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    addressLine1: z.string().min(1, "Address line 1 is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(5, "ZIP code must be at least 5 digits"),
    country: z.string().min(1, "Country is required"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    isDefault: z.boolean().optional(),
  });

  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showEditDefaultAddress, setShowEditDefaultAddress] = useState(false);

  // Default address form schema  
  const defaultAddressSchema = z.object({
    defaultAddress: z.string().min(1, "Address is required"),
    defaultAddressLine2: z.string().optional(),
    defaultCity: z.string().min(1, "City is required"),
    defaultState: z.string().min(1, "State is required"),
    defaultZipCode: z.string().min(5, "ZIP code must be at least 5 digits"),
    defaultCountry: z.string().min(1, "Country is required"),
    defaultPhone: z.string().optional(),
  });

  const defaultAddressForm = useForm<z.infer<typeof defaultAddressSchema>>({
    resolver: zodResolver(defaultAddressSchema),
    defaultValues: {
      defaultAddress: user?.defaultAddress || "",
      defaultAddressLine2: user?.defaultAddressLine2 || "",
      defaultCity: user?.defaultCity || "",
      defaultState: user?.defaultState || "",
      defaultZipCode: user?.defaultZipCode || "",
      defaultCountry: user?.defaultCountry || "US",
      defaultPhone: user?.defaultPhone || "",
    },
  });

  // Reset form defaults when user data changes
  useEffect(() => {
    if (user) {
      defaultAddressForm.reset({
        defaultAddress: user.defaultAddress || "",
        defaultAddressLine2: user.defaultAddressLine2 || "",
        defaultCity: user.defaultCity || "",
        defaultState: user.defaultState || "",
        defaultZipCode: user.defaultZipCode || "",
        defaultCountry: user.defaultCountry || "US",
        defaultPhone: user.defaultPhone || "",
      });
    }
  }, [user, defaultAddressForm]);

  const addressForm = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "US",
      phoneNumber: "",
      isDefault: false,
    },
  });

  const addPaymentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof paymentMethodSchema>) => {
      // In a real app, this would integrate with Stripe or similar payment processor
      console.log("Adding payment method:", data);
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Payment Method Added",
        description: "Your payment method has been successfully added.",
      });
      setShowAddPayment(false);
      paymentForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add payment method. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateDefaultAddressMutation = useMutation({
    mutationFn: async (data: z.infer<typeof defaultAddressSchema>) => {
      return await apiRequest("PUT", `/api/auth/user`, data);
    },
    onSuccess: () => {
      toast({
        title: "Default Address Updated",
        description: "Your default address has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setShowEditDefaultAddress(false);
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
        title: "Error", 
        description: "Failed to update default address. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: async (data: z.infer<typeof addressSchema>) => {
      console.log("Adding address:", data);
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Address Added",
        description: "Your address has been successfully added.",
      });
      setShowAddAddress(false);
      addressForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add address. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRestartTour = () => {
    localStorage.removeItem('durcheap_onboarding_completed');
    localStorage.removeItem('durcheap_onboarding_skipped');
    localStorage.removeItem('durcheap_onboarding_completed_date');
    toast({
      title: "Onboarding Tour Reset",
      description: "You'll see the welcome modal when you visit the home page next.",
    });
  };

  const { data: orders = [], isLoading: ordersLoading } = useQuery<
    (Order & { items: (OrderItem & { product: Product })[] })[]
  >({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-3">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <UserIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">Sign in to view your account</h1>
              <p className="text-gray-600 mb-6">
                {authError ? "Your session has expired. Please sign in again." : "Access your orders, preferences, and more."}
              </p>
              <Button onClick={() => window.location.href = "/auth"}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const totalSpent = orders.reduce((total, order) => total + Number(order.total), 0);
  const totalOrders = orders.length;
  const recentOrders = orders.slice(0, 3);

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Account Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user?.profileImageUrl ?? undefined} />
                    <AvatarFallback className="bg-amazon-orange text-white">
                      {getInitials(user?.firstName, user?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-bold text-lg">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : "User"}
                    </h2>
                    <p className="text-gray-600 text-sm">{user?.email}</p>
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical">
                  <TabsList className="grid w-full grid-cols-1 h-auto bg-transparent p-0 space-y-1">
                    <TabsTrigger
                      value="overview"
                      className="w-full justify-start px-4 py-3 data-[state=active]:bg-amazon-blue data-[state=active]:text-white"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Account Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="orders"
                      className="w-full justify-start px-4 py-3 data-[state=active]:bg-amazon-blue data-[state=active]:text-white"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Orders & Returns
                    </TabsTrigger>
                    <TabsTrigger
                      value="addresses"
                      className="w-full justify-start px-4 py-3 data-[state=active]:bg-amazon-blue data-[state=active]:text-white"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Addresses
                    </TabsTrigger>
                    <TabsTrigger
                      value="payment"
                      className="w-full justify-start px-4 py-3 data-[state=active]:bg-amazon-blue data-[state=active]:text-white"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Payment Methods
                    </TabsTrigger>
                    <TabsTrigger
                      value="wishlist"
                      className="w-full justify-start px-4 py-3 data-[state=active]:bg-amazon-blue data-[state=active]:text-white"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Wish Lists
                    </TabsTrigger>
                    <TabsTrigger
                      value="tax-exempt"
                      className="w-full justify-start px-4 py-3 data-[state=active]:bg-amazon-blue data-[state=active]:text-white"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Tax Exempt Certificates
                    </TabsTrigger>
                    <TabsTrigger
                      value="security"
                      className="w-full justify-start px-4 py-3 data-[state=active]:bg-amazon-blue data-[state=active]:text-white"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Security & 2FA
                    </TabsTrigger>
                    {(user?.role === "seller" || user?.role === "admin") && (
                      <TabsTrigger
                        value="seller-tools"
                        className="w-full justify-start px-4 py-3 data-[state=active]:bg-amazon-blue data-[state=active]:text-white"
                      >
                        <Store className="h-4 w-4 mr-2" />
                        Seller Tools
                      </TabsTrigger>
                    )}
                    <TabsTrigger
                      value="settings"
                      className="w-full justify-start px-4 py-3 data-[state=active]:bg-amazon-blue data-[state=active]:text-white"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Account Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Account Overview */}
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">Account Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="text-center p-6 bg-blue-50 rounded-lg">
                        <div className="text-3xl font-bold text-amazon-orange mb-2">
                          {totalOrders}
                        </div>
                        <div className="text-gray-600">Total Orders</div>
                      </div>
                      <div className="text-center p-6 bg-green-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          ${totalSpent.toFixed(2)}
                        </div>
                        <div className="text-gray-600">Total Spent</div>
                      </div>
                      <div className="text-center p-6 bg-purple-50 rounded-lg">
                        <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
                        <div className="text-gray-600">Wish List Items</div>
                      </div>
                    </div>

                    {/* Recent Orders */}
                    <h3 className="text-xl font-bold mb-4">Recent Orders</h3>
                    {ordersLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Card key={i}>
                            <CardContent className="p-4">
                              <Skeleton className="h-20 w-full" />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : recentOrders.length === 0 ? (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                          <p className="text-gray-600 mb-4">Start shopping to see your orders here.</p>
                          <Button asChild>
                            <Link href="/search">Start Shopping</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {recentOrders.map((order) => (
                          <Card key={order.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <div className="font-semibold">Order #{order.id}</div>
                                  <div className="text-sm text-gray-600">
                                    Placed on {new Date(order.createdAt || "").toLocaleDateString()}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold">${Number(order.total).toFixed(2)}</div>
                                  <Badge className={getStatusColor(order.status)}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </Badge>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {order.items.slice(0, 3).map((item, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                      {item.product.images && item.product.images.length > 0 ? (
                                        <img
                                          src={item.product.images[0]}
                                          alt={item.product.name}
                                          className="w-12 h-12 object-cover rounded"
                                        />
                                      ) : (
                                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                          <span className="text-xs text-gray-400">No image</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                  {order.items.length > 3 && (
                                    <div className="text-sm text-gray-600">
                                      +{order.items.length - 3} more items
                                    </div>
                                  )}
                                </div>
                                <div className="space-x-2">
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/orders/${order.id}`}>View Order</Link>
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    Buy Again
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Seller Quick Actions */}
                    {(user?.role === "seller" || user?.role === "admin") && (
                      <>
                        <div className="mt-8 pt-8 border-t">
                          <h3 className="text-xl font-bold mb-4">Seller Tools</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Button 
                              asChild 
                              className="h-auto p-4 flex flex-col items-center space-y-2 bg-amazon-orange hover:bg-amazon-orange/90"
                              data-testid="button-manage-products"
                            >
                              <Link href="/manage-products">
                                <Package className="h-6 w-6" />
                                <span>Manage Products</span>
                              </Link>
                            </Button>
                            <Button 
                              asChild 
                              variant="outline" 
                              className="h-auto p-4 flex flex-col items-center space-y-2"
                              data-testid="button-add-product"
                            >
                              <Link href="/add-product">
                                <Plus className="h-6 w-6" />
                                <span>Add New Product</span>
                              </Link>
                            </Button>
                            <Button 
                              asChild 
                              variant="outline" 
                              className="h-auto p-4 flex flex-col items-center space-y-2"
                              data-testid="button-seller-dashboard"
                            >
                              <Link href="/seller">
                                <TrendingUp className="h-6 w-6" />
                                <span>Seller Dashboard</span>
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Orders Section */}
              <TabsContent value="orders" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">Your Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {ordersLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Card key={i}>
                            <CardContent className="p-4">
                              <Skeleton className="h-24 w-full" />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-12">
                        <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No orders found</h3>
                        <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
                        <Button asChild>
                          <Link href="/search">Start Shopping</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {orders.map((order) => (
                          <Card key={order.id} className="border-l-4 border-l-amazon-blue">
                            <CardContent className="p-6">
                              <div className="bg-gray-50 -mx-6 -mt-6 px-6 py-4 mb-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <div className="text-gray-600">ORDER PLACED</div>
                                    <div className="font-medium">
                                      {new Date(order.createdAt || "").toLocaleDateString()}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-gray-600">TOTAL</div>
                                    <div className="font-medium">${Number(order.total).toFixed(2)}</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-600">SHIP TO</div>
                                    <div className="font-medium">
                                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-gray-600">
                                      ORDER # <span className="font-medium">{order.id}</span>
                                    </div>
                                    <div className="space-x-2 mt-1">
                                      <Button variant="link" size="sm" asChild>
                                        <Link href={`/orders/${order.id}`}>View order details</Link>
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <Badge className={getStatusColor(order.status)}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </Badge>
                                </div>

                                {order.items.map((item) => (
                                  <div key={item.id} className="flex items-center space-x-4">
                                    {item.product.images && item.product.images.length > 0 ? (
                                      <img
                                        src={item.product.images[0]}
                                        alt={item.product.name}
                                        className="w-20 h-20 object-cover rounded"
                                      />
                                    ) : (
                                      <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                                        <span className="text-xs text-gray-400">No image</span>
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <h4 className="font-semibold mb-1">{item.product.name}</h4>
                                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                      <p className="text-sm font-semibold">
                                        ${Number(item.price).toFixed(2)} each
                                      </p>
                                    </div>
                                    <div className="space-x-2">
                                      <Button size="sm" asChild>
                                        <Link href={`/product/${item.product.id}`}>Buy it again</Link>
                                      </Button>
                                      <Button variant="outline" size="sm">
                                        Write review
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Other Tabs - Placeholder Content */}
              <TabsContent value="addresses">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Addresses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Manage your shipping addresses here.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payment">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle>Payment Methods</CardTitle>
                    <Button onClick={() => setShowAddPayment(true)}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {/* Existing Payment Methods */}
                    <div className="space-y-4 mb-6">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CreditCard className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="font-medium">•••• •••• •••• 4242</p>
                              <p className="text-sm text-gray-500">Expires 12/25</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Default</span>
                            <Button variant="ghost" size="sm">Edit</Button>
                            <Button variant="ghost" size="sm" className="text-red-600">Remove</Button>
                          </div>
                        </div>
                      </div>
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CreditCard className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="font-medium">•••• •••• •••• 5555</p>
                              <p className="text-sm text-gray-500">Expires 08/26</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">Edit</Button>
                            <Button variant="ghost" size="sm" className="text-red-600">Remove</Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Add Payment Method Form */}
                    {showAddPayment && (
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4">Add New Payment Method</h3>
                        <Form {...paymentForm}>
                          <form onSubmit={paymentForm.handleSubmit((data) => addPaymentMutation.mutate(data))} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={paymentForm.control}
                                name="cardholderName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Cardholder Name *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={paymentForm.control}
                                name="cardNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Card Number *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="1234 5678 9012 3456" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <FormField
                                control={paymentForm.control}
                                name="expiryMonth"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Expiry Month *</FormLabel>
                                    <FormControl>
                                      <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="MM" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {Array.from({ length: 12 }, (_, i) => (
                                            <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                              {String(i + 1).padStart(2, '0')}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={paymentForm.control}
                                name="expiryYear"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Expiry Year *</FormLabel>
                                    <FormControl>
                                      <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="YYYY" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {Array.from({ length: 10 }, (_, i) => {
                                            const year = new Date().getFullYear() + i;
                                            return (
                                              <SelectItem key={year} value={String(year)}>
                                                {year}
                                              </SelectItem>
                                            );
                                          })}
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={paymentForm.control}
                                name="cvv"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>CVV *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="123" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <div className="space-y-4">
                              <h4 className="font-medium">Billing Address</h4>
                              <FormField
                                control={paymentForm.control}
                                name="billingAddress"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Address *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="123 Main Street" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                  control={paymentForm.control}
                                  name="billingCity"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>City *</FormLabel>
                                      <FormControl>
                                        <Input placeholder="New York" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={paymentForm.control}
                                  name="billingState"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>State *</FormLabel>
                                      <FormControl>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select state" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="NY">New York</SelectItem>
                                            <SelectItem value="CA">California</SelectItem>
                                            <SelectItem value="TX">Texas</SelectItem>
                                            <SelectItem value="FL">Florida</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={paymentForm.control}
                                  name="billingZipCode"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>ZIP Code *</FormLabel>
                                      <FormControl>
                                        <Input placeholder="10001" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <FormField
                                control={paymentForm.control}
                                name="isDefault"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <input
                                        type="checkbox"
                                        checked={field.value}
                                        onChange={field.onChange}
                                        className="mt-1"
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel>Make this my default payment method</FormLabel>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="flex justify-end space-x-4">
                              <Button type="button" variant="outline" onClick={() => setShowAddPayment(false)}>
                                Cancel
                              </Button>
                              <Button type="submit" disabled={addPaymentMutation.isPending}>
                                {addPaymentMutation.isPending ? "Adding..." : "Add Payment Method"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="addresses" className="space-y-6">
                {/* Default Address Section */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                      <CardTitle>Default Address</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Your primary address used for events, local services, and seller purposes
                      </p>
                    </div>
                    <Button onClick={() => setShowEditDefaultAddress(true)} variant="outline">
                      <MapPin className="h-4 w-4 mr-2" />
                      {user?.defaultAddress ? 'Edit Address' : 'Add Default Address'}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {user?.defaultAddress ? (
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <MapPin className="h-5 w-5 text-amazon-blue mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-gray-600">{user.defaultAddress}</p>
                            {user.defaultAddressLine2 && (
                              <p className="text-sm text-gray-600">{user.defaultAddressLine2}</p>
                            )}
                            <p className="text-sm text-gray-600">
                              {user.defaultCity}, {user.defaultState} {user.defaultZipCode}
                            </p>
                            {user.defaultPhone && (
                              <p className="text-sm text-gray-600">{user.defaultPhone}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <MapPin className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium mb-2">No default address set</p>
                        <p className="text-sm">Add your primary address for events and local services</p>
                      </div>
                    )}

                    {/* Edit Default Address Form */}
                    {showEditDefaultAddress && (
                      <div className="border-t pt-6 mt-4">
                        <h3 className="text-lg font-semibold mb-4">
                          {user?.defaultAddress ? 'Edit Default Address' : 'Add Default Address'}
                        </h3>
                        <Form {...defaultAddressForm}>
                          <form onSubmit={defaultAddressForm.handleSubmit((data) => updateDefaultAddressMutation.mutate(data))} className="space-y-4">
                            <FormField
                              control={defaultAddressForm.control}
                              name="defaultAddress"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Address *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="123 Main Street" {...field} data-testid="input-default-address" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={defaultAddressForm.control}
                              name="defaultAddressLine2"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Address Line 2 (Optional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Apartment, suite, etc." {...field} data-testid="input-default-address-line2" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={defaultAddressForm.control}
                                name="defaultCity"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>City *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="New York" {...field} data-testid="input-default-city" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={defaultAddressForm.control}
                                name="defaultState"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>State *</FormLabel>
                                    <FormControl>
                                      <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger data-testid="select-default-state">
                                          <SelectValue placeholder="Select state" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="AL">Alabama</SelectItem>
                                          <SelectItem value="AK">Alaska</SelectItem>
                                          <SelectItem value="AZ">Arizona</SelectItem>
                                          <SelectItem value="AR">Arkansas</SelectItem>
                                          <SelectItem value="CA">California</SelectItem>
                                          <SelectItem value="CO">Colorado</SelectItem>
                                          <SelectItem value="CT">Connecticut</SelectItem>
                                          <SelectItem value="DE">Delaware</SelectItem>
                                          <SelectItem value="FL">Florida</SelectItem>
                                          <SelectItem value="GA">Georgia</SelectItem>
                                          <SelectItem value="HI">Hawaii</SelectItem>
                                          <SelectItem value="ID">Idaho</SelectItem>
                                          <SelectItem value="IL">Illinois</SelectItem>
                                          <SelectItem value="IN">Indiana</SelectItem>
                                          <SelectItem value="IA">Iowa</SelectItem>
                                          <SelectItem value="KS">Kansas</SelectItem>
                                          <SelectItem value="KY">Kentucky</SelectItem>
                                          <SelectItem value="LA">Louisiana</SelectItem>
                                          <SelectItem value="ME">Maine</SelectItem>
                                          <SelectItem value="MD">Maryland</SelectItem>
                                          <SelectItem value="MA">Massachusetts</SelectItem>
                                          <SelectItem value="MI">Michigan</SelectItem>
                                          <SelectItem value="MN">Minnesota</SelectItem>
                                          <SelectItem value="MS">Mississippi</SelectItem>
                                          <SelectItem value="MO">Missouri</SelectItem>
                                          <SelectItem value="MT">Montana</SelectItem>
                                          <SelectItem value="NE">Nebraska</SelectItem>
                                          <SelectItem value="NV">Nevada</SelectItem>
                                          <SelectItem value="NH">New Hampshire</SelectItem>
                                          <SelectItem value="NJ">New Jersey</SelectItem>
                                          <SelectItem value="NM">New Mexico</SelectItem>
                                          <SelectItem value="NY">New York</SelectItem>
                                          <SelectItem value="NC">North Carolina</SelectItem>
                                          <SelectItem value="ND">North Dakota</SelectItem>
                                          <SelectItem value="OH">Ohio</SelectItem>
                                          <SelectItem value="OK">Oklahoma</SelectItem>
                                          <SelectItem value="OR">Oregon</SelectItem>
                                          <SelectItem value="PA">Pennsylvania</SelectItem>
                                          <SelectItem value="RI">Rhode Island</SelectItem>
                                          <SelectItem value="SC">South Carolina</SelectItem>
                                          <SelectItem value="SD">South Dakota</SelectItem>
                                          <SelectItem value="TN">Tennessee</SelectItem>
                                          <SelectItem value="TX">Texas</SelectItem>
                                          <SelectItem value="UT">Utah</SelectItem>
                                          <SelectItem value="VT">Vermont</SelectItem>
                                          <SelectItem value="VA">Virginia</SelectItem>
                                          <SelectItem value="WA">Washington</SelectItem>
                                          <SelectItem value="WV">West Virginia</SelectItem>
                                          <SelectItem value="WI">Wisconsin</SelectItem>
                                          <SelectItem value="WY">Wyoming</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={defaultAddressForm.control}
                                name="defaultZipCode"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>ZIP Code *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="10001" {...field} data-testid="input-default-zipcode" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={defaultAddressForm.control}
                              name="defaultPhone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number (Optional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="(555) 123-4567" {...field} data-testid="input-default-phone" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="flex justify-end space-x-4">
                              <Button type="button" variant="outline" onClick={() => setShowEditDefaultAddress(false)} data-testid="button-cancel-default-address">
                                Cancel
                              </Button>
                              <Button type="submit" disabled={updateDefaultAddressMutation.isPending} data-testid="button-save-default-address">
                                {updateDefaultAddressMutation.isPending ? "Saving..." : "Save Default Address"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Shipping Addresses Section */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                      <CardTitle>Shipping Addresses</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Additional addresses for receiving orders and deliveries
                      </p>
                    </div>
                    <Button onClick={() => setShowAddAddress(true)}>
                      <MapPin className="h-4 w-4 mr-2" />
                      Add Shipping Address
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {/* Existing Shipping Addresses */}
                    <div className="space-y-4 mb-6">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="font-medium">John Doe</p>
                              <p className="text-sm text-gray-600">123 Main Street</p>
                              <p className="text-sm text-gray-600">New York, NY 10001</p>
                              <p className="text-sm text-gray-600">(555) 123-4567</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Default</span>
                            <Button variant="ghost" size="sm">Edit</Button>
                            <Button variant="ghost" size="sm" className="text-red-600">Remove</Button>
                          </div>
                        </div>
                      </div>
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="font-medium">Jane Smith</p>
                              <p className="text-sm text-gray-600">456 Oak Avenue</p>
                              <p className="text-sm text-gray-600">Los Angeles, CA 90210</p>
                              <p className="text-sm text-gray-600">(555) 987-6543</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">Edit</Button>
                            <Button variant="ghost" size="sm" className="text-red-600">Remove</Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Add Address Form */}
                    {showAddAddress && (
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4">Add New Address</h3>
                        <Form {...addressForm}>
                          <form onSubmit={addressForm.handleSubmit((data) => addAddressMutation.mutate(data))} className="space-y-4">
                            <FormField
                              control={addressForm.control}
                              name="fullName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Name *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={addressForm.control}
                              name="addressLine1"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Address Line 1 *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="123 Main Street" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={addressForm.control}
                              name="addressLine2"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Address Line 2 (Optional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Apartment, suite, etc." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={addressForm.control}
                                name="city"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>City *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="New York" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={addressForm.control}
                                name="state"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>State *</FormLabel>
                                    <FormControl>
                                      <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select state" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="AL">Alabama</SelectItem>
                                          <SelectItem value="AK">Alaska</SelectItem>
                                          <SelectItem value="AZ">Arizona</SelectItem>
                                          <SelectItem value="AR">Arkansas</SelectItem>
                                          <SelectItem value="CA">California</SelectItem>
                                          <SelectItem value="CO">Colorado</SelectItem>
                                          <SelectItem value="CT">Connecticut</SelectItem>
                                          <SelectItem value="DE">Delaware</SelectItem>
                                          <SelectItem value="FL">Florida</SelectItem>
                                          <SelectItem value="GA">Georgia</SelectItem>
                                          <SelectItem value="HI">Hawaii</SelectItem>
                                          <SelectItem value="ID">Idaho</SelectItem>
                                          <SelectItem value="IL">Illinois</SelectItem>
                                          <SelectItem value="IN">Indiana</SelectItem>
                                          <SelectItem value="IA">Iowa</SelectItem>
                                          <SelectItem value="KS">Kansas</SelectItem>
                                          <SelectItem value="KY">Kentucky</SelectItem>
                                          <SelectItem value="LA">Louisiana</SelectItem>
                                          <SelectItem value="ME">Maine</SelectItem>
                                          <SelectItem value="MD">Maryland</SelectItem>
                                          <SelectItem value="MA">Massachusetts</SelectItem>
                                          <SelectItem value="MI">Michigan</SelectItem>
                                          <SelectItem value="MN">Minnesota</SelectItem>
                                          <SelectItem value="MS">Mississippi</SelectItem>
                                          <SelectItem value="MO">Missouri</SelectItem>
                                          <SelectItem value="MT">Montana</SelectItem>
                                          <SelectItem value="NE">Nebraska</SelectItem>
                                          <SelectItem value="NV">Nevada</SelectItem>
                                          <SelectItem value="NH">New Hampshire</SelectItem>
                                          <SelectItem value="NJ">New Jersey</SelectItem>
                                          <SelectItem value="NM">New Mexico</SelectItem>
                                          <SelectItem value="NY">New York</SelectItem>
                                          <SelectItem value="NC">North Carolina</SelectItem>
                                          <SelectItem value="ND">North Dakota</SelectItem>
                                          <SelectItem value="OH">Ohio</SelectItem>
                                          <SelectItem value="OK">Oklahoma</SelectItem>
                                          <SelectItem value="OR">Oregon</SelectItem>
                                          <SelectItem value="PA">Pennsylvania</SelectItem>
                                          <SelectItem value="RI">Rhode Island</SelectItem>
                                          <SelectItem value="SC">South Carolina</SelectItem>
                                          <SelectItem value="SD">South Dakota</SelectItem>
                                          <SelectItem value="TN">Tennessee</SelectItem>
                                          <SelectItem value="TX">Texas</SelectItem>
                                          <SelectItem value="UT">Utah</SelectItem>
                                          <SelectItem value="VT">Vermont</SelectItem>
                                          <SelectItem value="VA">Virginia</SelectItem>
                                          <SelectItem value="WA">Washington</SelectItem>
                                          <SelectItem value="WV">West Virginia</SelectItem>
                                          <SelectItem value="WI">Wisconsin</SelectItem>
                                          <SelectItem value="WY">Wyoming</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={addressForm.control}
                                name="zipCode"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>ZIP Code *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="10001" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={addressForm.control}
                                name="country"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Country *</FormLabel>
                                    <FormControl>
                                      <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select country" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="US">United States</SelectItem>
                                          <SelectItem value="CA">Canada</SelectItem>
                                          <SelectItem value="MX">Mexico</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={addressForm.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Phone Number *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="(555) 123-4567" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="flex items-center space-x-2">
                              <FormField
                                control={addressForm.control}
                                name="isDefault"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <input
                                        type="checkbox"
                                        checked={field.value}
                                        onChange={field.onChange}
                                        className="mt-1"
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel>Make this my default shipping address</FormLabel>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="flex justify-end space-x-4">
                              <Button type="button" variant="outline" onClick={() => setShowAddAddress(false)}>
                                Cancel
                              </Button>
                              <Button type="submit" disabled={addAddressMutation.isPending}>
                                {addAddressMutation.isPending ? "Adding..." : "Add Address"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="wishlist">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Wish Lists</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">View and manage your wish lists here.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tax-exempt">
                <TaxExemptCertificate />
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-6">
                        {/* Personal Information Section */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Personal Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={profileForm.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter your first name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileForm.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter your last name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address *</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="Enter your email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        {/* Business Information Section */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Business Information (Optional)</h3>
                          <p className="text-sm text-gray-600">
                            Fill this out if you plan to sell products or need business tax features.
                          </p>
                          <FormField
                            control={profileForm.control}
                            name="businessName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Business Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your business name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="businessAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Business Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your business address" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={profileForm.control}
                              name="businessCity"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter city" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileForm.control}
                              name="businessState"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State</FormLabel>
                                  <FormControl>
                                    <Select value={field.value || ""} onValueChange={field.onChange}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select state" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="AL">Alabama</SelectItem>
                                        <SelectItem value="AK">Alaska</SelectItem>
                                        <SelectItem value="AZ">Arizona</SelectItem>
                                        <SelectItem value="AR">Arkansas</SelectItem>
                                        <SelectItem value="CA">California</SelectItem>
                                        <SelectItem value="CO">Colorado</SelectItem>
                                        <SelectItem value="CT">Connecticut</SelectItem>
                                        <SelectItem value="DE">Delaware</SelectItem>
                                        <SelectItem value="FL">Florida</SelectItem>
                                        <SelectItem value="GA">Georgia</SelectItem>
                                        <SelectItem value="HI">Hawaii</SelectItem>
                                        <SelectItem value="ID">Idaho</SelectItem>
                                        <SelectItem value="IL">Illinois</SelectItem>
                                        <SelectItem value="IN">Indiana</SelectItem>
                                        <SelectItem value="IA">Iowa</SelectItem>
                                        <SelectItem value="KS">Kansas</SelectItem>
                                        <SelectItem value="KY">Kentucky</SelectItem>
                                        <SelectItem value="LA">Louisiana</SelectItem>
                                        <SelectItem value="ME">Maine</SelectItem>
                                        <SelectItem value="MD">Maryland</SelectItem>
                                        <SelectItem value="MA">Massachusetts</SelectItem>
                                        <SelectItem value="MI">Michigan</SelectItem>
                                        <SelectItem value="MN">Minnesota</SelectItem>
                                        <SelectItem value="MS">Mississippi</SelectItem>
                                        <SelectItem value="MO">Missouri</SelectItem>
                                        <SelectItem value="MT">Montana</SelectItem>
                                        <SelectItem value="NE">Nebraska</SelectItem>
                                        <SelectItem value="NV">Nevada</SelectItem>
                                        <SelectItem value="NH">New Hampshire</SelectItem>
                                        <SelectItem value="NJ">New Jersey</SelectItem>
                                        <SelectItem value="NM">New Mexico</SelectItem>
                                        <SelectItem value="NY">New York</SelectItem>
                                        <SelectItem value="NC">North Carolina</SelectItem>
                                        <SelectItem value="ND">North Dakota</SelectItem>
                                        <SelectItem value="OH">Ohio</SelectItem>
                                        <SelectItem value="OK">Oklahoma</SelectItem>
                                        <SelectItem value="OR">Oregon</SelectItem>
                                        <SelectItem value="PA">Pennsylvania</SelectItem>
                                        <SelectItem value="RI">Rhode Island</SelectItem>
                                        <SelectItem value="SC">South Carolina</SelectItem>
                                        <SelectItem value="SD">South Dakota</SelectItem>
                                        <SelectItem value="TN">Tennessee</SelectItem>
                                        <SelectItem value="TX">Texas</SelectItem>
                                        <SelectItem value="UT">Utah</SelectItem>
                                        <SelectItem value="VT">Vermont</SelectItem>
                                        <SelectItem value="VA">Virginia</SelectItem>
                                        <SelectItem value="WA">Washington</SelectItem>
                                        <SelectItem value="WV">West Virginia</SelectItem>
                                        <SelectItem value="WI">Wisconsin</SelectItem>
                                        <SelectItem value="WY">Wyoming</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileForm.control}
                              name="businessZipCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>ZIP Code</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter ZIP code" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={profileForm.control}
                            name="taxId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tax ID (EIN or SSN)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your Tax ID for business purposes" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end space-x-4">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => profileForm.reset()}
                          >
                            Reset
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={updateProfileMutation.isPending}
                          >
                            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>

                {/* Location Preferences Section */}
                <div className="mt-6">
                  <LocationSettings />
                </div>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security & Two-Factor Authentication
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">Two-Factor Authentication</h3>
                          <p className="text-sm text-gray-600">
                            {user?.twoFactorEnabled 
                              ? "Your account is protected with 2FA" 
                              : "Add an extra layer of security to your account"}
                          </p>
                        </div>
                        <Badge variant={user?.twoFactorEnabled ? "default" : "secondary"}>
                          {user?.twoFactorEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <Button asChild>
                        <Link href="/account/two-factor">
                          Manage Two-Factor Authentication
                        </Link>
                      </Button>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">Balance Protection</h3>
                          <p className="text-sm text-gray-600">
                            {user?.twoFactorEnabled 
                              ? "2FA is required to access your account balance and financial data" 
                              : "Enable 2FA to protect your financial information"}
                          </p>
                        </div>
                        <Badge variant={user?.twoFactorEnabled ? "default" : "destructive"}>
                          {user?.twoFactorEnabled ? "Protected" : "Unprotected"}
                        </Badge>
                      </div>
                      {!user?.twoFactorEnabled && (
                        <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded">
                          <strong>Important:</strong> Your account balance and transaction history require 2FA protection.
                          Set up two-factor authentication to access these features.
                        </p>
                      )}
                    </div>

                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Password & Sign-in</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Your account uses secure authentication through Replit. Password changes are managed through your Replit account settings.
                      </p>
                      <Button variant="outline" onClick={() => window.open('https://replit.com/account', '_blank')}>
                        Manage Replit Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Seller Tools Section */}
              <TabsContent value="seller-tools" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">Seller Tools</CardTitle>
                    <CardDescription>
                      Manage your products, view analytics, and grow your business
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Product Management */}
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <Package className="h-8 w-8 text-amazon-orange" />
                            <Button asChild size="sm" data-testid="button-manage-products-detailed">
                              <Link href="/manage-products">
                                <Eye className="h-4 w-4 mr-2" />
                                View All
                              </Link>
                            </Button>
                          </div>
                          <h3 className="font-semibold text-lg mb-2">Product Management</h3>
                          <p className="text-gray-600 text-sm mb-4">
                            View, edit, and manage all your products in one place
                          </p>
                          <div className="space-y-2">
                            <Button asChild variant="outline" className="w-full justify-start" data-testid="button-edit-products">
                              <Link href="/manage-products">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Products
                              </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start" data-testid="button-add-new-product">
                              <Link href="/add-product">
                                <Plus className="h-4 w-4 mr-2" />
                                Add New Product
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Seller Dashboard */}
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <TrendingUp className="h-8 w-8 text-green-600" />
                            <Button asChild size="sm" data-testid="button-seller-dashboard-detailed">
                              <Link href="/seller">
                                <Eye className="h-4 w-4 mr-2" />
                                View Dashboard
                              </Link>
                            </Button>
                          </div>
                          <h3 className="font-semibold text-lg mb-2">Sales Dashboard</h3>
                          <p className="text-gray-600 text-sm mb-4">
                            Monitor your sales performance and analytics
                          </p>
                          <div className="space-y-2">
                            <Button asChild variant="outline" className="w-full justify-start" data-testid="button-view-analytics">
                              <Link href="/seller">
                                <TrendingUp className="h-4 w-4 mr-2" />
                                View Analytics
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Store Settings */}
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <Store className="h-8 w-8 text-blue-600" />
                            <Button asChild size="sm" data-testid="button-store-settings">
                              <Link href="/seller">
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
                              </Link>
                            </Button>
                          </div>
                          <h3 className="font-semibold text-lg mb-2">Store Settings</h3>
                          <p className="text-gray-600 text-sm mb-4">
                            Configure your store profile and preferences
                          </p>
                          <div className="space-y-2">
                            <Button asChild variant="outline" className="w-full justify-start" data-testid="button-store-profile">
                              <Link href="/seller">
                                <Settings className="h-4 w-4 mr-2" />
                                Store Profile
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-8 pt-8 border-t">
                      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                      <div className="flex flex-wrap gap-4">
                        <Button asChild className="bg-amazon-orange hover:bg-amazon-orange/90" data-testid="button-quick-add-product">
                          <Link href="/add-product">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Product
                          </Link>
                        </Button>
                        <Button asChild variant="outline" data-testid="button-quick-view-orders">
                          <Link href="/seller">
                            <Package className="h-4 w-4 mr-2" />
                            View Orders
                          </Link>
                        </Button>
                        <Button asChild variant="outline" data-testid="button-quick-manage-inventory">
                          <Link href="/manage-products">
                            <Eye className="h-4 w-4 mr-2" />
                            Manage Inventory
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}

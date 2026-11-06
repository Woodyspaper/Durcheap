import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { CreditCard, Truck, Shield, CheckCircle } from "lucide-react";

interface ShippingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { cartItems, cartCount, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });

  const [deliveryMethod, setDeliveryMethod] = useState("ship-to");
  const [shippingOption, setShippingOption] = useState("standard");
  const [pickupStore, setPickupStore] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [sameAsBilling, setSameAsBilling] = useState(true);

  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  const subtotal = cartItems.reduce((total, item) => total + (Number(item.product.price) * item.quantity), 0);
  const shippingCost = deliveryMethod === "local-delivery" 
    ? 0 // Local delivery and pickup are free
    : shippingOption === "express" 
      ? 9.99 
      : shippingOption === "overnight" 
        ? 19.99 
        : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return apiRequest("POST", "/api/orders", orderData);
    },
    onSuccess: async (order) => {
      await clearCart();
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order placed successfully!",
        description: `Your order #${order.id} has been confirmed.`,
      });
      setLocation(`/orders/${order.id}`);
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
        title: "Order failed",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to place an order",
        variant: "destructive",
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields based on delivery method
    if (deliveryMethod === "ship-to") {
      const requiredFields = ['firstName', 'lastName', 'address1', 'city', 'state', 'zipCode', 'phone'];
      const missingFields = requiredFields.filter(field => !shippingAddress[field as keyof ShippingAddress]);
      
      if (missingFields.length > 0) {
        toast({
          title: "Missing information",
          description: "Please fill in all required shipping address fields",
          variant: "destructive",
        });
        return;
      }
    } else if (deliveryMethod === "local-delivery") {
      if (!pickupStore) {
        toast({
          title: "Missing store selection",
          description: "Please select a store for pickup",
          variant: "destructive",
        });
        return;
      }
      // Still need contact info for local delivery
      if (!shippingAddress.firstName || !shippingAddress.lastName || !shippingAddress.phone) {
        toast({
          title: "Missing contact information",
          description: "Please provide your name and phone number for pickup notification",
          variant: "destructive",
        });
        return;
      }
    }

    if (paymentMethod === "card") {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
        toast({
          title: "Missing payment information",
          description: "Please fill in all credit card details",
          variant: "destructive",
        });
        return;
      }
    }

    const orderData = {
      shippingAddress: deliveryMethod === "ship-to" ? shippingAddress : {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        phone: shippingAddress.phone,
        address1: '',
        address2: '',
        city: '',
        state: '',
        zipCode: ''
      },
      paymentMethod,
      deliveryMethod,
      pickupStore: deliveryMethod === "local-delivery" ? pickupStore : undefined,
      shippingOption: deliveryMethod === "ship-to" ? shippingOption : undefined,
      shippingCost: shippingCost.toString(),
      items: cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: Number(item.product.price),
      })),
    };

    createOrderMutation.mutate(orderData);
  };

  const updateShippingAddress = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <h1 className="text-2xl font-bold mb-4">Sign in to checkout</h1>
              <p className="text-gray-600 mb-6">You need to be signed in to complete your purchase.</p>
              <Button onClick={() => window.location.href = "/auth"}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
              <p className="text-gray-600 mb-6">Add items to your cart before checkout.</p>
              <Button onClick={() => setLocation("/search")}>
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">1. Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={shippingAddress.firstName}
                        onChange={(e) => updateShippingAddress("firstName", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={shippingAddress.lastName}
                        onChange={(e) => updateShippingAddress("lastName", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="address1">Address Line 1 *</Label>
                    <Input
                      id="address1"
                      value={shippingAddress.address1}
                      onChange={(e) => updateShippingAddress("address1", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                    <Input
                      id="address2"
                      value={shippingAddress.address2}
                      onChange={(e) => updateShippingAddress("address2", e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) => updateShippingAddress("city", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Select value={shippingAddress.state} onValueChange={(value) => updateShippingAddress("state", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NY">New York</SelectItem>
                          <SelectItem value="CA">California</SelectItem>
                          <SelectItem value="TX">Texas</SelectItem>
                          <SelectItem value="FL">Florida</SelectItem>
                          <SelectItem value="IL">Illinois</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        value={shippingAddress.zipCode}
                        onChange={(e) => updateShippingAddress("zipCode", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => updateShippingAddress("phone", e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">2. Delivery Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod} className="space-y-4">
                    {/* Ship to Address */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <RadioGroupItem value="ship-to" id="ship-to" />
                        <Label htmlFor="ship-to" className="font-medium cursor-pointer flex items-center">
                          <Truck className="w-5 h-5 mr-2" />
                          Ship to Address
                        </Label>
                      </div>
                      
                      {deliveryMethod === "ship-to" && (
                        <div className="ml-8 space-y-3">
                          <div className="flex items-center space-x-3 p-3 border rounded-md">
                            <input 
                              type="radio" 
                              name="shippingSpeed" 
                              value="standard" 
                              checked={shippingOption === "standard"}
                              onChange={(e) => setShippingOption(e.target.value)}
                              className="text-amazon-orange focus:ring-amazon-orange"
                            />
                            <Label className="flex-1 cursor-pointer">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium">FREE Standard Shipping</div>
                                  <div className="text-sm text-gray-600">Delivery by Dec 20-22 • No delivery fee</div>
                                </div>
                                <div className="font-bold text-green-600">FREE</div>
                              </div>
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-3 p-3 border rounded-md">
                            <input 
                              type="radio" 
                              name="shippingSpeed" 
                              value="express" 
                              checked={shippingOption === "express"}
                              onChange={(e) => setShippingOption(e.target.value)}
                              className="text-amazon-orange focus:ring-amazon-orange"
                            />
                            <Label className="flex-1 cursor-pointer">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium">Express Shipping</div>
                                  <div className="text-sm text-gray-600">Delivery by Dec 18 • Get it faster</div>
                                </div>
                                <div className="font-bold">$9.99</div>
                              </div>
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-3 p-3 border rounded-md">
                            <input 
                              type="radio" 
                              name="shippingSpeed" 
                              value="overnight" 
                              checked={shippingOption === "overnight"}
                              onChange={(e) => setShippingOption(e.target.value)}
                              className="text-amazon-orange focus:ring-amazon-orange"
                            />
                            <Label className="flex-1 cursor-pointer">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium">Overnight Shipping</div>
                                  <div className="text-sm text-gray-600">Delivery by Dec 16 • Next business day</div>
                                </div>
                                <div className="font-bold">$19.99</div>
                              </div>
                            </Label>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Local Delivery */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <RadioGroupItem value="local-delivery" id="local-delivery" />
                        <Label htmlFor="local-delivery" className="font-medium cursor-pointer flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Local Delivery
                        </Label>
                        <div className="ml-auto font-bold text-green-600">FREE</div>
                      </div>
                      
                      {deliveryMethod === "local-delivery" && (
                        <div className="ml-8 space-y-3">
                          {/* Store Pickup Submenu */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Picking Up From Store:</Label>
                            <Select value={pickupStore} onValueChange={setPickupStore}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a store location" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="store-001">Store #001 - Downtown Miami (123 Biscayne Blvd)</SelectItem>
                                <SelectItem value="store-002">Store #002 - Miami Beach (456 Ocean Drive)</SelectItem>
                                <SelectItem value="store-003">Store #003 - Coral Gables (789 Miracle Mile)</SelectItem>
                                <SelectItem value="store-004">Store #004 - Aventura (321 NE 207th St)</SelectItem>
                                <SelectItem value="store-005">Store #005 - Kendall (654 SW 88th St)</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="text-sm text-gray-600">
                              Your order will be ready for pickup within 2-4 hours during business hours (9 AM - 8 PM)
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">3. Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    {/* Credit Card */}
                    <div className="border rounded-md p-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="font-medium cursor-pointer">Credit or Debit Card</Label>
                        <div className="ml-auto flex space-x-2">
                          <CreditCard className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      
                      {paymentMethod === "card" && (
                        <div className="space-y-4 ml-6">
                          <div>
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <Input
                              id="cardNumber"
                              placeholder="1234 5678 9012 3456"
                              value={cardDetails.number}
                              onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="expiry">Expiry Date</Label>
                              <Input
                                id="expiry"
                                placeholder="MM/YY"
                                value={cardDetails.expiry}
                                onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="cvv">CVV</Label>
                              <Input
                                id="cvv"
                                placeholder="123"
                                value={cardDetails.cvv}
                                onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="cardName">Name on Card</Label>
                            <Input
                              id="cardName"
                              value={cardDetails.name}
                              onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* PayPal */}
                    <div className="flex items-center space-x-3 p-4 border rounded-md">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal" className="font-medium cursor-pointer">PayPal</Label>
                    </div>

                    {/* Apple Pay */}
                    <div className="flex items-center space-x-3 p-4 border rounded-md">
                      <RadioGroupItem value="applepay" id="applepay" />
                      <Label htmlFor="applepay" className="font-medium cursor-pointer">Apple Pay</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Billing Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">4. Billing Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sameAsBilling"
                      checked={sameAsBilling}
                      onCheckedChange={(checked) => setSameAsBilling(checked === true)}
                    />
                    <Label htmlFor="sameAsBilling">Same as shipping address</Label>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-32">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
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
                      <div className="flex-1">
                        <div className="text-sm font-medium">{item.product.name}</div>
                        <div className="text-xs text-gray-600">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-sm font-bold">
                        ${(Number(item.product.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span className={shippingCost === 0 ? "text-green-600" : ""}>
                      {shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-amazon-dark">${total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleSubmitOrder}
                  disabled={createOrderMutation.isPending}
                  className="w-full bg-amazon-orange hover:bg-orange-600 text-white font-semibold"
                >
                  {createOrderMutation.isPending ? "Placing Order..." : "Place Your Order"}
                </Button>

                <div className="text-xs text-gray-600 text-center">
                  By placing your order, you agree to our Terms & Conditions and Privacy Policy.
                </div>

                {/* Security Features */}
                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-green-600 mr-2" />
                    <span>Secure transaction</span>
                  </div>
                  <div className="flex items-center">
                    <Truck className="h-4 w-4 text-green-600 mr-2" />
                    <span>30-day return policy</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>2-year warranty included</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Minus, Plus, Trash2, ShoppingBag, X, Tag } from "lucide-react";
import { useState } from "react";

export default function Cart() {
  const { cartItems, cartCount, updateQuantity, removeFromCart, isLoading } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    name: string;
    discountAmount: number;
    discountType: string;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  if (!user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">Sign in to view your cart</h1>
              <p className="text-gray-600 mb-6">You need to be signed in to access your shopping cart.</p>
              <Link href="/auth">
                <Button>Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const subtotal = cartItems.reduce((total, item) => total + (Number(item.product.price) * item.quantity), 0);
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const subtotalAfterDiscount = subtotal - discount;
  const tax = subtotalAfterDiscount * 0.08; // 8% tax
  const total = subtotalAfterDiscount + tax;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a coupon code",
        variant: "destructive",
      });
      return;
    }

    setCouponLoading(true);
    try {
      const response = await apiRequest("POST", "/api/coupons/apply", {
        couponCode: couponCode.trim(),
        cartTotal: subtotal,
        cartItems: cartItems,
      });

      const result = await response.json();
      
      setAppliedCoupon({
        code: result.coupon.code,
        name: result.coupon.name,
        discountAmount: result.discountAmount,
        discountType: result.coupon.discountType,
      });
      
      setCouponCode("");
      
      const discountMessage = result.coupon.code === "1YEARFREE" 
        ? `${result.coupon.name} - You saved $${result.discountAmount.toFixed(2)} (12 months subscription value)`
        : `${result.coupon.name} - $${result.discountAmount.toFixed(2)} discount applied`;
        
      toast({
        title: "Coupon Applied!",
        description: discountMessage,
      });
    } catch (error: any) {
      toast({
        title: "Invalid Coupon",
        description: error.message || "This coupon code is not valid or has expired",
        variant: "destructive",
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    setCouponLoading(true);
    try {
      await apiRequest("DELETE", "/api/coupons/remove");
      setAppliedCoupon(null);
      
      toast({
        title: "Coupon Removed",
        description: "The coupon has been removed from your cart",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to remove coupon",
        variant: "destructive",
      });
    } finally {
      setCouponLoading(false);
    }
  };

  if (cartCount === 0) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
              <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
              <Button asChild>
                <Link href="/search">Continue Shopping</Link>
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
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h1 className="text-2xl font-bold mb-6">Shopping Cart ({cartCount} items)</h1>
                
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 border-b pb-6 last:border-b-0">
                      <div className="flex-shrink-0">
                        <Link href={`/product/${item.product.id}`}>
                          {item.product.images && item.product.images.length > 0 ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-24 h-24 object-cover rounded-md cursor-pointer hover:opacity-80"
                            />
                          ) : (
                            <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center">
                              <span className="text-gray-400 text-sm">No image</span>
                            </div>
                          )}
                        </Link>
                      </div>
                      
                      <div className="flex-1">
                        <Link href={`/product/${item.product.id}`}>
                          <h3 className="font-semibold text-lg hover:text-amazon-orange cursor-pointer">
                            {item.product.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 mb-2">
                          Brand: {item.product.brand || "Generic"}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-amazon-dark">
                            ${Number(item.product.price).toFixed(2)}
                          </span>
                          <div className="flex items-center space-x-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center border rounded-md">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={isLoading || item.quantity <= 1}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={isLoading || item.quantity >= item.product.stock}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            {/* Remove Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              disabled={isLoading}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {item.quantity >= item.product.stock && (
                          <p className="text-sm text-red-600 mt-1">
                            Maximum quantity available: {item.product.stock}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-32">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartCount} items):</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon ({appliedCoupon.code}):</span>
                      <span>-${appliedCoupon.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span className="text-green-600">
                      {appliedCoupon?.discountType === 'free_shipping' ? 'FREE (Coupon)' : 'FREE'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-amazon-dark">${total.toFixed(2)}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="text-sm text-green-600 text-center">
                      {appliedCoupon.code === "1YEARFREE" 
                        ? `You saved ${appliedCoupon.discountAmount.toFixed(2)} - 12 months subscription value with ${appliedCoupon.name}!`
                        : `You saved $${appliedCoupon.discountAmount.toFixed(2)} with ${appliedCoupon.name}!`
                      }
                    </div>
                  )}
                </div>

                <Button
                  className="w-full bg-amazon-orange hover:bg-orange-600 text-white mb-4"
                  disabled={isLoading}
                  asChild
                >
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>

                {/* Promo Code */}
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Promo Code
                  </h3>
                  
                  {appliedCoupon ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-green-800">{appliedCoupon.code}</div>
                          <div className="text-sm text-green-600">{appliedCoupon.name}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveCoupon}
                          disabled={couponLoading}
                          className="text-green-700 hover:text-green-800 hover:bg-green-100"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                      >
                        {couponLoading ? "..." : "Apply"}
                      </Button>
                    </div>
                  )}
                  
                  <div className="mt-2 text-xs text-gray-500">
                    Try: WELCOME10, SAVE20, FREESHIP, FLASH25, 1YEARFREE (subscriptions)
                  </div>
                </div>

                {/* Security Info */}
                <div className="mt-6 pt-4 border-t text-sm text-gray-600 space-y-2">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span>Secure 256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span>30-day return guarantee</span>
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

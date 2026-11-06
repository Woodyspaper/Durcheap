import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Tag, Calculator } from "lucide-react";

export default function CouponTest() {
  const { toast } = useToast();
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    name: string;
    discountAmount: number;
    discountType: string;
  } | null>(null);

  // Simulated cart items for testing
  const testCartItems = [
    {
      product: {
        id: "api_access_premium",
        name: "Premium API Access",
        price: "39.99",
        categoryId: "subscription_plans"
      },
      quantity: 1
    },
    {
      product: {
        id: "tax_automation_service", 
        name: "Tax Automation Service",
        price: "7.99",
        categoryId: "subscription_plans"
      },
      quantity: 1
    },
    {
      product: {
        id: "shipping_tools_premium",
        name: "Premium Shipping Tools", 
        price: "4.99",
        categoryId: "subscription_plans"
      },
      quantity: 1
    },
    {
      product: {
        id: "event_marketing_city",
        name: "City Event Marketing",
        price: "24.99", 
        categoryId: "subscription_plans"
      },
      quantity: 1
    },
    {
      product: {
        id: "subscription_enterprise",
        name: "Enterprise Subscription Plan",
        price: "99.00",
        categoryId: "subscription_plans" 
      },
      quantity: 1
    }
  ];

  const subtotal = testCartItems.reduce((total, item) => 
    total + (Number(item.product.price) * item.quantity), 0
  );

  const yearlyValue = testCartItems.reduce((total, item) => {
    const monthlyPrice = Number(item.product.price);
    return total + (monthlyPrice * 12 * item.quantity);
  }, 0);

  const simulateYearFreeCoupon = () => {
    // Provide exactly 12 months of subscription value as discount
    const discountAmount = yearlyValue;
    
    setAppliedCoupon({
      code: "1YEARFREE",
      name: "1 Year Free Subscription Value",
      discountAmount,
      discountType: "subscription_only"
    });

    toast({
      title: "1YEARFREE Coupon Applied!",
      description: `You saved $${discountAmount.toFixed(2)} (12 months subscription value)`,
    });
  };

  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = Math.max(0, subtotal - discount);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">1YEARFREE Coupon Demonstration</h1>
            <p className="text-gray-600">Testing the 12-month subscription value limitation</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Cart Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Test Cart Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {testCartItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-sm text-gray-500">
                          ${item.product.price}/month × {item.quantity}
                        </div>
                      </div>
                      <Badge variant="secondary">
                        ${(Number(item.product.price) * item.quantity).toFixed(2)}
                      </Badge>
                    </div>
                  ))}
                  
                  <div className="border-t pt-3 mt-4">
                    <div className="flex justify-between font-medium">
                      <span>Monthly Total:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>12-Month Value:</span>
                      <span>${yearlyValue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coupon Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Coupon Testing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Calculation Logic
                    </h3>
                    <div className="text-sm space-y-1">
                      <div>Monthly total: ${subtotal.toFixed(2)}</div>
                      <div>12-month value: ${yearlyValue.toFixed(2)}</div>
                      <div className="font-medium text-blue-700">
                        1YEARFREE discount: ${yearlyValue.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-600 mt-2">
                        *Discount provides exactly 12 months worth of subscription value
                      </div>
                    </div>
                  </div>

                  {!appliedCoupon ? (
                    <Button 
                      onClick={simulateYearFreeCoupon}
                      className="w-full"
                    >
                      Apply 1YEARFREE Coupon
                    </Button>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-green-800">
                            {appliedCoupon.code}
                          </div>
                          <div className="text-sm text-green-600">
                            {appliedCoupon.name}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          -${appliedCoupon.discountAmount.toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      
                      {appliedCoupon && (
                        <div className="flex justify-between text-green-600">
                          <span>Coupon Discount:</span>
                          <span>-${discount.toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                      
                      {appliedCoupon && (
                        <div className="text-sm text-green-600 text-center mt-2">
                          You saved ${discount.toFixed(2)} - 12 months subscription value!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Test Results Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">${subtotal.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Monthly Cart Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">${yearlyValue.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">12-Month Value</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    ${yearlyValue.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">1YEARFREE Discount</div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Result:</strong> The 1YEARFREE coupon provides exactly 12 months worth of subscription value 
                  (${yearlyValue.toFixed(2)}) as a discount. With monthly charges totaling ${subtotal.toFixed(2)}, 
                  this coupon effectively covers 12 full months of all subscription services in your cart.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
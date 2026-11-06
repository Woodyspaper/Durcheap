import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Truck, MapPin, Calculator, Download, BarChart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { Layout } from "@/components/Layout";

export default function ShippingTools() {
  const { user, isAuthenticated } = useAuth();
  const [selectedCarrier, setSelectedCarrier] = useState("");
  const [shippingRates, setShippingRates] = useState<Array<{
    carrier: string;
    service: string;
    price: string;
    days: string;
  }>>([]);
  const [calculatorData, setCalculatorData] = useState({
    weight: "",
    length: "",
    width: "",
    height: "",
    fromZip: "",
    toZip: "",
    serviceType: ""
  });
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleUpgrade = async () => {
    try {
      await addToCart("shipping_tools_premium", 1);
      toast({
        title: "Added to Cart",
        description: "Premium Shipping Tools added to your cart successfully!",
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

  // Mock shipping rates for demonstration
  const mockRates = [
    { carrier: "USPS", service: "Ground Advantage", price: "$8.45", days: "3-5 business days" },
    { carrier: "USPS", service: "Priority Mail", price: "$12.90", days: "1-3 business days" },
    { carrier: "UPS", service: "Ground", price: "$11.25", days: "3-5 business days" },
    { carrier: "UPS", service: "3 Day Select", price: "$16.80", days: "3 business days" },
    { carrier: "FedEx", service: "Ground", price: "$10.95", days: "3-5 business days" },
    { carrier: "FedEx", service: "Express Saver", price: "$18.45", days: "3 business days" },
    { carrier: "Local Delivery", service: "Same Day", price: "$7.99", days: "Same day" },
  ];

  const calculateRates = () => {
    // In real implementation, this would call shipping APIs
    setShippingRates(mockRates);
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Shipping Tools</h2>
            <p className="text-gray-600 mb-4">Access shipping calculators, label printing, and logistics management</p>
            <Button onClick={() => window.location.href = "/auth"}>
              Sign In to Access Shipping Tools
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Shipping Tools</h1>
        <p className="text-gray-600">
          Comprehensive shipping management for sellers and buyers
        </p>
      </div>

      {/* Premium Shipping Tools Upgrade */}
      <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-amazon-orange">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Star className="h-8 w-8 text-amazon-orange" />
              <div>
                <h3 className="text-xl font-bold text-amazon-dark">Premium Shipping Tools</h3>
                <p className="text-gray-600">Advanced shipping management with multi-carrier comparison and analytics</p>
                <Badge className="mt-2 bg-amazon-orange text-white">$4.99/month</Badge>
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

      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="calculator">Rate Calculator</TabsTrigger>
          <TabsTrigger value="labels">Label Management</TabsTrigger>
          <TabsTrigger value="tracking">Order Tracking</TabsTrigger>
          <TabsTrigger value="analytics">Shipping Analytics</TabsTrigger>
        </TabsList>

        {/* Rate Calculator Tab */}
        <TabsContent value="calculator">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Shipping Rate Calculator
                </CardTitle>
                <CardDescription>
                  Compare rates across multiple carriers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight">Weight (lbs)</Label>
                    <Input
                      id="weight"
                      placeholder="2.5"
                      value={calculatorData.weight}
                      onChange={(e) => setCalculatorData({...calculatorData, weight: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="serviceType">Service Type</Label>
                    <Select value={calculatorData.serviceType} onValueChange={(value) => setCalculatorData({...calculatorData, serviceType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ground">Ground</SelectItem>
                        <SelectItem value="express">Express</SelectItem>
                        <SelectItem value="overnight">Overnight</SelectItem>
                        <SelectItem value="same-day">Same Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="length">Length (in)</Label>
                    <Input
                      id="length"
                      placeholder="12"
                      value={calculatorData.length}
                      onChange={(e) => setCalculatorData({...calculatorData, length: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="width">Width (in)</Label>
                    <Input
                      id="width"
                      placeholder="8"
                      value={calculatorData.width}
                      onChange={(e) => setCalculatorData({...calculatorData, width: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height (in)</Label>
                    <Input
                      id="height"
                      placeholder="6"
                      value={calculatorData.height}
                      onChange={(e) => setCalculatorData({...calculatorData, height: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fromZip">From ZIP</Label>
                    <Input
                      id="fromZip"
                      placeholder="90210"
                      value={calculatorData.fromZip}
                      onChange={(e) => setCalculatorData({...calculatorData, fromZip: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="toZip">To ZIP</Label>
                    <Input
                      id="toZip"
                      placeholder="10001"
                      value={calculatorData.toZip}
                      onChange={(e) => setCalculatorData({...calculatorData, toZip: e.target.value})}
                    />
                  </div>
                </div>

                <Button onClick={calculateRates} className="w-full">
                  Calculate Shipping Rates
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rate Comparison Results</CardTitle>
                <CardDescription>
                  Best shipping options for your package
                </CardDescription>
              </CardHeader>
              <CardContent>
                {shippingRates.length > 0 ? (
                  <div className="space-y-3">
                    {shippingRates.map((rate, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Truck className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">{rate.carrier}</p>
                            <p className="text-sm text-gray-600">{rate.service}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{rate.price}</p>
                          <p className="text-sm text-gray-600">{rate.days}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Truck className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-600">Enter package details to compare rates</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Label Management Tab */}
        <TabsContent value="labels">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Recent Shipping Labels
                </CardTitle>
                <CardDescription>
                  Manage and reprint shipping labels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mock shipping labels */}
                  {[
                    { id: "LBL001", order: "ORD-2024-001", carrier: "USPS", status: "printed", date: "2024-01-15" },
                    { id: "LBL002", order: "ORD-2024-002", carrier: "UPS", status: "shipped", date: "2024-01-14" },
                    { id: "LBL003", order: "ORD-2024-003", carrier: "FedEx", status: "delivered", date: "2024-01-13" },
                  ].map((label) => (
                    <div key={label.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{label.order}</p>
                          <p className="text-sm text-gray-600">{label.carrier} • {label.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={label.status === "delivered" ? "default" : "secondary"}>
                          {label.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bulk Actions</CardTitle>
                <CardDescription>
                  Process multiple shipments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" variant="outline">
                  <Package className="h-4 w-4 mr-2" />
                  Batch Print Labels
                </Button>
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button className="w-full" variant="outline">
                  <Truck className="h-4 w-4 mr-2" />
                  Schedule Pickup
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Order Tracking Tab */}
        <TabsContent value="tracking">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Order Tracking
              </CardTitle>
              <CardDescription>
                Track shipments and delivery status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <Input placeholder="Enter tracking number..." className="flex-1" />
                  <Button>Track Package</Button>
                </div>

                {/* Mock tracking results */}
                <div className="space-y-4">
                  {[
                    { order: "ORD-2024-001", status: "In Transit", location: "Los Angeles, CA", estimated: "Jan 18, 2024" },
                    { order: "ORD-2024-002", status: "Delivered", location: "Customer Address", estimated: "Jan 15, 2024" },
                    { order: "ORD-2024-003", status: "Processing", location: "Fulfillment Center", estimated: "Jan 20, 2024" },
                  ].map((tracking, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{tracking.order}</h4>
                        <Badge variant={tracking.status === "Delivered" ? "default" : "secondary"}>
                          {tracking.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">Last seen: {tracking.location}</p>
                      <p className="text-sm text-gray-600">Expected delivery: {tracking.estimated}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Shipping Performance
                </CardTitle>
                <CardDescription>
                  Key shipping metrics and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">$2,450</p>
                      <p className="text-sm text-blue-600">Total Shipping Costs</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">94%</p>
                      <p className="text-sm text-green-600">On-Time Delivery</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">3.2 days</p>
                      <p className="text-sm text-orange-600">Avg Delivery Time</p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">$11.50</p>
                      <p className="text-sm text-purple-600">Avg Shipping Cost</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Carrier Performance</CardTitle>
                <CardDescription>
                  Compare carrier reliability and costs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { carrier: "USPS", deliveries: 45, onTime: 92, avgCost: "$9.50" },
                    { carrier: "UPS", deliveries: 38, onTime: 96, avgCost: "$12.80" },
                    { carrier: "FedEx", deliveries: 31, onTime: 98, avgCost: "$14.20" },
                    { carrier: "Local", deliveries: 22, onTime: 91, avgCost: "$7.99" },
                  ].map((carrier) => (
                    <div key={carrier.carrier} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{carrier.carrier}</p>
                        <p className="text-sm text-gray-600">{carrier.deliveries} deliveries</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{carrier.onTime}% on-time</p>
                        <p className="text-sm text-gray-600">{carrier.avgCost} avg</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { 
  TrendingUp, 
  Target, 
  Star, 
  Calendar,
  BarChart3,
  Megaphone,
  ArrowRight,
  CheckCircle,
  Eye,
  Users,
  DollarSign
} from "lucide-react";

export default function AdvertiseProducts() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Advertise Your Products on Durcheap
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Premium marketplace advertising at a fraction of major platform costs. While Amazon sellers spend $500-$20,000/month and face unpredictable CPC rates, 
                get guaranteed visibility with fixed weekly pricing starting at just $40.
              </p>
              <div className="mt-6 p-4 bg-green-50 rounded-lg inline-block">
                <p className="text-green-800 font-semibold">
                  🎯 Save 50-95% compared to Amazon advertising • No bid wars • Guaranteed placement duration
                </p>
              </div>
            </div>

            {/* Key Benefits */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardContent className="p-6 text-center">
                  <Eye className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Increased Visibility</h3>
                  <p className="text-gray-600">Get your products seen by millions of active shoppers</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Higher Sales</h3>
                  <p className="text-gray-600">Promoted products see 3x more clicks and conversions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Target className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Targeted Reach</h3>
                  <p className="text-gray-600">Reach customers actively searching for your products</p>
                </CardContent>
              </Card>
            </div>

            {/* Competitive Comparison */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-center mb-8">Why Choose Durcheap Advertising?</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-4 font-semibold border-b">Feature</th>
                      <th className="text-center p-4 font-semibold border-b text-blue-600">Durcheap</th>
                      <th className="text-center p-4 font-semibold border-b text-gray-600">Amazon</th>
                      <th className="text-center p-4 font-semibold border-b text-gray-600">Industry Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-4 border-b font-medium">Homepage Placement</td>
                      <td className="p-4 border-b text-center text-green-600 font-semibold">$200/week</td>
                      <td className="p-4 border-b text-center text-red-600">$1,400-$2,100/week</td>
                      <td className="p-4 border-b text-center text-red-600">$450,000/day (Yahoo)</td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b font-medium">Category Highlights</td>
                      <td className="p-4 border-b text-center text-green-600 font-semibold">$100/week</td>
                      <td className="p-4 border-b text-center text-red-600">$1,000-$5,000/month</td>
                      <td className="p-4 border-b text-center text-red-600">$1.50-$2.50 CPC</td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b font-medium">Search Boosting</td>
                      <td className="p-4 border-b text-center text-green-600 font-semibold">$40/week</td>
                      <td className="p-4 border-b text-center text-red-600">$125-$500/week</td>
                      <td className="p-4 border-b text-center text-red-600">$5.26+ CPC</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Pricing Model</td>
                      <td className="p-4 text-center text-green-600 font-semibold">Fixed Weekly</td>
                      <td className="p-4 text-center text-orange-600">Variable CPC</td>
                      <td className="p-4 text-center text-orange-600">Bidding Wars</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="text-center mt-6">
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-semibold">Save 50-95% on advertising costs with guaranteed placement</span>
                </div>
              </div>
            </div>

            {/* Advertising Options */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-center mb-8">Choose Your Advertising Strategy</h2>
              
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Promoted Products */}
                <Card className="border-2 border-blue-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="h-6 w-6 text-blue-500" />
                        <CardTitle>Promoted Products</CardTitle>
                      </div>
                      <Badge variant="secondary">Popular</Badge>
                    </div>
                    <CardDescription>
                      Feature your products prominently across the marketplace
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Homepage carousel spots
                        </span>
                        <div className="text-right">
                          <span className="font-semibold text-green-600">$200/week</span>
                          <div className="text-xs text-gray-500">95% less than major sites</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Category page highlights
                        </span>
                        <div className="text-right">
                          <span className="font-semibold text-green-600">$100/week</span>
                          <div className="text-xs text-gray-500">vs $1,000-$5,000/month on Amazon</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Search result boosting
                        </span>
                        <div className="text-right">
                          <span className="font-semibold text-green-600">$40/week</span>
                          <div className="text-xs text-gray-500">vs $5.26+ CPC industry average</div>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full mt-6" asChild>
                      <Link href="/all-options">
                        Purchase Advertising Products
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Event Marketing */}
                <Card className="border-2 border-purple-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-6 w-6 text-purple-500" />
                        <CardTitle>Event Marketing</CardTitle>
                      </div>
                      <Badge variant="outline">Trending</Badge>
                    </div>
                    <CardDescription>
                      Create events to showcase your products and build community
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          City Event Marketing
                        </span>
                        <span className="font-semibold">$24.99/month</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Metro Event Marketing
                        </span>
                        <span className="font-semibold">$49.99/month</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Nationwide Event Marketing
                        </span>
                        <span className="font-semibold">$149.99/month</span>
                      </div>
                    </div>
                    <Button className="w-full mt-6" variant="outline" asChild>
                      <Link href="/event-advertising">
                        Explore Event Marketing
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Subscription Plan Benefits */}
            <Card className="mb-12 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Maximize Your Advertising ROI</CardTitle>
                <CardDescription>
                  Seller subscription plans include advertising benefits and discounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-2">Basic Plan</h4>
                      <p className="text-sm text-gray-600 mb-3">Free</p>
                      <ul className="text-sm space-y-1">
                        <li>• Standard product listings</li>
                        <li>• Basic search visibility</li>
                        <li>• 2 events per month</li>
                      </ul>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-blue-300">
                      <Badge className="mb-2">Most Popular</Badge>
                      <h4 className="font-semibold text-gray-900 mb-2">Pro Plan</h4>
                      <p className="text-sm text-gray-600 mb-3">$29/month</p>
                      <ul className="text-sm space-y-1">
                        <li>• Featured product placements</li>
                        <li>• 50% off event advertising</li>
                        <li>• Once Weekly Event Listings</li>
                        <li>• Advanced analytics</li>
                      </ul>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-2">Enterprise</h4>
                      <p className="text-sm text-gray-600 mb-3">$99/month</p>
                      <ul className="text-sm space-y-1">
                        <li>• Premium featured placement</li>
                        <li>• FREE event advertising</li>
                        <li>• Unlimited Event Listings</li>
                        <li>• Custom marketing tools</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-6">
                  <Button size="lg" asChild>
                    <Link href="/subscription">
                      View All Subscription Plans
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Analytics & Performance */}
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Track Your Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Real-time impression tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Click-through rate analytics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Conversion tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>ROI reporting</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline" asChild>
                    <Link href="/analytics-pro">
                      View Analytics Pro Suite
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Reach Your Audience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Local customer targeting</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Category-based promotion</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Search keyword optimization</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Mobile app visibility</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline" asChild>
                    <Link href="/local-events">
                      Explore Local Marketing
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Success Stories */}
            <Card className="mb-12">
              <CardHeader className="text-center">
                <CardTitle>Success Stories</CardTitle>
                <CardDescription>See how sellers are growing with Durcheap advertising</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <span className="font-semibold">300% Sales Increase</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      "After promoting our products on the homepage carousel, we saw a 300% increase in sales within the first month."
                    </p>
                    <div className="text-xs text-gray-500">- Local Electronics Store</div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-5 w-5 text-blue-500" />
                      <span className="font-semibold">50+ New Customers</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      "Event marketing helped us connect with our local community. We gained 50+ regular customers through our workshops."
                    </p>
                    <div className="text-xs text-gray-500">- Artisan Crafts Shop</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA Section */}
            <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-4">Ready to Boost Your Sales?</h2>
              <p className="text-xl mb-6">
                Start advertising your products today and watch your business grow
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/product-form">
                    <Megaphone className="h-5 w-5 mr-2" />
                    Start Advertising Now
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600" asChild>
                  <Link href="/all-options">
                    <DollarSign className="h-5 w-5 mr-2" />
                    View All Options
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
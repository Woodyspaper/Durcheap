import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  ShoppingCart, Package, Zap, Crown, 
  Truck, FileText, BarChart3, Code,
  Eye, Target, Search, Shield, TrendingUp, Star, MapPin, Building2, Map, Globe, Plane,
  Calendar, Users, MessageSquare, Mail
} from "lucide-react";

export default function AllOptions() {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleAddToCart = async (productId: string, productName: string) => {
    try {
      await addToCart(productId, 1);
      toast({
        title: "Added to Cart",
        description: `${productName} added to your cart successfully!`,
      });
      setLocation('/cart');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Promoted Products
  const promotedProducts = [
    {
      id: "homepage_carousel",
      name: "Homepage Carousel",
      price: 200.00,
      period: "week",
      description: "Premium homepage carousel placement at a fraction of major marketplace costs. While Yahoo charges $450,000/day and Amazon sellers spend $1,400-$2,100/week, get maximum visibility for just $200/week.",
      icon: Eye,
      features: ["Homepage carousel placement", "Maximum visibility", "5-10x more clicks", "95% less than major sites", "One week guaranteed", "No bid competition", "Fixed pricing vs CPC volatility"]
    },
    {
      id: "promoted_category_highlights",
      name: "Category Page Highlights", 
      price: 100.00,
      period: "week",
      description: "Featured category placement with guaranteed visibility. Amazon Sponsored Brands cost $1.50-$2.50 CPC with $1,000-$5,000 monthly budgets - our fixed weekly rate eliminates unpredictable costs.",
      icon: Target,
      features: ["Category page highlights", "Enhanced visibility", "300% more clicks", "50-75% less than Amazon equivalent", "One week guaranteed", "No CPC bidding wars", "Predictable advertising costs"]
    },
    {
      id: "promoted_search_boosting",
      name: "Search Result Boosting",
      price: 40.00,
      period: "week", 
      description: "Top search placement at outstanding value. While industry average is $5.26 CPC (some reach $137+ CPC) and Amazon sellers spend $125-$500/week, get guaranteed search visibility for just $40/week.",
      icon: Search,
      features: ["Top search placement", "Keyword optimization", "Enhanced discovery", "90% less than industry average", "One week guaranteed", "No budget depletion risk", "Fraction of Amazon search costs"]
    }
  ];

  // Single Purchase Products
  const singlePurchaseProducts = [
    {
      id: "business_verification",
      name: "Business Verification",
      price: 24.00,
      description: "Official business verification with trust badges and compliance tools.",
      icon: Shield,
      features: ["Official verification", "Trust badge", "Document upload", "Enhanced credibility", "Priority support", "Compliance tracking"]
    },
    {
      id: "single_event_sponsored",
      name: "Sponsored Event Listing",
      price: 29.99,
      description: "Get your event featured in search results with premium placement.",
      icon: TrendingUp,
      features: ["Premium placement", "Enhanced visibility", "Search priority", "7-day listing"]
    },
    {
      id: "single_event_featured",
      name: "Featured Event Spotlight",
      price: 39.99,
      description: "Maximum visibility with homepage banner and social media promotion.",
      icon: Star,
      features: ["Premium placement", "Enhanced visibility", "Search priority", "Homepage banner", "Social media boost", "Analytics report", "7-day listing"]
    },
    {
      id: "single_event_city",
      name: "City Event Notice",
      price: 9.99,
      description: "Promote your event to local city audiences with targeted visibility.",
      icon: MapPin,
      features: ["City-wide targeting", "Local visibility", "Basic promotion", "7-day listing"]
    },
    {
      id: "single_event_metro",
      name: "Metro Event Notice",
      price: 24.99,
      description: "Reach the entire metropolitan area with enhanced event promotion.",
      icon: Building2,
      features: ["Metro area coverage", "Enhanced targeting", "Priority placement", "7-day listing"]
    },
    {
      id: "single_event_state",
      name: "State Event Notice",
      price: 49.99,
      description: "State-wide event promotion for maximum regional impact.",
      icon: Map,
      features: ["State-wide coverage", "Regional targeting", "Premium placement", "7-day listing"]
    },
    {
      id: "single_event_national",
      name: "National Event Notice",
      price: 99.99,
      description: "Nationwide event promotion with coast-to-coast visibility.",
      icon: Globe,
      features: ["National coverage", "Major market targeting", "Featured placement", "7-day listing"]
    },
    {
      id: "single_event_international",
      name: "International Event Notice",
      price: 199.99,
      description: "Global event promotion reaching international audiences.",
      icon: Plane,
      features: ["International reach", "Multi-language support", "Global placement", "7-day listing"]
    }
  ];

  // Merchant Account Plans
  const merchantAccountPlans = [
    {
      id: "subscription_basic",
      name: "Basic Plan",
      price: 0,
      originalPrice: null,
      period: "month",
      description: "Perfect for getting started with essential marketplace tools.",
      icon: Package,
      popular: false,
      features: [
        "13 product listings",
        "Basic seller dashboard",
        "Standard customer support",
        "Mobile app access",
        "10% commission rate",
        "2 events per month"
      ]
    },
    {
      id: "subscription_pro",
      name: "Pro Plan",
      price: 29.00,
      originalPrice: null,
      period: "month",
      description: "Most popular for growing businesses and serious sellers.",
      icon: Zap,
      popular: true,
      features: [
        "Up to 100 listings",
        "7% commission",
        "Advanced seller tools",
        "Priority support",
        "Detailed analytics",
        "Local shipping incentives (30% off commissions on $150+ orders)",
        "Inventory management",
        "Bulk operations",
        "Once Monthly Event Marketing Metro Subscription FREE for 1st year",
        "Event performance analytics",
        "Sponsored event listings (50% discount)"
      ]
    },
    {
      id: "subscription_enterprise",
      name: "Enterprise Plan",
      price: 99.00,
      originalPrice: null,
      period: "month",
      description: "Complete all-in-one solution with $210+ in services included at no additional cost.",
      icon: Crown,
      popular: true,
      features: [
        "Unlimited listings",
        "5% commission",
        "Enterprise seller tools",
        "Dedicated account manager",
        "Unlimited Event Listings",
        "✓ Analytics Pro Suite included ($39.99 value)",
        "✓ Business Verification included ($24 value)",
        "✓ Premium API Access included ($49.99 value)",
        "✓ Premium Shipping Tools included ($4.99 value)",
        "✓ Tax Automation Service included ($7.99 value)",
        "✓ Local+ Membership included ($4.99 value)",
        "✓ Nationwide Event Marketing FREE for 1st year ($149.99 value)",
        "Premium event analytics & insights",
        "Featured event placement",
        "Custom event branding & themes",
        "Event automation & scheduling tools",
        "Enhanced local shipping incentives (40% off commissions on $150+ orders)",
        "Custom analytics & reporting",
        "Custom integrations & webhooks",
        "Priority technical support",
        "Advanced bulk operations",
        "Multi-location inventory management",
        "International shipping tools"
      ]
    }
  ];

  // Event Marketing Plans
  const eventMarketingPlans = [
    {
      id: "event_marketing_city",
      name: "City Marketing",
      price: 24.99,
      originalPrice: null,
      period: "month",
      description: "Target local city audiences with monthly event promotions.",
      icon: Calendar,
      popular: false,
      features: [
        "Monthly event posts",
        "City-wide targeting",
        "Basic analytics",
        "Email notifications",
        "Social media integration"
      ]
    },
    {
      id: "event_marketing_metro",
      name: "Metro Marketing",
      price: 49.99,
      originalPrice: null,
      period: "month",
      description: "Reach entire metropolitan areas with enhanced visibility.",
      icon: Users,
      popular: true,
      features: [
        "Bi-weekly event posts",
        "Metro area coverage",
        "Enhanced analytics",
        "Priority placement",
        "Cross-platform promotion"
      ]
    },
    {
      id: "event_marketing_state",
      name: "State Marketing",
      price: 99.99,
      originalPrice: null,
      period: "month",
      description: "State-wide event marketing with premium features.",
      icon: MessageSquare,
      popular: false,
      features: [
        "Weekly event posts",
        "State-wide coverage",
        "Premium analytics",
        "Featured placement",
        "Multi-channel promotion"
      ]
    },
    {
      id: "event_marketing_national",
      name: "National Marketing",
      price: 149.99,
      originalPrice: null,
      period: "month",
      description: "Coast-to-coast event marketing with maximum reach.",
      icon: Mail,
      popular: false,
      features: [
        "Daily event posts",
        "National coverage",
        "Advanced analytics",
        "Premium placement",
        "Comprehensive promotion"
      ]
    }
  ];

  // Add On Features
  const addOnFeatures = [
    {
      id: "shipping_tools_premium",
      name: "Premium Shipping Tools",
      price: 4.99,
      originalPrice: null,
      period: "month",
      description: "Advanced shipping management and optimization tools.",
      icon: Truck,
      popular: false,
      features: [
        "Multi-carrier rate comparison",
        "Automated label printing",
        "Package tracking",
        "Local delivery network",
        "Shipping analytics",
        "Customer notifications"
      ]
    },
    {
      id: "tax_automation_service",
      name: "Tax Automation Service",
      price: 7.99,
      originalPrice: null,
      period: "month",
      description: "Automated tax calculations and document generation.",
      icon: FileText,
      popular: false,
      features: [
        "Automatic tax calculations",
        "1099-K form generation",
        "Sales tax reports",
        "Multi-state compliance",
        "Quarterly summaries",
        "Expert support"
      ]
    },
    {
      id: "analytics_pro",
      name: "Analytics Pro Suite",
      price: 39.99,
      originalPrice: null,
      period: "month",
      description: "Advanced analytics with competitor insights, market trends, and custom reporting.",
      icon: BarChart3,
      popular: false,
      features: [
        "Advanced analytics dashboard",
        "Competitor tracking & insights",
        "Market trend analysis",
        "Custom reporting tools",
        "Data export (CSV, PDF)",
        "Customer behavior analysis",
        "Performance benchmarking",
        "Real-time data visualization"
      ]
    },
    {
      id: "api_access_premium",
      name: "Premium API Access",
      price: 49.99,
      originalPrice: null,
      period: "month",
      description: "Full API access for custom integrations and advanced automation.",
      icon: Code,
      popular: false,
      features: [
        "Full REST API access",
        "Webhook notifications",
        "Custom integrations",
        "Developer documentation",
        "Technical support",
        "Rate limit: 10,000/hour"
      ]
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">See All Options</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our complete range of products and subscription plans designed to help you succeed both online and locally.
            </p>
          </div>

          {/* Subscription Plans */}
          <div className="space-y-16 mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Subscription Plans</h2>
            
            {/* Merchant Account Plans */}
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-center">Merchant Account Plans</h3>
              <div className="grid lg:grid-cols-3 gap-6">
                {merchantAccountPlans.map((plan) => {
                  const IconComponent = plan.icon;
                  return (
                    <Card 
                      key={plan.id} 
                      className={`relative hover:shadow-lg transition-shadow ${
                        plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-blue-500 text-white px-3 py-1">Most Popular</Badge>
                        </div>
                      )}
                      
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${plan.popular ? 'bg-blue-100' : 'bg-gray-100'}`}>
                            <IconComponent className={`h-6 w-6 ${plan.popular ? 'text-blue-600' : 'text-gray-600'}`} />
                          </div>
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                        </div>
                        <div className="flex items-baseline gap-1">
                          {plan.price === 0 ? (
                            <div className="text-3xl font-bold text-green-600">Free</div>
                          ) : (
                            <>
                              <div className={`text-3xl font-bold ${plan.popular ? 'text-blue-600' : 'text-gray-900'}`}>
                                ${plan.price}
                              </div>
                              <span className="text-lg font-normal text-gray-500">/{plan.period}</span>
                            </>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <p className="text-gray-600 mb-4 text-sm">{plan.description}</p>
                        <ul className="space-y-2 mb-6">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full mt-2 ${plan.popular ? 'bg-blue-500' : 'bg-gray-400'}`} />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button 
                          onClick={() => handleAddToCart(plan.id, plan.name)}
                          className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'}`}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {plan.price === 0 ? 'Get Started' : 'Add to Cart'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Product Advertising */}
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-center">Product Advertising (Weekly)</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {promotedProducts.map((product) => {
                  const IconComponent = product.icon;
                  return (
                    <Card key={product.id} className="relative hover:shadow-lg transition-shadow border-2 border-yellow-200">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <IconComponent className="h-6 w-6 text-yellow-600" />
                          </div>
                          <CardTitle className="text-xl">{product.name}</CardTitle>
                        </div>
                        <div className="text-3xl font-bold text-yellow-600">
                          ${product.price}
                          <span className="text-lg font-normal text-gray-500 ml-1">/{product.period}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4">{product.description}</p>
                        <ul className="space-y-2 mb-6">
                          {product.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button 
                          onClick={() => handleAddToCart(product.id, product.name)}
                          className="w-full bg-yellow-600 hover:bg-yellow-700"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Event Marketing Plans */}
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-center">Event Marketing Plans</h3>
              <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-6">
                {eventMarketingPlans.map((plan) => {
                  const IconComponent = plan.icon;
                  return (
                    <Card 
                      key={plan.id} 
                      className={`relative hover:shadow-lg transition-shadow ${
                        plan.popular ? 'ring-2 ring-purple-500 shadow-lg' : ''
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-purple-500 text-white px-3 py-1">Most Popular</Badge>
                        </div>
                      )}
                      
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <IconComponent className="h-6 w-6 text-purple-600" />
                          </div>
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <div className="text-3xl font-bold text-purple-600">
                            ${plan.price}
                          </div>
                          <span className="text-lg font-normal text-gray-500">/{plan.period}</span>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <p className="text-gray-600 mb-4 text-sm">{plan.description}</p>
                        <ul className="space-y-2 mb-6">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full mt-2 bg-purple-500" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button 
                          onClick={() => handleAddToCart(plan.id, plan.name)}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Add On Features */}
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-center">Add On Features</h3>
              <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-6">
                {addOnFeatures.map((feature) => {
                  const IconComponent = feature.icon;
                  return (
                    <Card 
                      key={feature.id} 
                      className="relative hover:shadow-lg transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <IconComponent className="h-6 w-6 text-green-600" />
                          </div>
                          <CardTitle className="text-lg">{feature.name}</CardTitle>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <div className="text-3xl font-bold text-green-600">
                            ${feature.price}
                          </div>
                          <span className="text-lg font-normal text-gray-500">/{feature.period}</span>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <p className="text-gray-600 mb-4 text-sm">{feature.description}</p>
                        <ul className="space-y-2 mb-6">
                          {feature.features.map((feat, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full mt-2 bg-green-500" />
                              <span className="text-sm">{feat}</span>
                            </li>
                          ))}
                        </ul>
                        <Button 
                          onClick={() => handleAddToCart(feature.id, feature.name)}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          {/* One-Time Purchases */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">One-Time Purchases</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {singlePurchaseProducts.map((product) => {
                const IconComponent = product.icon;
                return (
                  <Card key={product.id} className="relative hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <IconComponent className="h-6 w-6 text-blue-600" />
                        </div>
                        <CardTitle className="text-xl">{product.name}</CardTitle>
                      </div>
                      <div className="text-3xl font-bold text-blue-600">
                        ${product.price}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{product.description}</p>
                      <ul className="space-y-2 mb-6">
                        {product.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        onClick={() => handleAddToCart(product.id, product.name)}
                        className="w-full"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">Need Help Choosing?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our team can help you select the perfect combination of products and plans for your business needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Contact Sales
              </Button>
              <Button size="lg" variant="outline">
                View Comparison Chart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
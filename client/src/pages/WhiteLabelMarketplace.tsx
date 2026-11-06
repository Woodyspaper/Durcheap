import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Star, Building, Code, Palette, Shield, HeadphonesIcon, Zap, BarChart } from "lucide-react";

export default function WhiteLabelMarketplace() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleAddToCart = async () => {
    try {
      await addToCart("white_label_enterprise", 1);
      toast({
        title: "Added to Cart",
        description: "White-Label Marketplace Solution added to your cart successfully!",
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

  const features = [
    {
      icon: <Building className="h-6 w-6" />,
      title: "Complete Marketplace Platform",
      description: "Full-featured e-commerce marketplace with all Durcheap functionality under your brand"
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "Custom Branding & Design",
      description: "Your logo, colors, fonts, and custom domain - completely white-labeled experience"
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "API & Integration Access",
      description: "Full API access, webhooks, and integration with your existing systems"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Enterprise Security",
      description: "SOC 2 compliance, data encryption, PCI DSS compliance, and dedicated security"
    },
    {
      icon: <HeadphonesIcon className="h-6 w-6" />,
      title: "Dedicated Support Team",
      description: "24/7 technical support, account management, and implementation assistance"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Performance & Scalability",
      description: "High-performance infrastructure, CDN, and auto-scaling to handle any traffic"
    }
  ];

  const includedServices = [
    "Multi-vendor marketplace platform",
    "Seller onboarding and management",
    "Product catalog and inventory management",
    "Shopping cart and checkout system",
    "Payment processing integration",
    "Order management and tracking",
    "Review and rating system",
    "Advanced search and filtering",
    "Mobile-responsive design",
    "Admin dashboard and analytics",
    "Tax calculation and compliance",
    "Shipping rate calculation",
    "Event advertising system",
    "Local delivery integration",
    "Multi-language support",
    "Revenue sharing configuration",
    "Custom commission structures",
    "Automated reporting",
    "Seller subscription management",
    "Marketing tools and promotions"
  ];

  const supportServices = [
    "Platform setup and configuration",
    "Custom branding implementation",
    "Data migration assistance",
    "Staff training and onboarding",
    "Go-live support and monitoring",
    "Ongoing technical maintenance",
    "Feature updates and enhancements",
    "Performance optimization",
    "Security monitoring and updates",
    "24/7 technical support"
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Building className="h-12 w-12 text-amazon-orange" />
          <h1 className="text-4xl font-bold text-amazon-dark">Enterprise White-Label Marketplace</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
          Launch your own branded marketplace platform with all the power of Durcheap's technology. 
          Complete customization, dedicated support, and enterprise-grade infrastructure.
        </p>
        <div className="flex items-center justify-center gap-4 mb-8">
          <Badge className="bg-amazon-orange text-white text-lg px-4 py-2">$499.99/month</Badge>
          <Badge variant="outline" className="text-lg px-4 py-2">Custom Implementation</Badge>
        </div>
        <Button 
          onClick={handleAddToCart}
          size="lg"
          className="bg-amazon-orange hover:bg-orange-600 text-white text-lg px-8 py-3"
        >
          Add to Cart - Start Your Marketplace
        </Button>
      </div>

      {/* Key Features */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">What's Included</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="text-amazon-orange">{feature.icon}</div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Platform Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-6 w-6 text-amazon-orange" />
              Platform Features
            </CardTitle>
            <CardDescription>
              Complete marketplace functionality ready to deploy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {includedServices.map((service, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm">{service}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeadphonesIcon className="h-6 w-6 text-amazon-orange" />
              Support & Services
            </CardTitle>
            <CardDescription>
              End-to-end implementation and ongoing support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {supportServices.map((service, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm">{service}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Implementation Timeline */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Implementation Timeline</CardTitle>
          <CardDescription>
            From initial consultation to marketplace launch
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-amazon-orange text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">1</div>
              <h4 className="font-semibold mb-2">Discovery & Planning</h4>
              <p className="text-sm text-gray-600">Requirements gathering, branding guidelines, and technical architecture (Week 1-2)</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amazon-orange text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">2</div>
              <h4 className="font-semibold mb-2">Custom Development</h4>
              <p className="text-sm text-gray-600">Platform customization, branding implementation, and integration setup (Week 3-6)</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amazon-orange text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">3</div>
              <h4 className="font-semibold mb-2">Testing & Training</h4>
              <p className="text-sm text-gray-600">Quality assurance, staff training, and pre-launch testing (Week 7-8)</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amazon-orange text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">4</div>
              <h4 className="font-semibold mb-2">Launch & Support</h4>
              <p className="text-sm text-gray-600">Go-live support, monitoring, and ongoing optimization (Week 9+)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Use Cases */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Perfect For</CardTitle>
          <CardDescription>
            Organizations that need a complete branded marketplace solution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Enterprise Retailers</h4>
              <p className="text-sm text-gray-600">Launch multi-vendor marketplaces with complete brand control</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Industry Associations</h4>
              <p className="text-sm text-gray-600">Create member-exclusive marketplaces for specialized industries</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Regional Governments</h4>
              <p className="text-sm text-gray-600">Support local businesses with dedicated regional marketplaces</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">B2B Platforms</h4>
              <p className="text-sm text-gray-600">Professional procurement and supply chain marketplaces</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Franchise Networks</h4>
              <p className="text-sm text-gray-600">Unified marketplace for franchise locations and suppliers</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Educational Institutions</h4>
              <p className="text-sm text-gray-600">Campus and alumni marketplaces with custom features</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Details */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Investment & ROI</CardTitle>
          <CardDescription>
            Transparent pricing with no hidden fees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Monthly Investment</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Platform License</span>
                  <span className="font-semibold">$499.99/month</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Setup Fee (one-time)</span>
                  <span>$2,500</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Custom Development</span>
                  <span>Quote-based</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Starting at</span>
                  <span>$499.99/month</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">What You Save</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Development Team (6-12 months)</span>
                  <span className="text-green-600">$200K - $500K</span>
                </div>
                <div className="flex justify-between">
                  <span>Infrastructure & Hosting</span>
                  <span className="text-green-600">$2K - $10K/month</span>
                </div>
                <div className="flex justify-between">
                  <span>Ongoing Maintenance</span>
                  <span className="text-green-600">$5K - $15K/month</span>
                </div>
                <div className="flex justify-between">
                  <span>Security & Compliance</span>
                  <span className="text-green-600">$50K - $100K/year</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-green-600">
                  <span>Total Savings</span>
                  <span>$300K - $800K+</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Human vs Automated Services */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Service Delivery Model</CardTitle>
          <CardDescription>
            Understanding what's automated versus human-managed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4 text-green-600">✓ Fully Automated (Self-Service)</h4>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <h5 className="font-medium">Platform Infrastructure</h5>
                  <p className="text-sm text-gray-600">Auto-scaling servers, CDN, security updates, backups</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h5 className="font-medium">Core Marketplace Features</h5>
                  <p className="text-sm text-gray-600">Product catalog, cart, checkout, payments, order processing</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h5 className="font-medium">User Management</h5>
                  <p className="text-sm text-gray-600">Registration, authentication, role assignments, permissions</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h5 className="font-medium">Financial Operations</h5>
                  <p className="text-sm text-gray-600">Tax calculations, commission tracking, automated payouts</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h5 className="font-medium">Analytics & Reporting</h5>
                  <p className="text-sm text-gray-600">Real-time dashboards, automated reports, performance metrics</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h5 className="font-medium">Search & Discovery</h5>
                  <p className="text-sm text-gray-600">Product search, filtering, recommendations, SEO optimization</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-blue-600">👥 Human-Managed Services</h4>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h5 className="font-medium">Initial Setup & Configuration</h5>
                  <p className="text-sm text-gray-600">Custom branding, domain setup, payment gateway integration</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h5 className="font-medium">Custom Development</h5>
                  <p className="text-sm text-gray-600">Unique features, third-party integrations, API customizations</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h5 className="font-medium">Data Migration</h5>
                  <p className="text-sm text-gray-600">Importing existing products, users, orders from legacy systems</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h5 className="font-medium">Training & Onboarding</h5>
                  <p className="text-sm text-gray-600">Staff training sessions, documentation, workflow setup</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h5 className="font-medium">Strategic Consulting</h5>
                  <p className="text-sm text-gray-600">Market analysis, feature recommendations, growth planning</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h5 className="font-medium">Complex Issue Resolution</h5>
                  <p className="text-sm text-gray-600">Technical troubleshooting, performance optimization, security audits</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Self-Service Admin Panel */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Self-Service Management Tools</CardTitle>
          <CardDescription>
            What clients can manage independently after launch
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Shield className="h-8 w-8 text-amazon-orange mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Admin Dashboard</h4>
              <p className="text-sm text-gray-600">Manage sellers, products, orders, and marketplace settings</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Palette className="h-8 w-8 text-amazon-orange mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Visual Customization</h4>
              <p className="text-sm text-gray-600">Update colors, logos, banners, and promotional content</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <BarChart className="h-8 w-8 text-amazon-orange mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Business Intelligence</h4>
              <p className="text-sm text-gray-600">Configure reports, set KPIs, and monitor performance</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact & Next Steps */}
      <Card className="text-center">
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold mb-4">Ready to Launch Your Marketplace?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join leading organizations who trust Durcheap's white-label solution to power their branded marketplaces. 
            Get started with a consultation to discuss your specific needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleAddToCart}
              size="lg"
              className="bg-amazon-orange hover:bg-orange-600 text-white"
            >
              Add to Cart - $499.99/month
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.location.href = "mailto:enterprise@durcheap.com?subject=White-Label Marketplace Inquiry"}
            >
              Schedule Consultation
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Implementation timeline: 6-8 weeks • 24/7 support included • No long-term contracts
          </p>
        </CardContent>
      </Card>

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
  );
}
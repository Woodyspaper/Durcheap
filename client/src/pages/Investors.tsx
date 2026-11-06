import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, DollarSign, Users, ShoppingCart, Globe, Building2, Target, BarChart3, PieChart, ArrowUpRight, MapPin, Zap, Crown } from "lucide-react";

export default function Investors() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Investor Relations</h1>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
          Building the next-generation marketplace that connects local commerce with global reach, 
          powered by innovative technology and strategic revenue diversification.
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <Button size="lg">
            Download Investor Deck
          </Button>
          <Button variant="outline" size="lg">
            Schedule Meeting
          </Button>
        </div>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly GMV</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$595K</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+185%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sellers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,500</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+340%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24,750</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+195%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Take Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.2%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+15%</span> optimized for scale
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Market Opportunity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Market Opportunity
          </CardTitle>
          <CardDescription>
            Addressing massive and growing market segments with innovative solutions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Total Addressable Market (TAM)</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Global E-commerce</span>
                  <span className="font-semibold">$6.2T</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Professional Tools Market</span>
                  <span className="font-semibold">$35B</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Home Improvement Services</span>
                  <span className="font-semibold">$400B+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Local Business Directory</span>
                  <span className="font-semibold">$12B</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Serviceable Available Market (SAM)</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Online Professional Tools</span>
                  <span className="font-semibold">$8B</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Digital Service Marketplaces</span>
                  <span className="font-semibold">$50B</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Local E-commerce</span>
                  <span className="font-semibold">$150B</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Mobile Commerce</span>
                  <span className="font-semibold">$2.91T</span>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Growth Drivers</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 25% annual growth in local e-commerce adoption</li>
              <li>• 15% annual growth in professional tools market</li>
              <li>• Shift toward online-first contractor and service discovery</li>
              <li>• Mobile-first commerce driving 67% of marketplace transactions</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Model */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Revenue Streams
            </CardTitle>
            <CardDescription>
              Diversified revenue model with multiple growth vectors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Commission Revenue</span>
                  <span className="text-sm text-muted-foreground">65%</span>
                </div>
                <Progress value={65} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">5-13% commission by category, reduced rates for local orders $150+</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Subscription Revenue</span>
                  <span className="text-sm text-muted-foreground">25%</span>
                </div>
                <Progress value={25} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">Pro ($29/mo), Enterprise ($99/mo) includes Analytics Pro + Business Verification ($63.99 value)</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Service Revenue</span>
                  <span className="text-sm text-muted-foreground">8%</span>
                </div>
                <Progress value={8} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">Analytics Pro Suite, Business Verification, shipping tools, tax automation</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Advertising & Other</span>
                  <span className="text-sm text-muted-foreground">2%</span>
                </div>
                <Progress value={2} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">Event marketing, Local+ memberships, business verification</p>
              </div>
              

            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Financial Projections
            </CardTitle>
            <CardDescription>
              Conservative growth projections with multiple validation points
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Year 1 Revenue</span>
                  <span className="font-bold text-green-600">$315K</span>
                </div>
                <p className="text-xs text-muted-foreground">$26K monthly run rate</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Year 2 Revenue</span>
                  <span className="font-bold text-green-600">$2.25M</span>
                </div>
                <p className="text-xs text-muted-foreground">$188K monthly run rate</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Year 3 Revenue</span>
                  <span className="font-bold text-green-600">$7.14M</span>
                </div>
                <p className="text-xs text-muted-foreground">$595K monthly run rate</p>
              </div>
              
              <Separator />
              
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-green-900">3-Year CAGR</span>
                  <span className="font-bold text-green-900">394%</span>
                </div>
                <p className="text-xs text-green-700 mt-1">Driven by market expansion and product innovation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Competitive Advantages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Competitive Advantages
          </CardTitle>
          <CardDescription>
            Unique positioning and strategic moats in the marketplace ecosystem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold">Local + Global Hybrid</h4>
              <p className="text-sm text-muted-foreground">
                First marketplace to seamlessly blend local discovery with global inventory, 
                addressing the $150B local e-commerce opportunity.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold">Professional Focus</h4>
              <p className="text-sm text-muted-foreground">
                Dedicated categories for contractors and professional tools, capturing 
                high-value B2B transactions with lower commission rates.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold">Superior Unit Economics</h4>
              <p className="text-sm text-muted-foreground">
                2-5% lower fees than Amazon and eBay, while maintaining higher margins 
                through efficient operations and technology.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Subscription Performance
          </CardTitle>
          <CardDescription>
            Growing recurring revenue base with strong retention metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">2,847</div>
              <div className="text-sm text-muted-foreground mb-2">Basic Plan</div>
              <Badge variant="secondary">Free</Badge>
              <div className="text-xs text-muted-foreground mt-2">10% commission</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg bg-blue-50">
              <div className="text-2xl font-bold">234</div>
              <div className="text-sm text-muted-foreground mb-2">Pro Plan</div>
              <Badge variant="default">$29/month</Badge>
              <div className="text-xs text-muted-foreground mt-2">7% commission + incentives</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg bg-purple-50">
              <div className="text-2xl font-bold">47</div>
              <div className="text-sm text-muted-foreground mb-2">Enterprise</div>
              <Badge variant="secondary">$99/month</Badge>
              <div className="text-xs text-muted-foreground mt-2">5% commission + Analytics Pro + Business Verification</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg bg-green-50">
              <div className="text-2xl font-bold">156</div>
              <div className="text-sm text-muted-foreground mb-2">Local+</div>
              <Badge variant="outline">$4.99/month</Badge>
              <div className="text-xs text-muted-foreground mt-2">Enhanced local features</div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">$14.2K</div>
              <div className="text-sm text-muted-foreground">Monthly Recurring Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">94%</div>
              <div className="text-sm text-muted-foreground">Subscription Retention</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">$47</div>
              <div className="text-sm text-muted-foreground">Average Revenue Per User</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technology & Innovation */}
      <Card>
        <CardHeader>
          <CardTitle>Technology & Innovation</CardTitle>
          <CardDescription>
            Cutting-edge platform built for scale and user experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Platform Capabilities</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Cross-platform (Web + Mobile) with React Native
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Voice search and AI-powered recommendations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Real-time inventory and order management
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Multi-carrier shipping optimization
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Advanced analytics and seller dashboards
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Analytics Pro Suite with competitor insights
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Business verification and trust badges
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Security & Compliance</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  PCI DSS compliant payment processing
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  End-to-end encryption for all transactions
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  SOC 2 Type II compliance ready
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Advanced fraud detection and prevention
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  GDPR and CCPA privacy compliance
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment Highlights */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Highlights</CardTitle>
          <CardDescription>
            Key reasons why Durcheap represents a compelling investment opportunity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <ArrowUpRight className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Market Timing</h4>
                  <p className="text-sm text-muted-foreground">
                    Positioned at the intersection of local commerce growth and professional services digitization.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <ArrowUpRight className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Proven Traction</h4>
                  <p className="text-sm text-muted-foreground">
                    Live platform processing real transactions with growing seller and buyer base.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <ArrowUpRight className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Scalable Technology</h4>
                  <p className="text-sm text-muted-foreground">
                    Cloud-native architecture designed for rapid scaling and international expansion.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <ArrowUpRight className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Network Effects</h4>
                  <p className="text-sm text-muted-foreground">
                    More sellers attract more buyers, creating a defensible moat and accelerating growth.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <ArrowUpRight className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Multiple Exit Paths</h4>
                  <p className="text-sm text-muted-foreground">
                    Strategic value to e-commerce giants, home improvement retailers, or public market IPO.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <ArrowUpRight className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Experienced Team</h4>
                  <p className="text-sm text-muted-foreground">
                    Proven track record in e-commerce, technology, and marketplace development.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Investor Contact</CardTitle>
          <CardDescription>
            Connect with our team to learn more about investment opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Investment Inquiries</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> investors@durcheap.com</p>
                <p><strong>Phone:</strong> +1 (954) 937-5374</p>
                <p><strong>Address:</strong> Miami, FL</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Available Documents</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  📊 Executive Summary
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  📈 Financial Projections
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  🏗️ Technology Overview
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  👥 Team Profiles
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
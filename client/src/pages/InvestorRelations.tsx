import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, FileText, Calendar, Download, DollarSign, Users, Globe } from "lucide-react";

export default function InvestorRelations() {
  const financialHighlights = [
    { label: "Annual Revenue Run Rate", value: "$7.14M", change: "+237%" },
    { label: "Monthly GMV", value: "$595K", change: "+185%" },
    { label: "Active Sellers", value: "12,500", change: "+340%" },
    { label: "Average Take Rate", value: "8.2%", change: "+15%" }
  ];

  const upcomingEvents = [
    {
      date: "2025-02-15",
      event: "Q4 2024 Earnings Call",
      time: "2:00 PM EST"
    },
    {
      date: "2025-03-20",
      event: "Annual Shareholder Meeting",
      time: "10:00 AM EST"
    },
    {
      date: "2025-05-15",
      event: "Q1 2025 Earnings Call",
      time: "2:00 PM EST"
    }
  ];

  const documents = [
    { title: "Annual Report 2024", type: "PDF", size: "2.4 MB" },
    { title: "Q3 2024 Earnings Presentation", type: "PDF", size: "1.8 MB" },
    { title: "Proxy Statement 2024", type: "PDF", size: "3.1 MB" },
    { title: "Code of Business Conduct", type: "PDF", size: "0.9 MB" }
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amazon-dark mb-4">Investor Relations</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transparent financial information and strategic insights for our shareholders and the investment community.
          </p>
        </div>



        {/* Financial Highlights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-6 w-6 mr-2 text-amazon-orange" />
              Financial Highlights (2026 Projections)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {financialHighlights.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-amazon-dark">{item.value}</div>
                  <div className="text-sm text-gray-600">{item.label}</div>
                  <Badge className="bg-green-100 text-green-800 mt-1">{item.change}</Badge>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold text-amazon-dark mb-4">Revenue Diversification Strategy</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium text-amazon-dark">Transaction Revenue (65%)</div>
                  <div className="text-gray-600">Commission-based: 5-13% by category</div>
                  <div className="text-xs text-gray-500 mt-1">Includes professional tools (10%), contractor services (5%)</div>
                </div>
                <div>
                  <div className="font-medium text-amazon-dark">Subscription Revenue (25%)</div>
                  <div className="text-gray-600">Seller plans: Pro ($29), Enterprise ($99)</div>
                  <div className="text-xs text-gray-500 mt-1">Enterprise includes Analytics Pro ($39.99 value) + Business Verification ($24 value)</div>
                </div>
                <div>
                  <div className="font-medium text-amazon-dark">Service Revenue (8%)</div>
                  <div className="text-gray-600">Shipping tools, tax automation, business verification</div>
                  <div className="text-xs text-gray-500 mt-1">Analytics Pro Suite, document generation, compliance tools</div>
                </div>
                <div>
                  <div className="font-medium text-amazon-dark">Advertising Revenue (2%)</div>
                  <div className="text-gray-600">Event marketing, sponsored listings</div>
                  <div className="text-xs text-gray-500 mt-1">Geographic event promotion, featured placements</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-6 w-6 mr-2 text-amazon-orange" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{event.event}</h4>
                      <p className="text-sm text-gray-600">{event.time}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-6 w-6 mr-2 text-amazon-orange" />
                Key Business Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Professional Tools & Services</span>
                  <span className="font-semibold">35%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mobile Commerce</span>
                  <span className="font-semibold">72%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Prime Members</span>
                  <span className="font-semibold">6.8M</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Order Value</span>
                  <span className="font-semibold">$67</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Customer Retention</span>
                  <span className="font-semibold">89%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Documents */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-6 w-6 mr-2 text-amazon-orange" />
              Financial Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <h4 className="font-medium">{doc.title}</h4>
                      <p className="text-sm text-gray-500">{doc.type} • {doc.size}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Investment Thesis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Investment Thesis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-amazon-orange">Market Leadership</h4>
                <p className="text-sm text-gray-600">
                  Leading position in the global e-commerce market with strong competitive moats and network effects.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-amazon-orange">Innovation Focus</h4>
                <p className="text-sm text-gray-600">
                  Continuous investment in AI, logistics, and customer experience driving long-term growth.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-amazon-orange">Global Expansion</h4>
                <p className="text-sm text-gray-600">
                  Expanding into emerging markets with significant growth potential and local partnerships.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Investor Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Investor Relations</h4>
                <p className="text-gray-600 mb-1">Email: buyit@durcheap.com</p>
                <p className="text-gray-600 mb-1">Phone: +1 (954) 937-5374</p>
                <p className="text-gray-600">Address: 4600 NE 11th Ave, Fort Lauderdale, FL 33334</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Subscribe to Updates</h4>
                <p className="text-gray-600 mb-4">Get the latest financial news and earnings updates.</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <Button className="bg-amazon-orange hover:bg-amazon-orange/90">
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
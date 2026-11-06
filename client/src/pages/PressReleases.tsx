import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, ArrowRight, Quote, Download, Share2 } from "lucide-react";
import { useState } from "react";

export default function PressReleases() {
  const technologyRelease = {
    id: "ai-shopping-assistant-2024",
    date: "2025-04-21",
    title: "Durcheap Launches AI-Powered Shopping Assistant",
    excerpt: "New artificial intelligence feature helps customers discover products and make informed purchasing decisions with personalized recommendations.",
    category: "Technology",
    fullContent: {
      location: "Fort Lauderdale, FL",
      summary: "Durcheap.com, a leading e-commerce marketplace, today announced the launch of its revolutionary AI-Powered Shopping Assistant, marking a significant milestone in personalized online shopping technology. This innovative feature leverages advanced machine learning algorithms to provide customers with intelligent product recommendations, price comparisons, and shopping insights.",
      keyFeatures: [
        "Voice-activated product search with natural language processing",
        "Personalized product recommendations based on browsing history and preferences", 
        "Real-time price comparisons across sellers and categories",
        "Smart cart optimization suggesting complementary products",
        "Automated wishlist management with price drop notifications"
      ],
      executiveQuote: {
        quote: "Our AI Shopping Assistant represents the future of e-commerce - where technology seamlessly enhances the human shopping experience. By understanding customer preferences and behavior patterns, we're able to deliver truly personalized recommendations that save time and help customers discover products they'll love.",
        attribution: "Sarah Chen, Chief Technology Officer at Durcheap"
      },
      marketImpact: "Early beta testing showed a 45% increase in customer satisfaction scores and a 32% improvement in purchase conversion rates. The AI assistant currently supports over 15 languages and processes more than 2 million queries daily across Durcheap's global marketplace.",
      technicalDetails: "Built on Durcheap's proprietary machine learning platform, the AI Shopping Assistant analyzes over 200 data points per customer interaction, including browsing patterns, seasonal trends, local preferences, and real-time inventory levels to deliver contextually relevant recommendations.",
      availability: "The AI Shopping Assistant is now available to all Durcheap customers through the web platform and mobile applications. Premium features, including advanced analytics and priority customer support, are included with Pro and Enterprise seller subscriptions."
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "Financial": "bg-green-100 text-green-800",
      "Service": "bg-blue-100 text-blue-800",
      "Technology": "bg-purple-100 text-purple-800",
      "Partnership": "bg-orange-100 text-orange-800",
      "Sustainability": "bg-emerald-100 text-emerald-800",
      "Milestone": "bg-yellow-100 text-yellow-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amazon-dark mb-4">Press Releases</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest news, announcements, and milestones from Durcheap.
          </p>
        </div>

        {/* Press Releases List */}
        <div className="space-y-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-3">
                <Badge className={getCategoryColor(technologyRelease.category)}>
                  {technologyRelease.category}
                </Badge>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(technologyRelease.date)}
                </div>
              </div>
              <h2 className="text-xl font-semibold text-amazon-dark mb-3">
                {technologyRelease.title}
              </h2>
              <p className="text-gray-600 mb-4">
                {technologyRelease.excerpt}
              </p>
              <div className="flex gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center">
                      <span className="text-sm font-medium">Read Full Release</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-amazon-dark mb-2">
                        {technologyRelease.title}
                      </DialogTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span>{formatDate(technologyRelease.date)}</span>
                        <span>•</span>
                        <span>{technologyRelease.fullContent.location}</span>
                        <Badge className={getCategoryColor(technologyRelease.category)}>
                          {technologyRelease.category}
                        </Badge>
                      </div>
                    </DialogHeader>
                    
                    {/* Full Press Release Content */}
                    <div className="space-y-6">
                      <p className="text-lg leading-relaxed text-gray-700">
                        {technologyRelease.fullContent.summary}
                      </p>
                      
                      <div>
                        <h3 className="text-xl font-semibold text-amazon-dark mb-3">Key Features Include:</h3>
                        <ul className="space-y-2">
                          {technologyRelease.fullContent.keyFeatures.map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-amazon-orange mr-2">•</span>
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Card className="bg-gray-50">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-3">
                            <Quote className="h-6 w-6 text-amazon-orange flex-shrink-0 mt-1" />
                            <div>
                              <p className="italic text-gray-700 mb-3">
                                "{technologyRelease.fullContent.executiveQuote.quote}"
                              </p>
                              <p className="text-sm font-medium text-amazon-dark">
                                — {technologyRelease.fullContent.executiveQuote.attribution}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <div>
                        <h3 className="text-xl font-semibold text-amazon-dark mb-3">Market Impact</h3>
                        <p className="text-gray-700 leading-relaxed">
                          {technologyRelease.fullContent.marketImpact}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold text-amazon-dark mb-3">Technical Innovation</h3>
                        <p className="text-gray-700 leading-relaxed">
                          {technologyRelease.fullContent.technicalDetails}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold text-amazon-dark mb-3">Availability</h3>
                        <p className="text-gray-700 leading-relaxed">
                          {technologyRelease.fullContent.availability}
                        </p>
                      </div>
                      
                      <div className="flex gap-3 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          onClick={() => window.open(`mailto:buyit@durcheap.com?subject=Press Release Inquiry - ${technologyRelease.title}`, '_blank')}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Contact Media
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            const content = `${technologyRelease.fullContent.summary}\n\nFor more information, contact: buyit@durcheap.com`;
                            navigator.clipboard.writeText(content);
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Copy Release
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`mailto:?subject=Press Release: ${technologyRelease.title}&body=Check out this press release from Durcheap: ${technologyRelease.excerpt}`, '_blank')}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Media Contact */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Media Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <h4 className="font-semibold mb-4">Press Inquiries</h4>
              <div className="space-y-2">
                <p className="text-gray-600">Email: <a href="mailto:buyit@durcheap.com" className="text-amazon-orange hover:underline">buyit@durcheap.com</a></p>
                <p className="text-gray-600">Phone: <a href="tel:+19549375374" className="text-amazon-orange hover:underline">+1 (954) 937-5374</a></p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Newsletter Signup */}
        <Card className="mt-8 text-center">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-amazon-dark mb-4">Stay Informed</h2>
            <p className="text-gray-600 mb-6">
              Subscribe to our press release newsletter to get the latest updates delivered to your inbox.
            </p>
            <div className="flex max-w-md mx-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-orange"
              />
              <button className="px-6 py-2 bg-amazon-orange text-white rounded-lg hover:bg-amazon-orange/90 transition-colors">
                Subscribe
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Shield, Star, Percent, Clock, CheckCircle } from "lucide-react";

export default function BusinessCard() {
  const benefits = [
    {
      icon: Percent,
      title: "2% Cash Back",
      description: "Earn 2% cash back on all Durcheap purchases with no caps or limits"
    },
    {
      icon: Shield,
      title: "Purchase Protection",
      description: "Extended warranty and purchase protection on eligible items"
    },
    {
      icon: Clock,
      title: "No Annual Fee",
      description: "Enjoy all benefits with no annual fee for qualifying customers"
    },
    {
      icon: Star,
      title: "Exclusive Perks",
      description: "Access to special promotions and early access to deals"
    }
  ];

  const features = [
    "No foreign transaction fees",
    "Contactless payment technology", 
    "Real-time fraud monitoring",
    "Digital wallet compatibility",
    "24/7 customer support",
    "Online account management"
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amazon-dark mb-4">Durcheap Business Card</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Maximize your business purchases with the official Durcheap Business Credit Card. Earn cash back and enjoy exclusive benefits on all your business expenses.
          </p>
        </div>

        {/* Card Preview */}
        <div className="flex justify-center mb-12">
          <div className="relative">
            <div className="w-96 h-60 bg-gradient-to-br from-amazon-dark to-amazon-blue rounded-xl shadow-2xl p-6 text-white">
              <div className="flex justify-between items-start mb-8">
                <div className="text-2xl font-bold">Durcheap</div>
                <CreditCard className="h-8 w-8" />
              </div>
              <div className="mb-6">
                <div className="text-xs opacity-80 mb-1">CARD NUMBER</div>
                <div className="text-lg tracking-widest">•••• •••• •••• 1234</div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs opacity-80 mb-1">BUSINESS NAME</div>
                  <div className="text-sm">YOUR BUSINESS LLC</div>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-80 mb-1">EXPIRES</div>
                  <div className="text-sm">12/28</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-amazon-dark mb-8 text-center">Card Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <IconComponent className="h-12 w-12 text-amazon-orange mx-auto mb-4" />
                    <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Additional Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Eligibility Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-amazon-orange" />
                  <span className="text-gray-700">Valid business registration</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-amazon-orange" />
                  <span className="text-gray-700">Active Durcheap seller account</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-amazon-orange" />
                  <span className="text-gray-700">Minimum credit score of 680</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-amazon-orange" />
                  <span className="text-gray-700">Annual business revenue verification</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center">Transparent Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-amazon-dark">$0</div>
                <div className="text-gray-600">Annual Fee</div>
                <div className="text-xs text-gray-500 mt-1">For qualified businesses</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-amazon-dark">15.99%</div>
                <div className="text-gray-600">Variable APR</div>
                <div className="text-xs text-gray-500 mt-1">Based on creditworthiness</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-amazon-dark">$39</div>
                <div className="text-gray-600">Late Payment Fee</div>
                <div className="text-xs text-gray-500 mt-1">Up to $39 maximum</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Process */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Simple Application Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-amazon-orange text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">1</div>
                <h4 className="font-semibold mb-2">Apply Online</h4>
                <p className="text-sm text-gray-600">Complete our secure online application in minutes</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amazon-orange text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">2</div>
                <h4 className="font-semibold mb-2">Instant Decision</h4>
                <p className="text-sm text-gray-600">Get an instant credit decision in most cases</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amazon-orange text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">3</div>
                <h4 className="font-semibold mb-2">Receive Your Card</h4>
                <p className="text-sm text-gray-600">Get your card in 7-10 business days</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amazon-orange text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">4</div>
                <h4 className="font-semibold mb-2">Start Earning</h4>
                <p className="text-sm text-gray-600">Begin earning cash back on all purchases</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="text-center">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold text-amazon-dark mb-4">Ready to Apply?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of businesses already earning cash back on their Durcheap purchases. Apply now and start maximizing your business spending.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-amazon-orange hover:bg-amazon-orange/90 text-lg px-8 py-3">
                Apply Now
              </Button>
              <Button variant="outline" className="text-lg px-8 py-3">
                Learn More
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Application subject to credit approval. Terms and conditions apply.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
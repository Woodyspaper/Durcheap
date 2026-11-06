import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Shield, Globe } from "lucide-react";

export default function About() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amazon-dark mb-4">About Durcheap</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're building the world's most customer-centric marketplace, where anyone can discover and buy anything they want online, and still shop local.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-6 w-6 mr-2 text-amazon-orange" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                To be Earth's most customer-centric company, where customers can find and discover anything they might want to buy online, and endeavor to offer our customers the lowest possible prices.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-6 w-6 mr-2 text-amazon-orange" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                To create a world where commerce is accessible to everyone, connecting millions of sellers with customers worldwide through innovative technology and exceptional service.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Company Stats */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Durcheap by the Numbers (Our Goals)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-amazon-orange">10M+</div>
                <div className="text-sm text-gray-600">Active Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-amazon-orange">2M+</div>
                <div className="text-sm text-gray-600">Sellers Worldwide</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-amazon-orange">100M+</div>
                <div className="text-sm text-gray-600">Products Available</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-amazon-orange">195</div>
                <div className="text-sm text-gray-600">Countries Served</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leadership Principles */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-6 w-6 mr-2 text-amazon-orange" />
              Our Leadership Principles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Customer Obsession</h4>
                <p className="text-sm text-gray-600">We start with the customer and work backwards. We work vigorously to earn and keep customer trust.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Ownership</h4>
                <p className="text-sm text-gray-600">We act on behalf of the entire company, beyond just our own team. We never say "that's not my job."</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Invent and Simplify</h4>
                <p className="text-sm text-gray-600">We expect and require innovation and invention from our teams and always find ways to simplify.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Deliver Results</h4>
                <p className="text-sm text-gray-600">We focus on the key inputs for our business and deliver them with the right quality and in a timely fashion.</p>
              </div>
            </div>
          </CardContent>
        </Card>


      </div>
    </Layout>
  );
}
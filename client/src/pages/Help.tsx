import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Shield, CreditCard, RotateCcw, Phone, Mail } from "lucide-react";

export default function Help() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-amazon-dark mb-8">Help & Customer Service</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="h-5 w-5 mr-2 text-amazon-orange" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Standard delivery: 3-5 business days</li>
                <li>• Express delivery: 1-2 business days</li>
                <li>• International shipping available</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <RotateCcw className="h-5 w-5 mr-2 text-amazon-orange" />
                Returns & Refunds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• 30-day return policy</li>
                <li>• Free returns on most items</li>
                <li>• Full refund if not satisfied</li>
                <li>• Easy return process online</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-amazon-orange" />
                Payment & Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Secure SSL encryption</li>
                <li>• Multiple payment options</li>
                <li>• Fraud protection included</li>
                <li>• Payment plans available</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-amazon-orange" />
                Purchase Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• A-to-Z Guarantee protection</li>
                <li>• Product authenticity verified</li>
                <li>• Customer service support</li>
                <li>• Dispute resolution assistance</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Contact Customer Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-amazon-orange" />
                <div>
                  <p className="font-semibold">Phone Support</p>
                  <p className="text-sm text-gray-600">954-937-5374</p>
                  <p className="text-xs text-gray-500">Available 24/7</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-amazon-orange" />
                <div>
                  <p className="font-semibold">Email Support</p>
                  <p className="text-sm text-gray-600">buyit@durcheap.com</p>
                  <p className="text-xs text-gray-500">Response within 24 hours</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">How do I track my order?</h4>
                <p className="text-sm text-gray-600">
                  You can track your order by going to "Your Orders" in your account and clicking on the tracking number.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">What if I receive a damaged item?</h4>
                <p className="text-sm text-gray-600">
                  Contact our customer service immediately with photos of the damage. We'll arrange a replacement or full refund.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Can I change or cancel my order?</h4>
                <p className="text-sm text-gray-600">
                  Orders can be modified or cancelled within 30 minutes of placement. After that, please contact customer service.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { ShoppingBag, Truck, Shield, Star } from "lucide-react";

export default function Landing() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amazon-dark to-amazon-blue text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Find Everything You Need
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Millions of products, endless possibilities. Shop from trusted sellers worldwide.
          </p>
          <div className="space-x-4">
            <Button
              size="lg"
              className="bg-amazon-orange hover:bg-orange-600 text-amazon-dark font-semibold"
              onClick={() => window.location.href = "/auth"}
            >
              Sign In to Shop
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-amazon-dark"
              asChild
            >
              <Link href="/search">Browse Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-amazon-dark">
            Why Shop with Durcheap?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <ShoppingBag className="h-12 w-12 text-amazon-orange mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Millions of Products</h3>
                <p className="text-gray-600">Browse through our vast selection of products from trusted sellers worldwide.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Truck className="h-12 w-12 text-amazon-orange mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Fast Delivery</h3>
                <p className="text-gray-600">Get your orders delivered quickly with our efficient shipping network.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-amazon-orange mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Secure Shopping</h3>
                <p className="text-gray-600">Shop with confidence knowing your transactions are secure and protected.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Star className="h-12 w-12 text-amazon-orange mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Quality Guaranteed</h3>
                <p className="text-gray-600">All products are verified for quality with customer reviews and ratings.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-amazon-dark">
            Shop by Category
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: "Electronics", image: "📱" },
              { name: "Books", image: "📚" },
              { name: "Home & Kitchen", image: "🏠" },
              { name: "Clothing", image: "👕" },
              { name: "Sports", image: "⚽" },
              { name: "Beauty", image: "💄" },
            ].map((category) => (
              <Card key={category.name} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{category.image}</div>
                  <h3 className="font-semibold text-amazon-dark">{category.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-amazon-dark text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Start Shopping?
          </h2>
          <p className="text-xl mb-8">
            Join millions of customers who trust Durcheap for their shopping needs.
          </p>
          <Button
            size="lg"
            className="bg-amazon-orange hover:bg-orange-600 text-amazon-dark font-semibold"
            onClick={() => window.location.href = "/auth"}
          >
            Sign In Now
          </Button>
        </div>
      </section>
    </Layout>
  );
}

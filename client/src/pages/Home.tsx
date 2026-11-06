import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { ProductCarousel } from "@/components/ProductCarousel";
import ReferralBanner from "@/components/ReferralBanner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";



import { useLanguage } from "@/contexts/LanguageContext";
import TodaysEventsSection from "@/components/TodaysEventsSection";
import type { Product, Category } from "@shared/schema";

export default function Home() {
  const { t, translateCategory } = useLanguage();
  
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<(Category & { subcategories?: Category[] })[]>({
    queryKey: ["/api/categories?includeSubcategories=true"],
  });

  const { data: productsData, isLoading: productsLoading } = useQuery<{
    products: Product[];
    total: number;
  }>({
    queryKey: ["/api/products?limit=8"],
  });

  const featuredProducts = productsData?.products || [];





  return (
    <Layout>
      {/* Referral Program Banner */}
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <ReferralBanner />
      </div>

      {/* Deals Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-amazon-dark mb-8">Today's Deals</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProducts
              .filter(product => product.originalPrice && Number(product.originalPrice) > Number(product.price))
              .slice(0, 3)
              .map((product) => {
                const discountPercentage = product.originalPrice
                  ? Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)
                  : 0;

                return (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <Link href={`/product/${product.id}`}>
                      <CardContent className="p-6 text-center">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-32 object-cover rounded-md mb-4"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                        <Badge className="bg-red-600 text-white mb-2">
                          {discountPercentage}% OFF
                        </Badge>
                        <h3 className="font-medium mb-2">{product.name}</h3>
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-2xl font-bold text-amazon-dark">
                            ${Number(product.price).toFixed(2)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-lg text-gray-500 line-through">
                              ${Number(product.originalPrice).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                );
              })}
          </div>
        </div>
      </section>

      {/* Featured Products Carousel */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 featured-products">
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-3 sm:p-4">
                    <Skeleton className="aspect-square mb-3 sm:mb-4 rounded-md" />
                    <Skeleton className="h-5 sm:h-6 mb-2" />
                    <Skeleton className="h-3 sm:h-4 w-20 sm:w-24 mb-2" />
                    <Skeleton className="h-6 sm:h-8 w-16 sm:w-20 mb-3" />
                    <Skeleton className="h-8 sm:h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <ProductCarousel
              products={featuredProducts}
              title="Featured Products"
              autoPlay={true}
              interval={4000}
              itemsPerView={4}
              showIndicators={true}
            />
          )}
        </div>
      </section>

      {/* Today's Events Horizontal Scroll */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-amazon-dark mb-6 sm:mb-8 text-center sm:text-left">{t('todays_events', "Today's Events")}</h2>
          
          <TodaysEventsSection />
        </div>
      </section>

      {/* Seller Promotion Section */}
      <section className="py-8 sm:py-12 bg-amazon-blue text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">{t('start_selling_today', 'Start Selling Today')}</h2>
          <p className="text-lg mb-6 opacity-90">{t('join_thousands_sellers', 'Join thousands of sellers and turn your passion into profit')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-amazon-orange hover:bg-orange-600 text-amazon-dark font-semibold"
              asChild
            >
              <Link href="/seller">{t('become_seller', 'Become a Seller')}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-amazon-blue"
              asChild
            >
              <Link href="/subscription">{t('view_seller_plans', 'View Seller Plans')}</Link>
            </Button>
          </div>
        </div>
      </section>




    </Layout>
  );
}

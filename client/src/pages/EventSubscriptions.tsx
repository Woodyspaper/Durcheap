import React, { useState } from 'react';
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useLocation } from "wouter";
import { Check, Calendar, Globe, MapPin, Star, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { EventSubscriptionPlan, EventPostingRate } from "@shared/schema";

export default function EventSubscriptions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const { addToCart } = useCart();
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

  const { data: subscriptionPlans, isLoading: plansLoading } = useQuery({
    queryKey: ['/api/event-subscription-plans'],
  });

  const { data: postingRates, isLoading: ratesLoading } = useQuery({
    queryKey: ['/api/event-posting-rates'],
  });

  const subscriptionMutation = useMutation({
    mutationFn: async (planId: string) => {
      return apiRequest('POST', '/api/event-subscription', { planId });
    },
    onSuccess: (data) => {
      toast({
        title: "Subscription Activated!",
        description: data.discountMessage || "Your event subscription is now active.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/my-events'] });
    },
    onError: () => {
      toast({
        title: "Subscription Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  const userPlan = user?.subscriptionPlan || 'basic';
  
  const getDiscount = () => {
    if (userPlan === 'pro') return 50;
    if (userPlan === 'enterprise') return 75;
    return 0;
  };

  const calculatePrice = (basePrice: string) => {
    const price = parseFloat(basePrice);
    const discount = getDiscount();
    if (discount > 0) {
      return {
        original: price,
        discounted: price * (1 - discount / 100),
        discount
      };
    }
    return { original: price, discounted: price, discount: 0 };
  };

  const handleSubscribe = (planId: string) => {
    setSelectedPlan(planId);
    subscriptionMutation.mutate(planId);
  };

  if (plansLoading || ratesLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amazon-dark mb-4">Event Calendar Subscriptions</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Promote your events and reach your target audience across different geographical areas
          </p>
          {getDiscount() > 0 && (
            <div className="mt-4">
              <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
                <Zap className="h-4 w-4 mr-1" />
                {getDiscount()}% OFF as a {userPlan} user!
              </Badge>
            </div>
          )}
        </div>

        {/* Subscription Plans */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-amazon-dark mb-6 text-center">Monthly Subscription Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subscriptionPlans?.map((plan: EventSubscriptionPlan) => {
              const pricing = calculatePrice(plan.basePrice);
              const isPopular = plan.id === 'weekly';
              
              return (
                <Card key={plan.id} className={`relative ${isPopular ? 'border-amazon-orange border-2' : ''}`}>
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-amazon-orange text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                    <div className="mt-2">
                      {pricing.discount > 0 ? (
                        <div>
                          <div className="text-sm text-gray-500 line-through">
                            ${pricing.original.toFixed(2)}/month
                          </div>
                          <div className="text-3xl font-bold text-amazon-orange">
                            ${pricing.discounted.toFixed(2)}
                            <span className="text-sm font-normal text-gray-600">/month</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-3xl font-bold text-amazon-dark">
                          ${pricing.original.toFixed(2)}
                          <span className="text-sm font-normal text-gray-600">/month</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-gray-600 text-center">{plan.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">
                          {plan.postsPerMonth === 30 ? 'Unlimited' : plan.postsPerMonth} posts per month
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">All reach types available</span>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">Social media integration</span>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">Event analytics</span>
                      </div>
                      {plan.postsPerMonth >= 4 && (
                        <div className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm">Priority support</span>
                        </div>
                      )}
                      {plan.postsPerMonth === 30 && (
                        <div className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm">Featured event placement</span>
                        </div>
                      )}
                    </div>

                    <Button
                      className={`w-full ${isPopular ? 'bg-amazon-orange hover:bg-orange-600' : ''}`}
                      variant={isPopular ? 'default' : 'outline'}
                      onClick={() => {
                        const productMap: Record<string, string> = {
                          'monthly': 'event_marketing_city',
                          'twice-monthly': 'event_marketing_metro', 
                          'weekly': 'event_marketing_metro',
                          'daily': 'event_marketing_nationwide'
                        };
                        const productId = productMap[plan.id] || 'event_marketing_city';
                        handleAddToCart(productId, plan.name);
                      }}
                    >
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Single Event Posting Rates */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-amazon-dark mb-6 text-center">Single Event Posting Rates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {postingRates?.map((rate: EventPostingRate) => {
              const pricing = calculatePrice(rate.singlePostPrice);
              
              return (
                <Card key={rate.id} className="text-center">
                  <CardHeader className="pb-3">
                    <div className="mx-auto mb-2">
                      {rate.reachType === 'citywide' && <MapPin className="h-8 w-8 text-blue-500" />}
                      {rate.reachType === 'metro' && <Globe className="h-8 w-8 text-green-500" />}
                      {rate.reachType === 'statewide' && <Calendar className="h-8 w-8 text-purple-500" />}
                      {rate.reachType === 'national' && <Star className="h-8 w-8 text-orange-500" />}
                      {rate.reachType === 'global' && <Zap className="h-8 w-8 text-red-500" />}
                    </div>
                    <CardTitle className="text-lg capitalize">{rate.reachType}</CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    {pricing.discount > 0 ? (
                      <div>
                        <div className="text-sm text-gray-500 line-through">
                          ${pricing.original.toFixed(2)}
                        </div>
                        <div className="text-2xl font-bold text-amazon-orange">
                          ${pricing.discounted.toFixed(2)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-amazon-dark">
                        ${pricing.original.toFixed(2)}
                      </div>
                    )}
                    <p className="text-xs text-gray-600 mt-1">per event</p>
                    <Button
                      className="w-full mt-3"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const productMap: Record<string, string> = {
                          'citywide': 'single_event_sponsored',
                          'metro': 'single_event_sponsored',
                          'statewide': 'single_event_featured',
                          'national': 'single_event_featured',
                          'global': 'single_event_featured'
                        };
                        const productId = productMap[rate.reachType] || 'single_event_sponsored';
                        handleAddToCart(productId, `${rate.reachType} Event Post`);
                      }}
                    >
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Features Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-center mb-6">Event Calendar Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto text-amazon-orange mb-4" />
                <h4 className="font-semibold mb-2">Location-Based Filtering</h4>
                <p className="text-sm text-gray-600">
                  Users can filter events by city, state, ZIP code, and reach area to find relevant local events.
                </p>
              </div>
              
              <div className="text-center">
                <Calendar className="h-12 w-12 mx-auto text-amazon-orange mb-4" />
                <h4 className="font-semibold mb-2">Advanced Event Management</h4>
                <p className="text-sm text-gray-600">
                  Full event lifecycle management with date filtering, capacity tracking, and registration management.
                </p>
              </div>
              
              <div className="text-center">
                <Globe className="h-12 w-12 mx-auto text-amazon-orange mb-4" />
                <h4 className="font-semibold mb-2">Social Media Integration</h4>
                <p className="text-sm text-gray-600">
                  Link your social media accounts and media streams to boost event visibility and engagement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
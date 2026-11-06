import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/Layout";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Check, Star, Zap, Shield } from "lucide-react";

export default function SellerSubscription() {
  const { t } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const plans = [
    {
      id: "basic",
      name: t('basic_plan', 'Basic'),
      price: t('free', 'Free'),
      monthly: 0,
      description: t('basic_plan_desc', 'Perfect for getting started'),
      listings: t('13_listings', '13 product listings'),
      commission: t('10_percent_commission', '10% commission'),
      features: [
        t('basic_seller_tools', 'Basic seller tools'),
        t('email_support', 'Email support'),
        t('basic_analytics', 'Basic analytics'),
        t('mobile_app_access', 'Mobile app access'),
        t('basic_event_marketing', 'Once Monthly Event Marketing City Subscription FREE for 1st year')
      ],
      color: "border-gray-300",
      buttonColor: "bg-gray-600 hover:bg-gray-700"
    },
    {
      id: "pro",
      name: t('pro_plan', 'Pro'),
      price: "$29",
      monthly: 29,
      description: t('pro_plan_desc', 'Most popular for growing businesses'),
      listings: t('up_to_100_listings', 'Up to 100 listings'),
      commission: t('7_percent_commission', '7% commission'),
      features: [
        t('advanced_seller_tools', 'Advanced seller tools'),
        t('priority_support', 'Priority support'),
        t('detailed_analytics', 'Detailed analytics'),
        t('local_shipping_incentives', 'Local shipping incentives (30% off commissions on $150+ orders)'),
        t('inventory_management', 'Inventory management'),
        t('bulk_operations', 'Bulk operations'),
        t('pro_event_marketing', 'Once Monthly Event Marketing Metro Subscription FREE for 1st year'),
        t('event_analytics', 'Event performance analytics'),
        t('sponsored_event_listings', 'Sponsored event listings (50% discount)')
      ],
      color: "border-amazon-blue",
      buttonColor: "bg-amazon-blue hover:bg-blue-700",
      popular: true
    },
    {
      id: "enterprise",
      name: t('enterprise_plan', 'Enterprise'),
      price: "$99",
      monthly: 99,
      description: t('enterprise_plan_desc', 'Complete all-in-one solution with $210+ in services included'),
      listings: t('unlimited_listings', 'Unlimited listings'),
      commission: t('5_percent_commission', '5% commission'),
      features: [
        t('enterprise_seller_tools', 'Enterprise seller tools'),
        t('dedicated_account_manager', 'Dedicated account manager'),
        t('unlimited_events', 'Unlimited Event Listings'),
        
        // Core Services Included (Total $210+ value)
        t('analytics_pro_included', '✓ Analytics Pro Suite included ($39.99 value)'),
        t('business_verification_included', '✓ Business Verification included ($24 value)'),
        t('premium_api_included', '✓ Premium API Access included ($49.99 value)'),
        t('premium_shipping_included', '✓ Premium Shipping Tools included ($4.99 value)'),
        t('tax_automation_included', '✓ Tax Automation Service included ($7.99 value)'),
        t('local_plus_included', '✓ Local+ Membership included ($4.99 value)'),
        
        // Event Marketing Included
        t('enterprise_event_marketing', '✓ Nationwide Event Marketing FREE for 1st year ($149.99 value)'),
        t('premium_event_analytics', 'Premium event analytics & insights'),
        t('featured_event_placement', 'Featured event placement'),
        t('custom_event_branding', 'Custom event branding & themes'),
        t('event_automation_tools', 'Event automation & scheduling tools'),
        
        // Enhanced Features
        t('enhanced_local_incentives', 'Enhanced local shipping incentives (40% off commissions on $150+ orders)'),
        t('custom_analytics', 'Custom analytics & reporting'),
        t('custom_integrations', 'Custom integrations & webhooks'),
        t('priority_technical_support', 'Priority technical support'),
        t('bulk_operations', 'Advanced bulk operations'),
        t('inventory_management', 'Multi-location inventory management'),
        t('international_shipping', 'International shipping tools')
      ],
      color: "border-amazon-orange",
      buttonColor: "bg-amazon-orange hover:bg-orange-600"
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-amazon-dark mb-4">
              {t('seller_subscription_plans', 'Seller Subscription Plans')}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('choose_perfect_plan', 'Choose the perfect plan to grow your business on Durcheap. Start selling today with our comprehensive seller tools.')}
            </p>
          </div>

          {/* Enterprise Value Proposition */}
          <div className="mb-8 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-amazon-dark mb-2">
                Enterprise Plan: All-In-One Solution
              </h3>
              <p className="text-lg text-gray-700 mb-4">
                Get everything you need to run your business at one low price
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <span className="bg-white px-3 py-1 rounded-full border border-orange-300">
                  <strong>$99/month</strong> for <strong>$400+ value</strong>
                </span>
                <span className="bg-white px-3 py-1 rounded-full border border-orange-300">
                  6 Premium Services Included
                </span>
                <span className="bg-white px-3 py-1 rounded-full border border-orange-300">
                  Save $300+ Monthly
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${plan.color} ${selectedPlan === plan.id ? 'ring-2 ring-amazon-blue shadow-lg' : 'hover:shadow-md'} transition-all duration-200`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-amazon-orange text-white px-4 py-1">
                      <Star className="w-4 h-4 mr-1" />
                      {t('most_popular', 'Most Popular')}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-amazon-dark">
                    {plan.name}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-amazon-dark">{plan.price}</span>
                    {plan.monthly > 0 && (
                      <span className="text-gray-600 ml-2">{t('per_month', '/month')}</span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{t('product_listings', 'Product Listings')}</span>
                      <span className="text-amazon-blue font-semibold">{plan.listings}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{t('commission_rate', 'Commission Rate')}</span>
                      <span className="text-amazon-blue font-semibold">{plan.commission}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${plan.buttonColor} text-white font-semibold py-3`}
                    onClick={async () => {
                      setSelectedPlan(plan.id);
                      if (plan.id === 'basic') {
                        setLocation('/seller');
                      } else {
                        // For Pro and Enterprise plans, add to cart
                        const subscriptionProductId = plan.id === 'pro' ? 'subscription_pro' : 'subscription_enterprise';
                        try {
                          await addToCart(subscriptionProductId, 1);
                          setLocation('/cart');
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to add subscription to cart. Please try again.",
                            variant: "destructive",
                          });
                        }
                      }
                    }}
                  >
                    Get Started Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Event Marketing Benefits */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-sm p-8 mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">
              {t('event_marketing_power', 'Unlock the Power of Event Marketing')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-4xl mb-3">📅</div>
                <h3 className="text-xl font-semibold mb-2">{t('host_local_events', 'Host Local Events')}</h3>
                <p className="opacity-90">{t('create_engage_events', 'Create and promote engaging local events for your customers')}</p>
              </div>
              
              <div>
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-xl font-semibold mb-2">{t('track_performance', 'Track Performance')}</h3>
                <p className="opacity-90">{t('detailed_event_analytics', 'Get detailed analytics on event attendance and engagement')}</p>
              </div>
              
              <div>
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="text-xl font-semibold mb-2">{t('targeted_advertising', 'Targeted Advertising')}</h3>
                <p className="opacity-90">{t('sponsored_event_reach', 'Reach more customers with sponsored event listings')}</p>
              </div>
              
              <div>
                <div className="text-4xl mb-3">🚀</div>
                <h3 className="text-xl font-semibold mb-2">{t('boost_sales', 'Boost Sales')}</h3>
                <p className="opacity-90">{t('events_drive_sales', 'Events drive direct sales and build customer loyalty')}</p>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
            <h2 className="text-3xl font-bold text-amazon-dark text-center mb-8">
              {t('why_sell_on_durcheap', 'Why Sell on Durcheap?')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-amazon-blue rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{t('fast_setup', 'Fast Setup')}</h3>
                <p className="text-gray-600">
                  {t('get_selling_minutes', 'Get your store up and running in just minutes with our easy-to-use seller tools.')}
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-amazon-orange rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{t('secure_payments', 'Secure Payments')}</h3>
                <p className="text-gray-600">
                  {t('secure_payment_processing', 'Secure payment processing with instant transfers to your account.')}
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{t('reach_millions', 'Reach Millions')}</h3>
                <p className="text-gray-600">
                  {t('access_millions_customers', 'Access millions of customers looking for products like yours.')}
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-3xl font-bold text-amazon-dark text-center mb-8">
              {t('frequently_asked_questions', 'Frequently Asked Questions')}
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">{t('can_change_plans', 'Can I change my plan anytime?')}</h3>
                <p className="text-gray-600">
                  {t('yes_change_plans_anytime', 'Yes, you can upgrade or downgrade your subscription plan at any time. Changes take effect immediately.')}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">{t('commission_calculated', 'How are commissions calculated?')}</h3>
                <p className="text-gray-600">
                  {t('commission_calculation_explanation', 'Commissions are calculated on the final sale price and vary by category and subscription plan. Local orders over $150 receive additional discounts.')}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">{t('payment_schedule', 'When do I get paid?')}</h3>
                <p className="text-gray-600">
                  {t('payment_schedule_explanation', 'Payments are processed within 2-3 business days after order completion. You can track all earnings in your seller dashboard.')}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">{t('event_marketing_works', 'How does event marketing work?')}</h3>
                <p className="text-gray-600">
                  {t('event_marketing_explanation', 'Create local events, workshops, or promotions to engage customers. Higher subscription tiers include more events, analytics, and advertising benefits.')}
                </p>
                <div className="mt-3 space-y-2">
                  <Link href="/event-advertising" className="block text-amazon-blue hover:text-amazon-blue/80 font-medium">
                    {t('learn_more_event_advertising', 'Learn more about Event Advertising →')}
                  </Link>
                  <Link href="/event-branding" className="block text-orange-600 hover:text-orange-700 font-medium">
                    ✓ Customize Event Branding & Themes (Enterprise) →
                  </Link>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">{t('sponsored_events_cost', 'What are sponsored event listings?')}</h3>
                <p className="text-gray-600">
                  {t('sponsored_events_explanation', 'Featured placement for your events in local search results and event calendars. Pro subscribers get 50% off, Enterprise gets featured placement included.')}
                </p>
              </div>
            </div>
          </div>

          {/* See All Options CTA */}
          <div className="mt-12 text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">{t('explore_all_options', 'Explore All Options')}</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              {t('see_all_options_description', 'View our complete range of subscription plans, tools, and services to find the perfect combination for your business.')}
            </p>
            <Link href="/all-options">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                {t('see_all_options', 'See All Options')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
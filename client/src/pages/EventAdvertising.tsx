import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { Check, Globe, MapPin, Building, Users, Calendar, Star, Zap } from "lucide-react";

export default function EventAdvertising() {
  const { t } = useLanguage();
  const [selectedTab, setSelectedTab] = useState<'single' | 'subscription'>('single');
  const { addToCart } = useCart();
  const { toast } = useToast();
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

  const geographicPricing = [
    {
      id: 'city',
      name: t('city_wide', 'City Wide'),
      description: t('city_wide_desc', 'Target customers in your specific city'),
      icon: <Building className="h-8 w-8 text-blue-600" />,
      singlePrice: 15,
      monthlyPrice: 59.88,
      twiceMonthlyPrice: 89.88,
      weeklyPrice: 119.76,
      dailyPrice: 179.64,
      reach: t('city_reach', '10K-50K potential customers'),
      popular: false
    },
    {
      id: 'metro',
      name: t('metro_area', 'Metro Area'),
      description: t('metro_area_desc', 'Reach the entire metropolitan area'),
      icon: <MapPin className="h-8 w-8 text-green-600" />,
      singlePrice: 35,
      monthlyPrice: 95.88,
      twiceMonthlyPrice: 143.88,
      weeklyPrice: 191.76,
      dailyPrice: 287.64,
      reach: t('metro_reach', '100K-500K potential customers'),
      popular: true
    },
    {
      id: 'state',
      name: t('state_wide', 'State Wide'),
      description: t('state_wide_desc', 'Cover your entire state'),
      icon: <Users className="h-8 w-8 text-purple-600" />,
      singlePrice: 75,
      monthlyPrice: 179.88,
      twiceMonthlyPrice: 269.88,
      weeklyPrice: 359.76,
      dailyPrice: 539.64,
      reach: t('state_reach', '1M-10M potential customers'),
      popular: false
    },
    {
      id: 'national',
      name: t('nation_wide', 'Nation Wide'),
      description: t('nation_wide_desc', 'Reach customers across the country'),
      icon: <Globe className="h-8 w-8 text-orange-600" />,
      singlePrice: 149,
      monthlyPrice: 239.88,
      twiceMonthlyPrice: 359.88,
      weeklyPrice: 479.76,
      dailyPrice: 719.64,
      reach: t('national_reach', '50M+ potential customers'),
      popular: false
    },
    {
      id: 'international',
      name: t('international', 'International'),
      description: t('international_desc', 'Global reach across multiple countries'),
      icon: <Globe className="h-8 w-8 text-red-600" />,
      singlePrice: 299,
      monthlyPrice: 599.88,
      twiceMonthlyPrice: 899.88,
      weeklyPrice: 1199.76,
      dailyPrice: 1799.64,
      reach: t('international_reach', '500M+ potential customers'),
      popular: false
    }
  ];

  const subscriptionFrequencies = [
    {
      id: 'monthly',
      name: t('once_monthly_annual', 'Once Monthly (Annual)'),
      description: t('monthly_annual_desc', 'Perfect for regular events - paid annually upfront'),
      discount: 0,
      badge: t('annual_billing', 'Annual Billing')
    },
    {
      id: 'twice-monthly',
      name: t('twice_monthly_annual', 'Twice Monthly (Annual)'),
      description: t('twice_monthly_annual_desc', 'Great for frequent promotions - paid annually upfront'),
      discount: 0,
      badge: t('annual_billing', 'Annual Billing')
    },
    {
      id: 'weekly',
      name: t('weekly_annual', 'Weekly (Annual)'),
      description: t('weekly_annual_desc', 'Maximum engagement with weekly events - paid annually upfront'),
      discount: 0,
      badge: t('annual_billing', 'Annual Billing')
    },
    {
      id: 'daily',
      name: t('daily_annual', 'Daily (Annual)'),
      description: t('daily_annual_desc', 'Ultimate visibility with daily promotions - paid annually upfront'),
      discount: 0,
      badge: t('annual_billing', 'Annual Billing')
    }
  ];

  const features = [
    t('premium_placement', 'Premium event placement'),
    t('featured_badge', 'Featured event badge'),
    t('social_media_sharing', 'Social media sharing tools'),
    t('event_analytics', 'Detailed event analytics'),
    t('customer_messaging', 'Direct customer messaging'),
    t('rsvp_management', 'RSVP management system'),
    t('promotional_tools', 'Advanced promotional tools'),
    t('mobile_optimization', 'Mobile-optimized event pages')
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-amazon-dark mb-4">
              {t('event_advertising', 'Event Advertising')}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('event_advertising_desc', 'Promote your events to the right audience with our flexible advertising options. Choose your geographic reach and frequency to maximize attendance.')}
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button
                onClick={() => setSelectedTab('single')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  selectedTab === 'single'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-orange-500'
                }`}
              >
                <Calendar className="h-4 w-4 mr-2 inline" />
                {t('single_events', 'Single Events')}
              </button>
              <button
                onClick={() => setSelectedTab('subscription')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  selectedTab === 'subscription'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-orange-500'
                }`}
              >
                <Star className="h-4 w-4 mr-2 inline" />
                {t('subscription_plans', 'Subscription Plans')}
              </button>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-center mb-6">
              {t('advertising_benefits', 'Event Advertising Benefits')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <Check className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {selectedTab === 'single' ? (
            /* Single Event Pricing */
            <div>
              <h2 className="text-3xl font-bold text-center mb-8 text-amazon-dark">
                {t('single_event_pricing', 'Single Event Pricing')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {geographicPricing.map((tier) => (
                  <Card key={tier.id} className={`relative ${tier.popular ? 'ring-2 ring-amazon-orange' : ''}`}>
                    {tier.popular && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amazon-orange">
                        {t('most_popular', 'Most Popular')}
                      </Badge>
                    )}
                    <CardHeader className="text-center pb-4">
                      <div className="flex justify-center mb-4">
                        {tier.icon}
                      </div>
                      <CardTitle className="text-xl">{tier.name}</CardTitle>
                      <p className="text-gray-600 text-sm">{tier.description}</p>
                      <div className="text-3xl font-bold text-amazon-blue mt-4">
                        ${tier.singlePrice}
                      </div>
                      <p className="text-sm text-gray-500">{t('per_notice', 'per notice')}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 mr-2 text-gray-500" />
                          {tier.reach}
                        </div>
                        <div className="flex items-center text-sm">
                          <Zap className="h-4 w-4 mr-2 text-gray-500" />
                          {t('instant_activation', 'Instant activation')}
                        </div>
                      </div>
                      <Button 
                        className="w-full bg-amazon-blue hover:bg-amazon-blue/90"
                        onClick={() => {
                          const productId = tier.singlePrice >= 50 ? 'single_event_featured' : 'single_event_sponsored';
                          handleAddToCart(productId, `${tier.name} Event Advertising`);
                        }}
                      >
                        {t('advertise_event', 'Advertise Event')}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            /* Subscription Plans */
            <div>
              <h2 className="text-3xl font-bold text-center mb-8 text-amazon-dark">
                {t('subscription_advertising', 'Subscription Advertising Plans')}
              </h2>
              
              {subscriptionFrequencies.map((frequency) => (
                <div key={frequency.id} className="mb-12">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-amazon-dark mb-2">
                      {frequency.name}
                      {frequency.badge && (
                        <Badge className="ml-3 bg-green-600">{frequency.badge}</Badge>
                      )}
                    </h3>
                    <p className="text-gray-600">{frequency.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {geographicPricing.map((tier) => {
                      const basePrice = frequency.id === 'monthly' ? tier.monthlyPrice :
                                       frequency.id === 'twice-monthly' ? tier.twiceMonthlyPrice :
                                       frequency.id === 'weekly' ? tier.weeklyPrice :
                                       tier.dailyPrice;
                      
                      const finalPrice = basePrice;
                      
                      return (
                        <Card key={tier.id} className={`relative ${tier.popular ? 'ring-2 ring-amazon-orange' : ''}`}>
                          {tier.popular && (
                            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amazon-orange">
                              {t('most_popular', 'Most Popular')}
                            </Badge>
                          )}
                          <CardHeader className="text-center pb-4">
                            <div className="flex justify-center mb-4">
                              {tier.icon}
                            </div>
                            <CardTitle className="text-lg">{tier.name}</CardTitle>
                            <div className="text-2xl font-bold text-amazon-blue mt-2">
                              ${finalPrice.toFixed(2)}
                            </div>
                            <p className="text-sm text-gray-500">
                              {t('per_year_upfront', 'per year (paid upfront)')}
                            </p>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center text-sm">
                                <Users className="h-4 w-4 mr-2 text-gray-500" />
                                {tier.reach}
                              </div>
                              <div className="flex items-center text-sm">
                                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                {frequency.name.toLowerCase()} {t('events', 'events')} ({
                                  frequency.id === 'monthly' ? 
                                    (tier.id === 'city' ? '$4.99/month' :
                                     tier.id === 'metro' ? '$7.99/month' :
                                     tier.id === 'state' ? '$12.99/month' :
                                     tier.id === 'national' ? '$16.99/month' :
                                     '$49.99/month') :
                                  frequency.id === 'twice-monthly' ? 
                                    (tier.id === 'city' ? '$7.49/month' :
                                     tier.id === 'metro' ? '$11.99/month' :
                                     tier.id === 'state' ? '$22.49/month' :
                                     tier.id === 'national' ? '$29.99/month' :
                                     '$74.99/month') :
                                  frequency.id === 'weekly' ? 
                                    (tier.id === 'city' ? '$9.98/month' :
                                     tier.id === 'metro' ? '$15.98/month' :
                                     tier.id === 'state' ? '$29.98/month' :
                                     tier.id === 'national' ? '$39.98/month' :
                                     '$99.98/month') :
                                    (tier.id === 'city' ? '$14.97/month' :
                                     tier.id === 'metro' ? '$23.97/month' :
                                     tier.id === 'state' ? '$44.97/month' :
                                     tier.id === 'national' ? '$59.97/month' :
                                     '$149.97/month')
                                })
                              </div>
                            </div>
                            <Button 
                              className="w-full bg-amazon-blue hover:bg-amazon-blue/90"
                              onClick={() => {
                                const productMap: Record<string, string> = {
                                  'city': 'event_marketing_city',
                                  'metro': 'event_marketing_metro',
                                  'state': 'event_marketing_metro', 
                                  'national': 'event_marketing_nationwide',
                                  'global': 'event_marketing_nationwide'
                                };
                                const productId = productMap[tier.id] || 'event_marketing_city';
                                handleAddToCart(productId, `${tier.name} ${frequency.name} Subscription`);
                              }}
                            >
                              {t('start_subscription', 'Start Subscription')}
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* FAQ Section */}
          <div className="bg-white rounded-lg shadow-sm p-8 mt-12">
            <h2 className="text-2xl font-bold text-amazon-dark text-center mb-8">
              {t('frequently_asked_questions', 'Frequently Asked Questions')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">{t('how_geographic_targeting', 'How does geographic targeting work?')}</h3>
                <p className="text-gray-600">
                  {t('geographic_targeting_explanation', 'Your event will be promoted to users within your selected geographic area. City targets specific municipalities, Metro covers metropolitan areas, State reaches entire states, National covers the whole country, and International reaches global audiences.')}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">{t('subscription_vs_single', 'Subscription vs single event - which is better?')}</h3>
                <p className="text-gray-600">
                  {t('subscription_vs_single_explanation', 'Subscriptions offer consistent monthly rates billed annually upfront and are perfect for businesses with regular events. Single events are ideal for one-time promotions or testing different markets.')}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">{t('can_cancel_subscription', 'Can I cancel my subscription anytime?')}</h3>
                <p className="text-gray-600">
                  {t('cancel_subscription_explanation', 'Yes, you may cancel your subscription at any time, however all annual subscription purchases are final. Your account will remain open for edits and posting of event notices for the remaining subscription period.')}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">{t('when_events_go_live', 'When do my events go live?')}</h3>
                <p className="text-gray-600">
                  {t('events_go_live_explanation', 'Single events activate instantly after payment. Subscription events can be scheduled in advance and will automatically go live according to your chosen frequency.')}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">{t('can_change_geographic_area', 'Can I change my geographic area?')}</h3>
                <p className="text-gray-600">
                  {t('change_geographic_explanation', 'Yes! You can upgrade or downgrade your geographic reach anytime. For subscriptions, changes take effect with your next billing cycle.')}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">{t('monthly_annual_billing', 'Why is monthly advertising billed annually?')}</h3>
                <p className="text-gray-600">
                  {t('monthly_annual_explanation', 'Monthly advertising plans are billed annually upfront to provide significant cost savings (up to 80% off single event rates) and ensure consistent event promotion throughout the year.')}
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
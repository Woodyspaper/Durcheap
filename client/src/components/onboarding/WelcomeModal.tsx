import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, ShoppingBag, Store, Star, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface WelcomeModalProps {
  onStartTour: () => void;
  onSkip: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onStartTour, onSkip }) => {
  const { user } = useAuth();
  
  const userBenefits = [
    {
      icon: <ShoppingBag className="h-5 w-5" />,
      title: 'Shop with Confidence',
      description: 'Discover quality products from trusted sellers'
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: 'Read Reviews',
      description: 'Make informed decisions with customer reviews'
    },
    {
      icon: <Gift className="h-5 w-5" />,
      title: 'Great Deals',
      description: 'Find amazing prices and special offers'
    }
  ];

  const sellerBenefits = [
    {
      icon: <Store className="h-5 w-5" />,
      title: 'Sell Your Products',
      description: 'Reach thousands of potential customers'
    },
    {
      icon: <ShoppingBag className="h-5 w-5" />,
      title: 'Manage Inventory',
      description: 'Easy-to-use tools for product management'
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: 'Track Performance',
      description: 'Monitor sales and customer feedback'
    }
  ];

  const benefits = user?.role === 'seller' || user?.role === 'admin' 
    ? [...userBenefits, ...sellerBenefits] 
    : userBenefits;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        {/* Welcome Card */}
        <Card className="w-full max-w-md shadow-2xl border-2 border-amazon-orange">
          <CardHeader className="relative text-center">
            <button
              onClick={onSkip}
              className="absolute right-2 top-2 p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mx-auto w-16 h-16 bg-amazon-orange rounded-full flex items-center justify-center mb-4">
              <Gift className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-amazon-blue">
              Welcome to Durcheap!
            </CardTitle>
            {user?.firstName && (
              <p className="text-gray-600">
                Hi {user.firstName}, we're excited to have you here.
              </p>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Role Badge */}
            <div className="text-center">
              <Badge 
                variant="secondary" 
                className="bg-amazon-orange/10 text-amazon-orange border-amazon-orange/20"
              >
                {user?.role === 'seller' ? 'Seller Account' : 
                 user?.role === 'admin' ? 'Admin Account' : 'Buyer Account'}
              </Badge>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              <h3 className="font-semibold text-amazon-blue">What you can do:</h3>
              {benefits.slice(0, 3).map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amazon-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                    {benefit.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{benefit.title}</h4>
                    <p className="text-xs text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tour CTA */}
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <h3 className="font-semibold text-amazon-blue mb-2">
                Ready to get started?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Take a quick tour to learn how to make the most of your marketplace experience.
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={onStartTour}
                  className="w-full bg-amazon-orange hover:bg-amazon-orange/90"
                >
                  Start Quick Tour (2 minutes)
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onSkip}
                  className="w-full"
                >
                  Skip for now
                </Button>
              </div>
            </div>

            {/* First-time bonus hint */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                💡 New users get exclusive tips and recommendations
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default WelcomeModal;
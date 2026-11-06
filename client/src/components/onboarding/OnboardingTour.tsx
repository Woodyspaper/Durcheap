import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ArrowLeft, ArrowRight, Target, ShoppingBag, User, Store } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface TourStep {
  id: string;
  title: string;
  content: string;
  target?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  icon: React.ReactNode;
  action?: () => void;
}

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete, onSkip }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: `Welcome to Durcheap, ${user?.firstName || 'there'}!`,
      content: "Let's take a quick tour to help you get the most out of your marketplace experience. This will only take a minute.",
      position: 'center',
      icon: <Target className="h-6 w-6" />
    },
    {
      id: 'search',
      title: 'Find What You Need',
      content: 'Use the search bar to quickly find products across all categories. Try searching for electronics, books, or any product type.',
      target: '.search-bar',
      position: 'bottom',
      icon: <ShoppingBag className="h-6 w-6" />
    },
    {
      id: 'categories',
      title: 'Browse by Category',
      content: 'Explore our organized categories to discover new products. Each category is carefully curated with quality items.',
      target: '.categories-grid',
      position: 'top',
      icon: <ShoppingBag className="h-6 w-6" />
    },
    {
      id: 'cart',
      title: 'Shopping Cart',
      content: 'Add items to your cart as you browse. Your cart is saved across sessions, so you never lose your selections.',
      target: '.cart-button',
      position: 'bottom',
      icon: <ShoppingBag className="h-6 w-6" />
    },
    {
      id: 'profile',
      title: 'Your Account',
      content: 'Access your profile, order history, and account settings. Track your purchases and manage your preferences.',
      target: '.user-menu',
      position: 'bottom',
      icon: <User className="h-6 w-6" />
    }
  ];

  // Add seller-specific steps if user is a seller
  if (user?.role === 'seller' || user?.role === 'admin') {
    tourSteps.push({
      id: 'seller',
      title: 'Seller Tools',
      content: 'As a seller, you can manage your products, view sales analytics, and track orders from your seller dashboard.',
      target: '.seller-menu',
      position: 'bottom',
      icon: <Store className="h-6 w-6" />
    });
  }

  tourSteps.push({
    id: 'complete',
    title: 'You\'re All Set!',
    content: 'You\'re ready to start shopping or selling on Durcheap. Explore the marketplace and discover amazing products!',
    position: 'center',
    icon: <Target className="h-6 w-6" />
  });

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    // Store completion in localStorage
    localStorage.setItem('durcheap_onboarding_completed', 'true');
    localStorage.setItem('durcheap_onboarding_completed_date', new Date().toISOString());
    onComplete();
  };

  const handleSkip = () => {
    setIsVisible(false);
    localStorage.setItem('durcheap_onboarding_skipped', 'true');
    onSkip();
  };

  const getStepPosition = (step: TourStep) => {
    if (step.position === 'center') {
      return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50';
    }
    
    // For targeted steps, we'll position relative to the target element
    // This is a simplified implementation - in production, you'd use libraries like react-joyride
    return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50';
  };

  if (!isVisible) return null;

  const currentTourStep = tourSteps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      
      {/* Tour Card */}
      <div className={getStepPosition(currentTourStep)}>
        <Card className="w-96 max-w-[90vw] shadow-2xl border-2 border-amazon-orange">
          <CardHeader className="relative">
            <button
              onClick={handleSkip}
              className="absolute right-2 top-2 p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-4 w-4" />
            </button>
            <CardTitle className="flex items-center gap-2 text-amazon-blue">
              {currentTourStep.icon}
              {currentTourStep.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              {currentTourStep.content}
            </p>
            
            {/* Progress indicators */}
            <div className="flex justify-center space-x-2">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep
                      ? 'bg-amazon-orange'
                      : index < currentStep
                      ? 'bg-amazon-orange/50'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <span className="text-sm text-gray-500">
                {currentStep + 1} of {tourSteps.length}
              </span>
              
              <Button
                onClick={nextStep}
                className="flex items-center gap-2 bg-amazon-orange hover:bg-amazon-orange/90"
              >
                {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                {currentStep !== tourSteps.length - 1 && (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Skip option */}
            {currentStep !== tourSteps.length - 1 && (
              <div className="text-center pt-2">
                <button
                  onClick={handleSkip}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Skip tour
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default OnboardingTour;
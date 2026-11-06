import React, { useEffect } from 'react';
import { useTutorial } from './TutorialContext';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, ShoppingBag, MapPin, Calendar, Gift, ArrowRight } from 'lucide-react';

export function WelcomeTutorial() {
  const { isAuthenticated } = useAuth();
  const { startTutorial, setSteps } = useTutorial();
  const [showWelcome, setShowWelcome] = React.useState(false);

  useEffect(() => {
    // Show welcome dialog for new users
    const hasSeenWelcome = localStorage.getItem('durcheap_welcome_shown');
    if (!hasSeenWelcome && !isAuthenticated) {
      setShowWelcome(true);
    }
  }, [isAuthenticated]);

  const tutorialSteps = [
    {
      id: 'header-logo',
      title: 'Welcome to Durcheap!',
      content: 'This is your home for finding amazing products and local events. Let\'s take a quick tour of the key features.',
      target: 'header a[href="/"]',
      position: 'bottom' as const,
    },
    {
      id: 'search-bar',
      title: 'Search Everything',
      content: 'Use this search bar to find any product or service. You can search by name, category, or even use voice search!',
      target: '.search-bar input',
      position: 'bottom' as const,
    },
    {
      id: 'voice-search',
      title: 'Voice Search',
      content: 'Click this microphone to search using your voice. It\'s fast and convenient when you\'re on the go!',
      target: '[data-testid="voice-search-button"]',
      position: 'bottom' as const,
    },
    {
      id: 'location',
      title: 'Your Location',
      content: 'We automatically detect your location to show local products and events. You can change this anytime.',
      target: '[data-testid="location-editor"]',
      position: 'bottom' as const,
    },
    {
      id: 'categories',
      title: 'Browse Categories',
      content: 'Explore products by category. We have everything from electronics to local contractor services.',
      target: '.category-grid',
      position: 'top' as const,
    },
    {
      id: 'local-events',
      title: 'Local Events',
      content: 'Discover events happening in your area - from farmers markets to music festivals and professional workshops.',
      target: 'a[href="/events"]',
      position: 'bottom' as const,
    },
    {
      id: 'cart',
      title: 'Your Shopping Cart',
      content: 'Add items to your cart as you shop. You can review and checkout whenever you\'re ready.',
      target: '[data-testid="cart-button"]',
      position: 'bottom' as const,
    },

  ];

  const handleStartTutorial = () => {
    setSteps(tutorialSteps);
    startTutorial();
    setShowWelcome(false);
    localStorage.setItem('durcheap_welcome_shown', 'true');
  };

  const handleSkipTutorial = () => {
    setShowWelcome(false);
    localStorage.setItem('durcheap_welcome_shown', 'true');
  };

  return (
    <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-6 w-6 text-amazon-orange" />
            Welcome to Durcheap!
          </DialogTitle>
          <DialogDescription className="text-base">
            Your one-stop marketplace for products and local experiences
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <ShoppingBag className="h-8 w-8 text-amazon-orange" />
              <div>
                <div className="font-medium text-sm">Shop Products</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">7 categories</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <Calendar className="h-8 w-8 text-amazon-orange" />
              <div>
                <div className="font-medium text-sm">Local Events</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Near you</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <MapPin className="h-8 w-8 text-amazon-orange" />
              <div>
                <div className="font-medium text-sm">Shop Local</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Support nearby</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <Gift className="h-8 w-8 text-amazon-orange" />
              <div>
                <div className="font-medium text-sm">Earn Rewards</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Points & levels</div>
              </div>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Take a quick tour to discover all features
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleSkipTutorial}
            className="flex-1"
          >
            Skip for now
          </Button>
          <Button
            onClick={handleStartTutorial}
            className="flex-1 bg-amazon-orange hover:bg-orange-600 text-amazon-dark"
          >
            Start Tour
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
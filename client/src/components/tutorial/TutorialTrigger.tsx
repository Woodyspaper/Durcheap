import React from 'react';
import { useTutorial } from './TutorialContext';
import { Button } from '@/components/ui/button';
import { HelpCircle, Play } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function TutorialTrigger() {
  const { startTutorial, setSteps } = useTutorial();

  const tutorialSteps = [
    {
      id: 'header-logo',
      title: 'Welcome Back to Durcheap!',
      content: 'Let\'s refresh your knowledge of our key features. This tour will show you everything you can do.',
      target: 'header a[href="/"]',
      position: 'bottom' as const,
    },
    {
      id: 'search-bar',
      title: 'Smart Search',
      content: 'Search for products, services, or local events. Use the dropdown to filter by category for better results.',
      target: '.search-bar input',
      position: 'bottom' as const,
    },
    {
      id: 'voice-search',
      title: 'Voice Search Feature',
      content: 'Click the microphone to search using your voice - perfect for hands-free shopping!',
      target: '[data-testid="voice-search-button"]',
      position: 'bottom' as const,
    },
    {
      id: 'location',
      title: 'Location Services',
      content: 'Your location helps us show relevant local products and events. Click to update or change your location.',
      target: '[data-testid="location-editor"]',
      position: 'bottom' as const,
    },
    {
      id: 'all-menu',
      title: 'All Categories Menu',
      content: 'Click "All" to browse by category, find local products, or access your account settings.',
      target: 'nav button:first-child',
      position: 'bottom' as const,
    },
    {
      id: 'events-link',
      title: 'Local Events',
      content: 'Discover community events, networking opportunities, and entertainment happening near you.',
      target: 'a[href="/events"]',
      position: 'bottom' as const,
    },
    {
      id: 'cart',
      title: 'Shopping Cart',
      content: 'Your cart shows item count and total. Click to review items or proceed to checkout.',
      target: '[data-testid="cart-button"]',
      position: 'bottom' as const,
    },

    {
      id: 'categories',
      title: 'Product Categories',
      content: 'Browse our complete selection - from electronics and fashion to professional tools and services.',
      target: '.category-grid',
      position: 'top' as const,
    },
    {
      id: 'featured-products',
      title: 'Featured Products',
      content: 'Check out our hand-picked featured products with great ratings and competitive prices.',
      target: '.featured-products',
      position: 'top' as const,
    },
  ];

  const handleStartTutorial = () => {
    setSteps(tutorialSteps);
    startTutorial();
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleStartTutorial}
            variant="outline"
            size="sm"
            className="fixed bottom-6 right-6 z-30 bg-amazon-orange hover:bg-orange-600 text-amazon-dark border-amazon-orange shadow-lg"
          >
            <Play className="h-4 w-4 mr-1" />
            Take Tour
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Take an interactive tour of Durcheap features</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
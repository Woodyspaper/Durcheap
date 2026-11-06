import React from 'react';
import { HelpTooltip } from './HelpTooltip';
import { useHelp } from './HelpProvider';

interface ContextualHelpProps {
  id: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  showOnHover?: boolean;
  trigger?: 'hover' | 'click' | 'auto';
}

export function ContextualHelp({ 
  id, 
  title, 
  content, 
  position = 'bottom', 
  children,
  showOnHover = false,
  trigger = 'click'
}: ContextualHelpProps) {
  const { shouldShowHelp, dismissHelp } = useHelp();

  if (!shouldShowHelp(id)) {
    return <>{children}</>;
  }

  const handleDismiss = () => {
    dismissHelp(id);
  };

  if (trigger === 'hover') {
    return (
      <div className="relative group">
        {children}
        <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
          <HelpTooltip
            id={id}
            title={title}
            content={content}
            position={position}
            showOnHover={true}
            persistent={false}
          >
            <div></div>
          </HelpTooltip>
        </div>
      </div>
    );
  }

  return (
    <HelpTooltip
      id={id}
      title={title}
      content={content}
      position={position}
      showOnHover={showOnHover}
      persistent={false}
    >
      {children}
    </HelpTooltip>
  );
}

// Pre-defined help content for common UI elements
export const helpContent = {
  search: {
    title: "Smart Search",
    content: "Search by product name, category, or use voice search with the microphone icon. Use filters to narrow down results by price, location, and more."
  },
  categories: {
    title: "Browse Categories",
    content: "Click on any category to explore products. Each category has specialized subcategories to help you find exactly what you need."
  },
  cart: {
    title: "Shopping Cart",
    content: "Add items to your cart and checkout securely. Your cart is saved automatically, so you can continue shopping later."
  },
  wishlist: {
    title: "Wishlist",
    content: "Click the heart icon to save items for later. Build your wishlist and share it with friends or return to purchase when ready."
  },
  seller: {
    title: "Seller Tools",
    content: "Manage your products, view sales analytics, and grow your business with our comprehensive seller dashboard."
  },
  shopLocal: {
    title: "Shop Local",
    content: "Find products and services near you. Filter by location to support local businesses and get faster delivery."
  },
  voice: {
    title: "Voice Search",
    content: "Click the microphone to search using your voice. Just speak naturally and we'll find what you're looking for."
  },
  voiceSearch: {
    title: "Voice Search",
    content: "Click the microphone to search using your voice. Just speak naturally and we'll find what you're looking for."
  },
  rewards: {
    title: "Reward Points",
    content: "Earn points with every purchase and unlock achievements. Redeem points for discounts on future orders."
  },
  accountMenu: {
    title: "Account Menu",
    content: "Access your orders, account settings, seller dashboard, and more. Click on your profile picture or name to get started."
  },
  location: {
    title: "Delivery Location",
    content: "Your delivery location helps us show accurate shipping times and find local products and services. Click the edit icon to manually correct your location, or the map icon to refresh using GPS."
  },
  newUserWelcome: {
    title: "Welcome to Durcheap!",
    content: "We've enabled help tips to guide you around the marketplace. You can toggle them on/off anytime using the help button in the bottom right corner."
  }
};
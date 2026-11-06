import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Product } from '@shared/schema';

interface WishlistButtonProps {
  product: Product;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline' | 'default';
  showText?: boolean;
  className?: string;
}

interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
  product: Product;
  createdAt: Date;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  product,
  size = 'md',
  variant = 'ghost',
  showText = false,
  className = ""
}) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAnimating, setIsAnimating] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  // Query to check if product is in wishlist
  const { data: wishlistItems = [] } = useQuery<WishlistItem[]>({
    queryKey: ['/api/wishlist'],
    enabled: isAuthenticated,
  });

  const isInWishlist = wishlistItems.some(item => item.productId === product.id);

  // Mutation to add/remove from wishlist
  const wishlistMutation = useMutation({
    mutationFn: async (action: 'add' | 'remove') => {
      if (action === 'add') {
        return apiRequest('/api/wishlist', {
          method: 'POST',
          body: { productId: product.id }
        });
      } else {
        const wishlistItem = wishlistItems.find(item => item.productId === product.id);
        if (wishlistItem) {
          return apiRequest(`/api/wishlist/${wishlistItem.id}`, {
            method: 'DELETE'
          });
        }
      }
    },
    onSuccess: (_, action) => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      
      // Trigger heart animation
      setIsAnimating(true);
      setClickCount(prev => prev + 1);
      setTimeout(() => setIsAnimating(false), 600);

      toast({
        title: action === 'add' ? "Added to Wishlist ❤️" : "Removed from Wishlist",
        description: action === 'add' 
          ? `${product.name} has been saved to your wishlist.`
          : `${product.name} has been removed from your wishlist.`,
      });
    },
    onError: (error) => {
      console.error('Wishlist error:', error);
      toast({
        title: "Wishlist Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleClick = () => {
    if (!user) {
      toast({
        title: "Sign in Required",
        description: "Please sign in to save items to your wishlist.",
        variant: "destructive",
      });
      // Redirect to auth page
      window.location.href = "/auth";
      return;
    }

    if (wishlistMutation.isPending) return;

    const action = isInWishlist ? 'remove' : 'add';
    wishlistMutation.mutate(action);
  };

  // Heart burst animation effect
  const HeartBurstEffect = () => {
    if (!isAnimating) return null;

    return (
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`${clickCount}-${i}`}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              animation: `heartBurst 0.6s ease-out forwards`,
              animationDelay: `${i * 0.1}s`,
              transform: `translate(-50%, -50%) rotate(${i * 60}deg)`,
            }}
          >
            <Heart 
              className="h-3 w-3 text-red-500 fill-current opacity-80"
              style={{
                animation: `heartFloat 0.6s ease-out forwards`,
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return showText ? 'h-8 px-2 text-xs' : 'h-8 w-8 p-0';
      case 'lg':
        return showText ? 'h-12 px-4 text-base' : 'h-12 w-12 p-0';
      default:
        return showText ? 'h-10 px-3 text-sm' : 'h-10 w-10 p-0';
    }
  };

  const getHeartSize = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-6 w-6';
      default:
        return 'h-5 w-5';
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes heartBurst {
          0% {
            transform: translate(-50%, -50%) scale(0.8) rotate(var(--rotation, 0deg));
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(0.3) rotate(var(--rotation, 0deg)) translateY(-20px);
            opacity: 0;
          }
        }
        
        @keyframes heartFloat {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(0.8);
          }
        }
        
        @keyframes heartPulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
      
      <Button
        variant={variant}
        onClick={handleClick}
        disabled={wishlistMutation.isPending}
        className={`
          relative transition-all duration-200 
          ${getSizeClasses()}
          ${isInWishlist 
            ? 'text-red-500 hover:text-red-600' 
            : 'text-gray-400 hover:text-red-500'
          }
          ${isAnimating ? 'animate-pulse' : ''}
          ${className}
        `}
        title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <div className="relative flex items-center justify-center">
          <Heart 
            className={`
              ${getHeartSize()} 
              transition-all duration-200
              ${isInWishlist ? 'fill-current' : ''}
              ${isAnimating ? 'animate-pulse' : ''}
            `}
            style={{
              animation: isAnimating ? 'heartPulse 0.3s ease-in-out' : undefined
            }}
          />
          
          {showText && (
            <span className="ml-2">
              {isInWishlist ? 'Saved' : 'Save'}
            </span>
          )}
          
          {/* Heart burst effect */}
          <HeartBurstEffect />
        </div>
        
        {/* Loading indicator */}
        {wishlistMutation.isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded">
            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </Button>
    </>
  );
};
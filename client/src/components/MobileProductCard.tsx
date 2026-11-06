import { useState } from "react";
import { Link } from "wouter";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Product } from "@shared/schema";

interface MobileProductCardProps {
  product: Product;
  className?: string;
}

export function MobileProductCard({ product, className = "" }: MobileProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { t, translateCondition } = useLanguage();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: `${product.name} has been ${isWishlisted ? 'removed from' : 'added to'} your wishlist`,
    });
  };

  const displayPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const originalPrice = product.originalPrice ? 
    (typeof product.originalPrice === 'string' ? parseFloat(product.originalPrice) : product.originalPrice) : 
    null;

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 relative overflow-hidden ${className}`}>
      <Link href={`/products/${product.id}`}>
        <div className="relative">
          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 z-10 h-8 w-8 p-0 bg-white/80 hover:bg-white rounded-full"
            onClick={handleWishlist}
          >
            <Heart 
              className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
            />
          </Button>

          {/* Condition Badge */}
          {product.condition && product.condition !== 'new' && (
            <Badge 
              variant="secondary" 
              className="absolute top-2 left-2 z-10 text-xs"
            >
              {translateCondition(product.condition)}
            </Badge>
          )}

          {/* Product Image */}
          <div className="aspect-square overflow-hidden">
            <img
              src={product.images?.[0] || "/api/placeholder/300/300"}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
          </div>
        </div>

        <CardContent className="p-3 sm:p-4">
          {/* Brand */}
          {product.brand && (
            <p className="text-xs text-gray-600 mb-1 truncate">{product.brand}</p>
          )}

          {/* Product Name */}
          <h3 className="font-medium text-sm sm:text-base leading-tight mb-2 line-clamp-2 text-amazon-dark">
            {product.name}
          </h3>

          {/* Rating */}
          {product.averageRating && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(parseFloat(product.averageRating))
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600">
                ({product.totalReviews || 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-bold text-amazon-dark">
              ${displayPrice.toFixed(2)}
            </span>
            {originalPrice && originalPrice > displayPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
            {originalPrice && originalPrice > displayPrice && (
              <Badge variant="destructive" className="text-xs">
                {Math.round(((originalPrice - displayPrice) / originalPrice) * 100)}% off
              </Badge>
            )}
          </div>

          {/* Stock Status */}
          {product.stock !== undefined && (
            <div className="mb-3">
              {product.stock > 0 ? (
                <span className="text-xs text-green-600">
                  {product.stock < 10 ? t('only_left', 'Only {count} left').replace('{count}', product.stock.toString()) : t('in_stock', 'In Stock')}
                </span>
              ) : (
                <span className="text-xs text-red-600">{t('out_of_stock', 'Out of Stock')}</span>
              )}
            </div>
          )}

          {/* Local Badge */}
          {product.isLocal && (
            <Badge variant="outline" className="mb-3 text-xs">
              {t('shop_local', 'Shop Local')}
            </Badge>
          )}
        </CardContent>
      </Link>

      {/* Add to Cart Button */}
      <div className="p-3 sm:p-4 pt-0">
        <Button
          className="w-full bg-amazon-orange hover:bg-orange-600 text-amazon-dark mobile-button"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          <span className="text-sm">{t('add_to_cart', 'Add to Cart')}</span>
        </Button>
      </div>
    </Card>
  );
}
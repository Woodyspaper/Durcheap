import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { WishlistButton } from "@/components/WishlistButton";
import { Star } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addToCart, isLoading } = useCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product.id);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  const discountPercentage = product.originalPrice
    ? Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)
    : 0;

  return (
    <Card className={`group hover:shadow-lg transition-shadow cursor-pointer ${className}`}>
      <Link href={`/product/${product.id}`}>
        <CardContent className="p-4">
          <div className="aspect-square relative mb-4 overflow-hidden rounded-md bg-gray-100">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-sm">No image</span>
              </div>
            )}
            {discountPercentage > 0 && (
              <Badge className="absolute top-2 left-2 bg-red-600 text-white">
                -{discountPercentage}%
              </Badge>
            )}
            
            {/* Wishlist Button */}
            <div className="absolute top-2 right-2">
              <WishlistButton 
                product={product}
                size="sm"
                variant="ghost"
                className="bg-white/80 hover:bg-white/90 backdrop-blur-sm"
              />
            </div>
          </div>

          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-amazon-orange transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center mb-2">
            <div className="flex mr-2">
              {renderStars(Number(product.averageRating) || 0)}
            </div>
            <span className="text-sm text-gray-600">({product.totalReviews || 0})</span>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-amazon-dark">
                ${Number(product.price).toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${Number(product.originalPrice).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={isLoading || product.stock === 0}
            className="w-full bg-amazon-orange hover:bg-orange-600 text-white"
          >
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>

          {product.stock > 0 && product.stock <= 10 && (
            <p className="text-xs text-red-600 mt-2">Only {product.stock} left in stock</p>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}

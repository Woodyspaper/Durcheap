import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Star, ShoppingCart } from 'lucide-react';
import { Link } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@shared/schema';

interface ProductCarouselProps {
  products: Product[];
  title?: string;
  autoPlay?: boolean;
  interval?: number;
  showIndicators?: boolean;
  itemsPerView?: number;
  className?: string;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  title = "Featured Products",
  autoPlay = true,
  interval = 5000,
  showIndicators = true,
  itemsPerView = 4,
  className = ""
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const totalSlides = Math.ceil(products.length / itemsPerView);

  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
    setTimeout(() => setIsAnimating(false), 500);
  }, [totalSlides, isAnimating]);

  const prevSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    setTimeout(() => setIsAnimating(false), 500);
  }, [totalSlides, isAnimating]);

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || isHovered || totalSlides <= 1) return;

    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoPlay, isHovered, interval, nextSlide, totalSlides]);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const getCurrentProducts = () => {
    const startIndex = currentIndex * itemsPerView;
    return products.slice(startIndex, startIndex + itemsPerView);
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div 
      className={`relative bg-white rounded-lg shadow-sm ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <h2 className="text-2xl font-bold text-amazon-dark">{title}</h2>
        <div className="flex items-center space-x-2">
          {/* Navigation Arrows */}
          {totalSlides > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={prevSlide}
                disabled={isAnimating}
                className="h-8 w-8 p-0 rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextSlide}
                disabled={isAnimating}
                className="h-8 w-8 p-0 rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative overflow-hidden px-6">
        <div 
          className={`flex transition-transform duration-500 ease-in-out ${
            isAnimating ? 'transform' : ''
          }`}
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {Array.from({ length: totalSlides }).map((_, slideIndex) => (
            <div
              key={slideIndex}
              className="w-full flex-shrink-0 grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${Math.min(itemsPerView, products.length)}, 1fr)`,
              }}
            >
              {products
                .slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView)
                .map((product) => (
                  <Card
                    key={product.id}
                    className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <CardContent className="p-4">
                      <Link href={`/product/${product.id}`}>
                        <div className="relative mb-4 overflow-hidden rounded-lg">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg">
                              <span className="text-4xl">📦</span>
                            </div>
                          )}
                          
                          {/* Discount Badge */}
                          {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                            <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                              {Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)}% OFF
                            </Badge>
                          )}
                        </div>
                      </Link>

                      {/* Product Info */}
                      <div className="space-y-2">
                        <Link href={`/product/${product.id}`}>
                          <h3 className="font-medium text-amazon-dark line-clamp-2 hover:text-amazon-orange transition-colors">
                            {product.name}
                          </h3>
                        </Link>

                        {/* Rating */}
                        {product.rating && (
                          <div className="flex items-center space-x-1">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(product.rating!)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              ({product.rating.toFixed(1)})
                            </span>
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-amazon-blue">
                            ${Number(product.price).toFixed(2)}
                          </span>
                          {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                            <span className="text-sm text-gray-500 line-through">
                              ${Number(product.originalPrice).toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                          onClick={() => handleAddToCart(product)}
                          className="w-full bg-amazon-orange hover:bg-orange-600 text-amazon-dark font-semibold"
                          size="sm"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ))}
        </div>
      </div>

      {/* Indicators */}
      {showIndicators && totalSlides > 1 && (
        <div className="flex justify-center space-x-2 py-4">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-amazon-orange w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              disabled={isAnimating}
            />
          ))}
        </div>
      )}

      {/* Loading overlay during animation */}
      {isAnimating && (
        <div className="absolute inset-0 bg-white bg-opacity-50 pointer-events-none" />
      )}
    </div>
  );
};
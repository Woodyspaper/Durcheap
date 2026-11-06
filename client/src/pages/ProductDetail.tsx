import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Star, Truck, Shield, Award, Heart } from "lucide-react";
import type { Product, Review } from "@shared/schema";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const productId = params?.id;
  const { isAuthenticated } = useAuth();
  const { addToCart, isLoading: cartLoading } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");

  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    enabled: !!productId,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ["/api/products", productId, "reviews"],
    enabled: !!productId,
  });

  const reviewMutation = useMutation({
    mutationFn: async (reviewData: { rating: number; title?: string; content?: string }) => {
      return apiRequest("POST", `/api/products/${productId}/reviews`, reviewData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId, "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId] });
      setReviewTitle("");
      setReviewContent("");
      setReviewRating(5);
      toast({
        title: "Review submitted",
        description: "Thank you for your review!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/auth";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product.id, quantity);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to write a review",
        variant: "destructive",
      });
      return;
    }
    
    reviewMutation.mutate({
      rating: reviewRating,
      title: reviewTitle,
      content: reviewContent,
    });
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} ${
            interactive ? "cursor-pointer hover:text-yellow-400" : ""
          }`}
          onClick={interactive && onRatingChange ? () => onRatingChange(i) : undefined}
        />
      );
    }
    return stars;
  };

  if (productLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Skeleton className="aspect-square mb-4" />
              <div className="flex space-x-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="w-16 h-16" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-8 mb-4" />
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-12 w-40 mb-6" />
              <Skeleton className="h-32 mb-6" />
              <Skeleton className="h-10 w-24 mb-6" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-64" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
              <p className="text-gray-600">The product you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const discountPercentage = product.originalPrice
    ? Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)
    : 0;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm">
            <li><a href="/" className="text-amazon-blue hover:text-amazon-orange">Home</a></li>
            <li className="text-gray-400">/</li>
            <li><a href="/search" className="text-amazon-blue hover:text-amazon-orange">Products</a></li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-600">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Images */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <div className="aspect-square relative mb-4 overflow-hidden rounded-md bg-gray-100">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[selectedImage] || product.images[0]}
                      alt={product.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                  {discountPercentage > 0 && (
                    <Badge className="absolute top-2 right-2 bg-red-600 text-white">
                      -{discountPercentage}%
                    </Badge>
                  )}
                </div>
                {product.images && product.images.length > 1 && (
                  <div className="flex space-x-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-16 h-16 rounded border-2 overflow-hidden ${
                          selectedImage === index ? "border-amazon-blue" : "border-gray-300"
                        }`}
                      >
                        <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Product Details */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">{product.name}</h1>
                
                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex mr-2">
                    {renderStars(Number(product.averageRating) || 0)}
                  </div>
                  <span className="text-sm text-gray-600 mr-2">
                    {Number(product.averageRating).toFixed(1)} out of 5
                  </span>
                  <span className="text-sm text-amazon-blue">
                    ({product.totalReviews || 0} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-3xl font-bold text-amazon-dark">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-lg text-gray-500 line-through">
                        ${Number(product.originalPrice).toFixed(2)}
                      </span>
                    )}
                    {discountPercentage > 0 && (
                      <Badge className="bg-red-600 text-white">
                        {discountPercentage}% OFF
                      </Badge>
                    )}
                  </div>
                  <div className={`text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                    {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-700">{product.description}</p>
                  </div>
                )}

                {/* Specifications */}
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Specifications</h3>
                    <ul className="space-y-1 text-sm">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <li key={key} className="flex">
                          <span className="font-medium mr-2">{key}:</span>
                          <span className="text-gray-700">{String(value)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Seller Info */}
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">Ships from and sold by Durcheap</p>
                  <div className="flex items-center mt-2 space-x-4 text-sm">
                    <div className="flex items-center">
                      <Truck className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-green-600 font-medium">FREE delivery</span>
                    </div>
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-green-600">Secure transaction</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-green-600">30-day returns</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Options */}
          <div className="lg:col-span-1">
            <Card className="sticky top-32">
              <CardContent className="p-6">
                <div className="text-xl font-bold text-amazon-dark mb-4">
                  ${Number(product.price).toFixed(2)}
                </div>
                
                {product.stock > 0 && (
                  <div className="mb-4">
                    <Label htmlFor="quantity" className="block text-sm font-medium mb-2">
                      Quantity:
                    </Label>
                    <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={cartLoading || product.stock === 0}
                    className="w-full bg-amazon-orange hover:bg-orange-600 text-white"
                  >
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                  
                  {product.stock > 0 && (
                    <Button
                      variant="outline"
                      className="w-full border-amazon-orange text-amazon-orange hover:bg-amazon-orange hover:text-white"
                    >
                      Buy Now
                    </Button>
                  )}
                  
                  <Button variant="outline" className="w-full">
                    <Heart className="h-4 w-4 mr-2" />
                    Add to Wish List
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
              
              {/* Write Review Form */}
              {isAuthenticated && (
                <div className="mb-8 p-4 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <Label htmlFor="rating">Rating</Label>
                      <div className="flex mt-1">
                        {renderStars(reviewRating, true, setReviewRating)}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="reviewTitle">Title (optional)</Label>
                      <Input
                        id="reviewTitle"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        placeholder="Summary of your review"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reviewContent">Review (optional)</Label>
                      <Textarea
                        id="reviewContent"
                        value={reviewContent}
                        onChange={(e) => setReviewContent(e.target.value)}
                        placeholder="Share your thoughts about this product"
                        rows={4}
                      />
                    </div>
                    <Button type="submit" disabled={reviewMutation.isPending}>
                      {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                    </Button>
                  </form>
                </div>
              )}
              
              {/* Reviews List */}
              {reviewsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border-b pb-4">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-b-0">
                      <div className="flex items-center mb-2">
                        <div className="flex mr-2">
                          {renderStars(review.rating)}
                        </div>
                        <span className="font-medium text-sm">Verified Purchase</span>
                      </div>
                      {review.title && (
                        <h4 className="font-semibold mb-2">{review.title}</h4>
                      )}
                      {review.content && (
                        <p className="text-gray-700 mb-2">{review.content}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        {new Date(review.createdAt || "").toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

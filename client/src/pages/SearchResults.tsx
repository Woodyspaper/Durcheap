import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import ShopLocalFilter from "@/components/ShopLocalFilter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import type { Product, Category } from "@shared/schema";

export default function SearchResults() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const { city: userCity, state: userState, zipCode: userZipCode, country: userCountry } = useGeolocation();
  
  // Detect if we're on the deals page
  const isDealsPage = location.startsWith('/deals');
  
  const [filters, setFilters] = useState({
    search: searchParams.get("q") || "",
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sortBy: searchParams.get("sortBy") || "createdAt",
    shopLocal: searchParams.get("shopLocal") === "true",
    country: searchParams.get("country") || "",
    state: searchParams.get("state") || "",
    city: searchParams.get("city") || "",
    zipCode: searchParams.get("zipCode") || "",
    condition: searchParams.get("condition") || "",
    deals: isDealsPage,
  });

  const [showLocalFilter, setShowLocalFilter] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: productsData, isLoading } = useQuery<{
    products: Product[];
    total: number;
  }>({
    queryKey: [
      "/api/products",
      {
        ...filters,
        limit,
        offset: (currentPage - 1) * limit,
        // Pass user location for local prioritization
        userCountry,
        userState,
        userCity,
        userZipCode,
      },
    ],
  });

  const products = productsData?.products || [];
  const total = productsData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePriceFilter = (min: string, max: string) => {
    setFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }));
  };

  const handleLocalFiltersChange = (localFilters: {
    shopLocal: boolean;
    country: string;
    state: string;
    city: string;
    zipCode: string;
    condition: string;
  }) => {
    setFilters(prev => ({ ...prev, ...localFilters }));
    setShowLocalFilter(false);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className="w-64 space-y-6">
            {/* Shop Local Filter */}
            <ShopLocalFilter
              isOpen={showLocalFilter}
              onToggle={() => setShowLocalFilter(!showLocalFilter)}
              onFiltersChange={handleLocalFiltersChange}
            />
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Filters</h3>
                
                {/* Category Filter */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Category</h4>
                  <div className="space-y-2">
                    <Label className="flex items-center">
                      <Checkbox
                        checked={filters.category === ""}
                        onCheckedChange={() => updateFilter("category", "")}
                      />
                      <span className="ml-2 text-sm">All Categories</span>
                    </Label>
                    {categories.map((category) => (
                      <Label key={category.id} className="flex items-center">
                        <Checkbox
                          checked={filters.category === category.id}
                          onCheckedChange={() => updateFilter("category", category.id)}
                        />
                        <span className="ml-2 text-sm">{category.name}</span>
                      </Label>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Price</h4>
                  <div className="space-y-2">
                    <Label className="flex items-center">
                      <Checkbox
                        checked={!filters.minPrice && !filters.maxPrice}
                        onCheckedChange={() => handlePriceFilter("", "")}
                      />
                      <span className="ml-2 text-sm">Any Price</span>
                    </Label>
                    <Label className="flex items-center">
                      <Checkbox
                        checked={filters.minPrice === "0" && filters.maxPrice === "25"}
                        onCheckedChange={() => handlePriceFilter("0", "25")}
                      />
                      <span className="ml-2 text-sm">Under $25</span>
                    </Label>
                    <Label className="flex items-center">
                      <Checkbox
                        checked={filters.minPrice === "25" && filters.maxPrice === "50"}
                        onCheckedChange={() => handlePriceFilter("25", "50")}
                      />
                      <span className="ml-2 text-sm">$25 to $50</span>
                    </Label>
                    <Label className="flex items-center">
                      <Checkbox
                        checked={filters.minPrice === "50" && filters.maxPrice === "100"}
                        onCheckedChange={() => handlePriceFilter("50", "100")}
                      />
                      <span className="ml-2 text-sm">$50 to $100</span>
                    </Label>
                    <Label className="flex items-center">
                      <Checkbox
                        checked={filters.minPrice === "100" && !filters.maxPrice}
                        onCheckedChange={() => handlePriceFilter("100", "")}
                      />
                      <span className="ml-2 text-sm">Over $100</span>
                    </Label>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => updateFilter("minPrice", e.target.value)}
                        className="text-sm"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => updateFilter("maxPrice", e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Search Results */}
          <main className="flex-1">
            {/* Active Local Filters Display */}
            {(filters.shopLocal || filters.country || filters.state || filters.city || filters.zipCode) && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-blue-800">Active Local Filters:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.shopLocal && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Shop Local
                    </span>
                  )}
                  {filters.country && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Country: {filters.country}
                    </span>
                  )}
                  {filters.state && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      State: {filters.state}
                    </span>
                  )}
                  {filters.city && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      City: {filters.city}
                    </span>
                  )}
                  {filters.zipCode && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Zip: {filters.zipCode}
                    </span>
                  )}
                  <button
                    onClick={() => setFilters(prev => ({
                      ...prev,
                      shopLocal: false,
                      country: "",
                      state: "",
                      city: "",
                      zipCode: ""
                    }))}
                    className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full hover:bg-red-200"
                  >
                    Clear Local Filters
                  </button>
                </div>
              </div>
            )}

            {/* Results Header */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">
                      {isDealsPage 
                        ? "Today's Deals" 
                        : filters.search
                        ? `Search Results for "${filters.search}"`
                        : "All Products"}
                      {filters.shopLocal && " (Local)"}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {isLoading ? "Loading..." : `${total.toLocaleString()} results`}
                    </p>
                  </div>
                  <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Newest First</SelectItem>
                      <SelectItem value="local_first">Local First</SelectItem>
                      <SelectItem value="price_asc">Price: Low to High</SelectItem>
                      <SelectItem value="price_desc">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Customer Rating</SelectItem>
                      <SelectItem value="name">Name A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Product Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="aspect-square mb-4 rounded-md" />
                      <Skeleton className="h-6 mb-2" />
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-8 w-20 mb-3" />
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <h3 className="text-xl font-semibold mb-2">No products found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={currentPage === page ? "bg-amazon-blue" : ""}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
}

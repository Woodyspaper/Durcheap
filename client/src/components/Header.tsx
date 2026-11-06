import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { VoiceSearch } from "@/components/VoiceSearch";


import { LocationEditor } from "@/components/LocationEditor";
import { MapPin, Search, Menu, ShoppingCart, User, Package, LogOut, Calendar, Megaphone } from "lucide-react";
import logoImage from '@assets/Durcheap White Cart_transparent background_1753397837365.png';
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const { cartCount } = useCart();
  const { t, translateCategory } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Fetch categories from API
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Array<{id: string, name: string}>>({
    queryKey: ["/api/categories"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim() || selectedCategory) {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (selectedCategory) params.set('category', selectedCategory);
      setLocation(`/search?${params.toString()}`);
    }
  };

  const handleVoiceSearch = (query: string) => {
    setSearchQuery(query);
  };

  const { logoutMutation } = useAuth();
  
  const handleSignOut = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-amazon-dark text-white sticky top-0 z-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-amazon-dark px-2 py-2">
        <div className="flex items-center justify-between">
          {/* Mobile Logo and Menu */}
          <div className="flex items-center space-x-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:text-amazon-orange">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-white">
                <div className="py-4">
                  <h2 className="text-lg font-semibold mb-4">Menu</h2>
                  <div className="space-y-2">
                    <Link href="/" className="block py-2 px-3 rounded hover:bg-gray-100">Home</Link>
                    <Link href="/search" className="block py-2 px-3 rounded hover:bg-gray-100">Browse Products</Link>
                    <Link href="/events" className="block py-2 px-3 rounded hover:bg-gray-100">Local Events</Link>
                    <Link href="/help" className="block py-2 px-3 rounded hover:bg-gray-100">Help</Link>
                    <Link href="/faq" className="block py-2 px-3 rounded hover:bg-gray-100">FAQ</Link>
                    {isAuthenticated ? (
                      <>
                        <Link href="/account" className="block py-2 px-3 rounded hover:bg-gray-100">Your Account</Link>
                        <Link href="/orders" className="block py-2 px-3 rounded hover:bg-gray-100">Your Orders</Link>
                        {user?.role === "seller" && (
                          <>
                            <Link href="/seller" className="block py-2 px-3 rounded hover:bg-gray-100">Seller Dashboard</Link>
                            <Link href="/manage-products" className="block py-2 px-3 rounded hover:bg-gray-100">My Products</Link>
                          </>
                        )}
                        <button onClick={handleSignOut} className="block w-full text-left py-2 px-3 rounded hover:bg-gray-100">Sign Out</button>
                      </>
                    ) : (
                      <button onClick={() => setLocation("/auth")} className="block w-full text-left py-2 px-3 rounded hover:bg-gray-100">Sign In</button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <Link href="/" className="flex items-center space-x-2 text-lg font-bold text-white hover:text-amazon-orange transition-colors">
              <img 
                src={logoImage} 
                alt="Durcheap Logo" 
                className="h-6 w-6 object-contain filter brightness-0 invert"
              />
              <span className="hidden sm:inline">{t('site_name', 'Durcheap')}</span>
            </Link>
          </div>

          {/* Mobile Language Selector */}
          <div className="flex items-center space-x-2">
            <LanguageSelector />
            <Link href="/cart" className="relative">
              <ShoppingCart className="h-6 w-6 text-white hover:text-amazon-orange" />
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-amazon-orange text-amazon-dark rounded-full min-w-[18px] h-5 flex items-center justify-center text-xs">
                  {cartCount}
                </Badge>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-2 px-1">
          <form onSubmit={handleSearch} className="flex">
            <Input
              type="text"
              placeholder={t('search_products', 'Search products...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 rounded-r-none bg-white text-black"
            />
            <VoiceSearch onSearchQuery={handleVoiceSearch} />
            <Button type="submit" className="rounded-l-none bg-amazon-orange hover:bg-orange-600 text-amazon-dark">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-amazon-dark px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3 text-2xl font-bold text-white hover:text-amazon-orange transition-colors">
              <img 
                src={logoImage} 
                alt="Durcheap Logo" 
                className="h-8 w-8 object-contain filter brightness-0 invert"
              />
              <span>{t('site_name', 'Durcheap')}</span>
            </Link>
            <div className="hidden xl:flex">
              <div data-testid="location-editor">
                <LocationEditor />
              </div>
            </div>
          </div>

          {/* Language Selector - Center of top header */}
          <div className="flex-1 flex justify-center">
            <LanguageSelector />
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/help" className="text-sm hover:text-amazon-orange transition-colors" data-testid="link-help">
              Help
            </Link>
            <Link href="/faq" className="text-sm hover:text-amazon-orange transition-colors" data-testid="link-faq">
              FAQ
            </Link>

            {isAuthenticated ? (
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-sm hover:text-amazon-orange user-menu">
                      <User className="h-4 w-4 mr-1" />
                      <div className="text-left">
                        <div>Hello, {user?.firstName || "User"}</div>
                        <div className="font-semibold">Account & Lists</div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setLocation("/account")}>
                    Your Account
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/orders")}>
                    Your Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/membership")}>
                    Membership Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/subscription")}>
                    Seller Plans
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/referral-program")}>
                    Referral Program
                  </DropdownMenuItem>
                  {user?.role === "seller" && (
                    <>
                      <DropdownMenuItem onClick={() => setLocation("/seller")}>
                        Seller Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLocation("/manage-products")}>
                        My Products
                      </DropdownMenuItem>
                    </>
                  )}
                  {user?.role === "admin" && (
                    <DropdownMenuItem onClick={() => setLocation("/admin")}>
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                className="text-sm hover:text-amazon-orange"
                onClick={() => setLocation("/auth")}
              >
                <User className="h-4 w-4 mr-1" />
                <div className="text-left">
                  <div>{t('hello_sign_in', 'Hello, Sign in')}</div>
                  <div className="font-semibold">{t('account_lists', 'Account & Lists')}</div>
                </div>
              </Button>
            )}

            <Button variant="ghost" className="text-sm hover:text-amazon-orange hidden lg:flex" asChild>
              <Link href="/orders">
                <Package className="h-4 w-4 mr-1" />
                <div className="text-left">
                  <div>Returns</div>
                  <div className="font-semibold">& {t('orders', 'Orders')}</div>
                </div>
              </Link>
            </Button>

            <Button variant="ghost" className="flex items-center hover:text-amazon-orange relative cart-button" asChild data-testid="cart-button">
              <Link href="/cart">
                <ShoppingCart className="h-6 w-6 mr-1" />
                <span className="text-sm font-bold hidden lg:inline">{t('cart', 'Cart')}</span>
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-amazon-orange text-amazon-dark rounded-full min-w-[20px] h-5 flex items-center justify-center text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Link>
            </Button>
          </div>


        </div>
      </div>


      {/* Navigation */}
      <nav className="bg-amazon-blue px-4 py-2">
        <div className="max-w-7xl mx-auto">
          {/* Main Navigation Links */}
          <div className="flex items-center space-x-6 mb-2">
            <Link href="/deals" className="hover:text-amazon-orange transition-colors">
              {t('today_deals', "Daily Deals")}
            </Link>
            <Link href="/registry" className="hover:text-amazon-orange transition-colors">
              {t('registry', 'Registry')}
            </Link>

            <Link href={
              user?.subscriptionStatus === 'active' && user?.subscriptionPlan 
                ? '/add-product' 
                : '/subscription'
            } className="hover:text-amazon-orange transition-colors">
              {t('sell_products', 'Sell Products')}
            </Link>
            <Link href="/events" className="hover:text-amazon-orange transition-colors">
              {t('local_events', 'Local Events')}
            </Link>
            <Link href="/event-advertising" className="hover:text-amazon-orange transition-colors">
              {t('event_advertising', 'Event Advertising')}
            </Link>
          </div>
          
          {/* Search Bar */}
          <div className="flex items-center">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-200 text-amazon-dark px-3 py-2 rounded-l border-r border-gray-300 focus:outline-none min-w-[120px] text-sm categories-dropdown hover:bg-gray-100 transition-colors"
              disabled={categoriesLoading}
            >
              <option value="">{categoriesLoading ? 'Loading...' : t('all_categories', 'All Categories')}</option>
              {categories.map((category: any) => (
                <option key={category.id} value={category.id}>
                  {translateCategory(category.name)}
                </option>
              ))}
            </select>

            <form onSubmit={handleSearch} className="flex flex-1 search-form">
              <Input
                type="text"
                placeholder={t('search_products', 'Search products...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 rounded-none bg-white text-black border-0"
              />
              <div data-testid="voice-search">
                <VoiceSearch onSearchQuery={handleVoiceSearch} />
              </div>
              <Button type="submit" className="rounded-l-none bg-amazon-orange hover:bg-orange-600 text-amazon-dark">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </nav>
    </header>
  );
}

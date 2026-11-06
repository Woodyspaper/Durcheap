import { Switch, Route } from "wouter";
import { lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";


import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/lib/ProtectedRoute";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import AuthPage from "@/pages/AuthPage";
import Home from "@/pages/Home";
import SearchResults from "@/pages/SearchResults";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Account from "@/pages/Account";
import SellerDashboard from "@/pages/SellerDashboard";
import AdminPanel from "@/pages/AdminPanel";
import AdminHelp from "@/pages/AdminHelp";
import RevenueDashboard from "@/pages/RevenueDashboard";
import SellerSubscription from "@/pages/SellerSubscription";
import TaxDocuments from "@/pages/TaxDocuments";
import Help from "@/pages/Help";
import FAQ from "@/pages/FAQ";
import About from "@/pages/About";
import Careers from "@/pages/Careers";
import PressReleases from "@/pages/PressReleases";
import InvestorRelations from "@/pages/InvestorRelations";
import Investors from "@/pages/Investors";
import BusinessCard from "@/pages/BusinessCard";

import ReloadBalance from "@/pages/ReloadBalance";
import CurrencyConverter from "@/pages/CurrencyConverter";
import CryptoCurrencyConverter from "@/pages/CryptoCurrencyConverter";
import ProductForm from "@/pages/ProductForm";
import ProductManagement from "@/pages/ProductManagement";
import ShippingTools from "@/pages/ShippingTools";
import LocalEvents from "@/pages/LocalEvents";
import EventSubscriptions from "@/pages/EventSubscriptions";
import EventAdvertising from "@/pages/EventAdvertising";
import EventBranding from "@/pages/EventBranding";
import WhiteLabelMarketplace from "@/pages/WhiteLabelMarketplace";
import EventManagement from "@/pages/EventManagement";
import PostPurchaseEventSetup from "@/pages/PostPurchaseEventSetup";
import CouponTest from "@/pages/CouponTest";
import AllOptions from "@/pages/AllOptions";
import AnalyticsPro from "@/pages/AnalyticsPro";
import BusinessVerification from "@/pages/BusinessVerification";
import ReferralProgram from "@/pages/ReferralProgram";
import MembershipDashboard from "@/pages/MembershipDashboard";
import AdvertiseProducts from "@/pages/AdvertiseProducts";
import TwoFactorAuth from "@/pages/TwoFactorAuth";
import EmployeeManagement from "@/pages/EmployeeManagement";
import SellerTransition from "@/pages/SellerTransition";
import AdminUsersPage from "@/pages/AdminUsersPage";

import { LanguageProvider } from "@/contexts/LanguageContext";
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/landing" component={Landing} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/browse" component={SearchResults} />
      <Route path="/search" component={SearchResults} />
      <Route path="/product/:id" component={ProductDetail} />
      
      {/* Protected routes */}
      <ProtectedRoute path="/cart" component={() => <Cart />} />
      <ProtectedRoute path="/checkout" component={() => <Checkout />} />
      <ProtectedRoute path="/account" component={() => <Account />} />
      <ProtectedRoute path="/account/two-factor" component={() => <TwoFactorAuth />} />
      
      {/* Admin routes */}
      <Route path="/admin/employees" component={EmployeeManagement} />
      <Route path="/admin/users" component={AdminUsersPage} />
      <Route path="/admin/seller-transition" component={SellerTransition} />
      <Route path="/orders" component={Account} />
      <Route path="/orders/:id">
        {() => <Account />}
      </Route>
      
      {/* Role-based routes */}
      <Route path="/seller" component={SellerDashboard} />
      <Route path="/add-product" component={ProductForm} />
      <Route path="/manage-products" component={ProductManagement} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/admin/help" component={AdminHelp} />
      <Route path="/revenue" component={RevenueDashboard} />
      <Route path="/subscription" component={SellerSubscription} />
      <Route path="/tax-documents" component={TaxDocuments} />
      <Route path="/shipping-tools" component={ShippingTools} />
      
      {/* Support routes */}
      <Route path="/help" component={Help} />
      <Route path="/faq" component={FAQ} />
      <Route path="/about" component={About} />
      <Route path="/careers" component={Careers} />
      <Route path="/press" component={PressReleases} />
      <Route path="/investors" component={InvestorRelations} />
      <Route path="/investor-relations" component={InvestorRelations} />
      <Route path="/investor-dashboard" component={Investors} />
      <Route path="/business-card" component={BusinessCard} />
      
      {/* Alternative auth routes (redirects) */}
      <Route path="/signin" component={AuthPage} />
      <Route path="/login" component={AuthPage} />
      <Route path="/sign-in" component={AuthPage} />
      <Route path="/register" component={AuthPage} />
      <Route path="/signup" component={AuthPage} />

      <Route path="/reload" component={ReloadBalance} />
      <Route path="/currency" component={CurrencyConverter} />
      <Route path="/crypto" component={CryptoCurrencyConverter} />
      
      {/* Product management routes */}
      <Route path="/products/new" component={ProductForm} />
      <Route path="/products/edit/:id">{(params) => <ProductForm productId={params.id} mode="edit" />}</Route>
      <Route path="/products/manage" component={ProductManagement} />
      
      {/* Shipping tools */}
      <Route path="/shipping" component={ShippingTools} />
      <Route path="/events" component={LocalEvents} />
      <Route path="/event-subscriptions" component={EventSubscriptions} />
      <Route path="/event-advertising" component={EventAdvertising} />
      <Route path="/event-branding" component={EventBranding} />
      <Route path="/event-management" component={EventManagement} />
      <Route path="/event-setup" component={PostPurchaseEventSetup} />
      <Route path="/white-label" component={WhiteLabelMarketplace} />
      
      {/* Payment testing */}
      <Route path="/payment-test" component={lazy(() => import("@/pages/PaymentTest"))} />
      <Route path="/coupon-test" component={CouponTest} />
      <Route path="/all-options" component={AllOptions} />
      <Route path="/analytics-pro" component={AnalyticsPro} />
      <Route path="/business-verification" component={BusinessVerification} />
      <Route path="/referral-program" component={ReferralProgram} />
      <Route path="/membership" component={MembershipDashboard} />
      <Route path="/advertise-products" component={AdvertiseProducts} />
      
      {/* Category routes */}
      <Route path="/categories/:category">
        {(params) => <SearchResults />}
      </Route>
      
      {/* Additional routes */}
      <Route path="/deals">
        {() => <SearchResults />}
      </Route>
      <Route path="/customer-service" component={Help} />
      <Route path="/registry">
        {() => <SearchResults />}
      </Route>

      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <OnboardingProvider>
                <Router />
                <Toaster />
              </OnboardingProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

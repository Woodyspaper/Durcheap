import { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { HelpProvider } from "@/components/help/HelpProvider";
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";
import { CartProvider } from "@/contexts/CartContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

interface MobileLayoutProps {
  children: ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <LanguageProvider>
      <CartProvider>
        <HelpProvider>
          <OnboardingProvider>
            <div className="min-h-screen bg-background flex flex-col">
              <Header />
              <main className="flex-1 pb-safe">
                {children}
              </main>
              <Footer />
              <Toaster />
            </div>
          </OnboardingProvider>
        </HelpProvider>
      </CartProvider>
    </LanguageProvider>
  );
}
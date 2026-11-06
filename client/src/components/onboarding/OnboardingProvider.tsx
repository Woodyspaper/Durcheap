import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface OnboardingContextType {
  shouldShowOnboarding: boolean;
  isOnboardingComplete: boolean;
  startOnboarding: () => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  // Check if user should see onboarding
  useEffect(() => {
    if (isLoading) return;

    const hasCompletedOnboarding = localStorage.getItem('durcheap_onboarding_completed');
    const hasSkippedOnboarding = localStorage.getItem('durcheap_onboarding_skipped');
    const lastCompletedDate = localStorage.getItem('durcheap_onboarding_completed_date');

    // Check if onboarding was completed more than 30 days ago (optional reset)
    let shouldResetOnboarding = false;
    if (lastCompletedDate) {
      const completedDate = new Date(lastCompletedDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      shouldResetOnboarding = completedDate < thirtyDaysAgo;
    }

    // Show onboarding if:
    // 1. User is authenticated
    // 2. Haven't completed or skipped onboarding
    // 3. Or if it's been more than 30 days since completion
    const shouldShow = isAuthenticated && 
                      !hasCompletedOnboarding && 
                      !hasSkippedOnboarding;

    setShouldShowOnboarding(shouldShow);
    setIsOnboardingComplete(!!hasCompletedOnboarding && !shouldResetOnboarding);
  }, [isAuthenticated, isLoading]);

  const startOnboarding = () => {
    setShouldShowOnboarding(true);
  };

  const completeOnboarding = () => {
    setShouldShowOnboarding(false);
    setIsOnboardingComplete(true);
    localStorage.setItem('durcheap_onboarding_completed', 'true');
    localStorage.setItem('durcheap_onboarding_completed_date', new Date().toISOString());
    localStorage.removeItem('durcheap_onboarding_skipped');
  };

  const skipOnboarding = () => {
    setShouldShowOnboarding(false);
    localStorage.setItem('durcheap_onboarding_skipped', 'true');
  };

  const resetOnboarding = () => {
    localStorage.removeItem('durcheap_onboarding_completed');
    localStorage.removeItem('durcheap_onboarding_skipped');
    localStorage.removeItem('durcheap_onboarding_completed_date');
    setIsOnboardingComplete(false);
    if (isAuthenticated) {
      setShouldShowOnboarding(true);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        shouldShowOnboarding,
        isOnboardingComplete,
        startOnboarding,
        completeOnboarding,
        skipOnboarding,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};
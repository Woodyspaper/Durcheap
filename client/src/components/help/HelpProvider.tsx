import React, { createContext, useContext, useState, useEffect } from 'react';

interface HelpContextType {
  isHelpMode: boolean;
  toggleHelpMode: () => void;
  isNewUser: boolean;
  markUserAsExperienced: () => void;
  shouldShowHelp: (id: string) => boolean;
  dismissHelp: (id: string) => void;
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export function HelpProvider({ children }: { children: React.ReactNode }) {
  const [isHelpMode, setIsHelpMode] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);
  const [dismissedHelp, setDismissedHelp] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Check if user has been here before
    const hasVisited = localStorage.getItem('durcheap-has-visited');
    const helpSettings = localStorage.getItem('durcheap-help-settings');
    
    if (hasVisited) {
      setIsNewUser(false);
    }

    if (helpSettings) {
      const settings = JSON.parse(helpSettings);
      setIsHelpMode(settings.helpMode || false);
      setDismissedHelp(new Set(settings.dismissedHelp || []));
    } else if (!hasVisited) {
      // New user - show help mode by default
      setIsHelpMode(true);
    }
  }, []);

  const toggleHelpMode = () => {
    const newHelpMode = !isHelpMode;
    setIsHelpMode(newHelpMode);
    
    const settings = {
      helpMode: newHelpMode,
      dismissedHelp: Array.from(dismissedHelp)
    };
    localStorage.setItem('durcheap-help-settings', JSON.stringify(settings));
  };

  const markUserAsExperienced = () => {
    setIsNewUser(false);
    localStorage.setItem('durcheap-has-visited', 'true');
  };

  const shouldShowHelp = (id: string) => {
    if (!isHelpMode && !isNewUser) return false;
    return !dismissedHelp.has(id);
  };

  const dismissHelp = (id: string) => {
    const newDismissed = new Set(dismissedHelp);
    newDismissed.add(id);
    setDismissedHelp(newDismissed);
    
    const settings = {
      helpMode: isHelpMode,
      dismissedHelp: Array.from(newDismissed)
    };
    localStorage.setItem('durcheap-help-settings', JSON.stringify(settings));
  };

  return (
    <HelpContext.Provider value={{
      isHelpMode,
      toggleHelpMode,
      isNewUser,
      markUserAsExperienced,
      shouldShowHelp,
      dismissHelp
    }}>
      {children}
    </HelpContext.Provider>
  );
}

export function useHelp() {
  const context = useContext(HelpContext);
  if (context === undefined) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
}
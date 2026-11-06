import React from 'react';
import { HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHelp } from './HelpProvider';
import { Badge } from '@/components/ui/badge';

export function HelpToggle() {
  const { isHelpMode, toggleHelpMode, isNewUser } = useHelp();

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Button
        onClick={toggleHelpMode}
        className={`rounded-full h-12 w-12 shadow-lg transition-all duration-200 ${
          isHelpMode 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'
        }`}
        title={isHelpMode ? 'Hide help tips' : 'Show help tips'}
      >
        {isHelpMode ? (
          <X className="h-5 w-5" />
        ) : (
          <HelpCircle className="h-5 w-5" />
        )}
      </Button>
      {isNewUser && !isHelpMode && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs animate-pulse"
        >
          !
        </Badge>
      )}
    </div>
  );
}
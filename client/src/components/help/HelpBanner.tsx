import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useHelp } from './HelpProvider';

export function HelpBanner() {
  const { isHelpMode, toggleHelpMode, isNewUser } = useHelp();

  if (!isHelpMode || !isNewUser) return null;

  return (
    <Alert className="mb-4 bg-blue-50 border-blue-200">
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-blue-800">
            💡 Help mode is active! Look for help icons next to important features.
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleHelpMode}
          className="text-blue-600 hover:text-blue-800"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}
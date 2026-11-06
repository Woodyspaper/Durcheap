import React, { useState, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function LocationPermissionPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if we should show the location permission prompt
    const hasAskedPermission = localStorage.getItem('locationPermissionAsked');
    const hasLocation = localStorage.getItem('userLocation');
    
    // Show prompt if we haven't asked before and don't have a location
    if (!hasAskedPermission && !hasLocation) {
      // Delay showing the prompt so it doesn't interfere with page load
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAllow = () => {
    localStorage.setItem('locationPermissionAsked', 'true');
    setShowPrompt(false);
    // Trigger location request
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          // Success will be handled by the useGeolocation hook
          window.location.reload();
        },
        (error) => {
          console.error('Location permission denied:', error);
        }
      );
    }
  };

  const handleDeny = () => {
    localStorage.setItem('locationPermissionAsked', 'true');
    localStorage.setItem('locationPermission', 'denied');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Alert className="bg-white border-2 border-amazon-orange shadow-lg">
        <MapPin className="h-4 w-4 text-amazon-orange" />
        <AlertDescription>
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h4 className="font-medium text-amazon-dark mb-1">
                Enable Location Services
              </h4>
              <p className="text-sm text-gray-600">
                Get accurate delivery times and find local products near you.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeny}
              className="p-1 h-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={handleAllow}
              className="bg-amazon-orange hover:bg-orange-600 text-amazon-dark text-xs"
            >
              Allow
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeny}
              className="text-xs"
            >
              Not Now
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
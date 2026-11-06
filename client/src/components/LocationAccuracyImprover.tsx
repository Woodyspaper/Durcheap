import React, { useEffect, useState } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function LocationAccuracyImprover() {
  const [showImprover, setShowImprover] = useState(false);
  const [isImproving, setIsImproving] = useState(false);

  useEffect(() => {
    // Check if location seems inaccurate (user manually corrected it before)
    const manuallySet = localStorage.getItem('locationManuallySet');
    const hasLocation = localStorage.getItem('userLocation');
    
    if (hasLocation && !manuallySet) {
      // Show the improver after a delay
      const timer = setTimeout(() => {
        setShowImprover(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const improveLocation = async () => {
    setIsImproving(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Use higher accuracy reverse geocoding
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&addressdetails=1&zoom=18`,
              {
                headers: {
                  'User-Agent': 'Durcheap-Marketplace/1.0'
                }
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              const address = data.address || {};
              
              const improvedLocation = {
                city: address.city || address.town || address.village || address.suburb,
                state: address.state || address.region,
                zipCode: address.postcode,
                country: address.country_code?.toUpperCase() || 'US'
              };
              
              localStorage.setItem('userLocation', JSON.stringify(improvedLocation));
              localStorage.setItem('locationImproved', 'true');
              window.location.reload();
            }
          } catch (error) {
            console.error('Location improvement failed:', error);
          }
          setIsImproving(false);
          setShowImprover(false);
        },
        (error) => {
          console.error('High accuracy location failed:', error);
          setIsImproving(false);
          setShowImprover(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0 // Force fresh location
        }
      );
    }
  };

  const dismissImprover = () => {
    setShowImprover(false);
    localStorage.setItem('locationImprovementDismissed', 'true');
  };

  if (!showImprover) return null;

  return (
    <div className="fixed bottom-20 right-4 z-40 max-w-sm">
      <Alert className="bg-blue-50 border-blue-200 shadow-lg">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-blue-900 mb-1">
                Improve Location Accuracy
              </h4>
              <p className="text-sm text-blue-800">
                Is your delivery location not quite right? We can try to get a more precise location.
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={improveLocation}
                disabled={isImproving}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
              >
                {isImproving ? (
                  <>
                    <MapPin className="h-3 w-3 mr-1 animate-spin" />
                    Improving...
                  </>
                ) : (
                  <>
                    <MapPin className="h-3 w-3 mr-1" />
                    Improve Location
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={dismissImprover}
                className="text-xs"
              >
                Not Now
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
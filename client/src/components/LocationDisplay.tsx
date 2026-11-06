import React from 'react';
import { MapPin, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGeolocation } from '@/hooks/useGeolocation';

interface LocationDisplayProps {
  className?: string;
}

export function LocationDisplay({ className = "" }: LocationDisplayProps) {
  const { city, state, zipCode, loading, error, refreshLocation } = useGeolocation();

  const formatLocation = () => {
    if (loading) return 'Locating...';
    if (error) return 'Deliver to New York 10001';
    
    const parts = [city];
    if (state) parts.push(state);
    if (zipCode) parts.push(zipCode);
    
    return `Deliver to ${parts.join(' ')}`;
  };

  return (
    <div className={`flex items-center text-sm ${className}`}>
      <MapPin className="h-4 w-4 mr-1" />
      <span className="mr-2">{formatLocation()}</span>
      {!loading && (
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshLocation}
          className="h-auto p-1 text-xs hover:text-amazon-orange"
          title="Update location"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
      {loading && (
        <RefreshCw className="h-3 w-3 animate-spin text-amazon-orange" />
      )}
    </div>
  );
}
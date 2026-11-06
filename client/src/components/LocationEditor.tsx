import React, { useState } from 'react';
import { MapPin, Edit3, Check, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useGeolocation } from '@/hooks/useGeolocation';

interface LocationEditorProps {
  className?: string;
}

export function LocationEditor({ className = "" }: LocationEditorProps) {
  // All useState hooks must be called first to maintain consistent hook order
  const [isEditing, setIsEditing] = useState(false);
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editZip, setEditZip] = useState('');
  const [lookupInput, setLookupInput] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  
  // Then call other hooks that may use useContext internally
  const { city, state, zipCode, loading, error, refreshLocation } = useGeolocation();

  const startEditing = () => {
    setEditCity(city);
    setEditState(state);
    setEditZip(zipCode);
    setIsEditing(true);
    setShowManualEntry(false);
  };

  const lookupLocation = async () => {
    if (!lookupInput.trim()) return;
    
    setIsLookingUp(true);
    try {
      let url = '';
      const input = lookupInput.trim();
      
      // Check if it's a ZIP code (5 digits)
      if (/^\d{5}$/.test(input)) {
        url = `https://nominatim.openstreetmap.org/search?format=json&postalcode=${input}&country=US&addressdetails=1&limit=1`;
      } else {
        // Treat as address or city/state
        url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&country=US&addressdetails=1&limit=1`;
      }
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Durcheap-Marketplace/1.0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const result = data[0];
          const address = result.address || {};
          
          setEditCity(address.city || address.town || address.village || result.display_name.split(',')[0] || '');
          setEditState(address.state || address.region || '');
          setEditZip(address.postcode || (/^\d{5}$/.test(input) ? input : ''));
          setShowManualEntry(true);
        }
      }
    } catch (error) {
      console.error('Location lookup error:', error);
    } finally {
      setIsLookingUp(false);
    }
  };

  const saveLocation = () => {
    const newLocation = {
      city: editCity.trim() || city || 'Unknown City',
      state: editState.trim() || state || '',
      zipCode: editZip.trim() || zipCode || '',
      country: 'US'
    };
    
    localStorage.setItem('userLocation', JSON.stringify(newLocation));
    localStorage.setItem('locationManuallySet', 'true');
    localStorage.setItem('locationPermission', 'granted');
    
    setIsEditing(false);
    setShowManualEntry(false);
    setLookupInput('');
    
    // Refresh the page to update the location display
    window.location.reload();
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditCity('');
    setEditState('');
    setEditZip('');
    setLookupInput('');
    setShowManualEntry(false);
  };

  const formatLocation = () => {
    if (loading) return 'Locating...';
    if (error) return 'Deliver to New York 10001';
    
    const parts = [city];
    if (state) parts.push(state);
    if (zipCode) parts.push(zipCode);
    
    return `Deliver to ${parts.join(' ')}`;
  };

  if (isEditing) {
    return (
      <div className={`${className}`}>
        <Card className="absolute top-full left-0 mt-1 bg-white border shadow-lg z-50 w-80">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm font-medium text-amazon-dark">
                <MapPin className="h-4 w-4 text-amazon-orange" />
                <span>Update Delivery Location</span>
              </div>
              
              {!showManualEntry ? (
                <div className="space-y-2">
                  <div className="text-xs text-gray-600">Enter ZIP code, city, or full address:</div>
                  <div className="flex space-x-2">
                    <Input
                      value={lookupInput}
                      onChange={(e) => setLookupInput(e.target.value)}
                      placeholder="33334 or Miami, FL or 123 Main St, Miami, FL"
                      className="flex-1 h-8 text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={lookupLocation}
                      disabled={isLookingUp || !lookupInput.trim()}
                      className="h-8 px-3"
                    >
                      {isLookingUp ? '...' : <Search className="h-3 w-3" />}
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setShowManualEntry(true)}
                      className="text-xs text-amazon-orange hover:underline"
                    >
                      Or enter manually
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditCity('');
                        setEditState('');
                        setEditZip('');
                        setShowManualEntry(true);
                      }}
                      className="text-xs h-6"
                    >
                      Skip lookup
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-gray-600">Enter your address details:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      placeholder="City (required)"
                      className="h-8 text-sm"
                      required
                    />
                    <Input
                      value={editState}
                      onChange={(e) => setEditState(e.target.value.toUpperCase().slice(0, 2))}
                      placeholder="State (e.g. FL)"
                      className="h-8 text-sm"
                      maxLength={2}
                    />
                  </div>
                  <Input
                    value={editZip}
                    onChange={(e) => setEditZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    placeholder="ZIP Code (optional)"
                    className="h-8 text-sm"
                    maxLength={5}
                  />
                  <div className="text-xs text-green-600">
                    Only city is required. State and ZIP are optional.
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelEditing}
                  className="h-8 px-3 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={saveLocation}
                  disabled={!editCity.trim()}
                  className="h-8 px-3 text-xs bg-amazon-orange hover:bg-amazon-orange/90"
                >
                  Update Location
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center text-sm ${className}`}>
      <MapPin className="h-4 w-4 mr-1" />
      <span className="mr-2">{formatLocation()}</span>
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={startEditing}
          className="h-auto p-1 text-xs hover:text-amazon-orange"
          title="Change location"
        >
          <Edit3 className="h-3 w-3" />
        </Button>
        {!loading && (
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshLocation}
            className="h-auto p-1 text-xs hover:text-amazon-orange"
            title="Use my current location"
          >
            <MapPin className="h-3 w-3" />
          </Button>
        )}
        {loading && (
          <div className="animate-spin">
            <MapPin className="h-3 w-3 text-amazon-orange" />
          </div>
        )}
      </div>
    </div>
  );
}
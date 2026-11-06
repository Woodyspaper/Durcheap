import { useState } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Smartphone, Edit3, User, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type LocationPreference = 'account_address' | 'gps_coordinates' | 'manual_entry';

export function LocationSettings() {
  const { user, isAuthenticated } = useAuth();
  const { 
    city, 
    state, 
    zipCode, 
    country, 
    source, 
    loading, 
    error,
    setManualLocation, 
    setLocationPreference, 
    getLocationPreferences,
    refreshLocation 
  } = useGeolocation();
  
  const { toast } = useToast();
  
  const [currentPreference, setCurrentPreference] = useState<LocationPreference>(
    () => getLocationPreferences().preference
  );
  
  const [manualForm, setManualForm] = useState({
    city: getLocationPreferences().manualLocation?.city || '',
    state: getLocationPreferences().manualLocation?.state || '',
    zipCode: getLocationPreferences().manualLocation?.zipCode || '',
    country: getLocationPreferences().manualLocation?.country || 'US'
  });
  
  const handlePreferenceChange = (preference: LocationPreference) => {
    setCurrentPreference(preference);
    setLocationPreference(preference);
    
    toast({
      title: "Location preference updated",
      description: `Now using ${getPreferenceLabel(preference).toLowerCase()} for local content.`
    });
  };
  
  const handleManualLocationSave = () => {
    if (!manualForm.city.trim() || !manualForm.state.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter both city and state.",
        variant: "destructive"
      });
      return;
    }
    
    setManualLocation(
      manualForm.city.trim(),
      manualForm.state.trim(),
      manualForm.zipCode.trim(),
      manualForm.country
    );
    
    toast({
      title: "Manual location saved",
      description: `Location set to ${manualForm.city}, ${manualForm.state}`
    });
  };
  
  const getPreferenceLabel = (preference: LocationPreference) => {
    switch (preference) {
      case 'account_address': return 'Account Address';
      case 'gps_coordinates': return 'GPS Coordinates';
      case 'manual_entry': return 'Manual Entry';
    }
  };
  
  const getSourceBadge = () => {
    const sourceLabels = {
      profile: { label: 'Account', variant: 'default' as const },
      geolocation: { label: 'GPS', variant: 'secondary' as const },
      manual: { label: 'Manual', variant: 'outline' as const },
      localStorage: { label: 'Saved', variant: 'secondary' as const },
      fallback: { label: 'Default', variant: 'destructive' as const }
    };
    
    const info = sourceLabels[source || 'fallback'];
    return <Badge variant={info.variant}>{info.label}</Badge>;
  };
  
  const hasAccountAddress = isAuthenticated && user && user.defaultCity && user.defaultState;
  
  return (
    <Card data-testid="location-settings-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Settings
        </CardTitle>
        <CardDescription>
          Choose how we determine your location for local events and shop local listings.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Location Display */}
        <div className="p-4 bg-muted rounded-lg" data-testid="current-location-display">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Current Location</h3>
            <div className="flex items-center gap-2">
              {getSourceBadge()}
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshLocation}
                disabled={loading}
                data-testid="button-refresh-location"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          <p className="text-lg font-semibold" data-testid="text-current-location">
            {loading ? 'Loading...' : `${city}, ${state} ${zipCode}`}
          </p>
          {error && (
            <p className="text-sm text-destructive mt-1" data-testid="text-location-error">
              {error}
            </p>
          )}
        </div>
        
        {/* Location Preference Options */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Location Preference</Label>
          
          <RadioGroup
            value={currentPreference}
            onValueChange={handlePreferenceChange as (value: string) => void}
            data-testid="location-preference-radio-group"
          >
            {/* Option 1: Account Address */}
            <div className="flex items-start space-x-3 p-3 border rounded-lg">
              <RadioGroupItem 
                value="account_address" 
                id="account_address"
                data-testid="radio-account-address"
                disabled={!hasAccountAddress}
              />
              <div className="grid gap-1.5 flex-1">
                <Label htmlFor="account_address" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Account Address (Primary)
                </Label>
                <p className="text-sm text-muted-foreground">
                  {hasAccountAddress 
                    ? `Use your account address: ${user!.defaultCity}, ${user!.defaultState}`
                    : 'No address set in your account profile. Please update your profile first.'
                  }
                </p>
              </div>
            </div>
            
            {/* Option 2: GPS Coordinates */}
            <div className="flex items-start space-x-3 p-3 border rounded-lg">
              <RadioGroupItem 
                value="gps_coordinates" 
                id="gps_coordinates"
                data-testid="radio-gps-coordinates"
              />
              <div className="grid gap-1.5 flex-1">
                <Label htmlFor="gps_coordinates" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  GPS Coordinates (Secondary)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Use your device's current location when available.
                </p>
              </div>
            </div>
            
            {/* Option 3: Manual Entry */}
            <div className="flex items-start space-x-3 p-3 border rounded-lg">
              <RadioGroupItem 
                value="manual_entry" 
                id="manual_entry"
                data-testid="radio-manual-entry"
              />
              <div className="grid gap-1.5 flex-1">
                <Label htmlFor="manual_entry" className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4" />
                  Manual Entry
                </Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Manually specify your city and zip code.
                </p>
                
                {/* Manual Location Form */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="manual-city" className="text-sm">City</Label>
                    <Input
                      id="manual-city"
                      placeholder="Enter city"
                      value={manualForm.city}
                      onChange={(e) => setManualForm(prev => ({ ...prev, city: e.target.value }))}
                      data-testid="input-manual-city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="manual-state" className="text-sm">State</Label>
                    <Input
                      id="manual-state"
                      placeholder="Enter state"
                      value={manualForm.state}
                      onChange={(e) => setManualForm(prev => ({ ...prev, state: e.target.value }))}
                      data-testid="input-manual-state"
                    />
                  </div>
                  <div>
                    <Label htmlFor="manual-zipcode" className="text-sm">Zip Code (Optional)</Label>
                    <Input
                      id="manual-zipcode"
                      placeholder="Enter zip code"
                      value={manualForm.zipCode}
                      onChange={(e) => setManualForm(prev => ({ ...prev, zipCode: e.target.value }))}
                      data-testid="input-manual-zipcode"
                    />
                  </div>
                  <div>
                    <Label htmlFor="manual-country" className="text-sm">Country</Label>
                    <Input
                      id="manual-country"
                      value={manualForm.country}
                      onChange={(e) => setManualForm(prev => ({ ...prev, country: e.target.value }))}
                      data-testid="input-manual-country"
                    />
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualLocationSave}
                  className="w-fit mt-2"
                  data-testid="button-save-manual-location"
                >
                  Save Manual Location
                </Button>
              </div>
            </div>
          </RadioGroup>
        </div>
        
        {/* Help Text */}
        <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
          <strong>How it works:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li><strong>Account Address:</strong> Uses the address from your account profile (recommended)</li>
            <li><strong>GPS Coordinates:</strong> Automatically detects your current location</li>
            <li><strong>Manual Entry:</strong> You choose the specific city and zip code</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
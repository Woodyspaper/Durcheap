import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

type LocationPreference = 'account_address' | 'gps_coordinates' | 'manual_entry';

interface LocationData {
  city: string;
  state: string;
  zipCode: string;
  country: string;
  loading: boolean;
  error: string | null;
  accuracy?: number;
  lastUpdated?: string;
  source?: 'profile' | 'geolocation' | 'localStorage' | 'fallback' | 'manual';
}

interface LocationPreferences {
  preference: LocationPreference;
  manualLocation?: {
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
}

export function useGeolocation() {
  const { user, isAuthenticated } = useAuth();
  
  const [location, setLocation] = useState<LocationData>({
    city: 'Pompano Beach',
    state: 'FL',
    zipCode: '33334',
    country: 'US',
    loading: true,
    error: null,
    source: 'fallback'
  });

  // Get location preferences from localStorage
  const getLocationPreferences = (): LocationPreferences => {
    try {
      const saved = localStorage.getItem('locationPreferences');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error parsing location preferences:', error);
    }
    return { preference: 'account_address' }; // Default to account address
  };

  // Save location preferences to localStorage
  const saveLocationPreferences = (preferences: LocationPreferences) => {
    try {
      localStorage.setItem('locationPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving location preferences:', error);
    }
  };

  // Set manual location and save preferences
  const setManualLocation = (city: string, state: string, zipCode: string, country: string = 'US') => {
    const manualLocation = { city, state, zipCode, country };
    const preferences: LocationPreferences = {
      preference: 'manual_entry',
      manualLocation
    };
    
    saveLocationPreferences(preferences);
    
    setLocation({
      ...manualLocation,
      loading: false,
      error: null,
      source: 'manual',
      lastUpdated: new Date().toLocaleTimeString()
    });
  };

  // Set location preference mode
  const setLocationPreference = (preference: LocationPreference) => {
    const currentPrefs = getLocationPreferences();
    const newPrefs = { ...currentPrefs, preference };
    saveLocationPreferences(newPrefs);
    
    // Trigger location update based on new preference
    updateLocationBasedOnPreference(newPrefs);
  };

  // Update location based on current preference
  const updateLocationBasedOnPreference = (preferences?: LocationPreferences) => {
    const prefs = preferences || getLocationPreferences();
    
    switch (prefs.preference) {
      case 'account_address':
        // Use account address if available
        if (isAuthenticated && user && user.defaultCity && user.defaultState) {
          setLocation({
            city: user.defaultCity,
            state: user.defaultState,
            zipCode: user.defaultZipCode || '',
            country: user.defaultCountry || 'US',
            loading: false,
            error: null,
            source: 'profile'
          });
        } else {
          // Fall back to GPS if no account address
          setLocation(prev => ({ ...prev, loading: true }));
          getCurrentLocationWithHighAccuracy();
        }
        break;
        
      case 'gps_coordinates':
        setLocation(prev => ({ ...prev, loading: true }));
        getCurrentLocationWithHighAccuracy();
        break;
        
      case 'manual_entry':
        if (prefs.manualLocation) {
          setLocation({
            ...prefs.manualLocation,
            loading: false,
            error: null,
            source: 'manual'
          });
        } else {
          // No manual location set yet, stay on fallback
          setLocation(prev => ({
            ...prev,
            loading: false,
            error: 'Manual location not set'
          }));
        }
        break;
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      // Using a free geocoding service (OpenStreetMap Nominatim)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=10`,
        {
          headers: {
            'User-Agent': 'Durcheap-Marketplace/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }
      
      const data = await response.json();
      const address = data.address || {};
      
      setLocation({
        city: address.city || address.town || address.village || 'Unknown City',
        state: address.state || address.region || '',
        zipCode: address.postcode || '',
        country: address.country_code?.toUpperCase() || 'US',
        loading: false,
        error: null,
        source: 'geolocation'
      });
      
      // Save to localStorage for future visits
      const locationData = {
        city: address.city || address.town || address.village || 'Unknown City',
        state: address.state || address.region || '',
        zipCode: address.postcode || '',
        country: address.country_code?.toUpperCase() || 'US'
      };
      localStorage.setItem('userLocation', JSON.stringify(locationData));
      localStorage.setItem('locationPermission', 'granted');
      
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setLocation(prev => ({
        ...prev,
        loading: false,
        error: 'Unable to determine location'
      }));
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocation not supported'
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        reverseGeocode(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error('Geolocation error:', error);
        
        // Save permission denial to localStorage
        if (error.code === 1) { // PERMISSION_DENIED
          localStorage.setItem('locationPermission', 'denied');
        }
        
        setLocation(prev => ({
          ...prev,
          loading: false,
          error: error.code === 1 
            ? 'Location access denied' 
            : 'Unable to get location'
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000 // 1 minute for more accurate location
      }
    );
  };

  useEffect(() => {
    // Get user's location preference and update accordingly
    updateLocationBasedOnPreference();
  }, [isAuthenticated, user]);

  const refreshLocation = () => {
    setLocation(prev => ({ ...prev, loading: true, error: null }));
    // Clear existing location data to force fresh GPS reading
    localStorage.removeItem('userLocation');
    localStorage.removeItem('locationManuallySet');
    getCurrentLocationWithHighAccuracy();
  };

  const getCurrentLocationWithHighAccuracy = () => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocation not supported'
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        reverseGeocodeWithHighPrecision(
          position.coords.latitude, 
          position.coords.longitude,
          position.coords.accuracy || 0
        );
      },
      (error) => {
        console.error('High accuracy geolocation error:', error);
        
        if (error.code === 1) { // PERMISSION_DENIED
          localStorage.setItem('locationPermission', 'denied');
        }
        
        setLocation(prev => ({
          ...prev,
          loading: false,
          error: error.code === 1 
            ? 'Location access denied' 
            : 'Unable to get precise location'
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 30000, // Extended timeout for better accuracy
        maximumAge: 0 // Force fresh reading
      }
    );
  };

  const reverseGeocodeWithHighPrecision = async (latitude: number, longitude: number, accuracy?: number) => {
    try {
      // Use higher zoom level for more precise address resolution
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18&extratags=1`,
        {
          headers: {
            'User-Agent': 'Durcheap-Marketplace/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch precise location data');
      }
      
      const data = await response.json();
      const address = data.address || {};
      
      // Try multiple address components for better accuracy
      const city = address.city || address.town || address.village || address.suburb || address.neighbourhood || 'Unknown City';
      const state = address.state || address.region || address.state_district || '';
      const zipCode = address.postcode || '';
      
      setLocation({
        city,
        state,
        zipCode,
        country: address.country_code?.toUpperCase() || 'US',
        loading: false,
        error: null,
        accuracy,
        lastUpdated: new Date().toLocaleTimeString(),
        source: 'geolocation'
      });
      
      // Save the improved location
      const locationData = { city, state, zipCode, country: address.country_code?.toUpperCase() || 'US' };
      localStorage.setItem('userLocation', JSON.stringify(locationData));
      localStorage.setItem('locationPermission', 'granted');
      localStorage.setItem('locationHighAccuracy', 'true');
      
    } catch (error) {
      console.error('High precision reverse geocoding error:', error);
      // Fall back to regular geocoding
      reverseGeocode(latitude, longitude);
    }
  };

  return {
    ...location,
    refreshLocation,
    setManualLocation,
    setLocationPreference,
    getLocationPreferences
  };
}
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Search } from 'lucide-react';

interface ShopLocalFilters {
  country: string;
  state: string;
  city: string;
  zipCode: string;
  condition: string;
}

interface ShopLocalFilterProps {
  onFiltersChange: (filters: ShopLocalFilters & { shopLocal: boolean }) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ShopLocalFilter({ onFiltersChange, isOpen, onToggle }: ShopLocalFilterProps) {
  const [filters, setFilters] = useState<ShopLocalFilters>({
    country: '',
    state: '',
    city: '',
    zipCode: '',
    condition: ''
  });

  const handleFilterChange = (key: keyof ShopLocalFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange({ ...filters, shopLocal: true });
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      country: '',
      state: '',
      city: '',
      zipCode: '',
      condition: ''
    };
    setFilters(clearedFilters);
    onFiltersChange({ ...clearedFilters, shopLocal: false });
  };

  // US States for the dropdown
  const usStates = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        onClick={onToggle}
        className="flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
      >
        <MapPin className="h-4 w-4" />
        Shop Local
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-md border-blue-200 bg-blue-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <MapPin className="h-5 w-5" />
          Shop Local
        </CardTitle>
        <CardDescription className="text-blue-600">
          Find products and services near you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="country" className="text-sm font-medium">Country</Label>
          <Select 
            value={filters.country} 
            onValueChange={(value) => handleFilterChange('country', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="United States">United States</SelectItem>
              <SelectItem value="Canada">Canada</SelectItem>
              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
              <SelectItem value="Australia">Australia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="state" className="text-sm font-medium">State/Province</Label>
          <Select 
            value={filters.state} 
            onValueChange={(value) => handleFilterChange('state', value)}
            disabled={!filters.country}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {filters.country === 'United States' && usStates.map(state => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
              {filters.country === 'Canada' && [
                'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
                'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island',
                'Quebec', 'Saskatchewan', 'Yukon'
              ].map(province => (
                <SelectItem key={province} value={province}>{province}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-medium">City</Label>
          <Input
            id="city"
            placeholder="Enter city name"
            value={filters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zipCode" className="text-sm font-medium">Zip/Postal Code</Label>
          <Input
            id="zipCode"
            placeholder="Enter zip or postal code"
            value={filters.zipCode}
            onChange={(e) => handleFilterChange('zipCode', e.target.value)}
          />
        </div>

        {/* Condition Filter */}
        <div className="space-y-2">
          <Label htmlFor="condition" className="text-sm font-medium">Item Condition</Label>
          <Select value={filters.condition} onValueChange={(value) => handleFilterChange('condition', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Any Condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Condition</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="used">Used</SelectItem>
              <SelectItem value="refurbished">Refurbished</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleApplyFilters}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={!filters.country}
          >
            <Search className="h-4 w-4 mr-2" />
            Find Local
          </Button>
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="flex-1"
          >
            Clear
          </Button>
        </div>

        <Button
          variant="ghost"
          onClick={onToggle}
          className="w-full text-sm text-gray-600"
        >
          Close
        </Button>
      </CardContent>
    </Card>
  );
}
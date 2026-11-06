import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Clock, Users, Search, Filter, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { Layout } from "@/components/Layout";

interface LocalEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  endDate?: string;
  location: string;
  address: string;
  city: string;
  state: string;
  category: string;
  price?: string;
  capacity?: number;
  registeredCount?: number;
  imageUrl?: string;
  source?: string;
  websiteUrl?: string;
  ticketUrl?: string;
  isFeatured?: boolean;
}

export default function LocalEvents() {
  const { city, state } = useGeolocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch local events
  const { data: localEvents = [], isLoading: localLoading } = useQuery<LocalEvent[]>({
    queryKey: ['/api/events', city, state],
    queryFn: async () => {
      const response = await fetch(`/api/events?city=${city}&state=${state}&limit=50`);
      return response.json();
    },
    enabled: !!city && !!state,
  });

  // Fetch external events with filters
  const { data: externalEvents = [], isLoading: externalLoading } = useQuery<LocalEvent[]>({
    queryKey: ['/api/events/external', city, state, searchQuery, selectedCategory, selectedPriceRange, selectedDateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedPriceRange !== 'all') params.append('priceRange', selectedPriceRange);
      if (selectedDateRange !== 'all') params.append('dateRange', selectedDateRange);
      
      const response = await fetch(`/api/events/external/${city}/${state}?${params.toString()}`);
      return response.json();
    },
    enabled: !!city && !!state,
  });

  // Combine and filter events
  const allEvents = [...localEvents, ...externalEvents].filter(event => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query) ||
      event.category.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query)
    );
  });

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatEventPrice = (price?: string) => {
    if (!price || price === '0') return 'Free';
    return price.startsWith('$') ? price : `$${price}`;
  };

  const isLoading = localLoading || externalLoading;

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Local Events in {city}, {state}
        </h1>
        <p className="text-gray-600">
          Discover local events and activities happening in your area from multiple sources
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search & Filter Events
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search events by title, description, category, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="business">Business & Professional</SelectItem>
                    <SelectItem value="food">Food & Drink</SelectItem>
                    <SelectItem value="arts">Arts & Culture</SelectItem>
                    <SelectItem value="sports">Sports & Recreation</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="health">Health & Wellness</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Price Range</label>
                <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Prices" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="free">Free Events</SelectItem>
                    <SelectItem value="under-25">Under $25</SelectItem>
                    <SelectItem value="under-50">Under $50</SelectItem>
                    <SelectItem value="over-50">$50 and above</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Date Range</label>
                <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Dates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="this-week">This Week</SelectItem>
                    <SelectItem value="this-month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Active Filters */}
          {(selectedCategory !== 'all' || selectedPriceRange !== 'all' || selectedDateRange !== 'all' || searchQuery) && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchQuery('')}>
                  "{searchQuery}" ×
                </Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedCategory('all')}>
                  {selectedCategory} ×
                </Badge>
              )}
              {selectedPriceRange !== 'all' && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedPriceRange('all')}>
                  {selectedPriceRange} ×
                </Badge>
              )}
              {selectedDateRange !== 'all' && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedDateRange('all')}>
                  {selectedDateRange} ×
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          {isLoading ? 'Loading events...' : `Found ${allEvents.length} events`}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="w-full h-48 mb-4 rounded-md" />
                <Skeleton className="h-6 mb-2" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : allEvents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || selectedCategory !== 'all' || selectedPriceRange !== 'all' || selectedDateRange !== 'all'
                ? 'Try adjusting your search criteria or filters'
                : `No events found in ${city}, ${state}`}
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedPriceRange('all');
                setSelectedDateRange('all');
              }}
              variant="outline"
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-0">
                {/* Event Image */}
                {event.imageUrl ? (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                    <Calendar className="h-12 w-12 text-white" />
                  </div>
                )}
                
                <div className="p-6">
                  {/* Event Title */}
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                    {event.title}
                  </h3>
                  
                  {/* Event Details */}
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatEventDate(event.eventDate)} at {formatEventTime(event.eventDate)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    
                    {event.capacity && event.registeredCount !== undefined && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{event.registeredCount}/{event.capacity} attending</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Event Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {event.description}
                  </p>
                  
                  {/* Footer */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        {event.category}
                      </Badge>
                      {event.source && (
                        <Badge variant="secondary" className="text-xs">
                          {event.source}
                        </Badge>
                      )}
                      {event.isFeatured && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <span className="font-semibold text-blue-600">
                      {formatEventPrice(event.price)}
                    </span>
                  </div>
                  
                  {/* Action Button */}
                  <div className="mt-4">
                    {event.websiteUrl || event.ticketUrl ? (
                      <Button asChild className="w-full">
                        <a 
                          href={event.websiteUrl || event.ticketUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2"
                        >
                          View Event <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    ) : (
                      <Button asChild className="w-full">
                        <Link href={`/events/${event.id}`}>
                          View Details
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </Layout>
  );
}
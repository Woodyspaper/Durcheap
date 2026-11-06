import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users, Share2, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import SocialShareModal from "./SocialShareModal";

interface LocalEvent {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  endDate?: string | null;
  location: string | null;
  address?: string | null;
  city: string | null;
  state: string | null;
  category: string | null;
  price?: string | null;
  capacity?: number | null;
  registeredCount?: number | null;
  imageUrl?: string | null;
  reachType?: string;
  source?: string;
  websiteUrl?: string | null;
  ticketUrl?: string | null;
  // Additional fields from database schema
  zipCode?: string | null;
  currency?: string | null;
  tags?: string[] | null;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Interface for sharing events (compatible with SocialShareModal's EventPost interface)
interface ShareableEvent {
  id: string;
  title: string;
  description: string; // required by SocialShareModal, so we'll ensure it's not null
  eventDate: string;
  location: string;
  category: string;
  price: number; // converted to number for sharing
  maxAttendees: number;
  currentAttendees: number;
  imageUrl?: string;
  websiteUrl?: string | null;
  ticketUrl?: string | null;
}

export default function TodaysEventsSection() {
  // All useState hooks must be called first to maintain consistent hook order
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedEventForSharing, setSelectedEventForSharing] = useState<ShareableEvent | null>(null);
  
  // Then call other hooks that may use useContext internally
  const { city, state } = useGeolocation();
  
  const { data: events = [], isLoading: eventsLoading } = useQuery<LocalEvent[]>({
    queryKey: ['/api/events/today', city, state],
    enabled: !!city && !!state,
  });

  // Fetch external events when local events are limited
  const { data: externalEvents = [] } = useQuery<LocalEvent[]>({
    queryKey: ['/api/events/external', city, state],
    enabled: !!city && !!state && events.length < 3,
  });

  // Combine local and external events, prioritizing local events
  const allEvents = [...events, ...externalEvents].slice(0, 8);

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatEventPrice = (price?: string | null) => {
    if (!price || price === '0' || price === 'Free') return 'Free';
    // Handle string prices like '$5 entry' or '30-75'
    const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    if (isNaN(numericPrice) || numericPrice === 0) return 'Free';
    return `$${numericPrice.toFixed(2)}`;
  };

  if (eventsLoading) {
    return (
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide smooth-scroll">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="flex-shrink-0 w-64 sm:w-72">
            <CardContent className="p-4">
              <Skeleton className="w-full h-32 mb-3 rounded-md" />
              <Skeleton className="h-5 mb-2" />
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!allEvents.length) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Today</h3>
        <p className="text-gray-500">
          {city ? 
            `No events scheduled for today in ${city}, ${state}` : 
            "Enable location access to see local events"}
        </p>
        <Link href="/events" className="text-amazon-blue hover:text-amazon-orange mt-2 inline-block">
          Browse all events →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide smooth-scroll" style={{ scrollSnapType: 'x mandatory' }}>
      {allEvents.map((event: LocalEvent) => (
        <Card 
          key={event.id} 
          className="flex-shrink-0 w-64 sm:w-72 hover:shadow-md transition-shadow cursor-pointer" 
          style={{ scrollSnapAlign: 'start' }}
        >
          <Link href={event.websiteUrl || event.ticketUrl || `/events/${event.id}`}>
            <CardContent className="p-4">
              {event.imageUrl ? (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-32 object-cover rounded-md mb-3"
                />
              ) : (
                <div className="w-full h-32 bg-gradient-to-br from-amazon-blue to-amazon-orange rounded-md mb-3 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
              )}
              
              <h3 className="font-semibold text-amazon-dark text-sm mb-2 line-clamp-2">
                {event.title}
              </h3>
              
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatEventTime(event.eventDate)}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{event.location}</span>
                </div>
                
                {event.capacity && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{event.registeredCount}/{event.capacity} attending</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-2">
                  <span className="font-medium text-amazon-orange">
                    {formatEventPrice(event.price)}
                  </span>
                  <div className="flex gap-1">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {event.category}
                    </span>
                    {event.source && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {event.source}
                      </span>
                    )}
                  </div>
                </div>

                {/* Share Button */}
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const shareEvent: ShareableEvent = {
                        id: event.id,
                        title: event.title,
                        description: event.description || 'No description available',
                        eventDate: event.eventDate,
                        location: event.location || 'Location TBD',
                        category: event.category || 'General',
                        price: parseFloat((event.price || '0').replace(/[^0-9.]/g, '')) || 0,
                        maxAttendees: event.capacity || 100,
                        currentAttendees: event.registeredCount || 0,
                        imageUrl: event.imageUrl || undefined,
                        websiteUrl: event.websiteUrl,
                        ticketUrl: event.ticketUrl
                      };
                      setSelectedEventForSharing(shareEvent);
                      setShareModalOpen(true);
                    }}
                    className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                  >
                    <Share2 className="h-3 w-3 mr-1" />
                    Share Event
                  </Button>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      ))}

      {/* Social Share Modal */}
      {selectedEventForSharing && (
        <SocialShareModal
          event={selectedEventForSharing}
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setSelectedEventForSharing(null);
          }}
          eventUrl={(selectedEventForSharing.websiteUrl || selectedEventForSharing.ticketUrl) || `${window.location.origin}/events/${selectedEventForSharing.id}`}
        />
      )}
    </div>
  );
}
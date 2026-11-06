import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Zap,
  Share2
} from "lucide-react";
import SocialShareModal from "@/components/SocialShareModal";

interface EventPost {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  category: string;
  price: number;
  maxAttendees: number;
  currentAttendees: number;
  status: 'draft' | 'active' | 'paused' | 'ended';
  advertisingType: 'sponsored' | 'featured' | 'subscription';
  views: number;
  clicks: number;
  conversions: number;
  createdAt: string;
  imageUrl?: string;
}

interface EventAnalytics {
  totalViews: number;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  averageEngagement: number;
  recentEvents: EventPost[];
}

export default function EventManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<'events' | 'create' | 'analytics'>('events');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedEventForSharing, setSelectedEventForSharing] = useState<EventPost | null>(null);

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/user/events'],
    enabled: !!user,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/user/events/analytics'],
    enabled: !!user,
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await apiRequest('DELETE', `/api/events/${eventId}`);
    },
    onSuccess: () => {
      toast({
        title: "Event Deleted",
        description: "Event has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/events'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleEventStatusMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: string }) => {
      await apiRequest('PATCH', `/api/events/${eventId}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Event Updated",
        description: "Event status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/events'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update event status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Draft', color: 'bg-gray-500' },
      active: { label: 'Active', color: 'bg-green-500' },
      paused: { label: 'Paused', color: 'bg-yellow-500' },
      ended: { label: 'Ended', color: 'bg-red-500' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge className={`${config.color} text-white`}>{config.label}</Badge>;
  };

  const getAdvertisingBadge = (type: string) => {
    const typeConfig = {
      sponsored: { label: 'Sponsored', color: 'bg-blue-500' },
      featured: { label: 'Featured', color: 'bg-purple-500' },
      subscription: { label: 'Subscription', color: 'bg-amazon-orange' }
    };
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.sponsored;
    return <Badge className={`${config.color} text-white`}>{config.label}</Badge>;
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please log in to manage your events</h1>
            <Button onClick={() => window.location.href = '/auth'}>
              Log In
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-amazon-dark mb-2">Event Management</h1>
            <p className="text-gray-600">Create, manage, and track your event advertisements</p>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                My Events
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Event
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* My Events Tab */}
            <TabsContent value="events">
              <div className="space-y-6">
                {eventsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                    <p className="mt-2 text-gray-600">Loading your events...</p>
                  </div>
                ) : (!events || events.length === 0) ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Events Yet</h3>
                      <p className="text-gray-600 mb-4">
                        You haven't created any events yet. Start by purchasing an advertising package and creating your first event.
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Button onClick={() => setSelectedTab('create')}>
                          Create Event
                        </Button>
                        <Button variant="outline" onClick={() => window.location.href = '/event-advertising'}>
                          Buy Advertising
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(events as EventPost[] || [])?.map((event: EventPost) => (
                      <Card key={event.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start mb-2">
                            <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                            <div className="flex gap-1">
                              {getStatusBadge(event.status)}
                              {getAdvertisingBadge(event.advertisingType)}
                            </div>
                          </div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {new Date(event.eventDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {event.location}
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              {event.currentAttendees}/{event.maxAttendees} attendees
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-3 gap-2 mb-4 text-center text-sm">
                            <div>
                              <div className="font-semibold">{event.views}</div>
                              <div className="text-gray-500">Views</div>
                            </div>
                            <div>
                              <div className="font-semibold">{event.clicks}</div>
                              <div className="text-gray-500">Clicks</div>
                            </div>
                            <div>
                              <div className="font-semibold">{event.conversions}</div>
                              <div className="text-gray-500">RSVPs</div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="flex-1">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedEventForSharing(event);
                                  setShareModalOpen(true);
                                }}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                              >
                                <Share2 className="h-4 w-4 mr-1" />
                                Share
                              </Button>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => toggleEventStatusMutation.mutate({
                                  eventId: event.id,
                                  status: event.status === 'active' ? 'paused' : 'active'
                                })}
                                className="flex-1"
                              >
                                {event.status === 'active' ? (
                                  <>
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Pause
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Activate
                                  </>
                                )}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => deleteEventMutation.mutate(event.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Create Event Tab */}
            <TabsContent value="create">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Event Advertisement</CardTitle>
                  <p className="text-gray-600">
                    Create a new event post using your purchased advertising credits
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Zap className="h-12 w-12 text-amazon-orange mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Event Creation Form</h3>
                    <p className="text-gray-600 mb-4">
                      This will be a comprehensive event creation form where users can:
                    </p>
                    <div className="text-left max-w-md mx-auto space-y-2 text-sm text-gray-600 mb-6">
                      <div>• Upload event images and details</div>
                      <div>• Set event date, time, and location</div>
                      <div>• Configure pricing and attendee limits</div>
                      <div>• Choose advertising level (based on purchased products)</div>
                      <div>• Preview how the event will appear</div>
                      <div>• Schedule publication date</div>
                    </div>
                    <Button className="bg-amazon-orange hover:bg-orange-600">
                      Build Event Form
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="space-y-6">
                {analyticsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                    <p className="mt-2 text-gray-600">Loading analytics...</p>
                  </div>
                ) : (
                  <>
                    {/* Analytics Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Total Views</p>
                              <p className="text-2xl font-bold">{(analytics as EventAnalytics)?.totalViews || 0}</p>
                            </div>
                            <Eye className="h-8 w-8 text-blue-600" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                              <p className="text-2xl font-bold">{(analytics as EventAnalytics)?.totalClicks || 0}</p>
                            </div>
                            <Users className="h-8 w-8 text-green-600" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Conversions</p>
                              <p className="text-2xl font-bold">{(analytics as EventAnalytics)?.totalConversions || 0}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-purple-600" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                              <p className="text-2xl font-bold">{(analytics as EventAnalytics)?.conversionRate || 0}%</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-amazon-orange" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recent Performance */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Event Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {!(analytics as EventAnalytics)?.recentEvents || (analytics as EventAnalytics)?.recentEvents?.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            No recent events to display
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {((analytics as EventAnalytics)?.recentEvents || [])?.map((event: EventPost) => (
                              <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                  <h4 className="font-semibold">{event.title}</h4>
                                  <p className="text-sm text-gray-600">{new Date(event.eventDate).toLocaleDateString()}</p>
                                </div>
                                <div className="flex gap-4 text-sm">
                                  <div className="text-center">
                                    <div className="font-semibold">{event.views}</div>
                                    <div className="text-gray-500">Views</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="font-semibold">{event.clicks}</div>
                                    <div className="text-gray-500">Clicks</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="font-semibold">{event.conversions}</div>
                                    <div className="text-gray-500">RSVPs</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Social Share Modal */}
        {selectedEventForSharing && (
          <SocialShareModal
            event={selectedEventForSharing}
            isOpen={shareModalOpen}
            onClose={() => {
              setShareModalOpen(false);
              setSelectedEventForSharing(null);
            }}
            eventUrl={`${window.location.origin}/events/${selectedEventForSharing.id}`}
          />
        )}
      </div>
    </Layout>
  );
}
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Copy, 
  Share2, 
  Calendar,
  MapPin,
  Users,
  ExternalLink,
  Check,
  Hash,
  Image
} from "lucide-react";

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
  imageUrl?: string;
}

interface SocialShareModalProps {
  event: EventPost;
  isOpen: boolean;
  onClose: () => void;
  eventUrl: string;
}

const socialPlatforms = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: <Facebook className="h-5 w-5" />,
    color: 'bg-blue-600 hover:bg-blue-700',
    maxLength: 63206,
    supportsImages: true,
    supportsHashtags: true
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: <Twitter className="h-5 w-5" />,
    color: 'bg-black hover:bg-gray-800',
    maxLength: 280,
    supportsImages: true,
    supportsHashtags: true
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: <Linkedin className="h-5 w-5" />,
    color: 'bg-blue-700 hover:bg-blue-800',
    maxLength: 3000,
    supportsImages: true,
    supportsHashtags: true
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: <Instagram className="h-5 w-5" />,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    maxLength: 2200,
    supportsImages: true,
    supportsHashtags: true
  }
];

export default function SocialShareModal({ event, isOpen, onClose, eventUrl }: SocialShareModalProps) {
  const { toast } = useToast();
  const [selectedPlatform, setSelectedPlatform] = useState('facebook');
  const [customMessage, setCustomMessage] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [shareCount, setShareCount] = useState(0);

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const generateDefaultMessage = (platform: string) => {
    const baseMessage = `🎉 Join us for "${event.title}"!\n\n📅 ${formatEventDate(event.eventDate)}\n📍 ${event.location}\n\n${event.description.substring(0, 150)}${event.description.length > 150 ? '...' : ''}`;
    
    const platformSpecific = {
      facebook: `${baseMessage}\n\n👥 ${event.maxAttendees - event.currentAttendees} spots remaining!\n${event.price === 0 ? '🆓 FREE Event' : `💰 $${event.price}`}\n\nRSVP now: ${eventUrl}`,
      twitter: `🎉 "${event.title}"\n📅 ${new Date(event.eventDate).toLocaleDateString()}\n📍 ${event.location}\n${event.price === 0 ? '🆓 FREE' : `💰 $${event.price}`}\n\nRSVP: ${eventUrl}`,
      linkedin: `${baseMessage}\n\nThis is a great opportunity to connect with like-minded professionals in ${event.category}.\n\n${event.price === 0 ? '🆓 Free admission' : `Investment: $${event.price}`}\nSpaces available: ${event.maxAttendees - event.currentAttendees}\n\nRegister here: ${eventUrl}`,
      instagram: `${baseMessage}\n\n✨ Don't miss out!\n${event.price === 0 ? '🆓 FREE' : `💰 $${event.price}`}\n\nLink in bio for tickets! 🎫`
    };

    return platformSpecific[platform as keyof typeof platformSpecific] || baseMessage;
  };

  const generateHashtags = () => {
    const eventCategory = event.category.replace(/\s+/g, '').replace(/&/g, 'And');
    const locationTag = event.location.split(',')[0].replace(/\s+/g, '');
    const baseHashtags = [
      '#Events',
      '#DurcheapEvents',
      `#${eventCategory}`,
      `#${locationTag}`,
      '#CommunityEvents'
    ];

    if (event.price === 0) {
      baseHashtags.push('#FreeEvent');
    }

    const eventDate = new Date(event.eventDate);
    const month = eventDate.toLocaleDateString('en-US', { month: 'long' });
    baseHashtags.push(`#${month}${eventDate.getFullYear()}`);

    return baseHashtags.join(' ');
  };

  const getMessage = () => {
    const platform = socialPlatforms.find(p => p.id === selectedPlatform);
    const message = customMessage || generateDefaultMessage(selectedPlatform);
    const tags = hashtags || generateHashtags();
    const fullMessage = `${message}\n\n${tags}`;
    
    if (platform && fullMessage.length > platform.maxLength) {
      const truncated = fullMessage.substring(0, platform.maxLength - 3) + '...';
      return truncated;
    }
    
    return fullMessage;
  };

  const handleShare = async (platformId: string) => {
    const message = getMessage();
    const platform = socialPlatforms.find(p => p.id === platformId);
    
    if (!platform) return;

    let shareUrl = '';
    
    switch (platformId) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}&quote=${encodeURIComponent(message)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}&summary=${encodeURIComponent(message)}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing, copy to clipboard instead
        await navigator.clipboard.writeText(message);
        toast({
          title: "Copied to Clipboard!",
          description: "Message copied. Open Instagram and paste to share.",
        });
        setShareCount(shareCount + 1);
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setShareCount(shareCount + 1);
      
      // Track share analytics
      try {
        await fetch('/api/events/analytics/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: event.id,
            platform: platformId,
            message: message
          })
        });
      } catch (error) {
        console.error('Failed to track share:', error);
      }

      toast({
        title: "Shared Successfully!",
        description: `Event shared on ${platform.name}`,
      });
    }
  };

  const copyToClipboard = async () => {
    const message = getMessage();
    await navigator.clipboard.writeText(message);
    toast({
      title: "Copied to Clipboard!",
      description: "Share message copied to clipboard",
    });
  };

  const copyEventUrl = async () => {
    await navigator.clipboard.writeText(eventUrl);
    toast({
      title: "Event URL Copied!",
      description: "Event link copied to clipboard",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Event
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Preview */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                {event.imageUrl && (
                  <img 
                    src={event.imageUrl} 
                    alt={event.title}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg line-clamp-2">{event.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatEventDate(event.eventDate)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {event.maxAttendees - event.currentAttendees} spots left
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Share Stats */}
          {shareCount > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-700">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Shared {shareCount} time{shareCount !== 1 ? 's' : ''} successfully!
                </span>
              </div>
            </div>
          )}

          <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform}>
            {/* Platform Selection */}
            <TabsList className="grid grid-cols-4 w-full">
              {socialPlatforms.map((platform) => (
                <TabsTrigger 
                  key={platform.id} 
                  value={platform.id}
                  className="flex items-center gap-2"
                >
                  {platform.icon}
                  <span className="hidden sm:inline">{platform.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {socialPlatforms.map((platform) => (
              <TabsContent key={platform.id} value={platform.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold flex items-center gap-2">
                    {platform.icon}
                    Share on {platform.name}
                  </h4>
                  <Badge variant="outline">
                    {getMessage().length} / {platform.maxLength} chars
                  </Badge>
                </div>

                {/* Custom Message */}
                <div className="space-y-2">
                  <Label htmlFor="custom-message">Custom Message (optional)</Label>
                  <Textarea
                    id="custom-message"
                    placeholder={generateDefaultMessage(platform.id)}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    maxLength={platform.maxLength - 100} // Leave room for hashtags
                    rows={6}
                    className="resize-none"
                  />
                </div>

                {/* Hashtags */}
                {platform.supportsHashtags && (
                  <div className="space-y-2">
                    <Label htmlFor="hashtags" className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Hashtags
                    </Label>
                    <Input
                      id="hashtags"
                      placeholder={generateHashtags()}
                      value={hashtags}
                      onChange={(e) => setHashtags(e.target.value)}
                    />
                  </div>
                )}

                {/* Message Preview */}
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <Card>
                    <CardContent className="p-3">
                      <div className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded border">
                        {getMessage()}
                      </div>
                      {getMessage().length > platform.maxLength && (
                        <p className="text-red-500 text-xs mt-2">
                          Message exceeds {platform.name} character limit and will be truncated
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Share Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleShare(platform.id)}
                    className={`flex-1 ${platform.color} text-white`}
                  >
                    {platform.icon}
                    <span className="ml-2">
                      Share on {platform.name}
                    </span>
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={copyToClipboard}
                    className="px-3"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Quick Actions */}
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-semibold">Quick Actions</h4>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={copyEventUrl}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Event URL
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(eventUrl, '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Event Page
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
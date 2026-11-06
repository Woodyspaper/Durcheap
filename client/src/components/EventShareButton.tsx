import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import SocialShareModal from "./SocialShareModal";

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

interface EventShareButtonProps {
  event: EventPost;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export default function EventShareButton({ 
  event, 
  size = 'sm', 
  variant = 'outline',
  className = '' 
}: EventShareButtonProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false);

  return (
    <>
      <Button
        size={size}
        variant={variant}
        onClick={() => setShareModalOpen(true)}
        className={`${className} bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200`}
      >
        <Share2 className="h-4 w-4 mr-1" />
        Share
      </Button>

      <SocialShareModal
        event={event}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        eventUrl={`${window.location.origin}/events/${event.id}`}
      />
    </>
  );
}
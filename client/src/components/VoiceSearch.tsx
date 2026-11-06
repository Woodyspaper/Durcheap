import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface VoiceSearchProps {
  onSearchQuery: (query: string) => void;
  className?: string;
}

export const VoiceSearch: React.FC<VoiceSearchProps> = ({ onSearchQuery, className = "" }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
      };
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        
        if (transcript.trim()) {
          onSearchQuery(transcript);
          setLocation(`/search?q=${encodeURIComponent(transcript.trim())}`);
          toast({
            title: "Voice Search",
            description: `Searching for: "${transcript}"`,
          });
        }
      };
      
      recognitionInstance.onerror = (event: any) => {
        setIsListening(false);
        console.error('Speech recognition error:', event.error);
        
        let errorMessage = "Voice search failed. Please try again.";
        if (event.error === 'not-allowed') {
          errorMessage = "Microphone access denied. Please enable microphone permissions.";
        } else if (event.error === 'no-speech') {
          errorMessage = "No speech detected. Please try speaking again.";
        }
        
        toast({
          title: "Voice Search Error",
          description: errorMessage,
          variant: "destructive",
        });
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    } else {
      setIsSupported(false);
    }
  }, [onSearchQuery, setLocation, toast]);

  const startListening = () => {
    if (recognition && !isListening) {
      try {
        recognition.start();
        toast({
          title: "Voice Search Active",
          description: "Speak now to search for products...",
        });
      } catch (error) {
        console.error('Failed to start voice recognition:', error);
        toast({
          title: "Voice Search Error",
          description: "Failed to start voice search. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  if (!isSupported) {
    return null; // Hide the button if not supported
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={`relative transition-all duration-300 hover:scale-110 ${
        isListening 
          ? 'text-red-500 animate-pulse bg-red-50 hover:bg-red-100' 
          : 'text-amazon-orange hover:text-orange-600 hover:bg-orange-50'
      } ${className}`}
      onClick={isListening ? stopListening : startListening}
      disabled={!isSupported}
      title={isListening ? "Stop voice search" : "Start voice search"}
    >
      {isListening ? (
        <>
          <div className="absolute inset-0 rounded-full bg-red-500 opacity-25 animate-ping" />
          <Loader2 className="h-5 w-5 animate-spin" />
        </>
      ) : (
        <Mic className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
      )}
      
      {/* Microphone animation when listening */}
      {isListening && (
        <div className="absolute -top-1 -right-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" />
        </div>
      )}
    </Button>
  );
};

// Extend the Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
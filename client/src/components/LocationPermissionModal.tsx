import React from 'react';
import { MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAllow: () => void;
  onDeny: () => void;
}

export function LocationPermissionModal({ 
  isOpen, 
  onClose, 
  onAllow, 
  onDeny 
}: LocationPermissionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-amazon-orange" />
            <span>Enable Location Services</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Allow Durcheap to access your location to show accurate delivery options 
            and find local products and services near you.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-900 mb-1">Benefits:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Accurate delivery time estimates</li>
              <li>• Local product recommendations</li>
              <li>• Nearby contractor services</li>
              <li>• Regional shipping options</li>
            </ul>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              onClick={onAllow}
              className="flex-1 bg-amazon-orange hover:bg-orange-600 text-amazon-dark"
            >
              Allow Location Access
            </Button>
            <Button 
              variant="outline" 
              onClick={onDeny}
              className="flex-1"
            >
              Not Now
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            You can change this setting anytime in your browser preferences
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
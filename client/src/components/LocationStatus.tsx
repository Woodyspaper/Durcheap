import React from 'react';
import { MapPin, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LocationStatusProps {
  isRefreshing?: boolean;
  accuracy?: number;
  lastUpdated?: string;
}

export function LocationStatus({ isRefreshing, accuracy, lastUpdated }: LocationStatusProps) {
  if (!isRefreshing && !accuracy && !lastUpdated) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-xs">
      <Alert className="bg-white border shadow-lg">
        {isRefreshing ? (
          <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
        ) : accuracy && accuracy < 100 ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <AlertCircle className="h-4 w-4 text-yellow-600" />
        )}
        <AlertDescription>
          {isRefreshing ? (
            <div>
              <p className="font-medium text-blue-900">Getting precise location...</p>
              <p className="text-sm text-blue-800">Using high-accuracy GPS</p>
            </div>
          ) : accuracy ? (
            <div>
              <p className="font-medium text-green-900">Location updated!</p>
              <p className="text-xs text-green-800">
                Accuracy: {Math.round(accuracy)}m • {lastUpdated}
              </p>
            </div>
          ) : (
            <div>
              <p className="font-medium text-yellow-900">Location approximated</p>
              <p className="text-xs text-yellow-800">
                Try GPS refresh for better accuracy
              </p>
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
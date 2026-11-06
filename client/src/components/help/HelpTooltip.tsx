import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface HelpTooltipProps {
  id: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  showOnHover?: boolean;
  persistent?: boolean;
}

export function HelpTooltip({ 
  id, 
  title, 
  content, 
  position = 'bottom', 
  children, 
  showOnHover = false,
  persistent = false 
}: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Check if this tooltip was previously dismissed
    const dismissed = localStorage.getItem(`help-tooltip-${id}`);
    if (dismissed && !persistent) {
      setIsDismissed(true);
    }
  }, [id, persistent]);

  const showTooltip = () => {
    if (isDismissed && !persistent) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(true);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsVisible(false), 150);
  };

  const dismissTooltip = () => {
    setIsVisible(false);
    setIsDismissed(true);
    if (!persistent) {
      localStorage.setItem(`help-tooltip-${id}`, 'true');
    }
  };

  const getTooltipPosition = () => {
    if (!triggerRef.current) return {};

    const rect = triggerRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    switch (position) {
      case 'top':
        return {
          bottom: window.innerHeight - rect.top - scrollY + 8,
          left: rect.left + scrollX + rect.width / 2,
          transform: 'translateX(-50%)',
        };
      case 'left':
        return {
          top: rect.top + scrollY + rect.height / 2,
          right: window.innerWidth - rect.left - scrollX + 8,
          transform: 'translateY(-50%)',
        };
      case 'right':
        return {
          top: rect.top + scrollY + rect.height / 2,
          left: rect.right + scrollX + 8,
          transform: 'translateY(-50%)',
        };
      default: // bottom
        return {
          top: rect.bottom + scrollY + 8,
          left: rect.left + scrollX + rect.width / 2,
          transform: 'translateX(-50%)',
        };
    }
  };

  if (isDismissed && !persistent) {
    return <>{children}</>;
  }

  const tooltip = isVisible && (
    <div
      ref={tooltipRef}
      className="fixed z-50 max-w-xs"
      style={getTooltipPosition()}
      onMouseEnter={() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      }}
      onMouseLeave={hideTooltip}
    >
      <Card className="shadow-lg border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-blue-900 text-sm">{title}</h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
              onClick={dismissTooltip}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-sm text-blue-800">{content}</p>
          {!persistent && (
            <div className="mt-2 text-xs text-blue-600">
              Click the × to dismiss this tip
            </div>
          )}
        </CardContent>
      </Card>
      {/* Arrow */}
      <div
        className={`absolute w-2 h-2 bg-blue-50 border-blue-200 transform rotate-45 ${
          position === 'top' ? 'top-full -mt-1 border-b border-r' :
          position === 'bottom' ? 'bottom-full -mb-1 border-t border-l' :
          position === 'left' ? 'left-full -ml-1 border-t border-r' :
          'right-full -mr-1 border-b border-l'
        }`}
        style={{
          left: position === 'bottom' || position === 'top' ? '50%' : undefined,
          top: position === 'left' || position === 'right' ? '50%' : undefined,
          transform: position === 'bottom' || position === 'top' ? 'translateX(-50%) rotate(45deg)' : 
                    'translateY(-50%) rotate(45deg)'
        }}
      />
    </div>
  );

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={showOnHover ? showTooltip : undefined}
      onMouseLeave={showOnHover ? hideTooltip : undefined}
    >
      {children}
      {!showOnHover && (
        <Button
          variant="ghost"
          size="sm"
          className="ml-1 h-5 w-5 p-0 text-blue-500 hover:text-blue-700"
          onClick={isVisible ? hideTooltip : showTooltip}
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      )}
      {tooltip && createPortal(tooltip, document.body)}
    </div>
  );
}
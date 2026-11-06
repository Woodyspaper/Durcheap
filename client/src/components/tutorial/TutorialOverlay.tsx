import React, { useEffect, useState } from 'react';
import { useTutorial } from './TutorialContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';

export function TutorialOverlay() {
  const { isActive, currentStep, steps, nextStep, previousStep, skipTutorial, stopTutorial } = useTutorial();
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const currentStepData = steps[currentStep];

  useEffect(() => {
    if (!isActive || !currentStepData) {
      setHighlightedElement(null);
      return;
    }

    const findAndHighlightElement = () => {
      const element = document.querySelector(currentStepData.target) as HTMLElement;
      if (element) {
        setHighlightedElement(element);
        
        // Calculate tooltip position
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        let top = 0;
        let left = 0;
        
        switch (currentStepData.position) {
          case 'top':
            top = rect.top + scrollTop - 120;
            left = rect.left + scrollLeft + rect.width / 2 - 200;
            break;
          case 'bottom':
            top = rect.bottom + scrollTop + 20;
            left = rect.left + scrollLeft + rect.width / 2 - 200;
            break;
          case 'left':
            top = rect.top + scrollTop + rect.height / 2 - 100;
            left = rect.left + scrollLeft - 420;
            break;
          case 'right':
            top = rect.top + scrollTop + rect.height / 2 - 100;
            left = rect.right + scrollLeft + 20;
            break;
        }
        
        // Ensure tooltip stays within viewport
        top = Math.max(20, Math.min(top, window.innerHeight - 240));
        left = Math.max(20, Math.min(left, window.innerWidth - 420));
        
        setTooltipPosition({ top, left });
        
        // Scroll element into view if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    // Small delay to ensure DOM is ready
    setTimeout(findAndHighlightElement, 100);
  }, [isActive, currentStep, currentStepData]);

  if (!isActive || !currentStepData) {
    return null;
  }

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 pointer-events-none" />
      
      {/* Highlight spotlight */}
      {highlightedElement && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            top: highlightedElement.getBoundingClientRect().top + window.pageYOffset - 8,
            left: highlightedElement.getBoundingClientRect().left + window.pageXOffset - 8,
            width: highlightedElement.offsetWidth + 16,
            height: highlightedElement.offsetHeight + 16,
            boxShadow: '0 0 0 4px rgba(255, 165, 0, 0.6), 0 0 0 9999px rgba(0, 0, 0, 0.5)',
            borderRadius: '8px',
          }}
        />
      )}
      
      {/* Tutorial tooltip */}
      <Card
        className="fixed z-50 w-96 bg-white dark:bg-gray-800 shadow-2xl border-2 border-amazon-orange"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold text-amazon-dark dark:text-white">
              {currentStepData.title}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={stopTutorial}
              className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={progress} className="w-full h-2" />
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Step {currentStep + 1} of {steps.length}
          </div>
        </CardHeader>
        
        <CardContent className="py-2">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {currentStepData.content}
          </p>
        </CardContent>
        
        <CardFooter className="pt-2 flex justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousStep}
              disabled={currentStep === 0}
              className="text-xs"
            >
              <ChevronLeft className="h-3 w-3 mr-1" />
              Back
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={skipTutorial}
              className="text-xs text-gray-500 dark:text-gray-400"
            >
              <SkipForward className="h-3 w-3 mr-1" />
              Skip
            </Button>
          </div>
          
          <Button
            onClick={nextStep}
            size="sm"
            className="bg-amazon-orange hover:bg-orange-600 text-amazon-dark text-xs"
          >
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
            {currentStep < steps.length - 1 && <ChevronRight className="h-3 w-3 ml-1" />}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
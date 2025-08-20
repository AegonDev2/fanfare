import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TutorialStep as TutorialStepType } from '@/hooks/useTutorial';

interface TutorialStepProps {
  step: TutorialStepType;
  isActive: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function TutorialStep({ 
  step, 
  isActive, 
  onNext, 
  onPrev, 
  onSkip, 
  isFirst, 
  isLast 
}: TutorialStepProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center tutorial-overlay">
      <Card className={`
        max-w-md mx-4 p-8 text-center space-y-6 border-primary/20 shadow-2xl
        ${isVisible ? 'tutorial-step-enter' : 'opacity-0'}
      `}>
        {/* Animated Icon */}
        <div className="text-6xl tutorial-icon-bounce mb-4">
          {step.icon}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-display font-bold text-foreground">
          {step.title}
        </h2>

        {/* Description */}
        <p className="text-muted-foreground text-lg leading-relaxed">
          {step.description}
        </p>

        {/* Progress Dots */}
        <div className="flex justify-center space-x-3 py-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className={`
                w-3 h-3 rounded-full tutorial-progress-dot
                ${index === Array.from(['welcome', 'discover', 'wishlist', 'gift', 'connect']).findIndex(id => id === step.id) 
                  ? 'bg-primary active' : 'bg-muted/50'}
              `}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 space-x-4">
          <Button
            variant="ghost"
            onClick={onSkip}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip Tutorial
          </Button>

          <div className="flex space-x-2">
            {!isFirst && (
              <Button
                variant="outline"
                onClick={onPrev}
                className="transition-all duration-200 hover:scale-105"
              >
                Previous
              </Button>
            )}
            
            <Button
              onClick={onNext}
              className="transition-all duration-200 hover:scale-105 bg-primary hover:bg-primary/90 shadow-lg"
            >
              {isLast ? 'Get Started!' : 'Next'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
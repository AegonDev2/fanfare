import { useState, useCallback, useEffect } from 'react';
import { useDataPreloader } from './useDataPreloader';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  animation: string;
  duration: number;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to FanFare!',
    description: 'Connect with your favorite creators and send them amazing gifts that make their day.',
    icon: '🎉',
    animation: 'slide-in-bottom',
    duration: 4000
  },
  {
    id: 'discover',
    title: 'Discover Amazing Creators',
    description: 'Browse through talented influencers, streamers, and content creators across different platforms.',
    icon: '✨',
    animation: 'slide-in-left',
    duration: 4000
  },
  {
    id: 'wishlist',
    title: 'Explore Their Wishlists',
    description: 'See exactly what your favorite creators are wishing for - from tech gadgets to cozy items.',
    icon: '🎁',
    animation: 'slide-in-right',
    duration: 4000
  },
  {
    id: 'gift',
    title: 'Send Thoughtful Gifts',
    description: 'Choose the perfect gift from their wishlist and send it directly to them with a personal message.',
    icon: '💝',
    animation: 'expand',
    duration: 4000
  },
  {
    id: 'connect',
    title: 'Build Real Connections',
    description: 'Create meaningful relationships with creators through the joy of giving and receiving.',
    icon: '🤝',
    animation: 'slide-in-top',
    duration: 4000
  }
];

export const useTutorial = () => {
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  // Preload data during tutorial
  useDataPreloader();

  useEffect(() => {
    // Check if user has completed tutorial before - use consistent keys
    const tutorialCompleted = localStorage.getItem('tutorial-completed');
    const hasVisited = localStorage.getItem('has-visited');
    
    console.log('🎓 Tutorial: Initializing state', { tutorialCompleted, hasVisited });
    
    if (!tutorialCompleted && !hasVisited) {
      console.log('🆕 Tutorial: First time detected');
      setIsFirstTime(true);
    } else if (tutorialCompleted) {
      console.log('✅ Tutorial: Already completed');
      setIsComplete(true);
    }
  }, []);

  const startTutorial = useCallback(() => {
    setIsActive(true);
    setCurrentStep(0);
    setIsComplete(false);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTutorial();
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const skipTutorial = useCallback(() => {
    completeTutorial();
  }, []);

  const completeTutorial = useCallback(() => {
    console.log('🎓✅ Tutorial: Completing tutorial');
    setIsComplete(true);
    setIsActive(false);
    localStorage.setItem('tutorial-completed', 'true');
    
    // Trigger storage event for same-window communication
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'tutorial-completed',
      newValue: 'true'
    }));
  }, []);

  const resetTutorial = useCallback(() => {
    console.log('🔄 Tutorial: Resetting tutorial');
    localStorage.removeItem('tutorial-completed');
    localStorage.removeItem('has-visited'); // Use consistent key
    setIsFirstTime(true);
    setCurrentStep(0);
    setIsActive(false);
    setIsComplete(false);
  }, []);

  return {
    isFirstTime,
    currentStep,
    isActive,
    isComplete,
    steps: TUTORIAL_STEPS,
    totalSteps: TUTORIAL_STEPS.length,
    currentStepData: TUTORIAL_STEPS[currentStep],
    startTutorial,
    nextStep,
    prevStep,
    skipTutorial,
    completeTutorial,
    resetTutorial
  };
};
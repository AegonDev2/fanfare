import { useEffect } from 'react';
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialStep } from './TutorialStep';
import { TutorialLoading } from './TutorialLoading';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { useTransitionNavigation } from '@/hooks/useTransitionNavigation';

export function TutorialContainer() {
  const { 
    isActive, 
    isComplete,
    currentStep, 
    currentStepData, 
    nextStep, 
    prevStep, 
    skipTutorial,
    totalSteps,
    startTutorial,
    isFirstTime
  } = useTutorial();
  
  const { isAuthenticated, hasCompleteProfile, isPrimaryRole } = useOptimizedAuth();
  const { navigate } = useTransitionNavigation();

  // Auto-start tutorial for first-time users
  useEffect(() => {
    if (isFirstTime && isAuthenticated && !isActive && !isComplete) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        startTutorial();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isFirstTime, isAuthenticated, isActive, isComplete, startTutorial]);

  // Handle tutorial completion - redirect based on user state
  useEffect(() => {
    if (isComplete && isAuthenticated) {
      // If user doesn't have a complete profile, redirect to create profile
      if (!hasCompleteProfile()) {
        if (isPrimaryRole('fan')) {
          navigate('/create-fan-profile');
        } else if (isPrimaryRole('influencer')) {
          navigate('/create-influencer-profile');
        } else {
          navigate('/home');
        }
      } else {
        // User has complete profile, go to main app
        navigate('/home');
      }
    }
  }, [isComplete, isAuthenticated, hasCompleteProfile, isPrimaryRole, navigate]);

  if (!isActive || !currentStepData) {
    // Show loading state when tutorial is about to start
    if (isFirstTime && isAuthenticated && !isComplete) {
      return <TutorialLoading />;
    }
    return null;
  }

  return (
    <TutorialStep
      step={currentStepData}
      isActive={isActive}
      onNext={nextStep}
      onPrev={prevStep}
      onSkip={skipTutorial}
      isFirst={currentStep === 0}
      isLast={currentStep === totalSteps - 1}
    />
  );
}
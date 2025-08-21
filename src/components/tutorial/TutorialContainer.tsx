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
      console.log('🎓 TutorialContainer: Auto-starting tutorial');
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
      console.log('🎓✅ TutorialContainer: Tutorial completed, redirecting...');
      
      // Small delay to ensure state propagation
      const timer = setTimeout(() => {
        // If user doesn't have a complete profile, redirect to create profile
        if (!hasCompleteProfile()) {
          if (isPrimaryRole('fan')) {
            console.log('🎓➡️👤 TutorialContainer: Redirecting to fan profile creation');
            navigate('/create-fan-profile');
          } else if (isPrimaryRole('influencer')) {
            console.log('🎓➡️🌟 TutorialContainer: Redirecting to influencer profile creation');
            navigate('/create-influencer-profile');
          } else {
            console.log('🎓➡️🏠 TutorialContainer: Redirecting to home (no role)');
            navigate('/home');
          }
        } else {
          // User has complete profile, go to main app
          console.log('🎓➡️🏠 TutorialContainer: Redirecting to home (complete profile)');
          navigate('/home');
        }
      }, 100);
      
      return () => clearTimeout(timer);
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
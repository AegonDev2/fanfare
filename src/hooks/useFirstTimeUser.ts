import { useState, useEffect } from 'react';
import { useOptimizedAuth } from './useOptimizedAuth';

export const useFirstTimeUser = () => {
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean | null>(null);
  const [shouldShowAuth, setShouldShowAuth] = useState(false);
  const [shouldShowTutorial, setShouldShowTutorial] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { isAuthenticated, isLoading } = useOptimizedAuth();

  useEffect(() => {
    if (isLoading || initialized) return;

    console.log('🔄 FirstTimeUser: Initializing...', { isAuthenticated, isLoading });

    // Use consistent localStorage keys
    const hasVisited = localStorage.getItem('has-visited');
    const tutorialCompleted = localStorage.getItem('tutorial-completed');

    console.log('🔄 FirstTimeUser: LocalStorage state', { hasVisited, tutorialCompleted });

    // First time user logic
    if (!hasVisited) {
      console.log('🆕 FirstTimeUser: First time user detected');
      setIsFirstTimeUser(true);
      localStorage.setItem('has-visited', 'true');
      
      // If not authenticated, show auth first
      if (!isAuthenticated) {
        console.log('🔐 FirstTimeUser: Not authenticated, showing auth');
        setShouldShowAuth(true);
        setShouldShowTutorial(false);
      } else {
        // If authenticated but no tutorial, show tutorial
        if (!tutorialCompleted) {
          console.log('🎓 FirstTimeUser: Authenticated, showing tutorial');
          setShouldShowAuth(false);
          setShouldShowTutorial(true);
        } else {
          console.log('✅ FirstTimeUser: Tutorial already completed, going to app');
          setShouldShowAuth(false);
          setShouldShowTutorial(false);
        }
      }
    } else {
      console.log('👋 FirstTimeUser: Returning user');
      setIsFirstTimeUser(false);
      // Not first time, follow normal flow
      setShouldShowAuth(false);
      setShouldShowTutorial(false);
    }
    
    setInitialized(true);
  }, [isAuthenticated, isLoading, initialized]);

  // Handle auth completion for first-time users
  useEffect(() => {
    if (isFirstTimeUser && isAuthenticated && shouldShowAuth) {
      console.log('🔐➡️🎓 FirstTimeUser: Auth completed, checking tutorial');
      const tutorialCompleted = localStorage.getItem('tutorial-completed');
      if (!tutorialCompleted) {
        console.log('🎓 FirstTimeUser: Starting tutorial after auth');
        setShouldShowAuth(false);
        setShouldShowTutorial(true);
      } else {
        console.log('✅ FirstTimeUser: Tutorial already completed after auth');
        setShouldShowAuth(false);
        setShouldShowTutorial(false);
      }
    }
  }, [isAuthenticated, isFirstTimeUser, shouldShowAuth]);

  // Monitor tutorial completion from localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const tutorialCompleted = localStorage.getItem('tutorial-completed');
      if (tutorialCompleted && shouldShowTutorial) {
        console.log('🎓✅ FirstTimeUser: Tutorial completed detected, hiding tutorial');
        setShouldShowTutorial(false);
      }
    };

    // Listen for localStorage changes from other components
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically (fallback for same-window changes)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [shouldShowTutorial]);

  const completeTutorial = () => {
    setShouldShowTutorial(false);
    localStorage.setItem('tutorial-completed', 'true');
  };

  const resetFirstTimeUser = () => {
    localStorage.removeItem('has-visited');
    localStorage.removeItem('tutorial-completed');
    setIsFirstTimeUser(null);
    setShouldShowAuth(false);
    setShouldShowTutorial(false);
    setInitialized(false);
  };

  return {
    isFirstTimeUser,
    shouldShowAuth,
    shouldShowTutorial,
    completeTutorial,
    resetFirstTimeUser,
    isLoading: !initialized || isFirstTimeUser === null
  };
};
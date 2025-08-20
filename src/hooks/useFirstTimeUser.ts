import { useState, useEffect } from 'react';
import { useOptimizedAuth } from './useOptimizedAuth';

export const useFirstTimeUser = () => {
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean | null>(null);
  const [shouldShowAuth, setShouldShowAuth] = useState(false);
  const [shouldShowTutorial, setShouldShowTutorial] = useState(false);
  const { isAuthenticated, isLoading } = useOptimizedAuth();

  useEffect(() => {
    if (isLoading) return;

    const hasVisited = localStorage.getItem('has-visited');
    const tutorialCompleted = localStorage.getItem('tutorial-completed');

    // First time user logic
    if (!hasVisited) {
      setIsFirstTimeUser(true);
      localStorage.setItem('has-visited', 'true');
      
      // If not authenticated, show auth first
      if (!isAuthenticated) {
        setShouldShowAuth(true);
        setShouldShowTutorial(false);
      } else {
        // If authenticated but no tutorial, show tutorial
        if (!tutorialCompleted) {
          setShouldShowAuth(false);
          setShouldShowTutorial(true);
        }
      }
    } else {
      setIsFirstTimeUser(false);
      // Not first time, follow normal flow
      setShouldShowAuth(false);
      setShouldShowTutorial(false);
    }
  }, [isAuthenticated, isLoading]);

  // Handle auth completion for first-time users
  useEffect(() => {
    if (isFirstTimeUser && isAuthenticated && shouldShowAuth) {
      const tutorialCompleted = localStorage.getItem('tutorial-completed');
      if (!tutorialCompleted) {
        setShouldShowAuth(false);
        setShouldShowTutorial(true);
      }
    }
  }, [isAuthenticated, isFirstTimeUser, shouldShowAuth]);

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
  };

  return {
    isFirstTimeUser,
    shouldShowAuth,
    shouldShowTutorial,
    completeTutorial,
    resetFirstTimeUser,
    isLoading: isFirstTimeUser === null
  };
};
// Lazy preloader that initializes after the app is ready
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';

export function LazyPreloader() {
  const [hasInitialized, setHasInitialized] = useState(false);
  const location = useLocation();
  const { isAuthenticated, isLoading } = useSimpleAuth();

  useEffect(() => {
    // Only initialize preloader after app is ready and user has interacted
    if (isLoading || hasInitialized) return;

    const initializePreloader = async () => {
      // Wait a bit to ensure app has fully loaded
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        // Dynamically import the SmartPreloader to avoid blocking startup
        const { SmartPreloader } = await import('./SmartPreloader');
        
        // Initialize in the background
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            console.log('🚀 LazyPreloader: Initializing background preloading');
            setHasInitialized(true);
          }, { timeout: 5000 });
        } else {
          setTimeout(() => {
            console.log('🚀 LazyPreloader: Initializing background preloading');
            setHasInitialized(true);
          }, 3000);
        }
      } catch (error) {
        console.warn('Failed to initialize lazy preloader:', error);
      }
    };

    // Only start preloader after user has navigated or after delay
    const timer = setTimeout(initializePreloader, 3000);
    
    return () => clearTimeout(timer);
  }, [isLoading, hasInitialized]);

  // Don't render anything - this is just for side effects
  return null;
}
import { useCallback } from 'react';
import { useTransitionNavigation } from '@/hooks/useTransitionNavigation';
import { navigationOptimizer } from '@/utils/navigationOptimizer';

interface OptimizedNavigationProps {
  children: (navigate: (to: string, options?: any) => void) => React.ReactNode;
}

export const OptimizedNavigation: React.FC<OptimizedNavigationProps> = ({ children }) => {
  const { navigate: baseNavigate } = useTransitionNavigation();

  const optimizedNavigate = useCallback((to: string, options?: any) => {
    // Preload data for the target route
    navigationOptimizer.preloadRoute(to);
    
    // Navigate with transition
    baseNavigate(to, options);
  }, [baseNavigate]);

  return <>{children(optimizedNavigate)}</>;
};
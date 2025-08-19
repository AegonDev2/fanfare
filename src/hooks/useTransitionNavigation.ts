import { useCallback, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook that wraps navigation with startTransition to prevent
 * suspension errors during lazy loading
 */
export const useTransitionNavigation = () => {
  const navigate = useNavigate();

  const navigateWithTransition = useCallback((to: string, options?: any) => {
    startTransition(() => {
      navigate(to, options);
    });
  }, [navigate]);

  const replaceWithTransition = useCallback((to: string, options?: any) => {
    startTransition(() => {
      navigate(to, { ...options, replace: true });
    });
  }, [navigate]);

  return {
    navigate: navigateWithTransition,
    replace: replaceWithTransition,
    // Backward compatibility
    navigateWithTransition,
    replaceWithTransition
  };
};
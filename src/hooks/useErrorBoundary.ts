import { useState, useCallback } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export const useErrorBoundary = () => {
  const [errorState, setErrorState] = useState<ErrorBoundaryState>({
    hasError: false,
    error: null,
    errorInfo: null
  });

  const resetError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  }, []);

  const captureError = useCallback((error: Error, errorInfo?: any) => {
    console.error('🚨 Error captured:', error);
    setErrorState({
      hasError: true,
      error,
      errorInfo
    });
  }, []);

  const withErrorBoundary = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R> | R
  ) => {
    return async (...args: T): Promise<R | null> => {
      try {
        const result = await fn(...args);
        return result;
      } catch (error) {
        captureError(error as Error);
        return null;
      }
    };
  }, [captureError]);

  return {
    ...errorState,
    resetError,
    captureError,
    withErrorBoundary
  };
};
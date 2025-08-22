import { useQuery } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { optimizedCache } from '@/utils/optimizedCache';
import { useToast } from '@/hooks/use-toast';

interface UseResilientDataOptions<T> {
  queryKey: (string | number)[];
  queryFn: () => Promise<T>;
  cacheKey?: string;
  staleTime?: number;
  gcTime?: number;
  fallbackData?: T | null;
  enableOfflineFirst?: boolean;
  onError?: (error: Error) => void;
}

export function useResilientData<T>({
  queryKey,
  queryFn,
  cacheKey,
  staleTime = 5 * 60 * 1000, // 5 minutes
  gcTime = 30 * 60 * 1000, // 30 minutes
  fallbackData = null,
  enableOfflineFirst = true,
  onError
}: UseResilientDataOptions<T>) {
  const { toast } = useToast();
  const [hasShownOfflineWarning, setHasShownOfflineWarning] = useState(false);

  // Enhanced query function with caching fallback
  const enhancedQueryFn = useCallback(async (): Promise<T> => {
    try {
      const result = await queryFn();
      
      // Cache successful result
      if (cacheKey && result) {
        optimizedCache.set(cacheKey, result);
      }
      
      return result;
    } catch (error) {
      console.error('Query failed, attempting cache fallback:', error);
      
      // Try to get cached data as fallback
      if (enableOfflineFirst && cacheKey) {
        const cachedData = optimizedCache.get<T>(cacheKey);
        if (cachedData) {
          console.log('Using cached data due to network failure');
          
          // Show offline warning only once
          if (!hasShownOfflineWarning) {
            toast({
              title: "Using cached data",
              description: "Showing previously loaded information due to network issues",
              variant: "default",
            });
            setHasShownOfflineWarning(true);
          }
          
          return cachedData;
        }
      }
      
      // Call custom error handler if provided
      if (onError) {
        onError(error as Error);
      }
      
      throw error;
    }
  }, [queryFn, cacheKey, enableOfflineFirst, hasShownOfflineWarning, onError, toast]);

  const query = useQuery({
    queryKey,
    queryFn: enhancedQueryFn,
    staleTime,
    gcTime,
    retry: (failureCount, error) => {
      // Don't retry if we have cached data
      if (enableOfflineFirst && cacheKey && optimizedCache.get(cacheKey)) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Get cached data if query is loading and cache exists
  const getCachedData = useCallback((): T | null => {
    if (cacheKey) {
      return optimizedCache.get<T>(cacheKey) || fallbackData;
    }
    return fallbackData;
  }, [cacheKey, fallbackData]);

  return {
    ...query,
    cachedData: getCachedData(),
    isUsingCache: query.isLoading && !!getCachedData(),
    hasCache: !!getCachedData(),
  };
}
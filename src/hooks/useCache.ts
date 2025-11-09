import { useState, useEffect, useCallback } from 'react';
import { optimizedCache } from '@/utils/optimizedCache';

interface UseCacheOptions<T> {
  key: string;
  fetcher: () => Promise<T>;
  dependencies?: any[];
  ttl?: number;
  enabled?: boolean;
}

export function useCache<T>({
  key,
  fetcher,
  dependencies = [],
  ttl,
  enabled = true
}: UseCacheOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    try {
      setIsLoading(true);
      setError(null);

      // Try to get from cache first
      if (!forceRefresh) {
        const cachedData = optimizedCache.get<T>(key);
        if (cachedData) {
          setData(cachedData);
          setIsLoading(false);
          return cachedData;
        }
      }

      // Fetch fresh data
      const freshData = await fetcher();
      
      // Cache the result
      optimizedCache.set(key, freshData, ttl);
      setData(freshData);
      
      return freshData;
    } catch (err) {
      setError(err as Error);
      console.error(`Cache fetch error for key ${key}:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, enabled, ttl]);

  // Refresh function
  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Clear cache for this key
  const clearCache = useCallback(() => {
    optimizedCache.delete(key);
    setData(null);
  }, [key]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  return {
    data,
    isLoading,
    error,
    refresh,
    clearCache
  };
}

// Specialized hooks for common cache patterns
export function useProfileCache(userId: string, type: 'influencer' | 'fan' | 'general') {
  return useCache({
    key: `profile_${type}_${userId}`,
    fetcher: async () => {
      // This would be implemented in the actual hook usage
      throw new Error('Fetcher must be provided when using useProfileCache');
    },
    dependencies: [userId, type],
    enabled: !!userId
  });
}

export function useLeaderboardCache(type: string = 'monthly') {
  return useCache({
    key: `leaderboard_${type}`,
    fetcher: async () => {
      throw new Error('Fetcher must be provided when using useLeaderboardCache');
    },
    dependencies: [type]
  });
}
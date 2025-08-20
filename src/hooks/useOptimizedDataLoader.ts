// Optimized data loading hook for Android performance
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { performanceCache } from '@/utils/performanceCache';
import { requestManager } from '@/utils/requestDeduplication';

interface LoaderConfig {
  key: string;
  fetcher: () => Promise<any>;
  dependencies?: any[];
  enabled?: boolean;
  priority?: 'high' | 'medium' | 'low';
  ttl?: number;
  backgroundRefresh?: boolean;
  retryCount?: number;
}

interface LoaderState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: number | null;
  isStale: boolean;
}

export function useOptimizedDataLoader<T = any>(config: LoaderConfig) {
  const [state, setState] = useState<LoaderState<T>>({
    data: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
    isStale: false
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const {
    key,
    fetcher,
    dependencies = [],
    enabled = true,
    priority = 'medium',
    ttl,
    backgroundRefresh = true,
    retryCount = 3
  } = config;

  // Optimized fetch function with caching and deduplication
  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled || !isMountedRef.current) return;

    try {
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null 
      }));

      // Check cache first unless forcing refresh
      if (!forceRefresh) {
        const cachedData = await performanceCache.get<T>(key);
        if (cachedData !== null && isMountedRef.current) {
          setState(prev => ({
            ...prev,
            data: cachedData,
            isLoading: false,
            lastUpdated: Date.now(),
            isStale: false
          }));
          
          // Still trigger background refresh if enabled
          if (backgroundRefresh) {
            setTimeout(() => fetchData(true), 100);
          }
          return cachedData;
        }
      }

      // Fetch with deduplication and retry
      const freshData = await requestManager.dedupeWithRetry(
        `loader_${key}`,
        async () => {
          const result = await fetcher();
          return result;
        },
        retryCount
      );

      if (!isMountedRef.current) return;

      // Cache the result
      performanceCache.set(key, freshData, ttl);

      setState(prev => ({
        ...prev,
        data: freshData,
        isLoading: false,
        error: null,
        lastUpdated: Date.now(),
        isStale: false
      }));

      return freshData;

    } catch (error: any) {
      if (error.name === 'AbortError' || !isMountedRef.current) return;
      
      console.error(`Error loading ${key}:`, error);
      
      // Try to return stale cache data on error
      const staleData = await performanceCache.get<T>(key);
      
      setState(prev => ({
        ...prev,
        data: staleData || prev.data,
        isLoading: false,
        error: error,
        isStale: !!staleData
      }));
    }
  }, [key, fetcher, enabled, ttl, backgroundRefresh, retryCount]);

  // Manual refresh function
  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Clear cache for this key
  const clearCache = useCallback(() => {
    performanceCache.set(key, null, 0); // Immediate expiry
    setState(prev => ({
      ...prev,
      data: null,
      isStale: false
    }));
  }, [key]);

  // Initial load and dependency-based reloads
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, enabled, ...dependencies]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    refresh,
    clearCache,
    isReady: !state.isLoading && state.data !== null
  };
}

// Specialized hooks for common data patterns
export function useOptimizedAuth(userId?: string) {
  return useOptimizedDataLoader({
    key: `auth_${userId || 'current'}`,
    fetcher: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    },
    enabled: !!userId,
    priority: 'high',
    ttl: 15 * 60 * 1000, // 15 minutes
    retryCount: 2
  });
}

export function useOptimizedUserData(userId?: string) {
  return useOptimizedDataLoader({
    key: `user_complete_${userId}`,
    fetcher: async () => {
      if (!userId) throw new Error('User ID required');
      
      const { data, error } = await supabase.rpc('get_complete_user_data', {
        user_uuid: userId
      });
      
      if (error) throw error;
      return data;
    },
    dependencies: [userId],
    enabled: !!userId,
    priority: 'high',
    ttl: 30 * 60 * 1000, // 30 minutes
  });
}

export function useOptimizedLeaderboard(month?: number, year?: number) {
  const currentDate = new Date();
  const targetMonth = month || currentDate.getMonth() + 1;
  const targetYear = year || currentDate.getFullYear();
  
  return useOptimizedDataLoader({
    key: `leaderboard_${targetMonth}_${targetYear}`,
    fetcher: async () => {
      const { data, error } = await supabase.rpc('get_monthly_leaderboard', {
        target_month: targetMonth,
        target_year: targetYear
      });
      
      if (error) throw error;
      return data;
    },
    dependencies: [targetMonth, targetYear],
    priority: 'medium',
    ttl: 5 * 60 * 1000, // 5 minutes
  });
}

export function useOptimizedWallet(userId?: string) {
  return useOptimizedDataLoader({
    key: `wallet_${userId}`,
    fetcher: async () => {
      if (!userId) throw new Error('User ID required');
      
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    dependencies: [userId],
    enabled: !!userId,
    priority: 'high',
    ttl: 10 * 60 * 1000, // 10 minutes
  });
}

export function useOptimizedInfluencers(limit = 20) {
  return useOptimizedDataLoader({
    key: `influencers_preview_${limit}`,
    fetcher: async () => {
      const { data, error } = await supabase
        .from('influencer_profiles')
        .select('id, name, platform, followers, profile_image, category')
        .order('followers', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    },
    priority: 'medium',
    ttl: 30 * 60 * 1000, // 30 minutes - static-ish data
  });
}
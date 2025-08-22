import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Capacitor } from '@capacitor/core';
import { mobilePerformanceOptimizer } from '@/utils/mobilePerformanceOptimizer';
import { optimizedCache } from '@/utils/optimizedCache';

export const useMobileOptimizations = () => {
  const queryClient = useQueryClient();

  // Initialize mobile optimizations
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      mobilePerformanceOptimizer.initialize();
    }
  }, []);

  // Mobile-specific cache cleanup
  const cleanupMobileCache = useCallback(() => {
    if (!Capacitor.isNativePlatform()) return;

    // More aggressive cache cleanup on mobile
    const cacheSize = queryClient.getQueryCache().getAll().length;
    
    if (cacheSize > 50) {
      // Clear old cached queries
      queryClient.getQueryCache().getAll().forEach(query => {
        const age = Date.now() - query.state.dataUpdatedAt;
        if (age > 300000) { // 5 minutes
          queryClient.removeQueries({ queryKey: query.queryKey });
        }
      });
      
      console.log(`📱 Cleaned up mobile cache, removed old queries`);
    }

    // Clear optimized cache for non-critical data
    optimizedCache.clearUserData('temp');
  }, [queryClient]);

  // Listen for mobile cleanup events
  useEffect(() => {
    const handleMobileCleanup = () => {
      cleanupMobileCache();
    };

    window.addEventListener('mobile-cleanup-cache', handleMobileCleanup);
    
    return () => {
      window.removeEventListener('mobile-cleanup-cache', handleMobileCleanup);
    };
  }, [cleanupMobileCache]);

  // Optimize queries for mobile
  const optimizeQueriesForMobile = useCallback(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Set more aggressive stale times for mobile
    queryClient.setQueryDefaults(['influencers'], {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    });

    queryClient.setQueryDefaults(['leaderboard'], {
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 20 * 60 * 1000, // 20 minutes
    });

    // Reduce simultaneous requests on mobile
    queryClient.setDefaultOptions({
      queries: {
        retry: 2, // Reduce retries
        retryDelay: 1000, // Faster retries
      },
    });
  }, [queryClient]);

  useEffect(() => {
    optimizeQueriesForMobile();
  }, [optimizeQueriesForMobile]);

  // Performance monitoring
  const getPerformanceReport = useCallback(() => {
    if (!Capacitor.isNativePlatform()) return null;
    
    return mobilePerformanceOptimizer.getPerformanceReport();
  }, []);

  // Force optimization trigger
  const optimizeNow = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;
    
    cleanupMobileCache();
    await mobilePerformanceOptimizer.preloadCriticalResources();
    
    console.log('📱 Mobile optimizations triggered');
  }, [cleanupMobileCache]);

  return {
    isNativePlatform: Capacitor.isNativePlatform(),
    getPerformanceReport,
    optimizeNow,
    cleanupMobileCache
  };
};
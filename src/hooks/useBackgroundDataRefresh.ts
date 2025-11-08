import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { optimizedCache } from '@/utils/optimizedCache';

// Background data refresh to keep cache fresh
export const useBackgroundDataRefresh = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Refresh stale data in background every 10 minutes (reduced from 5)
    const interval = setInterval(() => {
      console.log('🔄 Background refresh of stale data');
      
      // Get all cached queries and refresh only active stale ones
      const queryCache = queryClient.getQueryCache();
      const queries = queryCache.getAll();
      
      queries.forEach(query => {
        // Only refresh if query is stale, has data, and has active observers
        if (query.isStale() && query.state.status === 'success' && query.getObserversCount() > 0) {
          console.log('Refreshing active stale query:', query.queryKey);
          query.fetch();
        }
      });
    }, 10 * 60 * 1000); // 10 minutes

    // Listen for network changes
    const handleOnline = () => {
      console.log('🌐 Network restored, refreshing data');
      queryClient.invalidateQueries();
    };

    // Listen for visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page visible, checking for stale data');
        
        // Refresh critical data when page becomes visible
        const criticalQueries = ['wallet-data', 'profile-complete', 'auth-data'];
        criticalQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ 
            queryKey: [queryKey],
            refetchType: 'inactive'
          });
        });
      }
    };

    // Listen for custom preload events
    const handlePreloadHome = () => {
      console.log('🏠 Preloading home data');
      
      // Prefetch home page queries
      queryClient.prefetchQuery({
        queryKey: ['influencers-optimized', undefined, undefined],
        staleTime: 10 * 60 * 1000
      });
      
      queryClient.prefetchQuery({
        queryKey: ['leaderboard-optimized'],
        staleTime: 10 * 60 * 1000
      });
    };

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('preload-home-data', handlePreloadHome);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('preload-home-data', handlePreloadHome);
    };
  }, [queryClient]);
};

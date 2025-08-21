import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface PerformanceMetrics {
  pageLoadTime: number;
  cacheHitRate: number;
  queryCount: number;
  errorCount: number;
}

export const usePerformanceMonitor = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const startTime = performance.now();
    let queryCount = 0;
    let errorCount = 0;

    const trackPageLoad = () => {
      const loadTime = performance.now() - startTime;
      console.log(`📊 Page load time: ${loadTime.toFixed(2)}ms`);
      
      // Log performance to localStorage for debugging
      const perfData = JSON.parse(localStorage.getItem('fanfare_perf') || '[]');
      perfData.push({
        timestamp: Date.now(),
        page: window.location.pathname,
        loadTime,
        type: 'page_load'
      });
      
      // Keep only last 50 entries
      if (perfData.length > 50) {
        perfData.splice(0, perfData.length - 50);
      }
      
      localStorage.setItem('fanfare_perf', JSON.stringify(perfData));
    };

    const trackQueries = () => {
      const queryCache = queryClient.getQueryCache();
      const queries = queryCache.getAll();
      
      queries.forEach(query => {
        if (query.state.status === 'success') {
          queryCount++;
        } else if (query.state.status === 'error') {
          errorCount++;
        }
      });

      const cacheHitRate = queries.length > 0 ? (queryCount / queries.length) * 100 : 0;
      
      console.log(`📊 Query stats: ${queryCount} successful, ${errorCount} errors, ${cacheHitRate.toFixed(1)}% cache hit rate`);
    };

    // Track initial performance
    const timeoutId = setTimeout(() => {
      trackPageLoad();
      trackQueries();
    }, 1000);

    // Monitor query changes
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'added' || event.type === 'updated') {
        trackQueries();
      }
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [queryClient]);

  // Expose performance data for debugging
  const getPerformanceData = () => {
    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();
    
    return {
      totalQueries: queries.length,
      successfulQueries: queries.filter(q => q.state.status === 'success').length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      loadingQueries: queries.filter(q => q.state.status === 'pending').length,
      cachedData: JSON.parse(localStorage.getItem('fanfare_perf') || '[]')
    };
  };

  return { getPerformanceData };
};

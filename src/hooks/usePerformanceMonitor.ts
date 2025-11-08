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
    let queryCountSnapshot = 0;
    let errorCountSnapshot = 0;

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
      
      const successQueries = queries.filter(q => q.state.status === 'success' && q.state.dataUpdatedAt > 0);
      const errorQueries = queries.filter(q => q.state.status === 'error');
      
      queryCountSnapshot = successQueries.length;
      errorCountSnapshot = errorQueries.length;

      // Cache hit rate: queries with cached data / total queries
      const cacheHitRate = queries.length > 0 ? (successQueries.length / queries.length) * 100 : 0;
      
      console.log(`📊 Query stats: ${queryCountSnapshot} successful, ${errorCountSnapshot} errors, ${cacheHitRate.toFixed(1)}% cache hit rate`);
    };

    // Track initial performance
    const timeoutId = setTimeout(() => {
      trackPageLoad();
      trackQueries();
    }, 1000);

    // Monitor query changes every 30 seconds instead of on every update
    const trackInterval = setInterval(() => {
      trackQueries();
    }, 30000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(trackInterval);
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

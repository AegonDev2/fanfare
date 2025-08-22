import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Capacitor } from '@capacitor/core';

export const MobileRefreshHandler = () => {
  const queryClient = useQueryClient();

  // Handle mobile pull-to-refresh
  const handleRefresh = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;
    
    console.log('🔄 Mobile refresh triggered');
    
    // Clear specific stale queries
    queryClient.removeQueries({ stale: true });
    
    // Invalidate critical data
    queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    queryClient.invalidateQueries({ queryKey: ['giftItems'] });
    queryClient.invalidateQueries({ queryKey: ['wallet'] });
    
    // Refetch in background
    queryClient.refetchQueries({ 
      queryKey: ['leaderboard'],
      type: 'active'
    });
    
    console.log('✅ Mobile refresh completed');
  }, [queryClient]);

  // Listen for mobile refresh events
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handlePullRefresh = () => {
      handleRefresh();
    };

    // Add event listeners for mobile refresh
    window.addEventListener('mobile-pull-refresh', handlePullRefresh);
    
    return () => {
      window.removeEventListener('mobile-pull-refresh', handlePullRefresh);
    };
  }, [handleRefresh]);

  return null; // This is a utility component with no UI
};
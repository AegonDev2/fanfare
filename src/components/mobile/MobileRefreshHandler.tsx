import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Capacitor } from '@capacitor/core';

export const MobileRefreshHandler = () => {
  const queryClient = useQueryClient();

  // Handle mobile pull-to-refresh
  const handleRefresh = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;
    
    console.log('🔄 Mobile refresh triggered');
    
    // Show visual feedback
    const refreshIndicator = document.createElement('div');
    refreshIndicator.innerHTML = '↻ Refreshing...';
    refreshIndicator.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
      padding: 8px 16px;
      border-radius: 8px;
      z-index: 9999;
      font-size: 14px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;
    document.body.appendChild(refreshIndicator);
    
    // Invalidate all active queries to trigger fresh data fetch
    await queryClient.invalidateQueries({ 
      refetchType: 'active'
    });
    
    // Remove indicator after refresh
    setTimeout(() => {
      refreshIndicator.remove();
    }, 1000);
    
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
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { optimizedCache } from '@/utils/optimizedCache';

// Preload static data that doesn't change often
export const usePreloadData = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const preloadStaticData = async () => {
      // Only preload if not already cached
      if (!optimizedCache.getStaticData('influencers_preview')) {
        try {
          // Preload top influencers
          const { data: topInfluencers } = await supabase
            .from('influencer_profiles')
            .select('id, name, platform, profile_image, followers, category')
            .order('followers', { ascending: false })
            .limit(12);

          if (topInfluencers) {
            optimizedCache.setStaticData('influencers_preview', topInfluencers);
            // Pre-populate React Query cache
            queryClient.setQueryData(['influencers', '', ''], topInfluencers);
          }
        } catch (error) {
          console.log('Preload failed, will fetch when needed:', error);
        }
      }

      // Preload categories if not cached
      if (!optimizedCache.getStaticData('influencer_categories')) {
        try {
          const { data: categoriesData } = await supabase
            .from('influencer_profiles')
            .select('category')
            .not('category', 'is', null);

          if (categoriesData) {
            const categories = [...new Set(categoriesData.map(item => item.category).filter(Boolean))];
            const sortedCategories = categories.sort();
            optimizedCache.setStaticData('influencer_categories', sortedCategories);
            queryClient.setQueryData(['influencer-categories'], sortedCategories);
          }
        } catch (error) {
          console.log('Categories preload failed:', error);
        }
      }
    };

    // Use requestIdleCallback for non-critical preloading
    if ('requestIdleCallback' in window) {
      requestIdleCallback(preloadStaticData);
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(preloadStaticData, 1000);
    }
  }, [queryClient]);
};

// Hook to trigger background refresh of cached data
export const useBackgroundRefresh = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const refreshInterval = setInterval(() => {
      // Refresh leaderboard data in background if it's older than 5 minutes
      const now = new Date();
      const currentMonth = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now);
      const currentYear = now.getFullYear();
      
      queryClient.invalidateQueries({
        queryKey: ['leaderboard', currentMonth, currentYear],
        refetchType: 'none' // Don't trigger loading states
      });
      
      queryClient.invalidateQueries({
        queryKey: ['topCreators', currentMonth, currentYear],
        refetchType: 'none'
      });
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(refreshInterval);
  }, [queryClient]);
};
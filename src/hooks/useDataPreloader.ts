import { useEffect } from 'react';
import { optimizedCache } from '@/utils/optimizedCache';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SimpleAuthContext';

/**
 * Hook to preload critical data for better UX
 */
export const useDataPreloader = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    const preloadCriticalData = async () => {
      try {
        // Only preload lightweight static data
        const staticDataPromises = [];

        // Preload platforms/categories for forms (lightweight)
        if (!optimizedCache.getStaticData('platforms')) {
          const platforms = ['Instagram', 'YouTube', 'TikTok', 'Twitter', 'Twitch'];
          optimizedCache.setStaticData('platforms', platforms);
        }

        if (!optimizedCache.getStaticData('categories')) {
          const categories = ['Gaming', 'Lifestyle', 'Fashion', 'Tech', 'Food', 'Travel', 'Fitness'];
          optimizedCache.setStaticData('categories', categories);
        }

        // Don't preload large datasets - let React Query handle them on-demand
        // Influencers list is now paginated and loads only when needed
        // Leaderboard uses materialized view and loads fast on-demand

        console.log('✅ Static data preloaded');
      } catch (error) {
        console.error('Error preloading data:', error);
      }
    };

    preloadCriticalData();
  }, []); // Only run once on mount, no dependency on user
};

/**
 * Hook to provide preloaded static data
 */
export const useStaticData = () => {
  return {
    getPlatforms: () => optimizedCache.getStaticData('platforms') || [],
    getCategories: () => optimizedCache.getStaticData('categories') || []
  };
};
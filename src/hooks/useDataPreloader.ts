import { useEffect } from 'react';
import { appCache } from '@/utils/appCache';
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
        // Preload static data that doesn't change often
        const staticDataPromises = [];

        // Preload common influencer list
        if (!appCache.get('static_influencers_preview')) {
          staticDataPromises.push(
            supabase
              .from('influencer_profiles')
              .select('id, name, platform, followers, profile_image, category')
              .order('followers', { ascending: false })
              .limit(20)
              .then(({ data }) => {
                if (data) {
                  appCache.set('static_influencers_preview', data, 15 * 60 * 1000); // 15 minutes
                }
              })
          );
        }

        // Preload platforms/categories for forms
        if (!appCache.get('static_platforms')) {
          const platforms = ['Instagram', 'YouTube', 'TikTok', 'Twitter', 'Twitch'];
          appCache.set('static_platforms', platforms, 60 * 60 * 1000); // 1 hour
        }

        if (!appCache.get('static_categories')) {
          const categories = ['Gaming', 'Lifestyle', 'Fashion', 'Tech', 'Food', 'Travel', 'Fitness'];
          appCache.set('static_categories', categories, 60 * 60 * 1000); // 1 hour
        }

        // Preload current month leaderboard
        if (!appCache.get('leaderboard_current')) {
          const currentDate = new Date();
          staticDataPromises.push(
            supabase
              .rpc('get_monthly_leaderboard', {
                target_month: currentDate.getMonth() + 1,
                target_year: currentDate.getFullYear()
              })
              .then(({ data }) => {
                if (data) {
                  appCache.set('leaderboard_current', data, 10 * 60 * 1000); // 10 minutes
                }
              })
          );
        }

        // Execute all static data preloading
        await Promise.allSettled(staticDataPromises);

        // If user is logged in, preload user-specific data
        if (user?.id) {
          await appCache.preloadUserData(user.id, supabase);
        }

        console.log('✅ Critical data preloaded successfully');
      } catch (error) {
        console.error('Error preloading data:', error);
      }
    };

    preloadCriticalData();
  }, [user?.id]);
};

/**
 * Hook to provide preloaded static data
 */
export const useStaticData = () => {
  return {
    getInfluencersPreview: () => appCache.get('static_influencers_preview') || [],
    getPlatforms: () => appCache.get('static_platforms') || [],
    getCategories: () => appCache.get('static_categories') || [],
    getCurrentLeaderboard: () => appCache.get('leaderboard_current') || []
  };
};
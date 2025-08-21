import { useEffect } from 'react';
import { performanceCache } from '@/utils/performanceCache';
import { mobileOptimizer } from '@/utils/mobileOptimizations';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SimpleAuthContext';

/**
 * Optimized hook for preloading critical data with mobile performance focus
 */
export const useDataPreloader = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    const preloadCriticalData = async () => {
      try {
        console.log('🚀 Starting optimized data preloading...');
        
        // Use mobile optimizer for critical resource preloading
        await mobileOptimizer.preloadCriticalResources();
        
        // Define warming map for cache
        const warmingMap: Record<string, () => Promise<any>> = {};
        
        // Only add to warming map if not already cached
        if (!performanceCache.get('static_influencers_preview')) {
          warmingMap.static_influencers_preview = async () => {
            const { data } = await supabase
              .from('influencer_profiles')
              .select('id, name, platform, followers, profile_image, category')
              .order('followers', { ascending: false })
              .limit(mobileOptimizer.getOptimizedConfig().preloadCount);
            return data;
          };
        }

        if (!performanceCache.get('leaderboard_current')) {
          warmingMap.leaderboard_current = async () => {
            const currentDate = new Date();
            const { data } = await supabase.rpc('get_monthly_leaderboard', {
              target_month: currentDate.getMonth() + 1,
              target_year: currentDate.getFullYear()
            });
            return data;
          };
        }

        // Warm cache with batched requests
        if (Object.keys(warmingMap).length > 0) {
          await performanceCache.warmCache(warmingMap);
        }

        // If user is logged in, preload user-specific data
        if (user?.id) {
          const userDataPromises = [
            performanceCache.fetch(`user_complete_${user.id}`, async () => {
              const { data } = await supabase.rpc('get_complete_user_data', {
                user_uuid: user.id
              });
              return data;
            }),
            
            performanceCache.fetch(`wallet_${user.id}`, async () => {
              const { data } = await supabase
                .from('wallets')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();
              return data;
            })
          ];

          await Promise.allSettled(userDataPromises);
        }

        console.log('✅ Optimized data preloading completed');
        console.log('📊 Cache stats:', performanceCache.getStats());
      } catch (error) {
        console.error('Error in optimized preloading:', error);
      }
    };

    preloadCriticalData();
  }, [user?.id]);
};

/**
 * Hook to provide preloaded static data with performance caching
 */
export const useStaticData = () => {
  return {
    getInfluencersPreview: () => performanceCache.get('static_influencers_preview') || [],
    getPlatforms: () => performanceCache.get('static_platforms') || ['Instagram', 'YouTube', 'TikTok', 'Twitter', 'Twitch'],
    getCategories: () => performanceCache.get('static_categories') || ['Gaming', 'Lifestyle', 'Fashion', 'Tech', 'Food', 'Travel', 'Fitness'],
    getCurrentLeaderboard: () => performanceCache.get('leaderboard_current') || []
  };
};
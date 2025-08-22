import { useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { optimizedCache } from '@/utils/optimizedCache';

interface UseProactiveDataLoaderOptions {
  enabled?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

export const useProactiveDataLoader = ({ 
  enabled = true, 
  priority = 'medium' 
}: UseProactiveDataLoaderOptions = {}) => {
  const queryClient = useQueryClient();

  // Preload influencers page data
  const preloadInfluencers = useCallback(async () => {
    if (!enabled) return;
    
    const cached = optimizedCache.getStaticData('influencers_preview');
    if (cached) return; // Already cached

    try {
      const { data } = await supabase
        .from('influencer_profiles')
        .select('id, name, platform, profile_image, followers, category')
        .order('followers', { ascending: false })
        .limit(12);

      if (data) {
        optimizedCache.setStaticData('influencers_preview', data);
        queryClient.setQueryData(['influencers'], data);
      }
    } catch (error) {
      console.log('Preload influencers failed:', error);
    }
  }, [enabled, queryClient]);

  // Preload profile data for a specific user
  const preloadProfile = useCallback(async (userId: string) => {
    if (!enabled || !userId) return;

    const cacheKey = `profile_complete_${userId}`;
    if (optimizedCache.getStaticData(cacheKey)) return;

    try {
      const { data } = await supabase.rpc('get_complete_user_data', {
        user_uuid: userId
      });

      if (data) {
        optimizedCache.setStaticData(cacheKey, data);
        queryClient.setQueryData(['profile-complete', userId], data);
      }
    } catch (error) {
      console.log('Preload profile failed:', error);
    }
  }, [enabled, queryClient]);

  // Preload leaderboard data
  const preloadLeaderboard = useCallback(async () => {
    if (!enabled) return;

    const now = new Date();
    const currentMonth = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now);
    const currentYear = now.getFullYear();
    const monthNumber = now.getMonth() + 1;

    const cacheKey = `leaderboard_${currentMonth}_${currentYear}`;
    if (optimizedCache.getStaticData(cacheKey)) return;

    try {
      const { data } = await supabase.rpc('get_monthly_leaderboard', {
        target_month: monthNumber,
        target_year: currentYear
      });

      if (data) {
        optimizedCache.setStaticData(cacheKey, data);
        queryClient.setQueryData(['leaderboard', currentMonth, currentYear], {
          leaderboard: data,
          currentMonth,
          currentYear
        });
      }
    } catch (error) {
      console.log('Preload leaderboard failed:', error);
    }
  }, [enabled, queryClient]);

  // Preload wallet data for authenticated user
  const preloadWallet = useCallback(async (userId: string) => {
    if (!enabled || !userId) return;

    const cacheKey = `wallet_${userId}`;
    if (optimizedCache.get(cacheKey)) return;

    try {
      const { data } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (data) {
        optimizedCache.set(cacheKey, data);
        queryClient.setQueryData(['wallet', userId], data);
      }
    } catch (error) {
      console.log('Preload wallet failed:', error);
    }
  }, [enabled, queryClient]);

  // Schedule preloading based on priority
  const schedulePreload = useCallback((task: () => Promise<void>) => {
    const delay = priority === 'high' ? 100 : priority === 'medium' ? 500 : 1000;
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        setTimeout(task, delay);
      });
    } else {
      setTimeout(task, delay);
    }
  }, [priority]);

  return {
    preloadInfluencers: () => schedulePreload(preloadInfluencers),
    preloadProfile: (userId: string) => schedulePreload(() => preloadProfile(userId)),
    preloadLeaderboard: () => schedulePreload(preloadLeaderboard),
    preloadWallet: (userId: string) => schedulePreload(() => preloadWallet(userId)),
  };
};
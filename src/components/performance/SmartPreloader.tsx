// Smart preloader component for progressive loading and performance
import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mobileOptimizer } from '@/utils/mobileOptimizations';
import { performanceCache } from '@/utils/performanceCache';
import { useAuth } from '@/contexts/SimpleAuthContext';

interface PreloadRoute {
  path: string;
  priority: 'high' | 'medium' | 'low';
  preload: () => Promise<void>;
}

export function SmartPreloader() {
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadedRoutes, setPreloadedRoutes] = useState<Set<string>>(new Set());
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();

  // Define routes with their preload functions
  const preloadRoutes: PreloadRoute[] = [
    {
      path: '/home',
      priority: 'high',
      preload: async () => {
        const { supabase } = await import('@/integrations/supabase/client');
        
        // Preload influencer preview data
        const { data: influencers } = await supabase
          .from('influencer_profiles')
          .select('id, name, platform, followers, profile_image, category')
          .order('followers', { ascending: false })
          .limit(10);
        
        if (influencers) {
          performanceCache.set('home_influencers_preview', influencers);
        }
      }
    },
    {
      path: '/leaderboard',
      priority: 'medium',
      preload: async () => {
        const { supabase } = await import('@/integrations/supabase/client');
        const currentDate = new Date();
        
        // Preload current month leaderboard
        const { data: leaderboard } = await supabase.rpc('get_monthly_leaderboard', {
          target_month: currentDate.getMonth() + 1,
          target_year: currentDate.getFullYear()
        });
        
        if (leaderboard) {
          performanceCache.set('leaderboard_current', leaderboard);
        }
      }
    },
    {
      path: '/wallet',
      priority: 'high',
      preload: async () => {
        if (!user?.id) return;
        
        const { supabase } = await import('@/integrations/supabase/client');
        
        // Preload wallet data
        const { data: wallet } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (wallet) {
          performanceCache.set(`wallet_${user.id}`, wallet);
          
          // Also preload recent transactions
          const { data: transactions } = await supabase
            .from('transactions')
            .select('*')
            .eq('wallet_id', wallet.id)
            .order('created_at', { ascending: false })
            .limit(10);
          
          if (transactions) {
            performanceCache.set(`transactions_${wallet.id}`, transactions);
          }
        }
      }
    },
    {
      path: '/gift-shop',
      priority: 'medium',
      preload: async () => {
        const { supabase } = await import('@/integrations/supabase/client');
        
        // Preload shops data
        const { data: shops } = await supabase
          .from('shops')
          .select('id, name, description, banner_image, is_active')
          .eq('is_active', true)
          .limit(20);
        
        if (shops) {
          performanceCache.set('shops_preview', shops);
        }
      }
    },
    {
      path: '/influencers',
      priority: 'low',
      preload: async () => {
        const { supabase } = await import('@/integrations/supabase/client');
        
        // Preload all influencers data
        const { data: influencers } = await supabase
          .from('influencer_profiles')
          .select('*')
          .order('followers', { ascending: false })
          .limit(50);
        
        if (influencers) {
          performanceCache.set('influencers_all', influencers);
        }
      }
    }
  ];

  // Intelligent preloading based on user behavior and route
  const preloadRoute = useCallback(async (route: PreloadRoute) => {
    if (preloadedRoutes.has(route.path)) return;
    
    try {
      console.log(`🔄 Preloading ${route.path}...`);
      await route.preload();
      
      setPreloadedRoutes(prev => new Set(prev).add(route.path));
      console.log(`✅ Preloaded ${route.path}`);
    } catch (error) {
      console.warn(`❌ Failed to preload ${route.path}:`, error);
    }
  }, [preloadedRoutes]);

  // Preload based on current route and priority
  useEffect(() => {
    if (authLoading) return;
    
    const preloadForCurrentRoute = async () => {
      setIsPreloading(true);
      
      try {
        // First, preload critical resources
        await mobileOptimizer.preloadCriticalResources();
        
        // Get routes sorted by priority
        const highPriority = preloadRoutes.filter(r => r.priority === 'high');
        const mediumPriority = preloadRoutes.filter(r => r.priority === 'medium');
        const lowPriority = preloadRoutes.filter(r => r.priority === 'low');
        
        // Preload high priority routes immediately
        await Promise.all(highPriority.map(route => preloadRoute(route)));
        
        // Preload medium priority routes with slight delay
        setTimeout(() => {
          mediumPriority.forEach(route => preloadRoute(route));
        }, 500);
        
        // Preload low priority routes when browser is idle
        const preloadLowPriority = () => {
          lowPriority.forEach(route => preloadRoute(route));
        };
        
        if ('requestIdleCallback' in window) {
          requestIdleCallback(preloadLowPriority, { timeout: 10000 });
        } else {
          setTimeout(preloadLowPriority, 2000);
        }
        
      } catch (error) {
        console.error('Error during preloading:', error);
      } finally {
        setIsPreloading(false);
      }
    };
    
    preloadForCurrentRoute();
  }, [location.pathname, user?.id, authLoading, preloadRoute]);

  // Preload next likely routes based on current route
  useEffect(() => {
    const predictNextRoutes = () => {
      const currentPath = location.pathname;
      const nextRoutes: string[] = [];
      
      switch (currentPath) {
        case '/':
        case '/home':
          nextRoutes.push('/leaderboard', '/gift-shop', '/influencers');
          break;
        case '/auth':
          if (user) {
            nextRoutes.push('/home', '/wallet');
          }
          break;
        case '/leaderboard':
          nextRoutes.push('/influencers', '/home');
          break;
        case '/wallet':
          nextRoutes.push('/gift-shop', '/home');
          break;
        case '/gift-shop':
          nextRoutes.push('/wallet', '/influencers');
          break;
        default:
          nextRoutes.push('/home');
      }
      
      // Preload predicted routes with low priority
      setTimeout(() => {
        nextRoutes.forEach(path => {
          const route = preloadRoutes.find(r => r.path === path);
          if (route && !preloadedRoutes.has(path)) {
            preloadRoute(route);
          }
        });
      }, 1000);
    };
    
    predictNextRoutes();
  }, [location.pathname, user, preloadRoute, preloadedRoutes]);

  // Component doesn't render anything - just handles preloading
  return null;
}

// Hook to check if route is preloaded
export function usePreloadStatus(routePath: string) {
  const [isPreloaded, setIsPreloaded] = useState(false);
  
  useEffect(() => {
    // Check if critical data for route is cached
    const checkPreloadStatus = () => {
      let hasData = false;
      
      switch (routePath) {
        case '/home':
          hasData = !!performanceCache.get('home_influencers_preview');
          break;
        case '/leaderboard':
          hasData = !!performanceCache.get('leaderboard_current');
          break;
        case '/wallet':
          hasData = !!performanceCache.get(`wallet_${routePath}`);
          break;
        case '/gift-shop':
          hasData = !!performanceCache.get('shops_preview');
          break;
        case '/influencers':
          hasData = !!performanceCache.get('influencers_all');
          break;
        default:
          hasData = true; // Assume preloaded for unknown routes
      }
      
      setIsPreloaded(hasData);
    };
    
    checkPreloadStatus();
    
    // Check again after a short delay in case data loads
    const timer = setTimeout(checkPreloadStatus, 1000);
    return () => clearTimeout(timer);
  }, [routePath]);
  
  return isPreloaded;
}
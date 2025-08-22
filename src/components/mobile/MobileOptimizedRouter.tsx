import React, { Suspense, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { mobilePerformanceOptimizer } from '@/utils/mobilePerformanceOptimizer';
import { Skeleton } from '@/components/ui/skeleton';

// Mobile-optimized lazy loading with preloading
const createMobileLazyComponent = (importFn: () => Promise<any>, componentName: string) => {
  return React.lazy(async () => {
    try {
      // Use mobile performance optimizer for chunk loading
      if (Capacitor.isNativePlatform()) {
        return await mobilePerformanceOptimizer.loadComponentChunk(componentName);
      }
      return await importFn();
    } catch (error) {
      console.error(`Failed to load ${componentName}:`, error);
      // Fallback to direct import
      return await importFn();
    }
  });
};

// Lazy load all major components with mobile optimization
const LazyLanding = createMobileLazyComponent(() => import('@/pages/Landing'), 'Landing');
const LazyAuth = createMobileLazyComponent(() => import('@/pages/Auth'), 'Auth');
const LazyInfluencers = createMobileLazyComponent(() => import('@/pages/Influencers'), 'Influencers');
const LazyGiftShop = createMobileLazyComponent(() => import('@/pages/GiftShop'), 'GiftShop');
const LazyLeaderboard = createMobileLazyComponent(() => import('@/pages/Leaderboard'), 'Leaderboard');
const LazyProfile = createMobileLazyComponent(() => import('@/pages/Profile'), 'Profile');
const LazyWallet = createMobileLazyComponent(() => import('@/pages/Wallet'), 'Wallet');
const LazySettings = createMobileLazyComponent(() => import('@/pages/Settings'), 'Settings');
const LazyAdminDashboard = createMobileLazyComponent(() => import('@/pages/AdminDashboard'), 'AdminDashboard');

// Mobile-optimized loading skeleton
const MobileLoadingSkeleton = () => (
  <div className="min-h-screen bg-background animate-pulse">
    <div className="bg-card/50 h-16 w-full" />
    <div className="p-4 space-y-4">
      <div className="bg-card/50 h-32 w-full rounded-lg" />
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card/50 h-24 rounded-lg" />
        <div className="bg-card/50 h-24 rounded-lg" />
      </div>
      <div className="bg-card/50 h-48 w-full rounded-lg" />
    </div>
  </div>
);

// Route preloading based on user behavior patterns
const routePreloadMap = {
  '/': ['/influencers', '/gift-shop'],
  '/influencers': ['/gift-shop', '/profile'],
  '/gift-shop': ['/place-order', '/wallet'],
  '/profile': ['/settings', '/wallet'],
  '/wallet': ['/gift-shop', '/gifts-sent']
};

interface MobileOptimizedRouterProps {
  currentPath: string;
}

export const MobileOptimizedRouter: React.FC<MobileOptimizedRouterProps> = ({ currentPath }) => {
  // Preload likely next routes
  useMemo(() => {
    if (Capacitor.isNativePlatform()) {
      const preloadRoutes = routePreloadMap[currentPath as keyof typeof routePreloadMap];
      if (preloadRoutes) {
        // Preload after a small delay to not block current route
        setTimeout(() => {
          preloadRoutes.forEach(route => {
            // This would trigger component preloading
            console.log(`📦 Preloading route: ${route}`);
          });
        }, 100);
      }
    }
  }, [currentPath]);

  return (
    <Suspense fallback={<MobileLoadingSkeleton />}>
      <Routes>
        <Route path="/" element={<LazyLanding />} />
        <Route path="/auth" element={<LazyAuth />} />
        <Route path="/influencers" element={<LazyInfluencers />} />
        <Route path="/gift-shop" element={<LazyGiftShop />} />
        <Route path="/leaderboard" element={<LazyLeaderboard />} />
        <Route path="/profile" element={<LazyProfile />} />
        <Route path="/wallet" element={<LazyWallet />} />
        <Route path="/settings" element={<LazySettings />} />
        <Route path="/admin" element={<LazyAdminDashboard />} />
        {/* Add other routes as needed */}
      </Routes>
    </Suspense>
  );
};
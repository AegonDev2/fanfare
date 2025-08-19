import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load components for better performance
export const LazyAdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
export const LazyGiftShop = lazy(() => import('@/pages/GiftShop'));
export const LazyInfluencers = lazy(() => import('@/pages/Influencers'));
export const LazyLeaderboard = lazy(() => import('@/pages/Leaderboard'));
export const LazyWallet = lazy(() => import('@/pages/Wallet'));
export const LazyProfile = lazy(() => import('@/pages/Profile'));
export const LazySettings = lazy(() => import('@/pages/Settings'));

// Loading fallback component
const PageSkeleton = () => (
  <div className="min-h-screen bg-background p-4">
    <div className="max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </div>
  </div>
);

// HOC for lazy loading with suspense
export const withLazyLoading = (Component: React.ComponentType) => {
  return (props: any) => (
    <Suspense fallback={<PageSkeleton />}>
      <Component {...props} />
    </Suspense>
  );
};
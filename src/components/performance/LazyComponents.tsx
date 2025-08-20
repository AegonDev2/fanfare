import { lazy, Suspense, startTransition } from 'react';
import { PageLoader } from '@/components/ui/loader';

// Lazy load components for better performance
export const LazyAdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
export const LazyGiftShop = lazy(() => import('@/pages/GiftShop'));
export const LazyInfluencers = lazy(() => import('@/pages/Influencers'));
export const LazyLeaderboard = lazy(() => import('@/pages/Leaderboard'));
export const LazyWallet = lazy(() => import('@/pages/Wallet'));
export const LazyProfile = lazy(() => import('@/pages/Profile'));
export const LazySettings = lazy(() => import('@/pages/Settings'));

// Loading fallback component
const PageSkeleton = () => <PageLoader />;

// HOC for lazy loading with suspense and transition
export const withLazyLoading = (Component: React.ComponentType) => {
  return (props: any) => (
    <Suspense fallback={<PageSkeleton />}>
      <Component {...props} />
    </Suspense>
  );
};

// Enhanced HOC with startTransition support
export const withTransitionLazyLoading = (Component: React.ComponentType) => {
  return (props: any) => {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <Component {...props} />
      </Suspense>
    );
  };
};
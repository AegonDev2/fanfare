import { lazy } from 'react';

// Lazy load heavy components for better initial load performance
export const LazyAdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
export const LazyAdminOrderDetails = lazy(() => import('@/pages/AdminOrderDetails'));
export const LazyGiftShop = lazy(() => import('@/pages/GiftShop'));
export const LazyShopView = lazy(() => import('@/pages/ShopView'));
export const LazyLeaderboard = lazy(() => import('@/pages/Leaderboard'));
export const LazyInfluencers = lazy(() => import('@/pages/Influencers'));
export const LazyProfile = lazy(() => import('@/pages/Profile'));
export const LazyWallet = lazy(() => import('@/pages/Wallet'));
export const LazyWishlist = lazy(() => import('@/pages/Wishlist'));
export const LazyGiftRequests = lazy(() => import('@/pages/GiftRequests'));
export const LazyGiftsSent = lazy(() => import('@/pages/GiftsSent'));
export const LazyTrackOrder = lazy(() => import('@/pages/TrackOrder'));
export const LazySettings = lazy(() => import('@/pages/Settings'));


import { useState, Suspense, startTransition } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useMobileFeatures } from "@/hooks/useMobileFeatures";
import { useFirstTimeUser } from "@/hooks/useFirstTimeUser";
import { ExitConfirmDialog } from "@/components/mobile/ExitConfirmDialog";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { OptimizedAuthGuard } from "@/components/navigation/OptimizedAuthGuard";
import { TutorialContainer } from "@/components/tutorial/TutorialContainer";
import { TutorialDebug } from "@/components/tutorial/TutorialDebug";
import { 
  LazyAdminDashboard, 
  LazyGiftShop, 
  LazyInfluencers, 
  LazyLeaderboard,
  LazyWallet,
  LazyProfile,
  LazySettings
} from "@/components/performance/LazyComponents";
import Index from "@/pages/Index";
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import ForgotPassword from "@/pages/ForgotPassword";
import PlaceOrder from "@/pages/PlaceOrder";
import EditProfile from "@/pages/EditProfile";
import CreateInfluencerProfile from "@/pages/CreateInfluencerProfile";
import CreateFanProfile from "@/pages/CreateFanProfile";
import GiftSelection from "@/pages/GiftSelection";
import GiftRequests from "@/pages/GiftRequests";
import GiftsSent from "@/pages/GiftsSent";
import TrackOrder from "@/pages/TrackOrder";
import OrderSuccess from "@/pages/OrderSuccess";
import Wishlist from "@/pages/Wishlist";
import AdminOrderDetails from "@/pages/AdminOrderDetails";
import NotFound from "@/pages/NotFound";
import ShopView from "@/pages/ShopView";
import EmailVerification from "@/pages/EmailVerification";
import AuthCallback from "@/pages/AuthCallback";

export function AppContent() {
  const [navOpen, setNavOpen] = useState(false);
  const { showExitPrompt, dismissExitPrompt } = useMobileFeatures({
    enablePullToRefresh: true,
    enableBackButton: true
  });
  
  const { 
    isFirstTimeUser, 
    shouldShowAuth, 
    shouldShowTutorial, 
    isLoading: firstTimeLoading 
  } = useFirstTimeUser();

  // Show loading while determining first-time user status
  if (firstTimeLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-16 w-full bg-muted animate-pulse rounded-lg" />
          <div className="h-48 w-full bg-muted animate-pulse rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-32 w-full bg-muted animate-pulse rounded-lg" />
            <div className="h-32 w-full bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // For first-time users, show auth page first
  if (isFirstTimeUser && shouldShowAuth) {
    return <Auth />;
  }

  // Show tutorial after auth for first-time users
  if (shouldShowTutorial) {
    return <TutorialContainer />;
  }

  return (
    <>
      <ExitConfirmDialog 
        open={showExitPrompt} 
        onOpenChange={dismissExitPrompt} 
      />
      <Suspense fallback={
        <div className="min-h-screen bg-background p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="h-16 w-full bg-muted animate-pulse rounded-lg" />
            <div className="h-48 w-full bg-muted animate-pulse rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-32 w-full bg-muted animate-pulse rounded-lg" />
              <div className="h-32 w-full bg-muted animate-pulse rounded-lg" />
            </div>
          </div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/email-verification" element={<EmailVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/profile" element={
            <ErrorBoundary>
              <OptimizedAuthGuard>
                <LazyProfile />
              </OptimizedAuthGuard>
            </ErrorBoundary>
          } />
          <Route path="/profile/:id" element={
            <ErrorBoundary>
              <OptimizedAuthGuard>
                <LazyProfile />
              </OptimizedAuthGuard>
            </ErrorBoundary>
          } />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/create-influencer-profile" element={<CreateInfluencerProfile />} />
          <Route path="/create-fan-profile" element={<CreateFanProfile />} />
          <Route path="/gift-selection" element={<GiftSelection />} />
          <Route path="/gift-requests" element={<GiftRequests />} />
          <Route path="/gifts-sent" element={<GiftsSent />} />
          <Route path="/leaderboard" element={
            <ErrorBoundary>
              <LazyLeaderboard />
            </ErrorBoundary>
          } />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/wallet" element={
            <ErrorBoundary>
              <OptimizedAuthGuard>
                <LazyWallet />
              </OptimizedAuthGuard>
            </ErrorBoundary>
          } />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/wishlist/:id" element={<Wishlist />} />
          <Route path="/settings" element={
            <ErrorBoundary>
              <OptimizedAuthGuard>
                <LazySettings />
              </OptimizedAuthGuard>
            </ErrorBoundary>
          } />
          <Route path="/admin" element={
            <ErrorBoundary>
              <OptimizedAuthGuard>
                <LazyAdminDashboard />
              </OptimizedAuthGuard>
            </ErrorBoundary>
          } />
          <Route path="/admin/order/:orderId" element={<AdminOrderDetails />} />
          <Route path="/influencers" element={
            <ErrorBoundary>
              <LazyInfluencers />
            </ErrorBoundary>
          } />
          <Route path="/gift-shop" element={
            <ErrorBoundary>
              <LazyGiftShop />
            </ErrorBoundary>
          } />
          <Route path="/shop/:shopId" element={<ShopView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        {/* Tutorial Debug Component - Development Only */}
        <TutorialDebug />
      </Suspense>
    </>
  );
}

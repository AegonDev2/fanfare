
import { useState, Suspense, startTransition } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useMobileFeatures } from "@/hooks/useMobileFeatures";
import { ExitConfirmDialog } from "@/components/mobile/ExitConfirmDialog";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { OptimizedAuthGuard } from "@/components/navigation/OptimizedAuthGuard";
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

  return (
    <>
      <ExitConfirmDialog 
        open={showExitPrompt} 
        onOpenChange={dismissExitPrompt} 
      />
      <Suspense fallback={
        <div className="min-h-screen bg-background">
          <div className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b z-50">
            <div className="h-16 flex items-center justify-between px-4">
              <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
                <div className="h-8 w-20 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </div>
          <div className="pt-20 p-4">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center space-y-4 py-12">
                <div className="h-12 w-64 bg-muted animate-pulse rounded mx-auto" />
                <div className="h-6 w-96 bg-muted animate-pulse rounded mx-auto" />
                <div className="flex justify-center gap-4 mt-6">
                  <div className="h-10 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-10 w-32 bg-muted animate-pulse rounded" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <div className="h-48 w-full bg-muted animate-pulse rounded-lg" />
                    <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
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
      </Suspense>
    </>
  );
}

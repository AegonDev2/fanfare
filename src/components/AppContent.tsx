
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useMobileFeatures } from "@/hooks/useMobileFeatures";
import { ExitConfirmDialog } from "@/components/mobile/ExitConfirmDialog";
import Index from "@/pages/Index";
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import ForgotPassword from "@/pages/ForgotPassword";
import PlaceOrder from "@/pages/PlaceOrder";
import Profile from "@/pages/Profile";
import EditProfile from "@/pages/EditProfile";
import CreateInfluencerProfile from "@/pages/CreateInfluencerProfile";
import CreateFanProfile from "@/pages/CreateFanProfile";
import GiftSelection from "@/pages/GiftSelection";
import GiftRequests from "@/pages/GiftRequests";
import GiftsSent from "@/pages/GiftsSent";
import Leaderboard from "@/pages/Leaderboard";
import TrackOrder from "@/pages/TrackOrder";
import OrderSuccess from "@/pages/OrderSuccess";
import Wallet from "@/pages/Wallet";
import Wishlist from "@/pages/Wishlist";
import Settings from "@/pages/Settings";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminOrderDetails from "@/pages/AdminOrderDetails";
import NotFound from "@/pages/NotFound";
import Influencers from "@/pages/Influencers";
import GiftShop from "@/pages/GiftShop";
import ShopView from "@/pages/ShopView";

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
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/place-order" element={<PlaceOrder />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/create-influencer-profile" element={<CreateInfluencerProfile />} />
        <Route path="/create-fan-profile" element={<CreateFanProfile />} />
        <Route path="/gift-selection" element={<GiftSelection />} />
        <Route path="/gift-requests" element={<GiftRequests />} />
        <Route path="/gifts-sent" element={<GiftsSent />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/wishlist/:id" element={<Wishlist />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/order/:orderId" element={<AdminOrderDetails />} />
        <Route path="/influencers" element={<Influencers />} />
        <Route path="/gift-shop" element={<GiftShop />} />
        <Route path="/shop/:shopId" element={<ShopView />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}


import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from '@/pages/Landing';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';
import EditProfile from '@/pages/EditProfile';
import CreateInfluencerProfile from '@/pages/CreateInfluencerProfile';
import PlaceOrder from '@/pages/PlaceOrder';
import OrderSuccess from '@/pages/OrderSuccess';
import TrackOrder from '@/pages/TrackOrder';
import Settings from '@/pages/Settings';
import Wallet from '@/pages/Wallet';
import GiftRequests from '@/pages/GiftRequests';
import GiftsSent from '@/pages/GiftsSent';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminOrderDetails from '@/pages/AdminOrderDetails';
import NotFound from '@/pages/NotFound';
import { useUser } from '@/hooks/useUser';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import Leaderboard from "@/pages/Leaderboard";
import Wishlist from "@/pages/Wishlist";

function App() {
  const { user, isLoading } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (isLoading) {
      document.title = `Loading | FanFare`;
    } else if (user?.name) {
      document.title = `FanFare | ${user.name}`;
    } else {
      document.title = `FanFare`;
    }
  }, [user, isLoading]);

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={<Landing setNavOpen={() => {}} />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile/:id?" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/create-influencer-profile" element={<CreateInfluencerProfile />} />
        <Route path="/place-order/:influencerId?" element={<PlaceOrder />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/track-order/:orderId?" element={<TrackOrder />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/gift-requests" element={<GiftRequests />} />
        <Route path="/gifts-sent" element={<GiftsSent />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/wishlist/:id?" element={<Wishlist />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/orders/:id" element={<AdminOrderDetails />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

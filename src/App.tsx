
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Landing from '@/pages/Landing';
import GiftSelection from '@/pages/GiftSelection';
import PlaceOrder from '@/pages/PlaceOrder';
import OrderSuccess from '@/pages/OrderSuccess';
import TrackOrder from '@/pages/TrackOrder';
import Profile from '@/pages/Profile';
import EditProfile from '@/pages/EditProfile';
import CreateInfluencerProfile from '@/pages/CreateInfluencerProfile';
import GiftRequests from '@/pages/GiftRequests';
import GiftsSent from '@/pages/GiftsSent';
import Leaderboard from '@/pages/Leaderboard';
import Wishlist from '@/pages/Wishlist';
import Wallet from '@/pages/Wallet';
import Settings from '@/pages/Settings';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminOrderDetails from '@/pages/AdminOrderDetails';
import NotFound from '@/pages/NotFound';
import Cart from '@/pages/Cart';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/gift-selection" element={<GiftSelection />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/profile/:influencerId" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/create-influencer-profile" element={<CreateInfluencerProfile />} />
          <Route path="/gift-requests" element={<GiftRequests />} />
          <Route path="/gifts-sent" element={<GiftsSent />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/order/:orderId" element={<AdminOrderDetails />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import CreateInfluencerProfile from "./pages/CreateInfluencerProfile";
import Auth from "./pages/Auth";
import Wishlist from "./pages/Wishlist";
import Wallet from "./pages/Wallet";
import OrderSuccess from "./pages/OrderSuccess";
import TrackOrder from "./pages/TrackOrder";
import Settings from "./pages/Settings";
import PlaceOrder from "./pages/PlaceOrder";
import GiftRequests from "./pages/GiftRequests";
import GiftsSent from "./pages/GiftsSent";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import MobileDock from "./components/landing/MobileDock";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrderDetails from "./pages/AdminOrderDetails";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import GiftSelection from "./pages/GiftSelection";
import GiftCart from "./pages/GiftCart";

const queryClient = new QueryClient();

function App() {
  const [isNavOpen, setNavOpen] = useState(false);
  const isDarkMode = false;

    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <div className={isDarkMode ? "dark" : ""}>
            <Toaster />
            <Router>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/index" element={<Index />} />
                <Route
                  path="/profile/:id"
                  element={
                    <Profile />
                  }
                />
                <Route
                  path="/edit-profile"
                  element={
                    <EditProfile />
                  }
                />
                <Route path="/create-profile" element={<CreateInfluencerProfile />} />
                <Route path="/auth/*" element={<Auth />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/place-order" element={<PlaceOrder setNavOpen={setNavOpen} />} />
                <Route path="/gift-requests" element={<GiftRequests />} />
                <Route path="/gifts-sent" element={<GiftsSent />} />
                <Route path="/gift-selection" element={<GiftSelection />} />
                <Route path="/gift-cart" element={<GiftCart />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/admin/order/:id" element={<AdminOrderDetails />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <MobileDock isNavOpen={isNavOpen} setNavOpen={setNavOpen} />
            </Router>
          </div>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

export default App;

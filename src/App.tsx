
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import CreateInfluencerProfile from "./pages/CreateInfluencerProfile";
import GiftSelection from "./pages/GiftSelection";
import PlaceOrder from "./pages/PlaceOrder";
import OrderSuccess from "./pages/OrderSuccess";
import TrackOrder from "./pages/TrackOrder";
import Cart from "./pages/Cart";
import Wallet from "./pages/Wallet";
import Settings from "./pages/Settings";
import Leaderboard from "./pages/Leaderboard";
import Wishlist from "./pages/Wishlist";
import GiftRequests from "./pages/GiftRequests";
import GiftsSent from "./pages/GiftsSent";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrderDetails from "./pages/AdminOrderDetails";
import NotFound from "./pages/NotFound";
import Influencers from "./pages/Influencers";
import MobileDock from "./components/navigation/MobileDock";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/home" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/create-influencer-profile" element={<CreateInfluencerProfile />} />
              <Route path="/gift-selection" element={<GiftSelection />} />
              <Route path="/place-order" element={<PlaceOrder />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/track-order" element={<TrackOrder />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/gift-requests" element={<GiftRequests />} />
              <Route path="/gifts-sent" element={<GiftsSent />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/order/:id" element={<AdminOrderDetails />} />
              <Route path="/influencers" element={<Influencers />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <MobileDock />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

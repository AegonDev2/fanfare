import { StrictMode, useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import PlaceOrder from "./pages/PlaceOrder";
import CreateInfluencerProfile from "./pages/CreateInfluencerProfile";
import EditProfile from "./pages/EditProfile";
import NotFound from "./pages/NotFound";
import GiftRequests from "./pages/GiftRequests";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrderDetails from "./pages/AdminOrderDetails";
import Wallet from "./pages/Wallet";
import OrderSuccess from "./pages/OrderSuccess";
import Navbar from "./components/navigation/Navbar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { hasRole } from "@/utils/roleManager";
import InfluencerGiftRequests from "./pages/InfluencerGiftRequests";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useLocation();
  
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const adminAccess = await hasRole(user.id, 'admin');
          setIsAdmin(adminAccess);
        }
      } catch (error) {
        console.error("Error checking admin access:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminAccess();
  }, []);
  
  if (isLoading) {
    return <div>Checking permissions...</div>;
  }
  
  return isAdmin ? <>{children}</> : <Navigate to="/" />;
};

const queryClient = new QueryClient();

const AppContent = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen w-full bg-[var(--background)] relative overflow-x-hidden">
      {!isAuthPage && (
        <Navbar isOpen={isNavOpen} setIsOpen={setIsNavOpen} />
      )}

      {!isAuthPage && (
        <div 
          className={cn(
            "fixed inset-0 bg-black/50 z-40 transition-all duration-300 ease-in-out",
            isNavOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setIsNavOpen(false)}
          style={{ transition: "all 0.3s ease-in" }}
        />
      )}

      <main 
        className={cn(
          "transition-all duration-300 ease-in-out min-h-screen",
          isNavOpen && !isAuthPage ? 
            isMobile ? 
              "opacity-50 transform scale-[0.85] origin-center" : 
              "transform translate-x-[260px] opacity-[0.6] origin-center" 
            : "scale-100 transform-none"
        )}
        style={{ transition: "all 0.3s ease-in" }}
      >
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<Landing setNavOpen={setIsNavOpen} />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/create-profile" element={<CreateInfluencerProfile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/place-order" element={<PlaceOrder setNavOpen={setIsNavOpen} />} />
            <Route path="/gift-requests" element={<GiftRequests />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/order-details/:id" element={<AdminOrderDetails />} />
            
            <Route path="/influencer/gift-requests" element={<InfluencerGiftRequests />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const App = () => (
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <AppContent />
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);

export default App;

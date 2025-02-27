
import { StrictMode, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import PlaceOrder from "./pages/PlaceOrder";
import CreateInfluencerProfile from "./pages/CreateInfluencerProfile";
import EditProfile from "./pages/EditProfile";
import NotFound from "./pages/NotFound";
import GiftRequests from "./pages/GiftRequests";
import Settings from "./pages/Settings";
import Navbar from "./components/navigation/Navbar";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile";

const queryClient = new QueryClient();

const AppContent = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';
  const { isMobile } = useMobile();
  
  return (
    <div className="min-h-screen w-full bg-[var(--background)] relative overflow-x-hidden">
      {/* Navigation */}
      {!isAuthPage && (
        <Navbar isOpen={isNavOpen} setIsOpen={setIsNavOpen} />
      )}

      {/* Overlay for navigation */}
      {!isAuthPage && (
        <div 
          className={cn(
            "fixed inset-0 bg-black/50 z-40 transition-all duration-300 ease-in-out",
            isNavOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setIsNavOpen(false)}
        />
      )}

      <main 
        className={cn(
          "transition-all duration-300 ease-in-out min-h-screen",
          isNavOpen && !isAuthPage ? 
            isMobile ? "opacity-50" : "scale-95 blur-sm" 
            : "scale-100"
        )}
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

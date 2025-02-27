
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
import { useIsMobile } from "./hooks/use-mobile";
import { Menu } from "lucide-react";
import { Button } from "./components/ui/button";

const queryClient = new QueryClient();

const AppContent = () => {
  const isMobile = useIsMobile();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  const handleOverlayClick = () => {
    setIsNavOpen(false);
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };
  
  return (
    <div className="min-h-screen w-full bg-[var(--background)] relative overflow-x-hidden">
      {/* Overlay */}
      {!isAuthPage && isNavOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-all duration-300 ease-in-out"
          onClick={handleOverlayClick}
        />
      )}

      {/* Navigation */}
      {!isAuthPage && (
        <div 
          className={`fixed top-8 left-8 z-50 transition-all duration-300 ease-in-out transform 
            ${isNavOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}
        >
          <Navbar isOpen={isNavOpen} setIsOpen={setIsNavOpen} />
        </div>
      )}

      {/* Navigation Toggle Button - visible on all pages except auth */}
      {!isAuthPage && (
        <Button
          variant="outline"
          size="icon"
          className="fixed top-8 left-8 z-30 rounded-full h-10 w-10 bg-white shadow-md hover:bg-gray-100"
          onClick={toggleNav}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      <main 
        className={`transition-all duration-300 ease-in-out min-h-screen transform
          ${isNavOpen && !isAuthPage ? 'scale-95 blur-sm translate-x-72' : 'scale-100'}`}
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

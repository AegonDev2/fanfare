
import { StrictMode, useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import PlaceOrder from "./pages/PlaceOrder";
import CreateInfluencerProfile from "./pages/CreateInfluencerProfile";
import NotFound from "./pages/NotFound";
import Navbar from "./components/navigation/Navbar";
import { useIsMobile } from "./hooks/use-mobile";
import { supabase } from "./integrations/supabase/client";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const isMobile = useIsMobile();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';
  
  return (
    <div className="min-h-screen w-full bg-[var(--background)] relative overflow-x-hidden">
      {!isAuthPage && isNavOpen && (
        <div 
          className="fixed top-0 right-0 z-40 transition-all duration-300 ease-in-out origin-top-right"
          style={{
            transformOrigin: 'top right',
            transform: isNavOpen ? 'scale(1)' : 'scale(0)',
          }}
        >
          <Navbar isOpen={isNavOpen} setIsOpen={setIsNavOpen} />
        </div>
      )}

      <main 
        className={`transition-all duration-300 ease-in-out min-h-screen ${
          isNavOpen && !isAuthPage
            ? 'blur-sm' 
            : ''
        }`}
      >
        <div className="min-h-screen">
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Landing setNavOpen={setIsNavOpen} />
              </ProtectedRoute>
            } />
            <Route path="/profile/:id" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/create-profile" element={
              <ProtectedRoute>
                <CreateInfluencerProfile />
              </ProtectedRoute>
            } />
            <Route path="/place-order" element={
              <ProtectedRoute>
                <PlaceOrder />
              </ProtectedRoute>
            } />
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

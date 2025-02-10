
import { StrictMode, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import CreateInfluencerProfile from "./pages/CreateInfluencerProfile";
import NotFound from "./pages/NotFound";
import Navbar from "./components/navigation/Navbar";
import { useIsMobile } from "./hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const queryClient = new QueryClient();

const AppContent = () => {
  const isMobile = useIsMobile();
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  return (
    <div className="min-h-screen w-full bg-[var(--background)] relative overflow-x-hidden">
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 bg-[var(--navbar-dark-primary)] text-[var(--navbar-light-primary)] hover:bg-[var(--navbar-dark-secondary)]"
        onClick={() => setIsNavOpen(!isNavOpen)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {isNavOpen && (
        <div className="fixed top-4 left-4 z-40 transition-transform duration-300 ease-in-out">
          <Navbar isOpen={isNavOpen} setIsOpen={setIsNavOpen} />
        </div>
      )}

      <main 
        className={`transition-all duration-300 ease-in-out min-h-screen ${
          isNavOpen 
            ? isMobile 
              ? 'ml-24 blur-sm' 
              : 'ml-[calc(var(--navbar-width)+2rem)] blur-sm'
            : 'ml-16'
        }`}
      >
        <div className="pt-4 px-4">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/create-profile" element={<CreateInfluencerProfile />} />
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

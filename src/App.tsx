
import { StrictMode } from "react";
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

const queryClient = new QueryClient();

const App = () => (
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <div className="min-h-screen w-full bg-[var(--background)]">
            <Navbar />
            <main className="ml-[calc(var(--navbar-width)+2rem)] pt-4 pr-4">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="/create-profile" element={<CreateInfluencerProfile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);

export default App;

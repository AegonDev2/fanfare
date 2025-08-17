
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AppContent } from "@/components/AppContent";
import { NotificationManager } from "@/components/notifications/NotificationManager";
import { AuthProvider } from "@/contexts/AuthContext";
import { useDataPreloader } from "@/hooks/useDataPreloader";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppWrapper />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function AppWrapper() {
  useDataPreloader(); // Preload critical data
  
  return (
    <NotificationManager>
      <AppContent />
    </NotificationManager>
  );
}

export default App;

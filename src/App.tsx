
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AppContent } from "@/components/AppContent";
import { NotificationManager } from "@/components/notifications/NotificationManager";
import { FirebaseAuthProvider } from "@/contexts/FirebaseAuthContext";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <FirebaseAuthProvider>
            <NotificationManager>
              <AppContent />
            </NotificationManager>
          </FirebaseAuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

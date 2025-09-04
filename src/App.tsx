
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AppContent } from "@/components/AppContent";
import { NotificationManager } from "@/components/notifications/NotificationManager";
import { MobileRefreshHandler } from "@/components/mobile/MobileRefreshHandler";
import { SimpleAuthProvider } from "@/contexts/SimpleAuthContext";
import { useDataPreloader } from "@/hooks/useDataPreloader";
import { useBackgroundDataRefresh } from "@/hooks/useBackgroundDataRefresh";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { useMobileOptimizations } from "@/hooks/useMobileOptimizations";
import { AppInitializingSkeleton } from "@/components/loading/AppSkeleton";
import { AppStartupScreen } from "@/components/loading/AppStartupScreen";
import { Suspense, useState, useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes - faster updates
      gcTime: 10 * 60 * 1000, // 10 minutes - reasonable cache
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true, // Refetch when reconnecting
      retry: 1, // Reduced retries for mobile
      retryDelay: 1000, // Faster retry
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    }
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SimpleAuthProvider>
            <AppWrapper />
          </SimpleAuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function AppWrapper() {
  const [showStartupScreen, setShowStartupScreen] = useState(true);
  
  useDataPreloader(); // Preload critical data
  useBackgroundDataRefresh(); // Keep data fresh in background
  usePerformanceMonitor(); // Monitor performance improvements
  useMobileOptimizations(); // Mobile-specific optimizations
  
  // Check if it's first time opening the app (startup screen)
  // Note: To test startup screen again, clear sessionStorage: sessionStorage.removeItem('hasSeenStartup')
  useEffect(() => {
    const hasSeenStartup = sessionStorage.getItem('hasSeenStartup');
    if (hasSeenStartup) {
      setShowStartupScreen(false);
    }
  }, []);

  const handleStartupComplete = () => {
    sessionStorage.setItem('hasSeenStartup', 'true');
    setShowStartupScreen(false);
  };
  
  if (showStartupScreen) {
    return <AppStartupScreen onComplete={handleStartupComplete} />;
  }
  
  return (
    <NotificationManager>
      <MobileRefreshHandler />
      <Suspense fallback={<AppInitializingSkeleton />}>
        <AppContent />
      </Suspense>
    </NotificationManager>
  );
}

export default App;

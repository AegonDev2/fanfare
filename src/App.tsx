
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
  const [isInitializing, setIsInitializing] = useState(true);
  
  useDataPreloader(); // Preload critical data
  useBackgroundDataRefresh(); // Keep data fresh in background
  usePerformanceMonitor(); // Monitor performance improvements
  useMobileOptimizations(); // Mobile-specific optimizations
  
  // Simulate app initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1000); // Show skeleton for 1 second minimum
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isInitializing) {
    return <AppInitializingSkeleton />;
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

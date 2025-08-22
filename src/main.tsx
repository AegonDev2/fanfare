
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

// Add the Pikwy API token as a global variable with the provided key
window.PIKWY_API_TOKEN = "c39990741cf427d7baa5750d20bfaefc66c45915a84af5d8";

// Optimized query client for mobile performance
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
})

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);

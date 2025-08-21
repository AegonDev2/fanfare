
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

// Add the Pikwy API token as a global variable with the provided key
window.PIKWY_API_TOKEN = "c39990741cf427d7baa5750d20bfaefc66c45915a84af5d8";

// Create a client with optimized cache settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - keep data fresh longer
      gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache much longer
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Don't refetch if data is fresh
      retry: (failureCount, error) => {
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
            return false;
          }
        }
        return failureCount < 2;
      },
    },
  },
})

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);

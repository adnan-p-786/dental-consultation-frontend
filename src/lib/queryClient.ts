import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes: prevents immediate refetching on component re-mounts
      gcTime: 1000 * 60 * 10,   // 10 minutes cache garbage collection
      retry: 1,                 // Retry once on network failure
      refetchOnWindowFocus: false, // Avoid jarring layout shifts when clicking between windows
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/apiError';

/**
 * Shared TanStack Query client. Owns all *server* state (fetching, caching,
 * background refetching). Client/global state lives in React Context instead.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Never retry client errors (4xx) — they won't succeed on retry.
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

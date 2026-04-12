import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';

const handleGlobalError = (error: unknown) => {
  const axiosError = error as { response?: { status?: number } };
  const status = axiosError.response?.status;

  if (!status || status >= 500) {
    if (window.location.pathname !== '/server-unavailable') {
      window.location.href = '/server-unavailable';
    }
  }
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleGlobalError,
  }),
  mutationCache: new MutationCache({
    onError: handleGlobalError,
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

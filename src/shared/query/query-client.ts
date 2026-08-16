import { QueryClient } from '@tanstack/react-query';
import { AppError } from '@/shared/api/error-type';

function shouldRetryQuery(failureCount: number, error: Error): boolean {
  if (error instanceof AppError) {
    if (error.code === 'CANCELED' || error.status === 401 || error.status === 400) {
      return false;
    }
  }
  return failureCount < 1;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetryQuery,
    },
  },
});

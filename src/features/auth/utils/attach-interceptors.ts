import axios, { type InternalAxiosRequestConfig } from 'axios';
import { appClient } from '@/shared/api/clients';
import { isTokenExpiredError, toAppError } from '@/shared/api/error-type';
import { useAuthStore } from '../auth-store';
import type { RetryConfig } from '../types/interceptor';
import { logout } from './auth-actions';
import { refreshSession } from './refresh-session';

let attached = false;

function getAccessToken(): string | null {
  const { session } = useAuthStore.getState();
  if (session.status === 'AUTHENTICATED') {
    return session.accessToken;
  }
  return null;
}

/**
 * 為受保護 client 掛上 token 與 401 TOKEN_EXPIRED 的單次 replay。只應呼叫一次。
 */
export function attachAuthInterceptors(): void {
  if (attached) {
    return;
  }
  attached = true;

  appClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken();
    if (accessToken !== null) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  appClient.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!axios.isAxiosError(error) || error.config === undefined) {
        return Promise.reject(toAppError(error));
      }

      const original = error.config as RetryConfig;
      const status = error.response?.status;
      const data = error.response?.data;

      if (status === 401 && isTokenExpiredError(data) && original.retried !== true) {
        original.retried = true;
        await refreshSession();
        if (useAuthStore.getState().session.status !== 'AUTHENTICATED') {
          return Promise.reject(toAppError(error));
        }
        return appClient(original);
      }

      if (status === 401) {
        logout();
      }

      return Promise.reject(toAppError(error));
    },
  );
}

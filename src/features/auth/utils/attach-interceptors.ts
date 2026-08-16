import axios, { type InternalAxiosRequestConfig } from 'axios';
import { appClient } from '@/shared/api/clients';
import { isTokenExpiredError, toAppError } from '@/shared/api/error-type';
import { useAuthStore } from '../auth-store';
import { logout } from './auth-actions';
import { refreshSession } from './auth-coordinator';

type RetryConfig = InternalAxiosRequestConfig & { retried?: boolean };

let attached = false;

/**
 * 為受保護的 Axios client 安裝 request／response interceptor。
 * Request interceptor 負責附加最新 access token；response interceptor 只在
 * `401 + TOKEN_EXPIRED` 時 refresh，成功後將原 request 重送一次。
 */
export function attachAuthInterceptors(): void {
  // 重複安裝會讓同一個 response 被處理多次，可能造成重複 refresh 或 replay。
  if (attached) {
    return;
  }
  attached = true;

  // 每次送出 request 時才讀 store，避免 interceptor 關閉包捕捉到舊 token。
  appClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const { session } = useAuthStore.getState();
    if (session.status === 'AUTHENTICATED') {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  });

  // 成功 response 原樣通過；失敗 response 依狀態決定 refresh、logout 或直接回傳錯誤。
  appClient.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!axios.isAxiosError(error) || error.config === undefined) {
        return Promise.reject(toAppError(error));
      }

      const original = error.config as RetryConfig;
      const status = error.response?.status;
      const data = error.response?.data;

      // 只有 TOKEN_EXPIRED 才 refresh，且同一請求最多 replay 一次。
      if (status === 401 && isTokenExpiredError(data) && original.retried !== true) {
        original.retried = true;
        await refreshSession();
        // Refresh 期間可能發生 logout；此時不能再送出原本的受保護 request。
        if (useAuthStore.getState().session.status !== 'AUTHENTICATED') {
          return Promise.reject(toAppError(error));
        }
        return appClient(original);
      }

      // 其他 401（無效 token 等）無法靠 refresh 修復，直接結束工作階段。
      if (status === 401) {
        logout();
      }

      return Promise.reject(toAppError(error));
    },
  );
}

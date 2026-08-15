import { AppError, toAppError } from '@/shared/api/error-type';
import { publicClient } from '@/shared/api/clients';
import { useAuthStore } from '../auth-store';
import { isLoginResponse, mapLoginResponse } from './auth-utils';
import { abortRefresh } from './refresh-session';

/**
 * 以帳號密碼登入，成功後把 access token 放進記憶體，refresh token 與使用者寫入 sessionStorage。
 */
export async function login(username: string, password: string): Promise<void> {
  try {
    const { data } = await publicClient.post<unknown>('/auth', {
      username,
      password,
    });
    if (!isLoginResponse(data)) {
      throw new AppError('登入回應格式不正確');
    }
    const mapped = mapLoginResponse(data);
    useAuthStore.getState().setAuthenticated(mapped);
  } catch (error) {
    throw toAppError(error);
  }
}

/**
 * 結束工作階段：提高 generation、中止 refresh、清記憶體與 sessionStorage。
 * 不負責導頁；路由看到 UNAUTHENTICATED 後會回到登入頁。
 */
export function logout(): void {
  useAuthStore.getState().bumpGeneration();
  abortRefresh();
  useAuthStore.getState().clearSession();
}

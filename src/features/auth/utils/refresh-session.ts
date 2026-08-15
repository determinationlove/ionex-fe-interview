import { AppError, toAppError } from '@/shared/api/error-type';
import { publicClient } from '@/shared/api/clients';
import { useAuthStore } from '../auth-store';
import type { AuthUser } from '../types/session';
import { isRefreshResponse, mapRefreshResponse } from './auth-utils';

let inFlight: Promise<void> | null = null;
let abortController: AbortController | null = null;

/**
 * 中止進行中的 refresh，供登出使用。晚到的結果不得恢復工作階段。
 */
export function abortRefresh(): void {
  abortController?.abort();
}

function getRefreshContext(): { refreshToken: string; user: AuthUser } | null {
  const { session, savedSession } = useAuthStore.getState();
  if (session.status === 'AUTHENTICATED') {
    return { refreshToken: session.refreshToken, user: session.user };
  }
  if (savedSession !== null) {
    return savedSession;
  }
  return null;
}

async function runRefresh(): Promise<void> {
  const generation = useAuthStore.getState().generation;
  const context = getRefreshContext();
  if (context === null) {
    useAuthStore.getState().clearSession();
    throw new AppError('沒有可用的工作階段');
  }

  abortController = new AbortController();

  try {
    const { data } = await publicClient.post<unknown>(
      '/auth/refresh',
      { refresh_token: context.refreshToken },
      { signal: abortController.signal },
    );

    if (useAuthStore.getState().generation !== generation) {
      return;
    }
    if (!isRefreshResponse(data)) {
      throw new AppError('重新整理工作階段的回應格式不正確');
    }

    const mapped = mapRefreshResponse(data);
    useAuthStore.getState().setAuthenticated({
      accessToken: mapped.accessToken,
      refreshToken: context.refreshToken,
      user: context.user,
    });
  } catch (error) {
    if (useAuthStore.getState().generation !== generation) {
      return;
    }

    const appError = toAppError(error);
    if (appError.code === 'CANCELED') {
      return;
    }
    if (
      appError.status === 401 ||
      appError.code === 'INVALID_REFRESH_TOKEN' ||
      appError.code === 'REFRESH_TOKEN_EXPIRED'
    ) {
      useAuthStore.getState().clearSession();
      throw appError;
    }

    useAuthStore.getState().setSession({ status: 'ERROR', error: appError });
    throw appError;
  }
}

/**
 * 用 refresh token 換新的 access token。同分頁共用同一個 in-flight Promise。
 * 現行 API 不會回傳新的 refresh token，因此不算 rotation-safe。
 */
export async function refreshSession(): Promise<void> {
  if (inFlight !== null) {
    return inFlight;
  }

  const request = runRefresh().finally(() => {
    if (inFlight === request) {
      inFlight = null;
      abortController = null;
    }
  });
  inFlight = request;
  return request;
}

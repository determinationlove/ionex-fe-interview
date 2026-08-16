import { publicClient } from '@/shared/api/clients';
import { AppError, toAppError } from '@/shared/api/error-type';
import type { AuthUser } from '../types/session';

type LoginResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    username: string;
    role: string;
  };
};

type RefreshResponse = {
  access_token: string;
  expires_in: number;
};

type MappedLogin = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

/**
 * 確認 unknown 是可安全讀取欄位的物件。
 * JavaScript 的 null 也會被 typeof 判定為 object，因此要另外排除。
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * 在執行期間檢查登入 API 的必要欄位。
 * TypeScript 型別只在編譯時有效，不能保證伺服器實際回傳的 JSON 正確。
 */
function isLoginResponse(value: unknown): value is LoginResponse {
  if (!isRecord(value)) {
    return false;
  }
  if (typeof value.access_token !== 'string' || value.access_token.length === 0) {
    return false;
  }
  if (typeof value.refresh_token !== 'string' || value.refresh_token.length === 0) {
    return false;
  }
  if (typeof value.expires_in !== 'number' || !Number.isFinite(value.expires_in)) {
    return false;
  }
  if (!isRecord(value.user)) {
    return false;
  }
  return typeof value.user.username === 'string' && typeof value.user.role === 'string';
}

/**
 * 檢查 refresh API 是否回傳非空 access token 與有效的過期秒數。
 */
function isRefreshResponse(value: unknown): value is RefreshResponse {
  return (
    isRecord(value) &&
    typeof value.access_token === 'string' &&
    value.access_token.length > 0 &&
    typeof value.expires_in === 'number' &&
    Number.isFinite(value.expires_in)
  );
}

/**
 * 將 API 的 snake_case 欄位轉成前端統一使用的 camelCase model。
 */
function mapLoginResponse(data: LoginResponse): MappedLogin {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    user: {
      username: data.user.username,
      role: data.user.role,
    },
  };
}

/**
 * Refresh 流程目前只需要新的 access token，因此只取出這個欄位。
 */
function mapRefreshResponse(data: RefreshResponse): string {
  return data.access_token;
}

/**
 * 呼叫登入 API，將未知的伺服器回應驗證並轉成前端 model。
 * publicClient 不會自動附加 token，也不會觸發 protected request 的 refresh interceptor。
 */
export async function requestLogin(username: string, password: string): Promise<MappedLogin> {
  try {
    const { data } = await publicClient.post<unknown>('/auth', {
      username,
      password,
    });
    if (!isLoginResponse(data)) {
      throw new AppError('登入回應格式不正確');
    }
    return mapLoginResponse(data);
  } catch (error) {
    throw toAppError(error);
  }
}

/**
 * 用 refresh token 取得新的 access token。
 * signal 由 coordinator 傳入，讓 logout 可以取消仍在等待的 HTTP request。
 * 現行 API 不回傳新的 refresh token，因此這裡不處理 token rotation。
 */
export async function requestAccessToken(
  refreshToken: string,
  signal: AbortSignal,
): Promise<string> {
  try {
    const { data } = await publicClient.post<unknown>(
      '/auth/refresh',
      { refresh_token: refreshToken },
      { signal },
    );
    if (!isRefreshResponse(data)) {
      throw new AppError('重新整理工作階段的回應格式不正確');
    }
    return mapRefreshResponse(data);
  } catch (error) {
    throw toAppError(error);
  }
}

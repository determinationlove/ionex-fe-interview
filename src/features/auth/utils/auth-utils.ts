import type { LoginResponse, MappedLogin, MappedRefresh, RefreshResponse } from '../types/api-response';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * 檢查值是否為登入 API 的成功回應。
 */
export function isLoginResponse(value: unknown): value is LoginResponse {
  if (!isRecord(value)) {
    return false;
  }
  if (typeof value.access_token !== 'string' || value.access_token.length === 0) {
    return false;
  }
  if (typeof value.refresh_token !== 'string' || value.refresh_token.length === 0) {
    return false;
  }
  if (typeof value.expires_in !== 'number') {
    return false;
  }
  if (!isRecord(value.user)) {
    return false;
  }
  if (typeof value.user.username !== 'string' || typeof value.user.role !== 'string') {
    return false;
  }
  return true;
}

/**
 * 檢查值是否為 refresh API 的成功回應。現行回應不含新的 refresh token。
 */
export function isRefreshResponse(value: unknown): value is RefreshResponse {
  if (!isRecord(value)) {
    return false;
  }
  if (typeof value.access_token !== 'string' || value.access_token.length === 0) {
    return false;
  }
  if (typeof value.expires_in !== 'number') {
    return false;
  }
  return true;
}

/**
 * 把登入 API 的 snake_case 回應轉成應用程式使用的 camelCase。
 */
export function mapLoginResponse(data: LoginResponse): MappedLogin {
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
 * 把 refresh API 回應轉成 camelCase。不含 refresh token。
 */
export function mapRefreshResponse(data: RefreshResponse): MappedRefresh {
  return {
    accessToken: data.access_token,
  };
}

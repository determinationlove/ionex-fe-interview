import type { AppError } from '@/shared/api/error-type';

export type AuthUser = {
  username: string;
  role: string;
};

/**
 * 認證狀態
 * IDLE: 未開始認證
 * LOADING: 正在用 refresh token 恢復
 * AUTHENTICATED: 已登入，包含 access token
 * UNAUTHENTICATED: 未登入
 * ERROR: 恢復登入時發生錯誤
 */
export type AuthSession =
  | { status: 'IDLE' }
  | { status: 'LOADING' }
  | {
      status: 'AUTHENTICATED';
      accessToken: string;
      refreshToken: string;
      user: AuthUser;
      sessionId: string;
    }
  | { status: 'UNAUTHENTICATED' }
  | { status: 'ERROR'; error: AppError };

export type SavedSession = {
  refreshToken: string;
  user: AuthUser;
  sessionId: string;
};

export type AuthenticatedPayload = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  sessionId: string;
};

export type AuthStore = {
  session: AuthSession;
  savedSession: SavedSession | null;
  generation: number;
  setSession: (session: AuthSession) => void;
  setAuthenticated: (payload: AuthenticatedPayload) => void;
  clearSession: () => void;
  bumpGeneration: () => number;
};

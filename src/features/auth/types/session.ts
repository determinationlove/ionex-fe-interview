import type { AppError } from '@/shared/api/error-type';

export type AuthUser = {
  username: string;
  role: string;
};

export type AuthSession =
  | { status: 'IDLE' }
  | { status: 'LOADING' }
  | {
      status: 'AUTHENTICATED';
      accessToken: string;
      refreshToken: string;
      user: AuthUser;
    }
  | { status: 'UNAUTHENTICATED' }
  | { status: 'ERROR'; error: AppError };

export type SavedSession = {
  refreshToken: string;
  user: AuthUser;
};

export type AuthenticatedPayload = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

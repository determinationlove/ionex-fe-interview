import type { AuthUser } from './session';

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    username: string;
    role: string;
  };
};

export type RefreshResponse = {
  access_token: string;
  expires_in: number;
};

export type MappedLogin = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type MappedRefresh = {
  accessToken: string;
};

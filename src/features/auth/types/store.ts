import type { AuthenticatedPayload, AuthSession, SavedSession } from './session';

export type AuthStore = {
  session: AuthSession;
  savedSession: SavedSession | null;
  generation: number;
  setSession: (session: AuthSession) => void;
  setAuthenticated: (payload: AuthenticatedPayload) => void;
  clearSession: () => void;
  bumpGeneration: () => number;
};

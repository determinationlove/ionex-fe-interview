import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  AuthenticatedPayload,
  AuthSession,
  AuthStore,
  AuthUser,
  SavedSession,
} from './types/session';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isAuthUser(value: unknown): value is AuthUser {
  if (!isRecord(value)) {
    return false;
  }
  return typeof value.username === 'string' && typeof value.role === 'string';
}

/**
 * 從 persist 還原最小工作階段。舊資料沒有 sessionId 時補一個，讓複製分頁能對上同一 session。
 */
function toSavedSession(value: unknown): SavedSession | null {
  if (!isRecord(value)) {
    return null;
  }
  if (typeof value.refreshToken !== 'string' || value.refreshToken.length === 0) {
    return null;
  }
  if (!isAuthUser(value.user)) {
    return null;
  }
  const sessionId =
    typeof value.sessionId === 'string' && value.sessionId.length > 0
      ? value.sessionId
      : crypto.randomUUID();
  return {
    refreshToken: value.refreshToken,
    user: value.user,
    sessionId,
  };
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      session: { status: 'IDLE' },
      savedSession: null,
      generation: 0,
      setSession: (session: AuthSession): void => {
        set({ session });
      },
      setAuthenticated: (payload: AuthenticatedPayload): void => {
        set({
          session: {
            status: 'AUTHENTICATED',
            accessToken: payload.accessToken,
            refreshToken: payload.refreshToken,
            user: payload.user,
            sessionId: payload.sessionId,
          },
          savedSession: {
            refreshToken: payload.refreshToken,
            user: payload.user,
            sessionId: payload.sessionId,
          },
        });
      },
      clearSession: (): void => {
        set({
          session: { status: 'UNAUTHENTICATED' },
          savedSession: null,
        });
      },
      bumpGeneration: (): number => {
        const generation = get().generation + 1;
        set({ generation });
        return generation;
      },
    }),
    {
      name: 'ionex.session.v1',
      storage: createJSONStorage(() => sessionStorage),
      // access token 與 generation 只活在記憶體，reload 只還原 refresh token／user／sessionId。
      partialize: (state: AuthStore): { savedSession: SavedSession | null } => ({
        savedSession: state.savedSession,
      }),
      merge: (persistedState: unknown, currentState: AuthStore): AuthStore => {
        if (!isRecord(persistedState)) {
          return currentState;
        }
        return {
          ...currentState,
          savedSession: toSavedSession(persistedState.savedSession),
        };
      },
    },
  ),
);

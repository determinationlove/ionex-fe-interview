import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AuthenticatedPayload, AuthSession, SavedSession } from './types/session';
import type { AuthStore } from './types/store';

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
          },
          savedSession: {
            refreshToken: payload.refreshToken,
            user: payload.user,
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
      partialize: (state: AuthStore): { savedSession: SavedSession | null } => ({
        savedSession: state.savedSession,
      }),
    },
  ),
);

import { useAuthStore } from '../auth-store';
import { refreshSession } from './refresh-session';

/**
 * 依 sessionStorage 的 refresh token 恢復工作階段；沒有則標為未登入。
 */
export async function bootstrapSession(): Promise<void> {
  const { session, savedSession } = useAuthStore.getState();
  if (session.status === 'AUTHENTICATED' || session.status === 'LOADING') {
    return;
  }

  if (savedSession === null) {
    useAuthStore.getState().clearSession();
    return;
  }

  useAuthStore.getState().setSession({ status: 'LOADING' });
  try {
    await refreshSession();
  } catch {
    // refreshSession 已把狀態設成 ERROR 或 UNAUTHENTICATED
  }
}

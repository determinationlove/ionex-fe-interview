import { useAuthStore } from '../auth-store';
import { refreshSession } from './auth-coordinator';

/**
 * App 啟動時依 sessionStorage 保存的資料恢復工作階段。
 * 已登入或正在恢復時不重複執行；沒有 savedSession 則直接標成未登入。
 * Refresh 的成功、暫時失敗與 session 失效狀態都由 refreshSession 統一寫入 store。
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

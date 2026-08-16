import { useAuthStore } from '../auth-store';
import { requestLogin } from './auth-api';
import { endSession } from './auth-coordinator.ts';

/**
 * 以帳號密碼登入，成功後建立新的本機工作階段。
 * Store 只把 refresh 所需資料保存到 sessionStorage；access token 仍只存在記憶體。
 * sessionId 用來辨識哪些瀏覽器分頁屬於同一次登入。
 */
export async function login(username: string, password: string): Promise<void> {
  const mapped = await requestLogin(username, password);
  useAuthStore.getState().setAuthenticated({
    ...mapped,
    sessionId: crypto.randomUUID(),
  });
}

/**
 * 結束本頁工作階段，並通知相同 sessionId 的其他分頁同步登出。
 * 實際清理與取消 refresh 由 coordinator 統一處理；導頁則交給路由守衛。
 */
export function logout(): void {
  endSession(true);
}

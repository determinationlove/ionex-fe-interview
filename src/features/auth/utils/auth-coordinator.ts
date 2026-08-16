import { AppError, toAppError } from '@/shared/api/error-type';
import { queryClient } from '@/shared/query/query-client';
import { useAuthStore } from '../auth-store';
import type { AuthUser } from '../types/session';
import { requestAccessToken } from './auth-api';
import { postAuthMessage, startAuthChannel, type AuthChannelMessage } from './auth-channel';

type RefreshContext = {
  refreshToken: string;
  user: AuthUser;
  sessionId: string;
};

let inFlight: Promise<void> | null = null;
let abortController: AbortController | null = null;
let coordinatorStarted = false;

/**
 * 取得 refresh 所需的最小資料。
 * 已登入時使用記憶體中的 session；頁面 reload 尚未恢復完成時改用 sessionStorage 還原的資料。
 */
function getRefreshContext(): RefreshContext | null {
  const { session, savedSession } = useAuthStore.getState();
  if (session.status === 'AUTHENTICATED') {
    return {
      refreshToken: session.refreshToken,
      user: session.user,
      sessionId: session.sessionId,
    };
  }
  return savedSession;
}

/**
 * 完整結束本頁工作階段：先讓舊 async 結果失效，再取消 refresh、清除 server cache 與 auth store。
 * broadcast 為 true 時，會通知相同 sessionId 的其他分頁同步執行本機清理。
 */
export function endSession(broadcast: boolean): void {
  const { session, savedSession, bumpGeneration, clearSession } = useAuthStore.getState();
  // 先保存 sessionId；clearSession 後就無法通知同一工作階段的其他分頁。
  const sessionId =
    session.status === 'AUTHENTICATED' ? session.sessionId : (savedSession?.sessionId ?? null);
  bumpGeneration();

  abortController?.abort();
  queryClient.clear();
  clearSession();

  if (broadcast && sessionId !== null) {
    postAuthMessage({
      event: 'SESSION_ENDED',
      sessionId,
    });
  }
}

/**
 * 處理其他分頁傳來的登出事件。
 * 只接受相同 sessionId，避免另一個獨立登入的分頁被誤登出。
 */
function handleChannelMessage(message: AuthChannelMessage): void {
  const context = getRefreshContext();
  if (context === null || message.sessionId !== context.sessionId) {
    return;
  }

  // 遠端已結束 session：只做本機清理，不再廣播，避免迴圈。
  endSession(false);
}

/**
 * 呼叫 refresh API 取得 access token，確認工作階段沒有在等待期間被結束後才寫入 store。
 * generation 就像本頁 session 的版本號；logout 會提高版本，使舊 response 失效。
 */
async function performRefresh(
  generation: number,
  context: RefreshContext,
  signal: AbortSignal,
): Promise<void> {
  const accessToken = await requestAccessToken(context.refreshToken, signal);

  // logout 已提高 generation：丟棄晚到的成功回應，避免 session 復活。
  if (useAuthStore.getState().generation !== generation) {
    return;
  }

  useAuthStore.getState().setAuthenticated({
    accessToken,
    refreshToken: context.refreshToken,
    user: context.user,
    sessionId: context.sessionId,
  });
}

/**
 * 執行一次本分頁 refresh，並將不同失敗原因轉成對應的 session 行為。
 * 取消或舊 generation 代表使用者已登出，直接停止；refresh token 失效則結束 session；
 * 網路或伺服器暫時失敗則保留資料並進入可重試的 ERROR 狀態。
 */
async function runRefresh(): Promise<void> {
  const generation = useAuthStore.getState().generation;
  const context = getRefreshContext();
  if (context === null) {
    endSession(false);
    throw new AppError('沒有可用的工作階段');
  }

  abortController = new AbortController();
  const { signal } = abortController;

  try {
    await performRefresh(generation, context, signal);
  } catch (error) {
    if (signal.aborted) {
      return;
    }
    if (useAuthStore.getState().generation !== generation) {
      return;
    }

    const appError = toAppError(error);
    if (appError.code === 'CANCELED') {
      return;
    }
    if (
      appError.status === 401 ||
      appError.code === 'INVALID_REFRESH_TOKEN' ||
      appError.code === 'REFRESH_TOKEN_EXPIRED'
    ) {
      endSession(true);
      throw appError;
    }

    useAuthStore.getState().setSession({ status: 'ERROR', error: appError });
    throw appError;
  }
}

/**
 * 啟動跨分頁 logout 同步。
 * coordinator 只啟動一次；缺少 BroadcastChannel 時仍保證本分頁 logout。
 */
export function startAuthCoordinator(): void {
  if (coordinatorStarted) {
    return;
  }
  coordinatorStarted = true;
  startAuthChannel(handleChannelMessage);
}

/**
 * 用 refresh token 換新的 access token。
 * 同分頁所有呼叫者共用 inFlight Promise，因此多個同時發生的 401 只會送出一次 refresh。
 * Promise 結束後清除共用狀態，下一次 token 過期才能建立新的 refresh。
 * 不選舉跨分頁 refresher，也不跨分頁同步 access token。
 * 現行 API 不會回傳新的 refresh token，因此不算 rotation-safe。
 */
export async function refreshSession(): Promise<void> {
  if (inFlight !== null) {
    return inFlight;
  }

  const request = runRefresh().finally(() => {
    if (inFlight === request) {
      inFlight = null;
      abortController = null;
    }
  });
  inFlight = request;
  return request;
}

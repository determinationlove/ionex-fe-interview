const AUTH_CHANNEL_NAME = 'ionex.auth.v1';

export type AuthChannelMessage = {
  event: 'SESSION_ENDED';
  sessionId: string;
};

let channel: BroadcastChannel | null = null;

/**
 * 驗證從其他分頁收到的資料是否符合 auth channel 協定。
 * Channel 傳來的是執行期間資料，不能只靠 TypeScript 型別信任其內容。
 */
function isAuthChannelMessage(value: unknown): value is AuthChannelMessage {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const message = value as Record<string, unknown>;
  if (typeof message.sessionId !== 'string' || message.sessionId.length === 0) {
    return false;
  }
  return message.event === 'SESSION_ENDED';
}

/**
 * 啟動跨分頁 auth channel，並將驗證通過的訊息交給 onMessage。
 * 瀏覽器不支援 BroadcastChannel 或 channel 已啟動時不做任何事，本分頁 auth 仍可正常運作。
 */
export function startAuthChannel(onMessage: (message: AuthChannelMessage) => void): void {
  if (typeof BroadcastChannel === 'undefined' || channel !== null) {
    return;
  }
  channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
  channel.addEventListener('message', (event: MessageEvent) => {
    if (!isAuthChannelMessage(event.data)) {
      return;
    }
    onMessage(event.data);
  });
}

/**
 * 將 auth 事件送給其他分頁。
 * Channel 尚未啟動或瀏覽器不支援時為 no-op；訊息型別不允許攜帶 token。
 */
export function postAuthMessage(message: AuthChannelMessage): void {
  channel?.postMessage(message);
}

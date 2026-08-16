# ADR 0001：單分頁 refresh 與跨分頁 logout

[返回專案 README](../../README.md)

## 狀態

Accepted

## 背景

本專案需要處理 access token 過期、單次 request replay、同分頁併發 401，以及 logout
發生於 refresh 期間的競態。作業與 Swagger 未要求跨分頁 token consistency 或 refresh token
rotation，因此 auth coordination 應以核心 API 流程與單分頁 correctness 為邊界。

## 決策

- 保留 Axios token interceptor、`401 + TOKEN_EXPIRED` 判斷與原 request 最多 replay 一次。
- 同分頁 refresh 使用 single-flight、`AbortController` 與本分頁 generation guard。
- Refresh 只在發出請求的分頁執行；不同分頁可各自 refresh。
- 不使用 Web Locks，不選舉跨分頁 refresher，也不廣播 access token。
- `ionex.auth.v1` 只傳 runtime-validated `SESSION_ENDED`，且僅相同 `sessionId` 的分頁互相結束
  工作階段。
- Fatal refresh failure 與主動 logout 共用 session termination semantics；暫時失敗仍進入可重試的
  `ERROR` 狀態。

## 影響

- Access token 僅存在本分頁記憶體；refresh token 與最小 session snapshot 放在
  `sessionStorage`，不透過 channel 傳送。
- 複製且沿用相同 `sessionId` 的分頁可同步 logout；獨立登入並取得不同 `sessionId` 的分頁不屬於
  同一工作階段。
- 不同分頁可能各自發出 refresh，這是目前範圍接受的取捨。
- 缺少 BroadcastChannel 時只保證本分頁 logout。
- 現行 refresh response 不提供 rotated refresh token，因此不得宣稱完整 rotation-safe。

## 驗證條件

- 單分頁 token 過期可 refresh 並 replay，且同分頁併發 401 只共用一次 refresh。
- Refresh 期間 logout 後，晚到結果不得恢復 session 或 replay 原 request。
- 相同 `sessionId` 的另一分頁收到 `SESSION_ENDED` 後結束工作階段。
- Fatal refresh failure 清除本頁 session/query cache 並廣播；暫時失敗顯示全域重試。

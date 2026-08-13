# Day 2：Users、RWD 與 Auth 協調

## 只讀這些契約

- [架構與資料流](../../AGENTS.md#架構與資料流)、[Auth 不變條件](../../AGENTS.md#auth-與安全不變條件)。
- Users：[API](https://ionexenergy.github.io/ionex-fe-interview-server/api/index.html#/paths/api-users/get)、[Query pagination](https://tanstack.com/query/latest/docs/framework/react/guides/paginated-queries)、[Table React](https://tanstack.com/table/latest/docs/framework/react)、[Router search params](https://reactrouter.com/api/hooks/useSearchParams)。
- Browser/Auth：[Web Locks](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API)、[BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API)、[Axios cancellation](https://axios-http.com/docs/cancellation)。
- UI：[React purity](https://react.dev/reference/rules/components-and-hooks-must-be-pure)、[WCAG quick reference](https://www.w3.org/WAI/WCAG22/quickref/)。

## 工作

1. Page 解析及 canonicalize `page`、`limit`、`name`、`email`、`status`；URL 是唯一 filters／pagination source。
2. 建立 typed params、穩定 query key 與 users query；切頁保留上一頁畫面，不鏡像 Query state。
3. TanStack Table 只做 headless rendering／server pagination；API 沒有排序，不呈現 sortable UI。
4. 補 loading、empty、可重試／fatal error、background fetching、avatar fallback。
5. Desktop 用語意化 table；窄螢幕用 cards。390px 無溢位，filter／pagination／logout 可鍵盤操作且有可辨識 label／error。
6. Interceptor 保持薄層；coordinator 實作同頁 single-flight、Web Locks winner 與 BroadcastChannel lifecycle。
7. 驗證 channel payload 的 session／generation／event；只同步 access token。Logout 先 abort，late result 不得恢復 session 或 replay。
8. 缺少跨頁 API 時退回同頁保證；不宣稱完整 rotation-safe。

## Gate 與證據

- `npm run verify`：PASS。
- Filters／pagination、empty／error、desktop／390px：人工 PASS。
- 兩分頁同 session 同時過期仍保持登入；refresh 期間 logout 後 session 不復活：人工 PASS。
- Network／Console 只記結果摘要，不保存 Authorization 或 token。

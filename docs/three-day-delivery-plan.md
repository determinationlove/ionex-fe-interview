# Ionex Frontend Interview：三日交付計畫

本檔是執行索引，只保留目標、順序與 release gate。Coding style、架構、Auth、安全與權限以根目錄 [AGENTS.md](../AGENTS.md) 為唯一契約；每日細節只在對應工作包出現一次。

## Agent 載入規則

每個工作階段只載入：

1. 自動生效的根目錄 `AGENTS.md`。
2. 本索引。
3. 當日工作包，以及其中與當下工作直接相關的官方連結。

不得以聊天逐字稿、其他 agent handoff 或一次載入全部外部文件取代上述來源。跨日接手依目前 tree、工作包 gate 與實際命令結果判斷進度。

## 交付目標

- 三日內交付登入、reload session 恢復、受保護 users 篩選／分頁、登出及 390px RWD。
- API／狀態／依賴方向遵循 [AGENTS 架構契約](../AGENTS.md#架構與資料流)。
- Token refresh、跨分頁協調及 logout race 遵循 [AGENTS Auth 契約](../AGENTS.md#auth-與安全不變條件)。
- `npm run verify` 通過，README 能在第一屏提供 live URL、測試帳密與快速啟動。
- Cloudflare Pages project：`ionex-fe-interview`；候選 production domain：`ionex-fe-interview.delove.win`。

GitHub、Cloudflare、DNS、secret 或 deployment 的外部寫入均依 [AGENTS 權限契約](../AGENTS.md#修改審查與交付)，取得當次授權後才能執行。

## 三日路徑

| 日程 | 可交付結果 | 工作包 | 當日 gate |
| --- | --- | --- | --- |
| Day 1 | 可登入、可 reload、可 production build 的垂直切片 | [Day 1](delivery/day-1.md) | `npm run verify`；login／reload／guard 人工通過 |
| Day 2 | Users 完整資料流、RWD、跨分頁 refresh | [Day 2](delivery/day-2.md) | `npm run verify`；users／390px／雙分頁 race 人工通過 |
| Day 3 | Review、README、CI、Cloudflare production | [Day 3](delivery/day-3.md) | CI 與 live smoke PASS；無 P0／P1 finding |

當日 gate 未通過不得假設完成；handoff 必須按 [AGENTS 證據契約](../AGENTS.md#修改審查與交付)標記 PASS、FAIL 或 NOT RUN。

## Release gate

- 正式功能：login、reload、users filters／pagination、refresh、logout、desktop／390px 全數完成。
- 品質：本機與 CI 的 `npm run verify` 都通過；Console 無未處理錯誤。
- 部署：`pages.dev` 與 custom domain 的首頁及 users deep link 可直接開啟。
- 文件：README 明分自動 gate、人工驗證、未驗證與已知限制，不把人工 race check 稱為自動測試。
- 安全：repository、log、handoff 皆無 token、Authorization header、secret 或 auth snapshot。

人工案例的唯一清單在 [AGENTS.md](../AGENTS.md#修改審查與交付)，此處不複製。依目前決策不加入 Vitest、MSW、Playwright。

## 時程取捨

落後時依序刪除動畫、dark mode、analytics、額外抽象與非必要視覺 polish。不得犧牲官方必做功能、錯誤處理、reload session、RWD、README、quality gate，或以宣稱取代未完成的驗證。

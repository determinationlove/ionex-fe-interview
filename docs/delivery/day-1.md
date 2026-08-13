# Day 1：可登入的垂直切片

## 只讀這些契約

- [範圍與架構](../../AGENTS.md#目標與範圍)、[Coding style](../../AGENTS.md#coding-style)、[Auth 不變條件](../../AGENTS.md#auth-與安全不變條件)。
- Scaffold：[Vite](https://vite.dev/guide/)、[Tailwind Vite](https://tailwindcss.com/docs/installation/using-vite)、[daisyUI Vite](https://daisyui.com/docs/install/vite/)。
- API／Auth：[作業說明](https://ionexenergy.github.io/ionex-fe-interview-server/#/)、[Swagger](https://ionexenergy.github.io/ionex-fe-interview-server/swagger.yaml)、[Axios interceptors](https://axios-http.com/docs/interceptors)、[Zustand persist](https://zustand.docs.pmnd.rs/reference/middlewares/persist)。

套件安裝前確認官方文件與 peer dependencies；精確版本只記於 `package.json` 與 lockfile。若最新 major 只有 beta 文件，採有完整穩定文件的 major。

## 工作

1. 以 Vite React TypeScript 建立 npm SPA，加入已定堆疊與最小路由依賴。
2. 建立 feature-first 骨架、`@/` alias、環境型別及 `.env.example`；API base URL 是公開 build-time 設定，不放 credential。
3. 設定 Prettier、Tailwind class sorting、ESLint、TypeScript，以及 `format`、`format:check`、`lint`、`typecheck`、`build`、`verify` scripts。
4. 建立 auth client、protected client、runtime guards、mappers 與 `AppError`；refresh client 不掛 protected interceptor。
5. 建立 Auth store 與 session bootstrap。Access token 只在記憶體；refresh token／最小 user snapshot 以 `sessionStorage` 支援 reload。
6. 完成 login、protected route、users shell、not-found、logout 入口及同頁 refresh single-flight。
7. 產出 `dist` 並以 static preview 驗證 deep link，提早消除 build／hosting 風險。

## Gate 與證據

- `npm run verify`：PASS。
- 正確／錯誤帳密、reload、未登入導回 login：人工 PASS。
- Production preview 的 `/` 與 users deep link：人工 PASS。
- Handoff 列出 tree、命令結果、未驗證項；不得包含 token 或 storage dump。

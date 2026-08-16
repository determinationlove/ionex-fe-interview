# Ionex Frontend Interview

以 [Ionex Frontend Interview API](https://ionexenergy.github.io/ionex-fe-interview-server/)
實作的 React 後台使用者列表，重點是完整的 authenticated API 資料流、URL 驅動的篩選／分頁、
錯誤處理與 responsive UI。

- [作業說明](https://ionexenergy.github.io/ionex-fe-interview-server/)
- [API 文件](https://ionexenergy.github.io/ionex-fe-interview-server/api/index.html)
- 測試帳號請見官方作業說明

## 快速開始

環境需求：Node.js `>=20.19.0`。

1. 建立 `.env`，填入 Swagger 公開的 API base URL

2. 安裝套件並啟動開發伺服器：

   ```bash
   npm install
   npm run dev
   ```

3. 開啟 <http://localhost:5173>。

## 技術棧

- React 19、TypeScript、Vite
- React Router 7
- TanStack Query 5、TanStack Table 8
- Axios、Zustand 5
- Tailwind CSS 4、daisyUI 5

## 架構與狀態所有權

- TanStack Query：users server state、快取與 request lifecycle
- URL search params：users filters 與 pagination 的唯一來源
- Zustand：auth session state；不鏡像 Query 或 URL state
- Component state：尚未送出的 filter draft、avatar fallback 等短暫 UI
- `app/routes → features → shared`：路由組合 feature，feature 共用 shared 基礎設施

## 常用指令

- `npm run dev`：啟動開發伺服器
- `npm run build`：產出 production build
- `npm run preview`：本機預覽 production build
- `npm run format`：格式化專案
- `npm run lint`：執行 ESLint
- `npm run typecheck`：執行 TypeScript 檢查
- `npm run verify`：依序執行 format check、ESLint、TypeScript 與 production build

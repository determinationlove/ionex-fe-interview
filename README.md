# Ionex Frontend Interview

以官方測試 API 實作的後台使用者管理介面，涵蓋登入、session 恢復、受保護頁面與登出。

- [作業說明](https://ionexenergy.github.io/ionex-fe-interview-server/)
- [API 文件](https://ionexenergy.github.io/ionex-fe-interview-server/api/index.html)

## 功能

- 帳號登入與錯誤提示
- 重新整理後維持登入狀態
- 未登入時導向登入頁
- 登出
- 淺色／深色主題切換

使用者列表的篩選與分頁仍在實作中。
測試帳號請見[作業說明](https://ionexenergy.github.io/ionex-fe-interview-server/)。

## 技術棧

- React 19、TypeScript、Vite
- Tailwind CSS v4、daisyUI 5
- React Router、Axios、Zustand

## 環境需求

- Node.js `>=20.19.0`（建議 22.12+）

## 初始化

```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env

npm install
npm run dev
```

瀏覽器開啟 <http://localhost:5173>。`.env` 只需設定公開的 `VITE_API_BASE_URL`。

## 常用指令

| 指令 | 說明 |
| --- | --- |
| `npm run dev` | 啟動開發伺服器 |
| `npm run build` | 產出 production build |
| `npm run preview` | 本機預覽 production build |
| `npm run verify` | 執行格式、ESLint、TypeScript 與 production build 檢查 |

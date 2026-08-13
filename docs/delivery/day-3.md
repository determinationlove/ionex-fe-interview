# Day 3：Hardening、README 與 Cloudflare

## 只讀這些契約

- [Review／權限／證據](../../AGENTS.md#修改審查與交付)。
- CI：[GitHub Node CI](https://docs.github.com/actions/tutorials/build-and-test-code/nodejs)。
- Hosting：[Cloudflare React／Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/)、[SPA serving](https://developers.cloudflare.com/pages/configuration/serving-pages/)、[Headers](https://developers.cloudflare.com/pages/configuration/headers/)、[Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)、[Rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/)。

## 工作

1. 依 P0–P3 契約 review Auth／API，先修 release blockers；人工 fault injection 涵蓋 400、401、415、500、network、超界頁、零結果、broken avatar。
2. README 第一屏放 live URL、測試帳密、快速啟動及 `npm run verify`；其後只放功能／非目標、狀態所有權、Auth 流程與限制、錯誤／RWD 策略、部署／rollback、驗證狀態。
3. GitHub Actions 對 PR／`main` 乾淨安裝並執行 `npm run verify`；本機、CI、Cloudflare 使用同一 Node pin 與 scripts。
4. Cloudflare Pages 連 GitHub：production branch=`main`、build=`npm run build`、output=`dist`；PR 使用 preview deployments。
5. 使用 Pages 內建 SPA fallback，不建 Worker／Pages Functions。加入 `_headers` 後實測 CSP、API、avatar 及 deep link。
6. 經使用者授權後綁定 `ionex-fe-interview.delove.win`；驗證 TLS、login、reload、users deep link，記錄上一個可 rollback deployment。

## Release gate 與證據

- 本機 `npm run verify` 與 GitHub Actions：PASS；無 P0／P1 finding。
- `pages.dev` 與 custom domain 的首頁、login、users deep link：人工 PASS；Console 無未處理錯誤。
- README 的命令、連結與驗證聲明皆以目前 tree 實際確認。
- Handoff 列 production／preview URL、commit、命令結果、人工案例與未驗證風險；不附 secret 或 auth evidence dump。

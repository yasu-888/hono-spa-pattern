ローカル開発 (pnpm)

```bash
pnpm install
pnpm dev   # 1プロセス・1ポートで Hono(API) + Vite(HMR)
```

仕組みメモ

- Vite dev サーバーに `@hono/vite-dev-server` を噛ませて、`src/app.tsx` の Hono アプリを同居させています。
- 開発中は Vite が `/src/*` をそのまま配信し、API も同じ 5173 ポートで動きます。
- 本番用の Node サーバー起動は `src/server.ts`（ビルド後は `dist/server.js`）。

本番ビルド & 実行

```bash
pnpm run build   # dist/static にクライアント、dist/server.js にサーバー
pnpm start       # PORT 環境変数でポート指定可 (デフォルト 8787)
```

/** @format */

import { Hono } from "hono";
import { html } from "hono/html";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY が設定されていません");
}
const gemini = new GoogleGenAI({ apiKey });

const app = new Hono();

// SSR 用のページコンポーネント
const Page = () => (
  <html lang="ja">
    <head>
      <meta charSet="utf-8" />
      <title>Hono + Gemini SPA</title>
      {/* Tailwind CDN 入れるならここで */}
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="max-w-2xl mx-auto my-10 p-4 font-sans space-y-4">
      <h1 class="text-2xl font-bold">Hono × Gemini SPA (React-lite)</h1>
      {/* クライアント側の JSX App をマウントする場所 */}
      <div id="root"></div>

      {/* Vite がビルドしてくれるクライアントエントリ */}
      {html`<script type="module" src="/src/client.tsx"></script>`}
    </body>
  </html>
);

app.get("/", (c) => c.html(<Page />));

// Gemini API は今まで通り /api/chat で提供
app.post("/api/chat", async (c) => {
  let body: { message?: string } | null = null;
  try {
    body = await c.req.json<{ message?: string }>();
  } catch {
    body = null;
  }

  const message = body?.message?.trim();
  if (!message) {
    return c.json({ error: "message は必須です" }, 400);
  }

  const res = await gemini.models.generateContent({
    model: "gemini-2.0-flash",
    contents: message,
  });

  const reply = res.text;
  return c.json({ reply });
});

export default app;

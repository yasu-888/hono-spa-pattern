/** @format */

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEYが設定されていません");
}

const gemini = new GoogleGenAI({ apiKey });
const app = new Hono();

// 1ページ分のフロントエンドをそのまま HTML で返す
app.get("/", (c) => {
  // htmlはindex.htmlに分けてもいい（分けるべき）
  // const html = readFileSync(join(process.cwd(), 'public/index.html'), 'utf8')
  const html = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>Hono + Gemini Sample</title>
    <style>
      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        max-width: 720px;
        margin: 40px auto;
        padding: 16px;
        line-height: 1.6;
      }
      h1 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
      }
      form {
        margin-bottom: 1rem;
      }
      textarea {
        width: 100%;
        box-sizing: border-box;
        min-height: 120px;
        padding: 8px;
      }
      button {
        margin-top: 8px;
        padding: 6px 12px;
        cursor: pointer;
      }
      .result {
        margin-top: 16px;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        white-space: pre-wrap;
      }
    </style>
  </head>
  <body>
    <h1>Hono × Gemini 超ミニサンプル</h1>
    <form id="chat-form">
      <label for="message">Gemini へのメッセージ</label><br />
      <textarea id="message" name="message" placeholder="例: TypeScript のユニオン型をざっくり説明して"></textarea><br />
      <button type="submit">送信</button>
    </form>

    <div id="result" class="result">まだ何も送っていません。</div>

    <script type="module">
      const form = document.getElementById('chat-form');
      const textarea = document.getElementById('message');
      const resultEl = document.getElementById('result');

      form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const content = textarea.value.trim();
        if (!content) {
          return;
        }

        resultEl.textContent = 'Gemini に問い合わせ中...';

        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: content })
          });

          if (!res.ok) {
            const text = await res.text();
            resultEl.textContent = 'エラー: ' + res.status + ' ' + text;
            return;
          }

          const data = await res.json();
          resultEl.textContent = data.reply ?? '(空のレスポンス)';
        } catch (err) {
          console.error(err);
          resultEl.textContent = 'ネットワークエラーかサーバーエラーが発生しました。';
        }
      });
    </script>
  </body>
</html>`;

  return c.html(html);
});

app.post("/api/chat", async (c) => {
  const body = (await c.req.json().catch(() => null)) as { message?: string } | null;

  const message = body?.message?.trim();
  if (!message) {
    return c.json({ error: "message は必須です" }, 400);
  }

  const res = await gemini.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: message,
  });

  const reply = res.text;

  return c.json({ reply }); // { reply: reply } の省略
});

// Node アダプタ（ヘルパー）で Hono アプリを起動（公式 Getting Started と同じ形）
serve(app, (info) => {
  console.log(`Listening on http://localhost:${info.port}`);
});

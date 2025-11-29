/** @format */

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { html } from "hono/html";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEYが設定されていません");
}

const gemini = new GoogleGenAI({ apiKey });
const app = new Hono();

// クライアント側の JS を html タグ付きテンプレートで持つ（ここは本来はclient.jsファイルなどに切り出した方がいい）
const clientScript = html`<script type="module">
  const form = document.getElementById("chat-form");
  const textarea = document.getElementById("message");
  const resultEl = document.getElementById("result");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const content = textarea.value.trim();
    if (!content) {
      return;
    }

    resultEl.textContent = "Gemini に問い合わせ中...";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: content }),
      });

      if (!res.ok) {
        const text = await res.text();
        resultEl.textContent = "エラー: " + res.status + " " + text;
        return;
      }

      const data = await res.json();
      resultEl.textContent = data.reply ?? "(空のレスポンス)";
    } catch (err) {
      console.error(err);
      resultEl.textContent = "ネットワークエラーかサーバーエラーが発生しました。";
    }
  });
</script>`;

const Page = () => (
  <html lang="ja">
    <head>
      <meta charSet="utf-8" />
      <title>Hono + Gemini Sample</title>
      {/* Tailwind Play CDN */}
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="min-h-screen bg-slate-50">
      <main class="max-w-2xl mx-auto py-10 px-4 space-y-6">
        <header>
          <h1 class="text-2xl font-bold text-slate-900">Hono × Gemini 超ミニサンプル (Tailwind 版)</h1>
          <p class="mt-1 text-sm text-slate-600">テキストを入力して Gemini に投げてみるだけの1ページアプリ。</p>
        </header>

        <section class="bg-white shadow-sm border border-slate-200 rounded-xl p-4 space-y-3">
          <form id="chat-form" class="space-y-3">
            <div>
              <label htmlFor="message" class="block text-sm font-medium text-slate-700">
                Gemini へのメッセージ
              </label>
              <textarea
                id="message"
                name="message"
                class="mt-1 block w-full min-h-[120px] rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
                placeholder="例: TypeScript のユニオン型をざっくり説明して"
              ></textarea>
            </div>

            <button
              type="submit"
              class="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              送信
            </button>
          </form>

          <div
            id="result"
            class="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 whitespace-pre-wrap"
          >
            まだ何も送っていません。
          </div>
        </section>
      </main>

      {clientScript}
    </body>
  </html>
);

app.get("/", (c) => {
  return c.html(<Page />);
});

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

serve(app, (info) => {
  console.log(`Listening on http://localhost:${info.port}`);
});

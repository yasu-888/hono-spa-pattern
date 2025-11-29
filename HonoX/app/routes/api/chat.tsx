/** @format */

import { createRoute } from "honox/factory";
import { env as nodeEnv } from "process";

export const POST = createRoute(async (c) => {
  // Cloudflare (c.env) 優先、ローカル Node 実行時は process.env をフォールバック
  const apiKey = c.env.GEMINI_API_KEY ?? nodeEnv.GEMINI_API_KEY;
  if (!apiKey) {
    return c.json({ error: "GEMINI_API_KEYが設定されていません" }, 500);
  }

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

  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
      apiKey,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: message }] }],
      }),
    }
  );

  if (!res.ok) {
    const error = await res.text();
    return c.json({ error: `Gemini API error: ${error}` }, 502);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!reply) {
    return c.json({ error: "Gemini APIから返答を取得できませんでした" }, 502);
  }

  return c.json({ reply });
});

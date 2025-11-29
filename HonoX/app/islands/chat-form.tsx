/** @format */

import { useState } from "hono/jsx";

export default function ChatForm() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("まだ何も送っていません。");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    const content = message.trim();
    if (!content) {
      return;
    }

    setResult("Gemini に問い合わせ中...");
    setIsLoading(true);

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
        setResult(`エラー: ${res.status} ${text}`);
        return;
      }

      const data = (await res.json()) as { reply?: string };
      setResult(data.reply ?? "(空のレスポンス)");
    } catch (err) {
      console.error(err);
      setResult("ネットワークエラーかサーバーエラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section>
      <form onSubmit={handleSubmit}>
        <label htmlFor="message">Geminiへメッセージ</label>
        <textarea
          id="message"
          name="message"
          placeholder="例: TypeScript のユニオン型をざっくり説明して"
          value={message}
          onInput={(e) => setMessage((e.target as HTMLTextAreaElement).value)}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "送信中..." : "送信"}
        </button>
        <span class="hint">Shift+Enter で改行</span>
      </form>

      <div id="result">{result}</div>
    </section>
  );
}

/** @format */

import { type FormEvent, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

type ChatResponse = {
  reply?: string;
  error?: string;
};

function App() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("まだ何も送っていません。");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = message.trim();
    if (!content) {
      return;
    }

    setIsLoading(true);
    setResult("Gemini に問い合わせ中...");

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

      const data: ChatResponse = await res.json();
      setResult(data.reply ?? "(空のレスポンス)");
    } catch (err) {
      console.error(err);
      setResult("ネットワークエラーかサーバーエラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>超ミニサンプル (Hono + React版)</h1>
      <form id="chat-form" onSubmit={handleSubmit}>
        <label htmlFor="message">Gemini へのメッセージ</label>
        <br />
        <textarea
          id="message"
          name="message"
          placeholder="例: TypeScript のユニオン型をざっくり説明して"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <br />
        <button type="submit" disabled={isLoading}>
          送信
        </button>
      </form>

      <div id="result" className="result">
        {result}
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

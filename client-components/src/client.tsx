/** @format */

import { render, useState } from "hono/jsx/dom";

const App = () => {
  const [input, setInput] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) {
        const text = await res.text();
        setError(`エラー: ${res.status} ${text}`);
        setReply(null);
      } else {
        const data: { reply?: string } = await res.json();
        setReply(data.reply ?? "(空のレスポンス)");
      }
    } catch (err) {
      console.error(err);
      setError("ネットワークエラーかサーバーエラーが発生しました。");
      setReply(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="space-y-4">
      <form
        onSubmit={onSubmit as any} // TS のイベント型が面倒なら一旦 any でもいい
        class="space-y-2"
      >
        <label htmlFor="message" class="block text-sm font-medium">
          Gemini へのメッセージ
        </label>
        <textarea
          id="message"
          name="message"
          class="w-full min-h-[120px] p-2 border rounded"
          value={input}
          onInput={(e) => setInput((e.target as HTMLTextAreaElement).value)}
          placeholder="例: TypeScript のユニオン型をざっくり説明して"
        />
        <button
          type="submit"
          class="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "送信中..." : "送信"}
        </button>
      </form>

      {error && <div class="border border-red-300 text-red-800 text-sm p-3 rounded">{error}</div>}

      {reply && !error && <div class="border rounded p-3 text-sm whitespace-pre-wrap bg-gray-50">{reply}</div>}
    </div>
  );
};

// SSR で吐いた <div id="root"></div> にマウント
const root = document.getElementById("root");
if (!root) {
  throw new Error("#root が見つかりません");
}

render(<App />, root);

/** @format */

import { createRoute } from "honox/factory";
import ChatForm from "../islands/chat-form";

export default createRoute((c) => {
  return c.render(
    <main>
      <title>Hono × Gemini 超ミニサンプル (HonoX版)</title>
      <header>
        <h1>Hono × Gemini 超ミニサンプル (HonoX版)</h1>
      </header>
      <ChatForm />
    </main>
  );
});

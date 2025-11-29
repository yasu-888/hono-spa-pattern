/** @format */

import type {} from "hono";

declare module "hono" {
  interface Env {
    Variables: {};
    Bindings: {
      GEMINI_API_KEY: string;
    };
  }
}

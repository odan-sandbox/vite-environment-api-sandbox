import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";

import { Hono } from "hono";

const _dirname = path.dirname(fileURLToPath(import.meta.url));

const app = new Hono();

// TODO: Remove a dependency of Node.js
app.get("/", async (c) => {
  let html = import.meta.env.DEV
    ? (await import("../client/index.html?transformIndexHtml")).default
    : await fs.readFile(path.resolve(_dirname, "./index.html"), "utf-8");

  return c.html(html);
});

export { app };

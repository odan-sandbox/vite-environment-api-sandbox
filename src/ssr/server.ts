import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

import { app } from "./main";

const port = 3000;

app.use(
  "/assets/*",
  serveStatic({
    root: "./dist/client",
  })
);

serve({ fetch: app.fetch, port }, ({ port }) => {
  console.log(`Server is running on http://localhost:${port}`);
});

import { getRequestListener } from "@hono/node-server";

import fs from "node:fs/promises";
import path from "node:path";

import {
  createServerModuleRunner,
  normalizePath,
  Plugin,
  ViteDevServer,
} from "vite";

export const environmentNames = {
  client: "client",
  ssr: "ssr",
};

const serverEntry = "./src/ssr/server.ts";

export function frameworkPlugin(): Plugin {
  const clientEntry = "./src/client/index.html";
  const ssrEntry = "./src/ssr/main.ts";

  let viteServer: ViteDevServer | undefined;

  return {
    name: "framework-plugin",
    config() {
      return {
        appType: "custom",
        environments: {
          [environmentNames.client]: {
            build: {
              rollupOptions: {
                input: normalizePath(path.resolve(clientEntry)),
              },
              outDir: "dist/client",
              emptyOutDir: false,
            },
          },
          [environmentNames.ssr]: {
            build: {
              rollupOptions: {
                input: normalizePath(path.resolve(serverEntry)),
              },
              outDir: "dist/ssr",
              emptyOutDir: false,
              copyPublicDir: false,
            },
          },
        },
        builder: {
          async buildApp(builder) {
            await fs.rm(path.resolve(builder.config.root, "dist"), {
              recursive: true,
              force: true,
            });

            await builder.build(builder.environments[environmentNames.client]);
            await builder.build(builder.environments[environmentNames.ssr]);

            await fs.rename(
              path.resolve(builder.config.root, "dist/client", clientEntry),
              path.resolve(builder.config.root, "dist/ssr/index.html")
            );
          },
        },
      };
    },
    async configureServer(server) {
      const ssrRunner = createServerModuleRunner(
        server.environments[environmentNames.ssr]
      );

      const module = await ssrRunner.import(ssrEntry);

      const handler = getRequestListener(module.app.fetch);

      return () => server.middlewares.use(handler);
    },
    async load(id) {
      console.log("load id", id);

      if (id.endsWith("?transformIndexHtml")) {
        const cleanId = id.replace("?transformIndexHtml", "");
        let content = await fs.readFile(cleanId, "utf-8");
        if (viteServer) {
          content = await viteServer.transformIndexHtml("/", content);
        }
        return `export default ${JSON.stringify(content)}`;
      }
    },
  };
}

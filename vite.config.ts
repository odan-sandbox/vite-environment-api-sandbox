import { defineConfig } from "vite";
import { frameworkPlugin } from "./framework";

export default defineConfig({
  plugins: [frameworkPlugin()],
});

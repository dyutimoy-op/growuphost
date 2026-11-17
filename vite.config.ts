process.env["NITRO_PRESET"] = process.env["NITRO_PRESET"] || "node-server";

import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  server: {
    allowedHosts: true,
  },
});

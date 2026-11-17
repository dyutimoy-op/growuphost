import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || "3000";
const host = process.env.HOST || "0.0.0.0";

process.env.PORT = port;
process.env.HOST = host;
process.env.NODE_ENV = process.env.NODE_ENV || "production";

const serverPath = path.resolve(__dirname, ".output", "server", "index.mjs");

if (!fs.existsSync(serverPath)) {
  console.error("=================================================================");
  console.error("[GrowUpHost cPanel] ERROR: Standalone server build not found!");
  console.error(`Looking for: ${serverPath}`);
  console.error("Please run 'npm run build' before starting, or ensure the '.output'");
  console.error("folder was completely uploaded to your cPanel directory.");
  console.error("=================================================================");
  process.exit(1);
}

console.log(`[GrowUpHost cPanel] Starting server on ${host}:${port}...`);

try {
  await import("./.output/server/index.mjs");
  console.log(`[GrowUpHost cPanel] Ready! Listening on http://${host}:${port}/`);
} catch (error) {
  console.error("[GrowUpHost cPanel] Fatal server bootstrap error:", error);
  process.exit(1);
}

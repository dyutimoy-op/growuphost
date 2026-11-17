import { createFileRoute } from "@tanstack/react-router";

import { MEDIA_BUCKET, encodeObjectPath, mediaObjectPath } from "@/lib/media-url";

const SERVEABLE_CONTENT_TYPES: readonly string[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/ogg",
];

const FORWARDED_REQUEST_HEADERS: readonly string[] = [
  "if-none-match",
  "if-modified-since",
  "range",
];

const FORWARDED_RESPONSE_HEADERS: readonly string[] = [
  "content-type",
  "content-length",
  "etag",
  "last-modified",
  "accept-ranges",
  "content-range",
];

const SUCCESS_CACHE_CONTROL = "public, max-age=31536000, immutable";

interface StorageConfig {
  url: string;
  key: string;
}

function readStorageConfig(): StorageConfig | null {
  const url = import.meta.env["VITE_SUPABASE_URL"] || process.env["SUPABASE_URL"];
  const key =
    import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || process.env["SUPABASE_PUBLISHABLE_KEY"];

  if (typeof url !== "string" || url.length === 0) return null;
  if (typeof key !== "string" || key.length === 0) return null;
  return { url: url.replace(/\/+$/, ""), key };
}

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function upstreamHeaders(request: Request, key: string): Headers {
  const headers = new Headers({ apikey: key });
  if (!isNewSupabaseApiKey(key)) headers.set("Authorization", `Bearer ${key}`);

  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value !== null) headers.set(name, value);
  }
  return headers;
}

function notFound(): Response {
  return new Response("Not found", {
    status: 404,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function responseHeaders(upstream: Response): Headers {
  const headers = new Headers();

  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value !== null) headers.set(name, value);
  }

  const contentType = (headers.get("content-type") ?? "").split(";")[0]?.trim().toLowerCase() ?? "";
  if (!SERVEABLE_CONTENT_TYPES.includes(contentType)) {
    headers.set("Content-Type", "application/octet-stream");
    headers.set("Content-Disposition", "attachment");
  }

  headers.set("Cache-Control", SUCCESS_CACHE_CONTROL);
  headers.set("X-Content-Type-Options", "nosniff");
  return headers;
}

export const Route = createFileRoute("/media/$")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const objectPath = mediaObjectPath(new URL(request.url).pathname);
        if (objectPath === null) return notFound();

        const config = readStorageConfig();
        if (config === null) {
          console.error(
            "[media] SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY are not set, so media cannot be served.",
          );
          return new Response("Media is not configured", {
            status: 500,
            headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
          });
        }

        const target = `${config.url}/storage/v1/object/${MEDIA_BUCKET}/${encodeObjectPath(objectPath)}`;

        let upstream: Response;
        try {
          upstream = await fetch(target, {
            headers: upstreamHeaders(request, config.key),

            redirect: "manual",
          });
        } catch (error) {
          console.error(`[media] could not reach storage for "${objectPath}":`, error);
          return notFound();
        }

        if (upstream.status === 304) {
          const headers = responseHeaders(upstream);
          headers.delete("content-length");
          return new Response(null, { status: 304, headers });
        }

        if (upstream.status !== 200 && upstream.status !== 206) {
          console.error(`[media] storage returned ${upstream.status} for "${objectPath}"`);
          return notFound();
        }

        return new Response(upstream.body, {
          status: upstream.status,
          headers: responseHeaders(upstream),
        });
      },
    },
  },
});

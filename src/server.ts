import "./lib/error-capture";

import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

const startHandler = createStartHandler(defaultStreamHandler);

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

function applyCachingHeaders(request: Request, response: Response): Response {
  if (request.method !== "GET" || response.status !== 200) return response;

  try {
    const url = new URL(request.url);
    const path = url.pathname.toLowerCase();

    if (
      path.startsWith("/assets/") ||
      path.startsWith("/growuphost/") ||
      /\.(png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot|css|js)$/.test(path)
    ) {
      const headers = new Headers(response.headers);
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    if (
      !path.startsWith("/_authenticated") &&
      !path.startsWith("/auth") &&
      !path.startsWith("/api")
    ) {
      const headers = new Headers(response.headers);
      if (!headers.has("Cache-Control")) {
        headers.set(
          "Cache-Control",
          "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
        );
      }
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }
  } catch {
    // If URL parsing fails, pass through original response
  }

  return response;
}

export default {
  async fetch(request: Request) {
    try {
      const response = await startHandler(request);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      return applyCachingHeaders(request, normalized);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

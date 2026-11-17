declare global {
  interface Window {
    dataLayer?: unknown[] | undefined;
  }
}

const GTAG_BASE_SRC = "https://www.googletagmanager.com/gtag/js";
const GA_MARKER_ATTR = "data-ga-measurement-id";

const injectedIds = new Set<string>();

function findExistingTag(measurementId: string): Element | null {
  for (const script of document.querySelectorAll(`script[${GA_MARKER_ATTR}]`)) {
    if (script.getAttribute(GA_MARKER_ATTR) === measurementId) return script;
  }

  for (const script of document.querySelectorAll("script[src]")) {
    if (!(script instanceof HTMLScriptElement)) continue;
    if (script.src.startsWith(GTAG_BASE_SRC) && script.src.includes(measurementId)) return script;
  }
  return null;
}

export function injectGoogleAnalytics(measurementId: string | null | undefined): boolean {
  const id = measurementId?.trim() ?? "";
  if (!id) return false;
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  if (injectedIds.has(id)) return false;
  if (findExistingTag(id)) {
    injectedIds.add(id);
    return false;
  }

  const script = document.createElement("script");
  script.src = `${GTAG_BASE_SRC}?id=${encodeURIComponent(id)}`;
  script.async = true;
  script.setAttribute(GA_MARKER_ATTR, id);
  document.head.appendChild(script);

  const dataLayer: unknown[] = window.dataLayer ?? [];
  window.dataLayer = dataLayer;
  const gtag = (...args: unknown[]): void => {
    dataLayer.push(args);
  };
  gtag("js", new Date());
  gtag("config", id);

  injectedIds.add(id);
  return true;
}

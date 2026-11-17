const DEFAULT_SITE_ORIGIN = "https://growuphost.com";

function readEnvSiteOrigin(): string | undefined {
  const raw = import.meta.env["VITE_SITE_ORIGIN"];
  return typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : undefined;
}

export const SITE_ORIGIN = (readEnvSiteOrigin() ?? DEFAULT_SITE_ORIGIN).replace(/\/+$/, "");

export const SITE_NAME = "GROWUPHOST";

export function normalizePath(path: string): string {
  const withoutQuery = path.split("#")[0]?.split("?")[0] ?? "/";
  const withLeadingSlash = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
  if (withLeadingSlash === "/") return "/";
  return withLeadingSlash.replace(/\/+$/, "");
}

export function absoluteUrl(path: string): string {
  const normalized = normalizePath(path);
  return normalized === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${normalized}`;
}

export function canonicalUrl(path: string): string {
  return absoluteUrl(path);
}

export function canonicalLink(path: string): { rel: "canonical"; href: string } {
  return { rel: "canonical", href: canonicalUrl(path) };
}

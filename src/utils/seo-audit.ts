import { supabase } from "@/integrations/supabase/client";
import { canonicalUrl, normalizePath } from "@/lib/seo/canonical";
import { STATIC_PUBLIC_ROUTES, isCoveredByStaticRoute, isPrivatePath } from "@/lib/seo/routes";

export interface SEOAuditIssue {
  type: "error" | "warning" | "info";
  message: string;

  route: string;
}

export interface SEOAuditResult {
  score: number;
  last_run: string;
  issues: SEOAuditIssue[];

  scope: string;

  audited_routes: string[];

  failed_routes: string[];
}

const SETTINGS_KEY = "seo_audit_results";

const MAX_DYNAMIC_ROUTES = 20;

const FETCH_CONCURRENCY = 4;

const TITLE_MIN = 30;
const TITLE_MAX = 65;
const DESCRIPTION_MIN = 50;
const DESCRIPTION_MAX = 165;

const WEIGHTS: Record<SEOAuditIssue["type"], number> = {
  error: 8,
  warning: 3,
  info: 0,
};

interface FetchedRoute {
  path: string;
  doc: Document;
}

function attr(element: Element | null, name: string): string {
  return element?.getAttribute(name)?.trim() ?? "";
}

function metaContent(doc: Document, selector: string): string {
  return attr(doc.querySelector(selector), "content");
}

async function collectRoutes(): Promise<string[]> {
  const paths = STATIC_PUBLIC_ROUTES.map((route) => route.path);

  const { data, error } = await supabase
    .from("categories")
    .select("slug")
    .order("display_order", { ascending: true })
    .limit(MAX_DYNAMIC_ROUTES);

  if (error) {
    console.error("[seo-audit] could not list categories:", error.message);
    return paths;
  }

  for (const row of data ?? []) {
    const slug = row.slug?.trim();
    if (!slug) continue;
    const path = normalizePath(`/${slug}`);
    if (isPrivatePath(path)) continue;
    if (isCoveredByStaticRoute(path)) continue;
    if (paths.includes(path)) continue;
    paths.push(path);
  }

  return paths;
}

function auditDocument(route: string, doc: Document, issues: SEOAuditIssue[]): void {
  const push = (type: SEOAuditIssue["type"], message: string): void => {
    issues.push({ type, message, route });
  };

  const title = doc.querySelector("title")?.textContent?.trim() ?? "";
  if (!title) push("error", "Missing <title>");
  else if (title.length < TITLE_MIN) push("warning", `Title is short (${title.length} chars)`);
  else if (title.length > TITLE_MAX)
    push("warning", `Title may be truncated in search results (${title.length} chars)`);

  const description = metaContent(doc, 'meta[name="description"]');
  if (!description) push("error", "Missing meta description");
  else if (description.length < DESCRIPTION_MIN)
    push("warning", `Meta description is short (${description.length} chars)`);
  else if (description.length > DESCRIPTION_MAX)
    push("warning", `Meta description may be truncated (${description.length} chars)`);

  const canonicals = Array.from(doc.querySelectorAll('link[rel="canonical"]'));
  const expected = canonicalUrl(route);
  if (canonicals.length === 0) {
    push("error", "No canonical tag");
  } else if (canonicals.length > 1) {
    push(
      "error",
      `${canonicals.length} canonical tags on one page (${canonicals
        .map((link) => attr(link, "href"))
        .join(", ")})`,
    );
  } else if (attr(canonicals[0] ?? null, "href") !== expected) {
    push(
      "warning",
      `Canonical points at ${attr(canonicals[0] ?? null, "href") || "(empty)"} instead of ${expected}`,
    );
  }

  const robots = metaContent(doc, 'meta[name="robots"]').toLowerCase();
  if (robots.includes("noindex")) {
    push("error", "Public route is marked noindex but is listed as indexable");
  }

  const h1s = doc.querySelectorAll("h1");
  if (h1s.length === 0) push("error", "No <h1> in the server-rendered HTML");
  else if (h1s.length > 1) push("warning", `${h1s.length} <h1> elements on one page`);

  if (!metaContent(doc, 'meta[property="og:title"]')) push("warning", "Missing og:title");
  if (!metaContent(doc, 'meta[property="og:description"]'))
    push("warning", "Missing og:description");
  if (!metaContent(doc, 'meta[property="og:url"]')) push("warning", "Missing og:url");
  if (!metaContent(doc, 'meta[property="og:image"]'))
    push("info", "No og:image — social shares will render without a preview image");

  if (!attr(doc.documentElement, "lang")) push("warning", "<html> has no lang attribute");

  const images = Array.from(doc.querySelectorAll("img"));
  const missingAlt = images.filter((img) => !attr(img, "alt"));
  if (missingAlt.length > 0) {
    push(
      "warning",
      `${missingAlt.length} of ${images.length} server-rendered image(s) missing alt text`,
    );
  }

  if (doc.querySelectorAll('script[type="application/ld+json"]').length === 0) {
    push("info", "No JSON-LD structured data");
  }
}

function auditCrossRoute(routes: FetchedRoute[], issues: SEOAuditIssue[]): void {
  const titles = new Map<string, string[]>();
  const descriptions = new Map<string, string[]>();

  for (const { path, doc } of routes) {
    const title = doc.querySelector("title")?.textContent?.trim() ?? "";
    const description = metaContent(doc, 'meta[name="description"]');
    if (title) titles.set(title, [...(titles.get(title) ?? []), path]);
    if (description)
      descriptions.set(description, [...(descriptions.get(description) ?? []), path]);
  }

  for (const [, paths] of titles) {
    if (paths.length < 2) continue;
    for (const path of paths) {
      issues.push({
        type: "error",
        message: `Duplicate <title> shared with: ${paths.filter((p) => p !== path).join(", ")}`,
        route: path,
      });
    }
  }

  for (const [, paths] of descriptions) {
    if (paths.length < 2) continue;
    for (const path of paths) {
      issues.push({
        type: "warning",
        message: `Duplicate meta description shared with: ${paths
          .filter((p) => p !== path)
          .join(", ")}`,
        route: path,
      });
    }
  }
}

async function fetchRoute(path: string): Promise<{ path: string; doc?: Document; error?: string }> {
  try {
    const response = await fetch(path, {
      headers: { Accept: "text/html" },
      redirect: "follow",
    });
    if (!response.ok) return { path, error: `HTTP ${response.status}` };
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    return { path, doc };
  } catch (cause) {
    return { path, error: cause instanceof Error ? cause.message : "fetch failed" };
  }
}

async function fetchAll(
  paths: string[],
): Promise<Array<{ path: string; doc?: Document; error?: string }>> {
  const results: Array<{ path: string; doc?: Document; error?: string }> = [];
  let cursor = 0;

  const workers = Array.from({ length: Math.min(FETCH_CONCURRENCY, paths.length) }, async () => {
    for (;;) {
      const index = cursor++;
      const path = paths[index];
      if (path === undefined) return;
      results.push(await fetchRoute(path));
    }
  });

  await Promise.all(workers);
  return results;
}

export const runSEOAudit = async (): Promise<SEOAuditResult> => {
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    throw new Error("runSEOAudit() must be called from the browser.");
  }

  const paths = await collectRoutes();
  const fetched = await fetchAll(paths);

  const issues: SEOAuditIssue[] = [];
  const audited: FetchedRoute[] = [];
  const failed: string[] = [];

  for (const result of fetched) {
    if (result.doc) {
      audited.push({ path: result.path, doc: result.doc });
    } else {
      failed.push(result.path);
      issues.push({
        type: "error",
        message: `Route could not be fetched (${result.error ?? "unknown error"})`,
        route: result.path,
      });
    }
  }

  audited.sort((a, b) => paths.indexOf(a.path) - paths.indexOf(b.path));

  for (const route of audited) {
    auditDocument(route.path, route.doc, issues);
  }
  auditCrossRoute(audited, issues);

  const deductions = issues.reduce((total, issue) => total + WEIGHTS[issue.type], 0);
  const score = Math.max(0, Math.min(100, 100 - deductions));

  const auditedPaths = audited.map((route) => route.path);
  const result: SEOAuditResult = {
    score,
    last_run: new Date().toISOString(),
    issues,
    scope: `Server-rendered HTML of ${auditedPaths.length} public route(s)${
      failed.length > 0 ? ` (${failed.length} unreachable)` : ""
    }. Content rendered only after hydration — product grids and client-loaded images — is not inspected.`,
    audited_routes: auditedPaths,
    failed_routes: failed,
  };

  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: SETTINGS_KEY, value: JSON.stringify(result) }, { onConflict: "key" });

  if (error) {
    console.error("[seo-audit] failed to save results:", error.message);
    throw new Error(`Audit ran but could not be saved: ${error.message}`);
  }

  return result;
};

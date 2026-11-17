import { absoluteUrl } from "./canonical";
import type { ChangeFreq } from "./routes";

export interface SitemapEntry {
  path: string;
  changefreq?: ChangeFreq;

  priority?: number;

  lastmod?: string;
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function toSitemapDate(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10);
}

function formatPriority(priority: number): string {
  const clamped = Math.min(1, Math.max(0, priority));
  return clamped.toFixed(1);
}

function renderUrl(entry: SitemapEntry): string {
  const parts = [`    <loc>${escapeXml(absoluteUrl(entry.path))}</loc>`];
  if (entry.lastmod) parts.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
  if (entry.changefreq) parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
  if (entry.priority !== undefined) {
    parts.push(`    <priority>${formatPriority(entry.priority)}</priority>`);
  }
  return `  <url>\n${parts.join("\n")}\n  </url>`;
}

export function buildSitemapXml(entries: readonly SitemapEntry[]): string {
  const seen = new Set<string>();
  const unique: SitemapEntry[] = [];
  for (const entry of entries) {
    const url = absoluteUrl(entry.path);
    if (seen.has(url)) continue;
    seen.add(url);
    unique.push(entry);
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...unique.map(renderUrl),
    "</urlset>",
    "",
  ].join("\n");
}

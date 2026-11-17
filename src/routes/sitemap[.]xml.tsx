import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { STATIC_PUBLIC_ROUTES, isCoveredByStaticRoute, isPrivatePath } from "@/lib/seo/routes";
import { buildSitemapXml, toSitemapDate, type SitemapEntry } from "@/lib/seo/sitemap";

const CATEGORY_CHANGEFREQ = "weekly" as const;
const CATEGORY_PRIORITY = 0.7;

async function loadCategoryEntries(): Promise<SitemapEntry[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("slug, created_at")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[sitemap] failed to load categories:", error.message);
    return [];
  }

  const entries: SitemapEntry[] = [];
  for (const row of data ?? []) {
    const slug = row.slug?.trim();
    if (!slug) continue;
    const path = `/${slug}`;

    if (isPrivatePath(path)) continue;

    if (isCoveredByStaticRoute(path)) continue;

    const lastmod = toSitemapDate(row.created_at);
    entries.push({
      path,
      changefreq: CATEGORY_CHANGEFREQ,
      priority: CATEGORY_PRIORITY,
      ...(lastmod ? { lastmod } : {}),
    });
  }
  return entries;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const categoryEntries = await loadCategoryEntries();
        const xml = buildSitemapXml([
          ...STATIC_PUBLIC_ROUTES.map((route) => ({
            path: route.path,
            changefreq: route.changefreq,
            priority: route.priority,
          })),
          ...categoryEntries,
        ]);

        return new Response(xml, {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      },
    },
  },
});

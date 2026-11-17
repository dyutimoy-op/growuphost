import { queryOptions, type QueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { prefetchForSSR } from "@/lib/prefetch";

import type { PlanProduct } from "./plan-data";

export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export const CATEGORY_STALE_TIME = 5 * 60 * 1000;

async function fetchCategoryBySlug(slug: string): Promise<CategoryRow | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function fetchCategoryProducts(categoryId: string | undefined): Promise<PlanProduct[]> {
  if (!categoryId) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("category_id", categoryId)
    .order("price", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export function categoryQueryOptions(slug: string) {
  return queryOptions({
    queryKey: ["category", slug] as const,
    queryFn: () => fetchCategoryBySlug(slug),
    staleTime: CATEGORY_STALE_TIME,
  });
}

export function categoryProductsQueryOptions(slug: string, categoryId: string | undefined) {
  return queryOptions({
    queryKey: ["products", slug] as const,
    queryFn: () => fetchCategoryProducts(categoryId),
    enabled: Boolean(categoryId),
    staleTime: CATEGORY_STALE_TIME,
  });
}

export type CategoryLandingResult =
  { status: "ok"; category: CategoryRow } | { status: "missing" } | { status: "unavailable" };

export async function prefetchCategoryLanding(
  queryClient: QueryClient,
  slug: string,
): Promise<CategoryLandingResult> {
  const category = await prefetchForSSR(queryClient, categoryQueryOptions(slug));

  if (category === undefined) return { status: "unavailable" };
  if (category === null) return { status: "missing" };

  await prefetchForSSR(queryClient, categoryProductsQueryOptions(slug, category.id));

  return { status: "ok", category };
}

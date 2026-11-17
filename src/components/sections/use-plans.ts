import { queryOptions, useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

import type { PlanProduct } from "./plan-data";

export const HOME_PLANS_QUERY_KEY = ["products-featured"] as const;

async function fetchHomePlans(): Promise<PlanProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .order("price", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export function homePlansQueryOptions() {
  return queryOptions({
    queryKey: HOME_PLANS_QUERY_KEY,
    queryFn: fetchHomePlans,
    staleTime: 60_000,
  });
}

export function useHomePlans() {
  return useQuery(homePlansQueryOptions());
}

export function pickShowcasePlans(
  products: readonly PlanProduct[] | undefined,
  limit = 6,
): PlanProduct[] {
  if (!products || products.length === 0) return [];
  const featured = products.filter((product) => product.is_featured === true);
  const rest = products.filter((product) => product.is_featured !== true);
  return [...featured, ...rest].slice(0, limit);
}

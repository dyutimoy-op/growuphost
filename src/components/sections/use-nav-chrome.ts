import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type NavCategory = Database["public"]["Tables"]["categories"]["Row"];
export type NewsAlert = Database["public"]["Tables"]["news_alerts"]["Row"];

const NAV_CHROME_STALE_TIME = 5 * 60 * 1000;

async function fetchNavCategories(): Promise<NavCategory[]> {
  const { data, error } = await supabase.from("categories").select("*");
  if (error) throw error;
  return data;
}

async function fetchNewsAlert(): Promise<NewsAlert | null> {
  const { data, error } = await supabase
    .from("news_alerts")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return data;
}

export function navCategoriesQueryOptions() {
  return queryOptions({
    queryKey: ["categories"] as const,
    queryFn: fetchNavCategories,
    staleTime: NAV_CHROME_STALE_TIME,
  });
}

export function newsAlertQueryOptions() {
  return queryOptions({
    queryKey: ["news-alert"] as const,
    queryFn: fetchNewsAlert,
    staleTime: NAV_CHROME_STALE_TIME,
  });
}

import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function siteSettingsQueryOptions() {
  return queryOptions({
    queryKey: ["site-settings"] as const,
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) throw error;

      const settings: Record<string, string> = {};
      data.forEach((s) => {
        settings[s.key] = s.value || "";
      });
      return settings;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSiteSettings() {
  return useQuery(siteSettingsQueryOptions());
}

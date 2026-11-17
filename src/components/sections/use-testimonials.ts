import { queryOptions, useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];

export const TESTIMONIALS_QUERY_KEY = ["testimonials-public"] as const;

async function fetchTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export function testimonialsQueryOptions() {
  return queryOptions({
    queryKey: TESTIMONIALS_QUERY_KEY,
    queryFn: fetchTestimonials,
    staleTime: 60_000,
  });
}

export function useTestimonials() {
  return useQuery(testimonialsQueryOptions());
}

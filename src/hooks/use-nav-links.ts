import { queryOptions, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { navLinkShowsOn, type NavLinkRecord, type NavLinkSurface } from "@/config/nav-links";
import { sanitizeUrl } from "@/config/whmcs";
import { getNavLinks } from "@/lib/nav-links.functions";

export type NavLinkRow = NavLinkRecord;

export {
  NAV_LINK_PLACEMENTS,
  type NavLinkPlacement,
  type NavLinkSurface,
} from "@/config/nav-links";

const NAV_LINKS_STALE_TIME = 5 * 60 * 1000;

async function fetchNavLinks(): Promise<NavLinkRow[]> {
  const links = await getNavLinks();
  return links.filter((link) => link.is_active);
}

export function navLinksQueryOptions() {
  return queryOptions({
    queryKey: ["nav-links"] as const,
    queryFn: fetchNavLinks,
    staleTime: NAV_LINKS_STALE_TIME,
  });
}

function isRenderable(link: NavLinkRow): boolean {
  return sanitizeUrl(link.url, "").length > 0;
}

export function useNavLinks(surface: NavLinkSurface): NavLinkRow[] {
  const { data } = useQuery(navLinksQueryOptions());

  return useMemo(
    () => (data ?? []).filter((link) => navLinkShowsOn(link, surface) && isRenderable(link)),
    [data, surface],
  );
}

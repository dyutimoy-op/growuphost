import { QueryClient, dehydrate, hydrate, type DehydratedState } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

const SSR_DEHYDRATED_QUERY_KEYS = new Set([
  "site-settings",
  "categories",
  "news-alert",
  "nav-links",
  "category",
  "products",
  "products-featured",
  "testimonials-public",
  "categories-all",
  "products-all",
]);

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 24 * 60 * 60 * 1000,
        refetchOnWindowFocus: false, // Prevent laggy re-fetching on tab switches
        refetchOnReconnect: "always",
        retry: 2,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,

    defaultPreload: "intent",
    defaultPreloadDelay: 50,
    defaultPreloadStaleTime: 60_000,

    dehydrate: () => ({
      queryClientState: JSON.stringify(
        dehydrate(queryClient, {
          shouldDehydrateQuery: (query) => {
            if (query.state.status !== "success") return false;
            const key = query.queryKey[0];
            return typeof key === "string" && SSR_DEHYDRATED_QUERY_KEYS.has(key);
          },
        }),
      ),
    }),
    hydrate: (dehydrated) => {
      hydrate(queryClient, JSON.parse(dehydrated.queryClientState) as DehydratedState);
    },
  });

  return router;
};

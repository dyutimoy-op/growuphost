import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useSiteSettings, siteSettingsQueryOptions } from "@/hooks/use-site-settings";
import { navLinksQueryOptions } from "@/hooks/use-nav-links";
import { useSourceViewDeterrent } from "@/hooks/use-source-view-deterrent";
import {
  navCategoriesQueryOptions,
  newsAlertQueryOptions,
} from "@/components/sections/use-nav-chrome";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { PromoPopup } from "@/components/PromoPopup";
import { Toaster } from "sonner";
import { injectGoogleAnalytics } from "@/lib/seo/analytics";
import { organizationJsonLd } from "@/lib/seo/jsonld";
import { prefetchForSSR } from "@/lib/prefetch";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async ({ context }) => {
    await Promise.all([
      prefetchForSSR(context.queryClient, siteSettingsQueryOptions()),
      prefetchForSSR(context.queryClient, navCategoriesQueryOptions()),
      prefetchForSSR(context.queryClient, newsAlertQueryOptions()),
      prefetchForSSR(context.queryClient, navLinksQueryOptions()),
    ]);
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "GROWUPHOST | Premium Enterprise Hosting Mumbai" },
      {
        name: "description",
        content:
          "High-performance enterprise infrastructure in Mumbai. NVMe Shared Hosting, VPS, and Dedicated Servers with 99.9% uptime guarantee.",
      },
      { name: "author", content: "GROWUPHOST" },
      { property: "og:title", content: "GROWUPHOST | Premium Enterprise Hosting Mumbai" },
      {
        property: "og:description",
        content:
          "High-performance enterprise infrastructure in Mumbai. NVMe Shared Hosting, VPS, and Dedicated Servers.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "GROWUPHOST" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@growuphost" },
      { name: "theme-color", content: "#2563eb" },

      { "script:ld+json": organizationJsonLd() },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap",
      },
      {
        rel: "preload",
        href: "/growuphost/logo.png",
        as: "image",
        type: "image/png",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "shortcut icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

const NOSCRIPT_REVEAL_CSS =
  "[data-reveal]{opacity:1!important;transform:none!important;filter:none!important}";

const THEME_INIT_SCRIPT = `
(function() {
  try {
    var saved = localStorage.getItem('growuphost_theme_v2');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch (e) {
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

function RootShell({ children }: { children: ReactNode }) {
  const { queryClient } = Route.useRouteContext();

  return (
    <html lang="en" data-theme="light">
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <noscript dangerouslySetInnerHTML={{ __html: `<style>${NOSCRIPT_REVEAL_CSS}</style>` }} />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          <Scripts />
        </QueryClientProvider>
      </body>
    </html>
  );
}

function RootComponent() {
  const { data: settings } = useSiteSettings();

  useSourceViewDeterrent();

  const googleAnalyticsId = settings?.["google_analytics_id"] ?? "";

  useEffect(() => {
    injectGoogleAnalytics(googleAnalyticsId);
  }, [googleAnalyticsId]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to content
      </a>

      <Toaster position="top-center" richColors />
      <PromoPopup />
      <Outlet />
    </>
  );
}

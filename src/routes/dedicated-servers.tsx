import { createFileRoute } from "@tanstack/react-router";

import { CategoryLandingPage } from "@/components/sections/CategoryLandingPage";
import { prefetchCategoryLanding } from "@/components/sections/use-category-products";
import { buildPageHead } from "@/lib/seo/head";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo/jsonld";

const PATH = "/dedicated-servers";
const CATEGORY_SLUG = "dedicated-servers";

export const Route = createFileRoute("/dedicated-servers")({
  component: DedicatedServersPage,

  loader: async ({ context }) => {
    await prefetchCategoryLanding(context.queryClient, CATEGORY_SLUG);
  },
  head: () =>
    buildPageHead({
      title: "Offshore Dedicated Servers Mumbai | Bare Metal | GROWUPHOST",
      description:
        "Bulletproof offshore dedicated servers in Mumbai. 100% dedicated bare-metal hardware, NVMe storage, and DDoS-protected bandwidth for mission-critical workloads.",
      path: PATH,
      ogTitle: "Dedicated Servers Mumbai | Bare Metal Infrastructure",
      ogDescription:
        "Unmatched bare-metal performance for mission-critical workloads, hosted in Mumbai.",
      jsonLd: [
        serviceJsonLd({
          name: "Dedicated Servers",
          serviceType: "Dedicated server hosting",
          description:
            "Single-tenant bare-metal servers in Tier 3 data centres, with dedicated hardware and DDoS-protected bandwidth.",
          path: PATH,
        }),
        breadcrumbJsonLd([
          { name: "Hosting Packages", path: "/packages" },
          { name: "Dedicated Servers", path: PATH },
        ]),
      ],
    }),
});

function DedicatedServersPage() {
  return (
    <CategoryLandingPage
      categorySlug={CATEGORY_SLUG}
      eyebrow="Single-Tenant Bare Metal"
      title="Dedicated Hardware"
      subtitle="Raw power with cheap bulletproof dedicated servers. Secure offshore antiban hardware for mission-critical enterprise workloads."
      gridTitle="ENTERPRISE NODES"
      gridSubtitle="High-availability hardware in Tier 3 data centers across the globe."
    />
  );
}

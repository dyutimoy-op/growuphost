import { createFileRoute } from "@tanstack/react-router";

import { CategoryLandingPage } from "@/components/sections/CategoryLandingPage";
import { prefetchCategoryLanding } from "@/components/sections/use-category-products";
import { buildPageHead } from "@/lib/seo/head";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo/jsonld";

const PATH = "/shared-hosting";
const CATEGORY_SLUG = "shared-hosting";

export const Route = createFileRoute("/shared-hosting")({
  component: SharedHostingPage,

  loader: async ({ context }) => {
    await prefetchCategoryLanding(context.queryClient, CATEGORY_SLUG);
  },
  head: () =>
    buildPageHead({
      title: "Offshore Shared Hosting Mumbai | LiteSpeed NVMe | GROWUPHOST",
      description:
        "Affordable offshore shared hosting in Mumbai, running LiteSpeed on pure NVMe storage. DDoS-protected infrastructure, 24/7 support, and a 99.9% uptime target.",
      path: PATH,
      ogTitle: "Shared Hosting Mumbai | Fast LiteSpeed NVMe Hosting",
      ogDescription:
        "Scale your website on LiteSpeed + NVMe shared hosting from our Mumbai infrastructure.",
      jsonLd: [
        serviceJsonLd({
          name: "Shared Hosting",
          serviceType: "Web hosting",
          description:
            "LiteSpeed-powered shared hosting on NVMe storage, hosted in Tier 3 Mumbai data centres.",
          path: PATH,
        }),
        breadcrumbJsonLd([
          { name: "Hosting Packages", path: "/packages" },
          { name: "Shared Hosting", path: PATH },
        ]),
      ],
    }),
});

function SharedHostingPage() {
  return (
    <CategoryLandingPage
      categorySlug={CATEGORY_SLUG}
      eyebrow="LiteSpeed · Pure NVMe"
      title="Shared Hosting"
      subtitle="Cheap trusted offshore webhosting and antiban solutions. Fast, secure, and affordable hosting powered by LiteSpeed and NVMe storage."
      gridTitle="CHOOSE YOUR PLAN"
      gridSubtitle="Simple pricing that scales with your growth. No hidden fees."
    />
  );
}

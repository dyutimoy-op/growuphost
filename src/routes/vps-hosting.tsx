import { createFileRoute } from "@tanstack/react-router";

import { CategoryLandingPage } from "@/components/sections/CategoryLandingPage";
import { prefetchCategoryLanding } from "@/components/sections/use-category-products";
import { buildPageHead } from "@/lib/seo/head";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo/jsonld";

const PATH = "/vps-hosting";
const CATEGORY_SLUG = "vps-hosting";

export const Route = createFileRoute("/vps-hosting")({
  component: VPSHostingPage,

  loader: async ({ context }) => {
    await prefetchCategoryLanding(context.queryClient, CATEGORY_SLUG);
  },
  head: () =>
    buildPageHead({
      title: "Offshore VPS Hosting Mumbai | NVMe Cloud Servers | GROWUPHOST",
      description:
        "Bulletproof offshore VPS hosting in Mumbai with dedicated vCPU, NVMe storage, and full root access. Private, DDoS-protected cloud servers that scale on demand.",
      path: PATH,
      ogTitle: "NVMe VPS Mumbai | Enterprise Cloud Servers",
      ogDescription:
        "Dedicated cloud resources on NVMe storage with full root access, hosted in Mumbai.",
      jsonLd: [
        serviceJsonLd({
          name: "VPS Hosting",
          serviceType: "Virtual private server hosting",
          description:
            "Virtual private servers with dedicated vCPU and RAM, NVMe storage, and full root access.",
          path: PATH,
        }),
        breadcrumbJsonLd([
          { name: "Hosting Packages", path: "/packages" },
          { name: "VPS Hosting", path: PATH },
        ]),
      ],
    }),
});

function VPSHostingPage() {
  return (
    <CategoryLandingPage
      categorySlug={CATEGORY_SLUG}
      eyebrow="Full Root · NVMe Cloud"
      title="VPS Servers"
      subtitle="Experience privacy and power with our cheap bulletproof VPS and offshore servers. High-performance antiban infrastructure."
      gridTitle="VPS CONFIGURATIONS"
      gridSubtitle="Choose the perfect balance of power and value for your applications."
    />
  );
}

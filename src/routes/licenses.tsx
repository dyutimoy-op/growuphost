import { createFileRoute } from "@tanstack/react-router";

import { CategoryLandingPage } from "@/components/sections/CategoryLandingPage";
import { prefetchCategoryLanding } from "@/components/sections/use-category-products";
import { buildPageHead } from "@/lib/seo/head";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo/jsonld";

const PATH = "/licenses";
const CATEGORY_SLUG = "licenses";

export const Route = createFileRoute("/licenses")({
  component: LicensesPage,

  loader: async ({ context }) => {
    await prefetchCategoryLanding(context.queryClient, CATEGORY_SLUG);
  },
  head: () =>
    buildPageHead({
      title: "cPanel, LiteSpeed & CloudLinux Licenses | GROWUPHOST",
      description:
        "Genuine cPanel, LiteSpeed, and CloudLinux licenses for your servers, with instant activation and support. Affordable monthly licensing for any provider's hardware.",
      path: PATH,
      ogTitle: "Software Licenses | cPanel, LiteSpeed, CloudLinux",
      ogDescription:
        "Genuine infrastructure software licenses with instant activation and support.",
      jsonLd: [
        serviceJsonLd({
          name: "Software Licenses",
          serviceType: "Server software licensing",
          description:
            "Genuine cPanel, LiteSpeed, and CloudLinux licenses with instant activation, usable on any provider's servers.",
          path: PATH,
        }),
        breadcrumbJsonLd([
          { name: "Hosting Packages", path: "/packages" },
          { name: "Software Licenses", path: PATH },
        ]),
      ],
    }),
});

function LicensesPage() {
  return (
    <CategoryLandingPage
      categorySlug={CATEGORY_SLUG}
      eyebrow="Genuine · Instant Activation"
      title="Software Licenses"
      subtitle="Genuine licenses for cPanel, LiteSpeed, CloudLinux, and more. Instant activation and official support included."
      gridTitle="CLOUD LICENSING"
      gridSubtitle="All the tools you need to manage your infrastructure professionally."
    />
  );
}

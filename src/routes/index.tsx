import { createFileRoute } from "@tanstack/react-router";

import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { TrustBar } from "@/components/sections/TrustBar";
import { DomainSearch } from "@/components/sections/DomainSearch";
import { ProductGrid } from "@/components/ProductGrid";
import { PerformanceMatrix } from "@/components/sections/PerformanceMatrix";
import { CloudBentoGrid } from "@/components/sections/CloudBentoGrid";
import { ResellerBusinessShowcase } from "@/components/sections/ResellerBusinessShowcase";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { StatsBand } from "@/components/sections/StatsBand";
import { ComparisonTable } from "@/components/sections/ComparisonTable";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { CTABand } from "@/components/sections/CTABand";
import { homePlansQueryOptions } from "@/components/sections/use-plans";
import { testimonialsQueryOptions } from "@/components/sections/use-testimonials";
import { buildPageHead } from "@/lib/seo/head";
import { prefetchForSSR } from "@/lib/prefetch";

export const Route = createFileRoute("/")({
  component: Index,
  loader: async ({ context }) => {
    await Promise.all([
      prefetchForSSR(context.queryClient, homePlansQueryOptions()),
      prefetchForSSR(context.queryClient, testimonialsQueryOptions()),
    ]);
  },
  head: () =>
    buildPageHead({
      title: "GROWUPHOST | High-Performance LiteSpeed NVMe Web Hosting & Cloud Servers India",
      description:
        "High-performance cloud infrastructure in Mumbai. NVMe web hosting, LiteSpeed 20x speed engine, VPS, and dedicated servers with 99.9% uptime guarantee.",
      path: "/",
      ogTitle: "GROWUPHOST | High-Performance LiteSpeed NVMe Hosting India",
      ogDescription:
        "Ultra-fast cloud platform with 20x LiteSpeed engine, 100% NVMe storage, anti-DDoS protection, and 24/7 expert support in Mumbai.",
    }),
});

function Index() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white">
      <Navbar />

      <main id="main-content" className="flex-grow">
        <Hero />
        <DomainSearch />
        <TrustBar />
        <ProductGrid />
        <PerformanceMatrix />
        <CloudBentoGrid />
        <ResellerBusinessShowcase />
        <WhyChooseUs />
        <StatsBand />
        <ComparisonTable />
        <Testimonials />
        <FAQ />
        <CTABand />
      </main>

      <Footer />
    </div>
  );
}

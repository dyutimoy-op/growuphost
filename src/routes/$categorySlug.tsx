import { createFileRoute, notFound } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CategoryProductGrid } from "@/components/CategoryProductGrid";
import { PageHero } from "@/components/sections/PageHero";
import { prefetchCategoryLanding } from "@/components/sections/use-category-products";
import { buildPageHead } from "@/lib/seo/head";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/seo/jsonld";

export const Route = createFileRoute("/$categorySlug")({
  loader: async ({ params, context }) => {
    const result = await prefetchCategoryLanding(context.queryClient, params.categorySlug);
    if (result.status === "missing") throw notFound();
    return { category: result.status === "ok" ? result.category : null };
  },

  head: ({ loaderData }) => {
    const category = loaderData?.category;
    if (!category) {
      return { meta: [{ name: "robots", content: "noindex" }] };
    }

    const path = `/${category.slug}`;
    const title = category.seo_title?.trim() || `${category.name} | GROWUPHOST`;
    const description =
      category.seo_description?.trim() ||
      category.description?.trim() ||
      `Compare ${category.name} plans from GROWUPHOST, hosted on NVMe infrastructure in Mumbai with 24/7 support.`;

    return buildPageHead({
      title,
      description,
      path,
      jsonLd: [
        collectionPageJsonLd({ name: category.name, description, path }),
        breadcrumbJsonLd([
          { name: "Hosting Packages", path: "/packages" },
          { name: category.name, path },
        ]),
      ],
    });
  },

  component: DynamicCategoryPage,
});

function DynamicCategoryPage() {
  const { category } = Route.useLoaderData();
  const { categorySlug } = Route.useParams();

  const heading = category?.name ?? categorySlug.replace(/-/g, " ");
  const subtitle =
    category?.description ||
    `High-performance ${heading} solutions with low-latency networking and enterprise-grade security.`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 selection:bg-blue-500/30 selection:text-blue-400">
      <Navbar />
      <main id="main-content" className="flex-grow">
        <PageHero uppercase title={heading} subtitle={subtitle} />

        <CategoryProductGrid
          categorySlug={category?.slug ?? categorySlug}
          title="AVAILABLE PACKAGES"
          subtitle="Enterprise infrastructure starting at unbeatable prices."
        />
      </main>
      <Footer />
    </div>
  );
}

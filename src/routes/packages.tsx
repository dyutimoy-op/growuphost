import { queryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { BillingCycleToggle } from "@/components/sections/BillingCycleToggle";
import { CTABand } from "@/components/sections/CTABand";
import { PlanCard } from "@/components/sections/PlanCard";
import { Reveal } from "@/components/sections/Reveal";
import {
  resolveToggleSavingPercent,
  useAnnualDiscountPercent,
  type PlanProduct,
  type UiBillingCycle,
} from "@/components/sections/plan-data";
import {
  LoadingAnnouncement,
  PlanGridSkeleton,
  SectionEmpty,
  SectionError,
} from "@/components/sections/states";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { buildPageHead } from "@/lib/seo/head";
import { prefetchForSSR } from "@/lib/prefetch";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export const Route = createFileRoute("/packages")({
  component: PackagesPage,

  loader: async ({ context }) => {
    await Promise.all([
      prefetchForSSR(context.queryClient, categoriesQueryOptions()),
      prefetchForSSR(context.queryClient, allProductsQueryOptions()),
    ]);
  },
  head: () =>
    buildPageHead({
      title: "Hosting Packages & Pricing | GROWUPHOST",
      description:
        "Explore our wide range of hosting packages including Shared, VPS, Dedicated, and Licenses. Bulletproof, Offshore, and Antiban solutions at the best prices.",
      path: "/packages",
    }),
});

async function fetchCategories(): Promise<CategoryRow[]> {
  const { data, error } = await supabase.from("categories").select("*").order("display_order");
  if (error) throw error;
  return data ?? [];
}

async function fetchAllProducts(): Promise<PlanProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .order("price", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

function categoriesQueryOptions() {
  return queryOptions({
    queryKey: ["categories-all"] as const,
    queryFn: fetchCategories,
    staleTime: 300_000,
  });
}

function allProductsQueryOptions() {
  return queryOptions({
    queryKey: ["products-all"] as const,
    queryFn: fetchAllProducts,
    staleTime: 60_000,
  });
}

function PackagesPage() {
  const [billingCycle, setBillingCycle] = useState<UiBillingCycle>("monthly");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const annualDiscountPercent = useAnnualDiscountPercent();

  const categoriesQuery = useQuery(categoriesQueryOptions());

  const productsQuery = useQuery(allProductsQueryOptions());

  const products = productsQuery.data;

  const filteredProducts = useMemo<PlanProduct[]>(() => {
    if (!products) return [];
    const needle = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = selectedCategory === "" || product.category_id === selectedCategory;
      if (!matchesCategory) return false;
      if (needle === "") return true;
      const haystack = [product.name, product.description ?? "", product.categories?.name ?? ""]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [products, searchQuery, selectedCategory]);

  const isFiltering = searchQuery.trim() !== "" || selectedCategory !== "";
  const totalCount = products?.length ?? 0;

  const annualSavingPercent = resolveToggleSavingPercent(filteredProducts, annualDiscountPercent);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white selection:bg-blue-500/30 selection:text-blue-400">
      <Navbar />

      <main id="main-content" className="flex-grow pt-28 sm:pt-40 lg:pt-56">
        <section
          aria-labelledby="packages-heading"
          className="relative mx-auto mb-12 sm:mb-16 max-w-7xl px-4 sm:px-6 lg:mb-24 lg:px-8"
        >
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[140px]"
            aria-hidden="true"
          />

          <Reveal preset="rise" className="relative mb-10 sm:mb-14 space-y-4 sm:space-y-6 text-center lg:mb-20">
            <div className="flex justify-center mb-3 sm:mb-6">
              <p className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-blue-700 dark:text-blue-300 shadow-xs">
                Full catalogue
              </p>
            </div>
            <h1
              id="packages-heading"
              className="text-2xl leading-[1.05] font-black tracking-tight text-slate-950 dark:text-white uppercase sm:text-5xl lg:text-7xl"
            >
              Our{" "}
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-600 dark:from-blue-400 dark:via-sky-300 dark:to-blue-500 bg-clip-text text-transparent italic">
                packages
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-sm sm:text-base lg:text-xl leading-relaxed font-medium text-slate-700 dark:text-slate-300">
              Every live plan, in one place — from personal projects to enterprise-grade offshore
              infrastructure. Pick your term below and your cart opens on exactly that term.
            </p>
          </Reveal>

          <div className="relative mb-8 sm:mb-12 flex flex-col items-center justify-between gap-4 sm:gap-6 rounded-2xl sm:rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 p-4 sm:p-6 shadow-sm dark:shadow-none backdrop-blur-md lg:flex-row lg:rounded-[2.5rem] lg:px-8">
            <div className="relative w-full lg:max-w-md">
              <label htmlFor="package-search" className="sr-only">
                Search packages
              </label>
              <Search
                className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-400"
                aria-hidden="true"
              />
              <Input
                id="package-search"
                type="search"
                placeholder="Search plans…"
                className="h-12 rounded-2xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 pl-12 text-slate-950 dark:text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>

            <div className="flex w-full flex-wrap items-center justify-center gap-4 lg:w-auto">
              <BillingCycleToggle
                value={billingCycle}
                onChange={setBillingCycle}
                annualSavingPercent={annualSavingPercent}
                size="sm"
              />

              <div className="relative">
                <label htmlFor="package-category" className="sr-only">
                  Filter by category
                </label>
                <SlidersHorizontal
                  className="pointer-events-none absolute top-1/2 left-4 h-3.5 w-3.5 -translate-y-1/2 text-blue-600 dark:text-blue-400"
                  aria-hidden="true"
                />
                <select
                  id="package-category"
                  className="cursor-pointer appearance-none rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 py-3.5 pr-10 pl-10 text-xs font-black tracking-widest text-slate-900 dark:text-slate-200 uppercase transition-colors hover:border-blue-500/40 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                >
                  <option value="">All categories</option>
                  {categoriesQuery.data?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {productsQuery.isPending && (
            <>
              <LoadingAnnouncement label="Loading hosting packages" />
              <PlanGridSkeleton count={6} />
            </>
          )}

          {!productsQuery.isPending && productsQuery.isError && (
            <SectionError
              title="We couldn't load the catalogue"
              message="Our package list is temporarily unreachable. Retry in a moment, or browse everything directly in the GROWUPHOST store."
              onRetry={() => void productsQuery.refetch()}
            />
          )}

          {!productsQuery.isPending && !productsQuery.isError && (
            <>
              <p role="status" aria-live="polite" className="sr-only">
                {filteredProducts.length} of {totalCount} packages shown
              </p>

              {totalCount === 0 && (
                <SectionEmpty
                  title="Packages are being published"
                  message="Our team is finalising this catalogue right now. Every product that is already live can be ordered directly in the GROWUPHOST store."
                />
              )}

              {totalCount > 0 && filteredProducts.length === 0 && (
                <SectionEmpty
                  title="No packages match that search"
                  message="Try a broader term, or clear the filters to see the whole catalogue again."
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("");
                    }}
                    className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-xs font-black tracking-widest text-white uppercase transition-colors duration-200 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none"
                  >
                    Clear filters
                  </button>
                </SectionEmpty>
              )}

              {filteredProducts.length > 0 && (
                <ul className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                  {filteredProducts.map((product, index) => (
                    <li key={product.id} className="flex">
                      <Reveal
                        preset="pop"
                        delay={isFiltering ? 0 : Math.min(index, 5) * 0.06}
                        className="flex w-full"
                      >
                        <PlanCard
                          product={product}
                          billingCycle={billingCycle}
                          annualDiscountPercent={annualDiscountPercent}
                          maxFeatures={8}
                          className="w-full"
                        />
                      </Reveal>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>

        <CTABand />
      </main>

      <Footer />
    </div>
  );
}

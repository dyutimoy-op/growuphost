import { useQuery } from "@tanstack/react-query";
import { Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { useBrokenImage } from "@/hooks/use-broken-image";
import { toMediaSrc } from "@/lib/media-url";

import { BillingCycleToggle } from "./sections/BillingCycleToggle";
import { PlanCard } from "./sections/PlanCard";
import { Reveal } from "./sections/Reveal";
import {
  categoryProductsQueryOptions,
  categoryQueryOptions,
} from "./sections/use-category-products";
import {
  resolveToggleSavingPercent,
  useAnnualDiscountPercent,
  type UiBillingCycle,
} from "./sections/plan-data";
import {
  LoadingAnnouncement,
  PlanGridSkeleton,
  SectionEmpty,
  SectionError,
} from "./sections/states";

interface ProductGridProps {
  categorySlug: string;
  title: string;
  subtitle: string;
}

function splitTitle(title: string): { lead: string; emphasis: string } {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return { lead: "", emphasis: "Plans" };
  const last = words[words.length - 1] ?? "";
  if (words.length === 1) return { lead: "", emphasis: last };
  return { lead: words.slice(0, -1).join(" "), emphasis: last };
}

export function CategoryProductGrid({ categorySlug, title, subtitle }: ProductGridProps) {
  const [billingCycle, setBillingCycle] = useState<UiBillingCycle>("monthly");
  const annualDiscountPercent = useAnnualDiscountPercent();
  const prefersReducedMotion = useReducedMotion();
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);

  const categoryQuery = useQuery(categoryQueryOptions(categorySlug));
  const categoryData = categoryQuery.data;

  const productsQuery = useQuery(categoryProductsQueryOptions(categorySlug, categoryData?.id));

  const isLoading = categoryQuery.isPending || (Boolean(categoryData) && productsQuery.isPending);
  const isError = categoryQuery.isError || productsQuery.isError;
  const products = productsQuery.data ?? [];
  const { lead, emphasis } = splitTitle(title);

  const backgroundUrl = toMediaSrc(categoryData?.background_media_url);

  const {
    isBroken: isBackgroundBroken,
    handleError: handleBackgroundError,
    mediaRef: backgroundMediaRef,
  } = useBrokenImage(backgroundUrl);

  const attachBackgroundVideo = useCallback(
    (node: HTMLVideoElement | null): void => {
      backgroundVideoRef.current = node;
      backgroundMediaRef(node);
    },
    [backgroundMediaRef],
  );

  const annualSavingPercent = resolveToggleSavingPercent(products, annualDiscountPercent);

  useEffect(() => {
    const video = backgroundVideoRef.current;
    if (!video) return;
    if (prefersReducedMotion) {
      video.pause();
    } else {
      void video.play().catch(() => {});
    }
  }, [prefersReducedMotion, backgroundUrl]);

  return (
    <section
      aria-labelledby={`category-heading-${categorySlug}`}
      className="relative flex min-h-0 sm:min-h-[500px] items-center overflow-hidden bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 py-10 sm:py-20 lg:px-8 lg:py-32"
    >
      {backgroundUrl && !isBackgroundBroken ? (
        <div className="absolute inset-0 z-0" aria-hidden="true">
          {categoryData?.background_media_type === "video" ? (
            <video
              key={backgroundUrl}
              ref={attachBackgroundVideo}
              loop
              muted
              playsInline
              className="h-full w-full object-cover opacity-30"
            >
              <source src={backgroundUrl} onError={handleBackgroundError} />
            </video>
          ) : (
            <img
              src={backgroundUrl}
              ref={backgroundMediaRef}
              className="h-full w-full object-cover opacity-30"
              alt=""
              loading="lazy"
              decoding="async"
              onError={handleBackgroundError}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/85 to-white/95 dark:from-slate-950 dark:via-slate-950/80 dark:to-slate-950" />
        </div>
      ) : (
        <div
          className="pointer-events-none absolute top-0 left-1/2 h-full w-full -translate-x-1/2 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.08),transparent_70%)]"
          aria-hidden="true"
        />
      )}

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <Reveal
          preset="rise"
          className="mb-12 flex flex-col gap-6 text-center lg:mb-16 md:flex-row md:items-end md:justify-between md:text-left"
        >
          <div className="space-y-4 max-w-2xl">
            <p className="mx-auto inline-flex items-center gap-2 text-xs font-black tracking-[0.25em] text-blue-600 dark:text-blue-400 uppercase md:mx-0">
              <Zap
                className="h-3 w-3 fill-current text-blue-600 dark:text-blue-400"
                aria-hidden="true"
              />{" "}
              {(categoryData?.name ?? categorySlug).replace(/-/g, " ")}
            </p>
            <h2
              id={`category-heading-${categorySlug}`}
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 dark:text-white uppercase leading-tight sm:whitespace-nowrap"
            >
              {lead ? `${lead} ` : null}
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-600 dark:from-blue-400 dark:via-sky-300 dark:to-blue-500 bg-clip-text text-transparent italic">
                {emphasis}
              </span>
            </h2>
            <p className="mx-auto max-w-xl text-base leading-relaxed font-medium text-slate-700 dark:text-slate-300 md:mx-0 lg:text-lg">
              {subtitle}
            </p>
          </div>

          <BillingCycleToggle
            value={billingCycle}
            onChange={setBillingCycle}
            annualSavingPercent={annualSavingPercent}
            className="mx-auto md:mx-0"
          />
        </Reveal>

        {isLoading && (
          <>
            <LoadingAnnouncement label="Loading plans in this category" />
            <PlanGridSkeleton count={3} />
          </>
        )}

        {!isLoading && isError && (
          <SectionError
            message="We couldn't load this category just now. Retry, or jump straight into the GROWUPHOST store where every live plan is listed."
            onRetry={() => {
              void categoryQuery.refetch();
              void productsQuery.refetch();
            }}
          />
        )}

        {!isLoading && !isError && products.length === 0 && (
          <SectionEmpty
            title="No plans published here yet"
            message="This line-up is being finalised. Everything currently available is listed in the GROWUPHOST store, or our team can quote a custom build."
          />
        )}

        {!isLoading && !isError && products.length > 0 && (
          <ul className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {products.map((product, index) => (
              <li key={product.id} className="h-full">
                <Reveal preset="pop" delay={index * 0.06} className="h-full">
                  <PlanCard
                    product={product}
                    billingCycle={billingCycle}
                    annualDiscountPercent={annualDiscountPercent}
                    ctaLabel="Configure plan"
                    showCategory={false}
                    maxFeatures={9}
                  />
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

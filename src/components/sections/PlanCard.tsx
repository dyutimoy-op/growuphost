import { ArrowRight, Check, Cpu, Globe, HardDrive, KeyRound, Server, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { resolveProductUrl } from "@/config/whmcs";

import { CTA_PRIMARY, CTA_TIER_NEUTRAL } from "./cta-styles";
import {
  getPlanPricing,
  planCategoryLabel,
  planDescription,
  toFeatureList,
  type PlanProduct,
  type UiBillingCycle,
} from "./plan-data";

function planIcon(product: PlanProduct): LucideIcon {
  const haystack =
    `${product.categories?.slug ?? ""} ${product.categories?.name ?? ""} ${product.name}`.toLowerCase();
  if (haystack.includes("licen")) return KeyRound;
  if (haystack.includes("dedicated") || haystack.includes("bare")) return Server;
  if (haystack.includes("vps") || haystack.includes("cloud")) return Cpu;
  if (haystack.includes("shared") || haystack.includes("web")) return Globe;
  if (haystack.includes("storage") || haystack.includes("backup")) return HardDrive;
  return Shield;
}

export interface PlanCardProps {
  product: PlanProduct;
  billingCycle: UiBillingCycle;
  annualDiscountPercent?: number;
  ctaLabel?: string;
  showCategory?: boolean;
  maxFeatures?: number;
  className?: string;
}

export function PlanCard({
  product,
  billingCycle,
  annualDiscountPercent = 0,
  ctaLabel = "Configure plan",
  showCategory = true,
  maxFeatures = 7,
  className = "",
}: PlanCardProps) {
  const pricing = getPlanPricing(product, billingCycle, annualDiscountPercent);
  const href = resolveProductUrl(product, { billingCycle: pricing.cartCycle });
  const features = toFeatureList(product.features);
  const visibleFeatures = features.slice(0, maxFeatures);
  const hiddenFeatureCount = features.length - visibleFeatures.length;
  const isFeatured = product.is_featured === true;
  const Icon = planIcon(product);

  return (
    <article
      className={[
        "group relative flex h-full flex-col rounded-[2rem] border-2 p-8 lg:rounded-[2.5rem] lg:p-10",
        "transition-all duration-300 hover:-translate-y-1.5",
        isFeatured
          ? "border-blue-600 bg-white text-slate-950 shadow-xl dark:border-blue-500 dark:bg-slate-900/90 dark:text-white dark:shadow-[0_0_50px_-10px_rgba(37,99,235,0.4)]"
          : "border-slate-300 bg-white text-slate-900 shadow-md hover:border-blue-500 hover:shadow-xl dark:border-white/20 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:bg-slate-900/80 dark:hover:shadow-[0_0_30px_rgba(37,99,235,0.15)]",
        className,
      ].join(" ")}
    >
      {isFeatured && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-black uppercase tracking-wider whitespace-nowrap text-white shadow-xl shadow-blue-600/50 lg:left-10 lg:translate-x-0">
          Most popular
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {showCategory && (
              <div className="mb-2 text-xs font-black tracking-[0.2em] text-blue-600 dark:text-blue-400 uppercase">
                {planCategoryLabel(product)}
              </div>
            )}
            <h3 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white lg:text-3xl">
              {product.name}
            </h3>
          </div>
          <div
            className={`shrink-0 rounded-2xl p-3 transition-colors ${
              isFeatured
                ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                : "bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-600 dark:bg-white/5 dark:text-blue-400 dark:group-hover:bg-blue-500/10"
            }`}
          >
            <Icon className="h-5 w-5 lg:h-6 lg:w-6" aria-hidden="true" />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-4xl font-black text-slate-950 dark:text-white lg:text-5xl">
              {pricing.price.primary}
            </span>
            <span className="text-xs font-bold tracking-widest text-slate-600 dark:text-slate-400 uppercase lg:text-sm">
              {pricing.price.unit}
            </span>
            {pricing.price.strikethrough && (
              <span className="text-sm font-bold text-slate-400 dark:text-slate-500 line-through">
                {pricing.price.strikethrough}
              </span>
            )}
          </div>
          {pricing.price.effectiveMonthly && (
            <p className="text-xs font-bold text-blue-600 dark:text-blue-300">
              Works out at {pricing.price.effectiveMonthly}/mo
            </p>
          )}
          <p className="text-xs font-bold tracking-[0.12em] text-slate-600 dark:text-slate-400 uppercase">
            {pricing.price.note}
          </p>
        </div>

        <p className="text-sm leading-relaxed font-medium text-slate-700 dark:text-slate-300">
          {planDescription(product)}
        </p>
      </div>

      {visibleFeatures.length > 0 && (
        <ul className="mt-8 mb-10 flex-grow space-y-4 lg:mb-12">
          {visibleFeatures.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-3 text-left text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20">
                <Check
                  className="h-3 w-3 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                />
              </span>
              <span className="transition-colors group-hover:text-slate-950 dark:group-hover:text-white">
                {feature}
              </span>
            </li>
          ))}
          {hiddenFeatureCount > 0 && (
            <li className="pl-8 text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
              +{hiddenFeatureCount} more included
            </li>
          )}
        </ul>
      )}

      {visibleFeatures.length === 0 && <div className="mt-8 mb-10 flex-grow" />}

      <Button
        asChild
        className={`w-full rounded-2xl py-7 text-sm font-black tracking-widest uppercase lg:py-8 ${
          isFeatured ? CTA_PRIMARY : CTA_TIER_NEUTRAL
        }`}
      >
        <a
          href={href}
          aria-label={`${ctaLabel}: ${product.name} — continues to GROWUPHOST billing`}
        >
          {ctaLabel} <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </a>
      </Button>
    </article>
  );
}

import { Link } from "@tanstack/react-router";
import { ArrowRight, Zap } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { WHMCS_LINKS } from "@/config/whmcs";

import { BillingCycleToggle } from "./sections/BillingCycleToggle";
import { PlanCard } from "./sections/PlanCard";
import { Reveal } from "./sections/Reveal";
import { CTA_SECONDARY, FOCUS_RING_BRAND } from "./sections/cta-styles";
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
import { pickShowcasePlans, useHomePlans } from "./sections/use-plans";

export function ProductGrid() {
  const [billingCycle, setBillingCycle] = useState<UiBillingCycle>("monthly");
  const annualDiscountPercent = useAnnualDiscountPercent();
  const { data, isPending, isError, refetch } = useHomePlans();

  const plans = pickShowcasePlans(data, 6);

  const annualSavingPercent = resolveToggleSavingPercent(plans, annualDiscountPercent);

  return (
    <section
      id="plans"
      aria-labelledby="plans-heading"
      className="relative overflow-hidden bg-slate-950 px-4 sm:px-6 py-12 sm:py-20 lg:px-8 lg:py-32"
    >
      <div
        className="pointer-events-none absolute top-0 left-1/2 h-full w-full -translate-x-1/2 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.06),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">
        <Reveal
          preset="rise"
          className="mb-8 sm:mb-12 flex flex-col gap-6 text-center lg:mb-16 md:flex-row md:items-end md:justify-between md:text-left"
        >
          <div className="space-y-3 sm:space-y-4">
            <p className="mx-auto inline-flex items-center gap-2 text-xs font-black tracking-[0.25em] text-blue-600 dark:text-blue-400 uppercase md:mx-0">
              <Zap
                className="h-3.5 w-3.5 fill-current text-blue-600 dark:text-blue-400"
                aria-hidden="true"
              />{" "}
              Scalable Cloud Infrastructure
            </p>
            <h2
              id="plans-heading"
              className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 dark:text-white uppercase leading-tight"
            >
              Plans built for every{" "}
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-600 dark:from-blue-400 dark:via-sky-300 dark:to-blue-500 bg-clip-text text-transparent italic">
                stage.
              </span>
            </h2>
            <p className="mx-auto max-w-xl text-base leading-relaxed font-medium text-slate-700 dark:text-slate-300 md:mx-0 lg:text-lg">
              Start with shared cloud, scale to high-performance NVMe VPS or dedicated hardware.
              Your selected term carries straight through to checkout.
            </p>
          </div>

          <BillingCycleToggle
            value={billingCycle}
            onChange={setBillingCycle}
            annualSavingPercent={annualSavingPercent}
            className="mx-auto md:mx-0"
          />
        </Reveal>

        {isPending && (
          <>
            <LoadingAnnouncement label="Loading hosting plans" />
            <PlanGridSkeleton count={3} />
          </>
        )}

        {!isPending && isError && <SectionError onRetry={() => void refetch()} />}

        {!isPending && !isError && plans.length === 0 && (
          <SectionEmpty
            title="Our plans are being published"
            message="The catalogue is empty right now. Everything currently for sale is listed in the GROWUPHOST store, and this page will fill in as soon as plans go live."
          />
        )}

        {!isPending && !isError && plans.length > 0 && (
          <>
            <ul className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {plans.map((plan, index) => (
                <li key={plan.id} className="h-full">
                  <Reveal preset="pop" delay={index * 0.06} className="h-full">
                    <PlanCard
                      product={plan}
                      billingCycle={billingCycle}
                      annualDiscountPercent={annualDiscountPercent}
                      ctaLabel="Configure plan"
                    />
                  </Reveal>
                </li>
              ))}
            </ul>

            <div className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                className={`w-full rounded-2xl px-8 py-7 text-xs font-black tracking-widest uppercase sm:w-auto ${CTA_SECONDARY}`}
              >
                <Link to="/packages">
                  See every package <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <a
                href={WHMCS_LINKS.store}
                className={`cursor-pointer rounded-xl px-2 py-2 text-xs font-black tracking-widest text-slate-400 uppercase underline-offset-4 transition-colors duration-200 hover:text-white hover:underline ${FOCUS_RING_BRAND}`}
              >
                Or open the store directly
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

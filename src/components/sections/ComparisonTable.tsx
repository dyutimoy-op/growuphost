import { ArrowRight, Check, Minus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveProductUrl } from "@/config/whmcs";

import { BillingCycleToggle } from "./BillingCycleToggle";
import { Reveal } from "./Reveal";
import { CTA_PRIMARY, CTA_TIER_NEUTRAL } from "./cta-styles";
import {
  getPlanPricing,
  resolveToggleSavingPercent,
  toFeatureList,
  useAnnualDiscountPercent,
  type PlanProduct,
  type UiBillingCycle,
} from "./plan-data";
import { LoadingAnnouncement, SectionEmpty, SectionError } from "./states";
import { pickShowcasePlans, useHomePlans } from "./use-plans";

const MAX_COLUMNS = 4;

const SPEC_ROWS: readonly { label: string; keywords: readonly string[] }[] = [
  { label: "Memory", keywords: ["ram", "memory", "ddr"] },
  { label: "Processor", keywords: ["vcpu", "cpu", "core", "thread", "epyc", "xeon"] },
  { label: "Storage", keywords: ["nvme", "ssd", "storage", "disk", "space"] },
  { label: "Bandwidth", keywords: ["bandwidth", "transfer", "traffic", "unmetered", "port"] },
  { label: "Websites & domains", keywords: ["website", "domain", "addon", "subdomain"] },
  { label: "Email", keywords: ["email", "mailbox", "imap"] },
  { label: "Backups", keywords: ["backup", "snapshot"] },
  { label: "Control panel", keywords: ["cpanel", "whm", "plesk", "directadmin", "panel"] },
  { label: "Protection", keywords: ["ddos", "mitigation", "firewall", "antiban", "bulletproof"] },
  { label: "Support", keywords: ["support", "24/7", "ticket", "migration"] },
];

interface ComparisonRow {
  label: string;

  cells: Record<string, string | null>;
}

function buildRows(plans: readonly PlanProduct[]): ComparisonRow[] {
  const featuresByPlan = new Map<string, string[]>();
  for (const plan of plans) featuresByPlan.set(plan.id, toFeatureList(plan.features));

  const consumed = new Map<string, Set<string>>();
  for (const plan of plans) consumed.set(plan.id, new Set<string>());

  const rows: ComparisonRow[] = [];

  for (const spec of SPEC_ROWS) {
    const cells: Record<string, string | null> = {};
    let matched = false;

    for (const plan of plans) {
      const features = featuresByPlan.get(plan.id) ?? [];
      const used = consumed.get(plan.id);
      const hit = features.find((feature) => {
        if (used?.has(feature)) return false;
        const haystack = feature.toLowerCase();
        return spec.keywords.some((keyword) => haystack.includes(keyword));
      });
      if (hit) {
        used?.add(hit);
        cells[plan.id] = hit;
        matched = true;
      } else {
        cells[plan.id] = null;
      }
    }

    if (matched) rows.push({ label: spec.label, cells });
  }

  const extraCells: Record<string, string | null> = {};
  let hasExtras = false;
  for (const plan of plans) {
    const features = featuresByPlan.get(plan.id) ?? [];
    const used = consumed.get(plan.id);
    const remaining = features.filter((feature) => !used?.has(feature));
    if (remaining.length > 0) {
      hasExtras = true;
      extraCells[plan.id] = remaining.join(" · ");
    } else {
      extraCells[plan.id] = null;
    }
  }
  if (hasExtras) rows.push({ label: "Also included", cells: extraCells });

  return rows;
}

function CellValue({ value }: { value: string | null }) {
  if (!value) {
    return (
      <>
        <Minus className="h-4 w-4 text-slate-400 dark:text-slate-500" aria-hidden="true" />
        <span className="sr-only">Not included</span>
      </>
    );
  }
  return (
    <span className="flex items-start gap-2">
      <Check
        className="mt-px h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
        aria-hidden="true"
      />
      <span className="text-slate-900 dark:text-slate-300 font-semibold">{value}</span>
    </span>
  );
}

function TableSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-[2rem] border border-white/5 bg-slate-900/40 p-6 lg:p-10"
      aria-hidden="true"
    >
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {[0, 1, 2, 3].map((column) => (
          <div key={column} className="space-y-3">
            <Skeleton className="h-4 w-24 rounded-full bg-white/10" />
            <Skeleton className="h-8 w-20 rounded-lg bg-white/10" />
          </div>
        ))}
      </div>
      <div className="mt-10 space-y-4">
        {[0, 1, 2, 3, 4, 5].map((row) => (
          <Skeleton key={row} className="h-8 w-full rounded-xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}

export function ComparisonTable() {
  const [billingCycle, setBillingCycle] = useState<UiBillingCycle>("monthly");
  const annualDiscountPercent = useAnnualDiscountPercent();
  const { data, isPending, isError, refetch } = useHomePlans();

  const plans = pickShowcasePlans(data, MAX_COLUMNS);
  const rows = buildRows(plans);

  const annualSavingPercent = resolveToggleSavingPercent(plans, annualDiscountPercent);

  return (
    <section
      aria-labelledby="comparison-heading"
      className="relative bg-slate-950 px-6 py-20 lg:px-8 lg:py-32"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(99,102,241,0.08),transparent_55%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">
        <Reveal
          preset="blur"
          className="mb-12 flex flex-col gap-8 text-center lg:mb-16 lg:flex-row lg:items-end lg:justify-between lg:text-left"
        >
          <div className="space-y-4">
            <p className="text-xs font-black tracking-[0.25em] text-blue-600 dark:text-blue-400 uppercase">
              Side by side
            </p>
            <h2
              id="comparison-heading"
              className="text-4xl leading-[1.05] font-black tracking-tight text-slate-950 dark:text-white uppercase lg:text-6xl"
            >
              Compare the{" "}
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-600 dark:from-blue-400 dark:via-sky-300 dark:to-blue-500 bg-clip-text text-transparent italic">
                line-up.
              </span>
            </h2>
            <p className="mx-auto max-w-xl text-base leading-relaxed font-medium text-slate-700 dark:text-slate-300 lg:mx-0">
              Specifications come straight from our catalogue. Whichever term you pick here is the
              term your cart opens on.
            </p>
          </div>
          <BillingCycleToggle
            value={billingCycle}
            onChange={setBillingCycle}
            annualSavingPercent={annualSavingPercent}
            className="mx-auto lg:mx-0"
          />
        </Reveal>

        {isPending && (
          <>
            <LoadingAnnouncement label="Loading plan comparison" />
            <TableSkeleton />
          </>
        )}

        {!isPending && isError && (
          <SectionError
            title="The comparison couldn't load"
            message="We couldn't reach the catalogue to build this table. Retry, or view every plan directly in the store."
            onRetry={() => void refetch()}
          />
        )}

        {!isPending && !isError && plans.length === 0 && (
          <SectionEmpty
            title="Nothing to compare yet"
            message="As soon as plans are published they will appear here side by side, with live pricing."
          />
        )}

        {!isPending && !isError && plans.length > 0 && (
          <>
            <div className="hidden overflow-x-auto rounded-[2.5rem] border border-white/5 bg-slate-900/40 lg:block">
              <table className="w-full min-w-[860px] border-separate border-spacing-0 text-left">
                <caption className="sr-only">
                  Feature and price comparison of GROWUPHOST plans
                </caption>
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="sticky left-0 z-10 bg-slate-900/95 px-8 py-8 align-bottom text-xs font-black tracking-[0.2em] text-slate-400 uppercase backdrop-blur"
                    >
                      Specification
                    </th>
                    {plans.map((plan) => {
                      const pricing = getPlanPricing(plan, billingCycle, annualDiscountPercent);
                      return (
                        <th
                          scope="col"
                          key={plan.id}
                          className={`border-l border-white/5 px-6 py-8 align-bottom ${
                            plan.is_featured === true ? "bg-blue-600/10" : ""
                          }`}
                        >
                          {plan.is_featured === true && (
                            <span className="mb-3 inline-block rounded-full bg-blue-600 px-3 py-1 text-xs font-black tracking-wider text-white uppercase shadow-md shadow-blue-600/30">
                              Most popular
                            </span>
                          )}
                          <span className="block text-lg font-black tracking-tight text-white">
                            {plan.name}
                          </span>
                          <span className="mt-2 block">
                            <span className="text-2xl font-black text-white">
                              {pricing.price.primary}
                            </span>
                            <span className="ml-1 text-xs font-bold tracking-widest text-slate-400 uppercase">
                              {pricing.price.unit}
                            </span>
                          </span>
                          <span className="mt-1 block text-xs font-bold tracking-widest text-slate-400 uppercase">
                            {pricing.price.note}
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.label} className="align-top">
                      <th
                        scope="row"
                        className="sticky left-0 z-10 border-t border-white/5 bg-slate-900/95 px-8 py-5 text-xs font-black tracking-widest text-slate-400 uppercase backdrop-blur"
                      >
                        {row.label}
                      </th>
                      {plans.map((plan) => (
                        <td
                          key={plan.id}
                          className={`border-t border-l border-white/5 px-6 py-5 text-sm font-medium ${
                            plan.is_featured === true ? "bg-blue-600/10" : ""
                          }`}
                        >
                          <CellValue value={row.cells[plan.id] ?? null} />
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <th scope="row" className="sticky left-0 z-10 bg-slate-900/95 px-8 py-8">
                      <span className="sr-only">Order</span>
                    </th>
                    {plans.map((plan) => {
                      const pricing = getPlanPricing(plan, billingCycle, annualDiscountPercent);
                      return (
                        <td
                          key={plan.id}
                          className={`border-l border-white/5 px-6 py-8 ${
                            plan.is_featured === true ? "bg-blue-600/10" : ""
                          }`}
                        >
                          <Button
                            asChild
                            className={`w-full rounded-xl py-6 text-xs font-black tracking-widest uppercase ${
                              plan.is_featured === true ? CTA_PRIMARY : CTA_TIER_NEUTRAL
                            }`}
                          >
                            <a
                              href={resolveProductUrl(plan, { billingCycle: pricing.cartCycle })}
                              aria-label={`Choose ${plan.name} — continues to GROWUPHOST billing`}
                            >
                              Choose
                              <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
                            </a>
                          </Button>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            <ul className="space-y-5 lg:hidden">
              {plans.map((plan) => {
                const pricing = getPlanPricing(plan, billingCycle, annualDiscountPercent);
                return (
                  <li key={plan.id}>
                    <article
                      className={`rounded-[2rem] border p-7 ${
                        plan.is_featured === true
                          ? "border-blue-500/40 bg-slate-900 shadow-[0_0_35px_rgba(37,99,235,0.25)]"
                          : "border-white/10 bg-slate-900/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-black tracking-tight text-white">
                            {plan.name}
                          </h3>
                          <p className="mt-1 text-xs font-bold tracking-widest text-slate-400 uppercase">
                            {pricing.price.note}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black text-white">
                            {pricing.price.primary}
                          </span>
                          <span className="ml-1 text-xs font-bold tracking-widest text-slate-400 uppercase">
                            {pricing.price.unit}
                          </span>
                        </div>
                      </div>

                      <dl className="mt-6 divide-y divide-white/5 border-y border-white/5">
                        {rows.map((row) => {
                          const value = row.cells[plan.id] ?? null;
                          if (!value) return null;
                          return (
                            <div key={row.label} className="flex gap-4 py-3">
                              <dt className="w-28 shrink-0 text-xs font-black tracking-widest text-slate-400 uppercase">
                                {row.label}
                              </dt>
                              <dd className="flex-1 text-xs font-medium text-slate-300">{value}</dd>
                            </div>
                          );
                        })}
                      </dl>

                      <Button
                        asChild
                        className={`mt-6 w-full rounded-2xl py-7 text-xs font-black tracking-widest uppercase ${
                          plan.is_featured === true ? CTA_PRIMARY : CTA_TIER_NEUTRAL
                        }`}
                      >
                        <a
                          href={resolveProductUrl(plan, { billingCycle: pricing.cartCycle })}
                          aria-label={`Choose ${plan.name} — continues to GROWUPHOST billing`}
                        >
                          Choose {plan.name}
                          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                        </a>
                      </Button>
                    </article>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Package,
  Layers,
  Megaphone,
  Star,
  Image as ImageIcon,
  Link2Off,
  ListX,
  FileText,
  CalendarX,
  FolderOpen,
  TriangleAlert,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Wallet,
  CalendarRange,
  type LucideIcon,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatPrice, toFeatureList } from "@/components/sections/plan-data";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import type { AdminTab } from "../admin-tabs";
import { AdminTableError } from "../admin-table-parts";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

interface OverviewTabProps {
  onNavigate: (tab: AdminTab) => void;
}

interface StatCard {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bg: string;
  tab: AdminTab;
}

const SERIES_COLORS = ["#6366f1", "#a855f7", "#f97316", "#10b981", "#0ea5e9"] as const;

const CYCLE_LABELS: Readonly<Record<string, string>> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  semiannually: "Every 6 months",
  annually: "Annually",
  biennially: "Every 2 years",
  triennially: "Every 3 years",
  onetime: "One-time",
};

function cycleLabel(raw: string): string {
  return CYCLE_LABELS[raw] ?? raw;
}

interface HealthCheck {
  key: string;
  label: string;
  count: number;
  icon: LucideIcon;
  detail: string;
  tab: AdminTab;
}

export function OverviewTab({ onNavigate }: OverviewTabProps) {
  const {
    data: stats,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [products, categories, testimonials, popups] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("categories").select("*", { count: "exact", head: true }),
        supabase.from("testimonials").select("*", { count: "exact", head: true }),
        supabase.from("promo_popups").select("*", { count: "exact", head: true }),
      ]);

      for (const result of [products, categories, testimonials, popups]) {
        if (result.error) throw result.error;
      }
      return {
        products: products.count ?? 0,
        categories: categories.count ?? 0,
        testimonials: testimonials.count ?? 0,
        popups: popups.count ?? 0,
      };
    },
  });

  const {
    data: catalogue,
    isLoading: catalogueLoading,
    isError: catalogueError,
  } = useQuery({
    queryKey: ["admin-overview-catalogue"],
    queryFn: async () => {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from("products").select("*"),
        supabase.from("categories").select("*"),
      ]);
      if (productsRes.error) throw productsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      return {
        products: (productsRes.data ?? []) as ProductRow[],
        categories: (categoriesRes.data ?? []) as CategoryRow[],
      };
    },
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const analytics = useMemo(() => {
    const products = catalogue?.products ?? [];
    const categories = catalogue?.categories ?? [];

    const categoryNameById = new Map<string, string>();
    for (const category of categories) categoryNameById.set(category.id, category.name);

    const countByCategory = new Map<string, number>();
    for (const category of categories) countByCategory.set(category.id, 0);
    for (const product of products) {
      countByCategory.set(product.category_id, (countByCategory.get(product.category_id) ?? 0) + 1);
    }

    const byCategory = [...countByCategory.entries()]
      .map(([id, count]) => ({
        name: categoryNameById.get(id) ?? "Uncategorised",
        products: count,
      }))
      .sort((a, b) => b.products - a.products);

    const countByCycle = new Map<string, number>();
    for (const product of products) {
      countByCycle.set(product.billing_cycle, (countByCycle.get(product.billing_cycle) ?? 0) + 1);
    }
    const byCycle = [...countByCycle.entries()]
      .map(([cycle, count]) => ({ cycle, label: cycleLabel(cycle), count }))
      .sort((a, b) => b.count - a.count);

    let cheapestMonthly: ProductRow | null = null;
    for (const product of products) {
      if (product.billing_cycle !== "monthly") continue;
      if (cheapestMonthly === null || product.price < cheapestMonthly.price) {
        cheapestMonthly = product;
      }
    }

    const hasAnnual = (product: ProductRow) => typeof product.annual_price === "number";

    const missingDestination = products.filter((product) => {
      const hasLink = (product.whmcs_link ?? "").trim().length > 0;
      const hasPid = typeof product.whmcs_pid === "number" && product.whmcs_pid > 0;
      return !hasLink && !hasPid;
    }).length;

    const checks: HealthCheck[] = [
      {
        key: "destination",
        label: "Plans with no buy destination",
        count: missingDestination,
        icon: Link2Off,
        detail:
          "No WHMCS product ID and no custom URL, so the buy button falls back to the generic store front.",
        tab: "products",
      },
      {
        key: "features",
        label: "Plans with no features listed",
        count: products.filter((product) => toFeatureList(product.features).length === 0).length,
        icon: ListX,
        detail: "The plan card renders with an empty body and nothing to compare against.",
        tab: "products",
      },
      {
        key: "description",
        label: "Plans with no description",
        count: products.filter((product) => (product.description ?? "").trim().length === 0).length,
        icon: FileText,
        detail: "The card falls back to generic copy, which also weakens the page for search.",
        tab: "products",
      },
      {
        key: "annual",
        label: "Plans with no annual price",
        count: products.filter((product) => !hasAnnual(product)).length,
        icon: CalendarX,
        detail:
          "The annual side of the pricing toggle only switches the cart term for these — it shows no yearly figure and no saving.",
        tab: "products",
      },
      {
        key: "empty-category",
        label: "Categories with no plans",
        count: categories.filter((category) => (countByCategory.get(category.id) ?? 0) === 0)
          .length,
        icon: FolderOpen,
        detail: "These render as an empty page if they are linked in the navigation.",
        tab: "categories",
      },
    ];

    return {
      total: products.length,
      byCategory,
      byCycle,
      featured: products.filter((product) => product.is_featured === true).length,
      withAnnual: products.filter(hasAnnual).length,
      cheapestMonthly,
      checks,
      issueCount: checks.reduce((sum, check) => sum + check.count, 0),
    };
  }, [catalogue]);

  const cards: StatCard[] = [
    {
      title: "Products",
      value: stats?.products ?? "—",
      icon: Package,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      tab: "products",
    },
    {
      title: "Categories",
      value: stats?.categories ?? "—",
      icon: Layers,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      tab: "categories",
    },
    {
      title: "Popups",
      value: stats?.popups ?? "—",
      icon: Megaphone,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      tab: "marketing",
    },
    {
      title: "Reviews",
      value: stats?.testimonials ?? "—",
      icon: Star,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      tab: "testimonials",
    },
    {
      title: "Storage",
      value: "Library",
      icon: ImageIcon,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      tab: "media",
    },
  ];

  const categoryChartConfig: ChartConfig = {
    products: { label: "Plans", color: SERIES_COLORS[0] },
  };

  const cycleChartConfig: ChartConfig = Object.fromEntries(
    analytics.byCycle.map((entry, index) => [
      entry.cycle,
      {
        label: entry.label,
        color: SERIES_COLORS[index % SERIES_COLORS.length] ?? SERIES_COLORS[0],
      },
    ]),
  );

  const derivedUnavailable = catalogueLoading || catalogueError;
  const chartsReady = mounted && !derivedUnavailable && analytics.total > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black tracking-tighter text-slate-950 dark:text-white">
          Overview
        </h2>
        <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
          {isLoading
            ? "Loading counts…"
            : "Catalogue health and shape, derived from your own rows."}
        </p>
      </div>

      {isError ? (
        <AdminTableError
          entity="counts"
          error={error}
          consequence="The tiles below show a dash instead of a number until this loads."
          onRetry={() => void refetch()}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <button
            key={card.title}
            type="button"
            data-neutral-btn="true"
            onClick={() => onNavigate(card.tab)}
            className={cn(
              "cursor-pointer rounded-[2rem] border-2 border-slate-300 dark:border-white/20 bg-white dark:bg-slate-900/50 p-6 text-left shadow-sm",
              "transition-colors duration-200 hover:border-slate-300 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800/50",
              "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none",
            )}
          >
            <div className="flex items-start justify-between">
              <div className={cn("rounded-2xl p-3", card.bg)}>
                <card.icon className={cn("h-6 w-6", card.color)} aria-hidden="true" />
              </div>
              <div className="text-3xl font-black text-slate-950 dark:text-white">{card.value}</div>
            </div>
            <div className="mt-4 text-xs font-bold tracking-widest text-slate-600 dark:text-slate-300 uppercase">
              {card.title}
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <DerivedStat
          icon={Sparkles}
          label="Featured plans"
          value={derivedUnavailable ? "—" : String(analytics.featured)}
          hint="Shown with the “Most popular” ribbon"
        />
        <DerivedStat
          icon={Wallet}
          label="Cheapest monthly plan"
          value={
            derivedUnavailable
              ? "—"
              : analytics.cheapestMonthly
                ? formatPrice(analytics.cheapestMonthly.price, analytics.cheapestMonthly.currency)
                : "None"
          }
          hint={
            derivedUnavailable
              ? "Catalogue not loaded"
              : (analytics.cheapestMonthly?.name ?? "No monthly-billed plans")
          }
        />
        <DerivedStat
          icon={CalendarRange}
          label="Priced for a year"
          value={derivedUnavailable ? "—" : `${analytics.withAnnual}/${analytics.total}`}
          hint="Plans carrying a real annual price"
        />

        <DerivedStat
          icon={derivedUnavailable || analytics.issueCount > 0 ? TriangleAlert : CheckCircle2}
          label="Needs attention"
          value={derivedUnavailable ? "—" : String(analytics.issueCount)}
          hint={
            catalogueError
              ? "Could not read your catalogue"
              : catalogueLoading
                ? "Checking your rows…"
                : analytics.issueCount > 0
                  ? "See the panel below"
                  : "Nothing outstanding"
          }
          tone={derivedUnavailable ? "neutral" : analytics.issueCount > 0 ? "warn" : "ok"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartPanel
          title="Plans per category"
          description="Where the catalogue is thin. A category at zero renders an empty page."
        >
          {chartsReady ? (
            <ChartContainer
              config={categoryChartConfig}
              className="aspect-auto h-[280px] w-full"
              aria-label={`Bar chart of plans per category. ${analytics.byCategory
                .map((entry) => `${entry.name}: ${entry.products}`)
                .join(". ")}`}
            >
              <BarChart
                data={analytics.byCategory}
                layout="vertical"
                margin={{ left: 8, right: 24, top: 8, bottom: 8 }}
              >
                <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />

                <Bar
                  dataKey="products"
                  fill={SERIES_COLORS[0]}
                  radius={[0, 6, 6, 0]}
                  label={{ position: "right", fill: "#cbd5e1", fontSize: 12 }}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <ChartPlaceholder
              loading={catalogueLoading || !mounted}
              failed={catalogueError}
              emptyMessage="Add a product to see how the catalogue is distributed."
            />
          )}
        </ChartPanel>

        <ChartPanel
          title="Billing terms in use"
          description="Only monthly and annual plans follow the pricing toggle; other terms always bill on their stored cycle."
        >
          {chartsReady ? (
            <>
              <ChartContainer
                config={cycleChartConfig}
                className="aspect-auto h-[280px] w-full"
                aria-label={`Donut chart of billing terms. ${analytics.byCycle
                  .map((entry) => `${entry.label}: ${entry.count}`)
                  .join(". ")}`}
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="cycle" />} />
                  <Pie data={analytics.byCycle} dataKey="count" nameKey="cycle" innerRadius={55}>
                    {analytics.byCycle.map((entry, index) => (
                      <Cell
                        key={entry.cycle}
                        fill={SERIES_COLORS[index % SERIES_COLORS.length] ?? SERIES_COLORS[0]}
                      />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="cycle" />} />
                </PieChart>
              </ChartContainer>

              <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs font-medium text-slate-300">
                {analytics.byCycle.map((entry) => (
                  <li key={entry.cycle}>
                    {entry.label}: <span className="font-bold text-white">{entry.count}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <ChartPlaceholder
              loading={catalogueLoading || !mounted}
              failed={catalogueError}
              emptyMessage="Add a product to see which billing terms you sell on."
            />
          )}
        </ChartPanel>
      </div>

      <section
        aria-labelledby="overview-health-heading"
        className="rounded-[2rem] border-2 border-slate-300 dark:border-white/20 bg-white dark:bg-slate-900/50 p-6 shadow-sm"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3
              id="overview-health-heading"
              className="text-lg font-black tracking-tight text-slate-950 dark:text-white"
            >
              Needs attention
            </h3>
            <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              Blank fields that change what a visitor sees. Nothing here is an error — each one is a
              row you may simply not have filled in yet.
            </p>
          </div>

          {!derivedUnavailable && analytics.issueCount === 0 && (
            <CheckCircle2
              className="h-6 w-6 shrink-0 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
          )}
        </div>

        {derivedUnavailable ? (
          <p className="mt-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/40 p-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            {catalogueError
              ? "These checks read your products and categories, and that read failed — so they would report every check as clear without having looked at a single row. Reload to run them."
              : "Running these checks over your catalogue…"}
          </p>
        ) : (
          <ul className="mt-5 space-y-2">
            {analytics.checks.map((check) => {
              const clear = check.count === 0;
              return (
                <li key={check.key}>
                  <button
                    type="button"
                    data-neutral-btn="true"
                    onClick={() => onNavigate(check.tab)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-4 rounded-2xl border p-4 text-left",
                      "transition-colors duration-200",
                      "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none",
                      clear
                        ? "border-2 border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-900/60"
                        : "border-2 border-red-500/40 bg-red-50 dark:bg-red-500/5 hover:bg-red-100 dark:hover:bg-red-500/10",
                    )}
                  >
                    <span
                      className={cn(
                        "shrink-0 rounded-xl p-2.5",
                        clear ? "bg-slate-200/60 dark:bg-white/5" : "bg-red-100 dark:bg-red-500/10",
                      )}
                    >
                      <check.icon
                        className={cn(
                          "h-5 w-5",
                          clear
                            ? "text-slate-600 dark:text-slate-400"
                            : "text-red-600 dark:text-red-400",
                        )}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-slate-950 dark:text-white">
                        {check.label}
                      </span>
                      <span className="mt-0.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                        {check.detail}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "shrink-0 text-2xl font-black",
                        clear
                          ? "text-slate-500 dark:text-slate-500"
                          : "text-red-600 dark:text-red-400",
                      )}
                    >
                      {check.count}
                    </span>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500"
                      aria-hidden="true"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function DerivedStat({
  icon: Icon,
  label,
  value,
  hint,
  tone = "neutral",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  tone?: "neutral" | "warn" | "ok";
}) {
  return (
    <div className="rounded-[2rem] border-2 border-slate-300 dark:border-white/20 bg-white dark:bg-slate-900/50 p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <Icon
          className={cn(
            "h-5 w-5 shrink-0",
            tone === "warn"
              ? "text-red-500 dark:text-red-400"
              : tone === "ok"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-500 dark:text-slate-400",
          )}
          aria-hidden="true"
        />
        <span className="text-xs font-bold tracking-widest text-slate-600 dark:text-slate-300 uppercase">
          {label}
        </span>
      </div>
      <div
        className={cn(
          "mt-3 text-2xl font-black",
          tone === "warn" ? "text-red-600 dark:text-red-400" : "text-slate-950 dark:text-white",
        )}
      >
        {value}
      </div>
      <p className="mt-1 truncate text-xs font-medium text-slate-500 dark:text-slate-400">{hint}</p>
    </div>
  );
}

function ChartPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border-2 border-slate-300 dark:border-white/20 bg-white dark:bg-slate-900/50 p-6 shadow-sm">
      <h3 className="text-lg font-black tracking-tight text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-1 mb-4 text-xs font-medium text-slate-600 dark:text-slate-300">
        {description}
      </p>
      {children}
    </section>
  );
}

function ChartPlaceholder({
  loading,
  failed,
  emptyMessage,
}: {
  loading: boolean;
  failed: boolean;
  emptyMessage: string;
}) {
  return (
    <div className="flex h-[280px] items-center justify-center rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/40 px-6">
      <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">
        {loading
          ? "Loading catalogue…"
          : failed
            ? "Your catalogue could not be read, so this chart has nothing to plot. Reload to try again."
            : emptyMessage}
      </p>
    </div>
  );
}

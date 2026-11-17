import { toBillingCycle, type BillingCycle } from "@/config/whmcs";
import { useSiteSettings } from "@/hooks/use-site-settings";
import type { Database } from "@/integrations/supabase/types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export type PlanProduct = ProductRow & {
  categories?: { name: string | null; slug?: string | null } | null;
};

export type UiBillingCycle = "monthly" | "annually";

const TOGGLEABLE_CYCLES: readonly BillingCycle[] = ["monthly"];

const CURRENCY_SYMBOLS: Readonly<Record<string, string>> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AUD: "A$",
  CAD: "C$",
};

const CYCLE_UNIT: Readonly<Record<BillingCycle, string>> = {
  monthly: "/mo",
  quarterly: "/qtr",
  semiannually: "/6 mo",
  annually: "/yr",
  biennially: "/2 yr",
  triennially: "/3 yr",
  onetime: "one-time",
};

const CYCLE_TERM: Readonly<Record<BillingCycle, string>> = {
  monthly: "Billed monthly",
  quarterly: "Billed every 3 months",
  semiannually: "Billed every 6 months",
  annually: "Billed every 12 months",
  biennially: "Billed every 24 months",
  triennially: "Billed every 36 months",
  onetime: "One-time payment",
};

export function currencySymbol(currency: string | null | undefined): string {
  if (!currency) return "";
  const key = currency.trim().toUpperCase();
  return CURRENCY_SYMBOLS[key] ?? `${key} `;
}

function groupThousands(integerPart: string): string {
  return integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatNumber(value: number, decimals = 0): string {
  if (!Number.isFinite(value)) return "—";
  const fixed = value.toFixed(decimals);
  const [integerPart = "0", fraction] = fixed.split(".");
  return fraction ? `${groupThousands(integerPart)}.${fraction}` : groupThousands(integerPart);
}

export function formatAmount(amount: number): string {
  if (!Number.isFinite(amount)) return "—";
  const rounded = Math.round(amount * 100) / 100;
  return formatNumber(rounded, Number.isInteger(rounded) ? 0 : 2);
}

export function formatPrice(amount: number, currency: string | null | undefined): string {
  return `${currencySymbol(currency)}${formatAmount(amount)}`;
}

export const ANNUAL_DISCOUNT_SETTING_KEY = "annual_discount_percent";

export function parseDiscountPercent(raw: string | null | undefined): number {
  if (!raw) return 0;
  const parsed = Number.parseFloat(raw.replace("%", "").trim());
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed >= 100) return 0;
  return parsed;
}

export function useAnnualDiscountPercent(): number {
  const { data: settings } = useSiteSettings();
  return parseDiscountPercent(settings?.[ANNUAL_DISCOUNT_SETTING_KEY]);
}

export function resolveCartCycle(
  product: Pick<ProductRow, "billing_cycle">,
  uiCycle: UiBillingCycle,
): BillingCycle {
  const native = toBillingCycle(product.billing_cycle);
  return TOGGLEABLE_CYCLES.includes(native) ? uiCycle : native;
}

export interface PlanPriceView {
  primary: string;

  unit: string;

  strikethrough: string | null;

  note: string;

  effectiveMonthly?: string;
}

export interface PlanPricing {
  cartCycle: BillingCycle;

  followsToggle: boolean;
  price: PlanPriceView;
}

export function getPlanPricing(
  product: PricedProduct,
  uiCycle: UiBillingCycle,
  annualDiscountPercent = 0,
): PlanPricing {
  const native = toBillingCycle(product.billing_cycle);
  const followsToggle = TOGGLEABLE_CYCLES.includes(native);
  const cartCycle = followsToggle ? uiCycle : native;

  const listPrice = product.price;

  const annualTotal = product.annual_price;
  const hasAnnual =
    typeof annualTotal === "number" && Number.isFinite(annualTotal) && annualTotal >= 0;

  if (followsToggle && cartCycle === "annually" && hasAnnual) {
    let note = CYCLE_TERM.annually;
    let strikethrough: string | null = null;

    if (native === "monthly") {
      const twelveMonths = listPrice * 12;
      const saving = twelveMonths - annualTotal;
      if (saving > 0) {
        const savedLabel = formatPrice(saving, product.currency);
        const percentLabel = formatAmount((saving / twelveMonths) * 100);
        note = `Save ${savedLabel} (${percentLabel}%) vs paying monthly`;
        strikethrough = formatPrice(twelveMonths, product.currency);
      }
    }

    return {
      cartCycle,
      followsToggle,
      price: {
        primary: formatPrice(annualTotal, product.currency),

        unit: CYCLE_UNIT.annually,
        strikethrough,
        note,
        effectiveMonthly: formatPrice(annualTotal / 12, product.currency),
      },
    };
  }

  const discountApplies = followsToggle && cartCycle === "annually" && annualDiscountPercent > 0;
  const shownPrice = discountApplies ? listPrice * (1 - annualDiscountPercent / 100) : listPrice;

  const unit = CYCLE_UNIT[native];

  let note: string;
  if (!followsToggle) {
    note = CYCLE_TERM[native];
  } else if (cartCycle === "annually") {
    note = discountApplies
      ? `Save ${formatAmount(annualDiscountPercent)}% on a 12-month term`
      : "12-month term — total confirmed in cart";
  } else {
    note = "Monthly term — cancel any time";
  }

  return {
    cartCycle,
    followsToggle,
    price: {
      primary: formatPrice(shownPrice, product.currency),
      unit,
      strikethrough: discountApplies ? formatPrice(listPrice, product.currency) : null,
      note,
    },
  };
}

export type PricedProduct = Pick<
  ProductRow,
  "price" | "currency" | "billing_cycle" | "annual_price"
>;

function realAnnualSavingPercent(product: PricedProduct): number {
  if (toBillingCycle(product.billing_cycle) !== "monthly") return 0;
  const annualTotal = product.annual_price;
  if (typeof annualTotal !== "number" || !Number.isFinite(annualTotal) || annualTotal < 0) return 0;
  const twelveMonths = product.price * 12;
  if (twelveMonths <= 0) return 0;
  const saving = twelveMonths - annualTotal;
  if (saving <= 0) return 0;
  return (saving / twelveMonths) * 100;
}

export function guaranteedAnnualSavingPercent(products: readonly PricedProduct[]): number {
  let lowest = Number.POSITIVE_INFINITY;

  for (const product of products) {
    if (!TOGGLEABLE_CYCLES.includes(toBillingCycle(product.billing_cycle))) continue;
    const saving = realAnnualSavingPercent(product);
    if (saving <= 0) return 0;
    if (saving < lowest) lowest = saving;
  }

  return Number.isFinite(lowest) ? Math.floor(lowest) : 0;
}

export function resolveToggleSavingPercent(
  products: readonly PricedProduct[],
  annualDiscountPercent: number,
): number {
  const guaranteed = guaranteedAnnualSavingPercent(products);
  return guaranteed > 0 ? guaranteed : annualDiscountPercent;
}

export function toFeatureList(value: ProductRow["features"]): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const entry of value) {
    if (typeof entry === "string") {
      const trimmed = entry.trim();
      if (trimmed) out.push(trimmed);
    } else if (typeof entry === "number") {
      out.push(String(entry));
    }
  }
  return out;
}

export function planDescription(product: Pick<PlanProduct, "description" | "name">): string {
  const description = product.description?.trim();
  if (description) return description;
  return `${product.name} — full specification and current pricing are confirmed at checkout.`;
}

export function planCategoryLabel(product: PlanProduct, fallback = "Hosting"): string {
  const name = product.categories?.name?.trim();
  return name && name.length > 0 ? name : fallback;
}

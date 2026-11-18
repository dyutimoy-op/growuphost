const DEFAULT_WHMCS_BASE_URL = "http://client.growuphost.com";

function readEnvBaseUrl(): string | undefined {
  const raw = import.meta.env["VITE_WHMCS_BASE_URL"];
  return typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : undefined;
}

export const WHMCS_BASE_URL = (readEnvBaseUrl() ?? DEFAULT_WHMCS_BASE_URL).replace(/\/+$/, "");

export type BillingCycle =
  "monthly" | "quarterly" | "semiannually" | "annually" | "biennially" | "triennially" | "onetime";

const BILLING_CYCLES: readonly BillingCycle[] = [
  "monthly",
  "quarterly",
  "semiannually",
  "annually",
  "biennially",
  "triennially",
  "onetime",
];

export function toBillingCycle(value: string | null | undefined): BillingCycle {
  if (!value) return "monthly";
  const normalized = value.trim().toLowerCase();
  const match = BILLING_CYCLES.find((cycle) => cycle === normalized);
  if (match) return match;
  if (normalized === "yearly" || normalized === "annual" || normalized === "yr") return "annually";
  if (normalized === "mo" || normalized === "month") return "monthly";
  return "monthly";
}

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${WHMCS_BASE_URL}${suffix}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export const WHMCS_LINKS = {
  login: buildUrl("/clientarea.php"),

  clientArea: buildUrl("/clientarea.php"),

  register: buildUrl("/register.php"),

  store: buildUrl("/cart.php"),

  domainRegister: buildUrl("/cart.php", { a: "add", domain: "register" }),

  domainTransfer: buildUrl("/cart.php", { a: "add", domain: "transfer" }),

  support: buildUrl("/submitticket.php"),

  tickets: buildUrl("/supporttickets.php"),

  invoices: buildUrl("/clientarea.php", { action: "invoices" }),

  knowledgebase: buildUrl("/knowledgebase.php"),

  announcements: buildUrl("/announcements.php"),

  affiliates: buildUrl("/affiliates.php"),

  passwordReset: buildUrl("/pwreset.php"),
} as const;

export interface WhmcsLinkableProduct {
  whmcs_pid?: number | null;
  whmcs_link?: string | null;
  billing_cycle?: string | null;
}

export interface ResolveProductUrlOptions {
  billingCycle?: BillingCycle | undefined;

  promoCode?: string | undefined;
}

export function resolveProductUrl(
  product: WhmcsLinkableProduct,
  options: ResolveProductUrlOptions = {},
): string {
  const override = product.whmcs_link?.trim();
  if (override) return sanitizeUrl(override, WHMCS_LINKS.store);

  const pid = product.whmcs_pid;
  if (typeof pid === "number" && Number.isFinite(pid) && pid > 0) {
    return buildUrl("/cart.php", {
      a: "add",
      pid,
      billingcycle: options.billingCycle ?? toBillingCycle(product.billing_cycle),
      ...(options.promoCode ? { promocode: options.promoCode } : {}),
    });
  }

  return WHMCS_LINKS.store;
}

export function isExternalUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return /^(https?:)?\/\//i.test(url.trim()) || /^mailto:|^tel:/i.test(url.trim());
}

const SAFE_URL_SCHEMES = ["http:", "https:", "mailto:", "tel:"];

export function sanitizeUrl(url: string | null | undefined, fallback = "#"): string {
  if (!url) return fallback;

  // eslint-disable-next-line no-control-regex
  const cleaned = url.replace(/[\x00-\x1F\x7F]+/g, "").trim();
  if (!cleaned) return fallback;

  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(cleaned)?.[1]?.toLowerCase();
  if (!scheme) return cleaned;
  return SAFE_URL_SCHEMES.includes(`${scheme}:`) ? cleaned : fallback;
}

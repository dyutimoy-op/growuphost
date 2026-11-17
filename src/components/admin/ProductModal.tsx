import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { ExternalLink, Link2, Wallet } from "lucide-react";
import { resolveProductUrl, toBillingCycle, type BillingCycle } from "@/config/whmcs";

import { currencySymbol, formatAmount, formatPrice } from "@/components/sections/plan-data";
import type { CategoryRow, ProductInsert, ProductRow } from "./admin-types";
import { invalidateEntity } from "./admin-invalidation";
import { emptyToNull, getErrorMessage, parseOptionalPositiveInt } from "./admin-utils";

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductRow | null | undefined;
}

interface ProductFormState {
  name: string;
  description: string;
  price: string;

  annual_price: string;
  billing_cycle: string;
  currency: string;
  category_id: string;
  whmcs_pid: string;
  whmcs_link: string;
  features: string;
  is_featured: boolean;
  display_order: string;
}

const EMPTY_FORM: ProductFormState = {
  name: "",
  description: "",
  price: "0",

  annual_price: "",
  billing_cycle: "monthly",
  currency: "INR",
  category_id: "",
  whmcs_pid: "",
  whmcs_link: "",
  features: "",
  is_featured: false,
  display_order: "0",
};

function featuresToText(value: ProductRow["features"]): string {
  if (!Array.isArray(value)) return "";
  return value
    .filter(
      (entry): entry is string | number => typeof entry === "string" || typeof entry === "number",
    )
    .map((entry) => String(entry).trim())
    .filter((entry) => entry.length > 0)
    .join("\n");
}

function textToFeatures(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function toFormState(product: ProductRow): ProductFormState {
  return {
    name: product.name,
    description: product.description ?? "",
    price: String(product.price),

    annual_price: typeof product.annual_price === "number" ? String(product.annual_price) : "",
    billing_cycle: product.billing_cycle,
    currency: product.currency,
    category_id: product.category_id,
    whmcs_pid: typeof product.whmcs_pid === "number" ? String(product.whmcs_pid) : "",
    whmcs_link: product.whmcs_link ?? "",
    features: featuresToText(product.features),
    is_featured: product.is_featured === true,

    display_order: typeof product.display_order === "number" ? String(product.display_order) : "0",
  };
}

type FieldErrors = Partial<
  Record<"name" | "category_id" | "price" | "annual_price" | "whmcs_pid", string>
>;

const BILLING_CYCLES = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "semiannually", label: "Semi-annually" },
  { value: "annually", label: "Annually" },
  { value: "biennially", label: "Biennially" },
  { value: "triennially", label: "Triennially" },
  { value: "onetime", label: "One-time" },
] as const;

const PRICE_TERM_LABEL: Readonly<Record<BillingCycle, string>> = {
  monthly: "Price per month",
  quarterly: "Price per 3 months",
  semiannually: "Price per 6 months",
  annually: "Price per 12 months",
  biennially: "Price per 24 months",
  triennially: "Price per 36 months",
  onetime: "One-time price",
};

interface AnnualComparison {
  twelveMonthlyPayments: number;
  saving: number;
  savingPercent: number;
  effectiveMonthly: number;
}

function compareAnnualPrice(
  priceText: string,
  annualText: string,
  cycle: BillingCycle,
): AnnualComparison | null {
  if (cycle !== "monthly") return null;

  const monthly = Number.parseFloat(priceText.trim());
  const annual = Number.parseFloat(annualText.trim());
  if (!Number.isFinite(monthly) || monthly <= 0) return null;
  if (!Number.isFinite(annual) || annual < 0) return null;

  const twelveMonthlyPayments = monthly * 12;
  if (annual >= twelveMonthlyPayments) return null;

  const saving = twelveMonthlyPayments - annual;
  return {
    twelveMonthlyPayments,
    saving,
    savingPercent: (saving / twelveMonthlyPayments) * 100,
    effectiveMonthly: annual / 12,
  };
}

type LinkMode = "pid" | "custom";

const LINK_MODES = [
  { value: "pid", label: "WHMCS product ID" },
  { value: "custom", label: "Custom URL" },
] as const;

export function ProductModal({ open, onOpenChange, product }: ProductModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ProductFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});

  const [linkMode, setLinkMode] = useState<LinkMode>("pid");

  useEffect(() => {
    setErrors({});
    if (product) {
      setFormData(toFormState(product));

      setLinkMode((product.whmcs_link ?? "").trim().length > 0 ? "custom" : "pid");
    } else {
      setFormData(EMPTY_FORM);
      setLinkMode("pid");
    }
  }, [product, open]);

  const { data: categories } = useQuery({
    queryKey: ["categories-full"],
    queryFn: async (): Promise<CategoryRow[]> => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const patch = (changes: Partial<ProductFormState>): void => {
    setFormData((previous) => ({ ...previous, ...changes }));
  };

  const customUrl = linkMode === "custom" ? formData.whmcs_link : "";
  const customUrlActive = customUrl.trim().length > 0;

  const pidValue = parseOptionalPositiveInt(formData.whmcs_pid);
  const usingStoreFallback = !customUrlActive && typeof pidValue !== "number";

  const resolvedUrl = useMemo(() => {
    const pid = parseOptionalPositiveInt(formData.whmcs_pid);
    return resolveProductUrl({
      whmcs_pid: typeof pid === "number" ? pid : null,
      whmcs_link: customUrl,
      billing_cycle: formData.billing_cycle,
    });
  }, [formData.whmcs_pid, customUrl, formData.billing_cycle]);

  let linkPreviewNote: string;
  if (customUrlActive) {
    linkPreviewNote = "Using the custom URL — it replaces the WHMCS product ID completely.";
  } else if (usingStoreFallback) {
    linkPreviewNote =
      linkMode === "custom"
        ? "The custom URL is empty and no product ID is stored, so this falls back to the WHMCS store front."
        : "No product ID set, so this falls back to the WHMCS store front.";
  } else {
    linkPreviewNote =
      linkMode === "custom"
        ? "The custom URL is empty, so the stored WHMCS product ID is still used."
        : "Built from the WHMCS product ID and billing cycle above.";
  }

  const priceCycle = toBillingCycle(formData.billing_cycle);
  const currencyTag = currencySymbol(formData.currency).trim();
  const annualEntered = formData.annual_price.trim().length > 0;
  const annualComparison = compareAnnualPrice(formData.price, formData.annual_price, priceCycle);

  let annualPreviewNote: string;
  if (priceCycle !== "monthly") {
    annualPreviewNote = `A saving is only worked out against a monthly price — this plan is quoted as “${PRICE_TERM_LABEL[priceCycle]}”.`;
  } else if (!Number.isFinite(Number.parseFloat(formData.price.trim()))) {
    annualPreviewNote = "Fill in the monthly price too and the yearly saving appears here.";
  } else {
    annualPreviewNote =
      "This is the same as — or more than — 12 monthly payments, so no saving is advertised. Check the figure is the 12-month total and not a monthly one.";
  }

  const mutation = useMutation({
    mutationFn: async (payload: ProductInsert) => {
      if (product?.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      void invalidateEntity(queryClient, "products");
      toast.success(product ? "Product updated" : "Product created");
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Could not save the product"));
    },
  });

  const handleSave = (): void => {
    const nextErrors: FieldErrors = {};

    const name = formData.name.trim();
    if (name.length === 0) nextErrors.name = "A product name is required.";

    if (formData.category_id.length === 0) {
      nextErrors.category_id = "Every product must belong to a category.";
    }

    const price = Number.parseFloat(formData.price.trim());
    if (!Number.isFinite(price) || price < 0) {
      nextErrors.price = "Enter a price of 0 or more.";
    }

    const annualText = formData.annual_price.trim();
    let annualPrice: number | null = null;
    if (annualText.length > 0) {
      const parsedAnnual = Number.parseFloat(annualText);
      if (!Number.isFinite(parsedAnnual) || parsedAnnual < 0) {
        nextErrors.annual_price = "Enter an annual price of 0 or more, or leave it blank.";
      } else {
        annualPrice = parsedAnnual;
      }
    }

    const pid = parseOptionalPositiveInt(formData.whmcs_pid);
    if (linkMode === "pid" && pid === undefined) {
      nextErrors.whmcs_pid = "The product ID must be a whole number greater than 0, or left blank.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    const displayOrder = Number.parseInt(formData.display_order.trim(), 10);

    mutation.mutate({
      name,
      description: emptyToNull(formData.description),
      price,
      annual_price: annualPrice,
      billing_cycle: toBillingCycle(formData.billing_cycle),
      currency: formData.currency.trim() || "INR",
      category_id: formData.category_id,

      whmcs_pid: pid === undefined ? (product?.whmcs_pid ?? null) : pid,

      whmcs_link: linkMode === "custom" ? emptyToNull(formData.whmcs_link) : null,
      features: textToFeatures(formData.features),
      is_featured: formData.is_featured,
      display_order: Number.isFinite(displayOrder) ? displayOrder : 0,
    });
  };

  const inputClass =
    "bg-slate-950 border-white/10 text-white rounded-xl min-h-11 transition-colors duration-200 focus-visible:border-blue-500";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl overflow-y-auto rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tighter text-white">
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogDescription className="text-slate-400 font-medium">
            Configure the hosting plan, its pricing, and where its buy button sends the visitor.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-name" className="text-slate-300 font-bold">
                Product Name
              </Label>
              <Input
                id="product-name"
                value={formData.name}
                onChange={(e) => patch({ name: e.target.value })}
                className={inputClass}
                placeholder="Starter Plan"
                aria-invalid={errors.name !== undefined}
                aria-describedby={errors.name ? "product-name-error" : undefined}
              />
              {errors.name && (
                <p id="product-name-error" role="alert" className="text-xs font-bold text-red-400">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-category" className="text-slate-300 font-bold">
                Category
              </Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => patch({ category_id: value })}
              >
                <SelectTrigger
                  id="product-category"
                  className={inputClass}
                  aria-invalid={errors.category_id !== undefined}
                  aria-describedby={errors.category_id ? "product-category-error" : undefined}
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-white">
                  {categories?.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id}
                      className="focus:bg-blue-600 cursor-pointer"
                    >
                      {category.name}
                      {category.parent_id ? " (Subcategory)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && (
                <p
                  id="product-category-error"
                  role="alert"
                  className="text-xs font-bold text-red-400"
                >
                  {errors.category_id}
                </p>
              )}
            </div>
          </div>

          <section
            aria-labelledby="pricing-section-heading"
            className="space-y-4 rounded-[1.5rem] border border-blue-500/20 bg-blue-500/[0.06] p-5"
          >
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-blue-300" aria-hidden="true" />
              <h3
                id="pricing-section-heading"
                className="text-sm font-black uppercase tracking-widest text-blue-200"
              >
                Pricing
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-price" className="text-slate-200 font-bold">
                  {currencyTag
                    ? `${PRICE_TERM_LABEL[priceCycle]} (${currencyTag})`
                    : PRICE_TERM_LABEL[priceCycle]}
                </Label>
                <Input
                  id="product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => patch({ price: e.target.value })}
                  className={inputClass}
                  aria-invalid={errors.price !== undefined}
                  aria-describedby={errors.price ? "product-price-error" : undefined}
                />
                {errors.price && (
                  <p
                    id="product-price-error"
                    role="alert"
                    className="text-xs font-bold text-red-400"
                  >
                    {errors.price}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-billing" className="text-slate-200 font-bold">
                  Billing Cycle
                </Label>
                <Select
                  value={toBillingCycle(formData.billing_cycle)}
                  onValueChange={(value) => patch({ billing_cycle: value })}
                >
                  <SelectTrigger
                    id="product-billing"
                    className={inputClass}
                    aria-describedby="product-billing-help"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    {BILLING_CYCLES.map((cycle) => (
                      <SelectItem
                        key={cycle.value}
                        value={cycle.value}
                        className="focus:bg-blue-600 cursor-pointer"
                      >
                        {cycle.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p id="product-billing-help" className="text-xs text-slate-300 font-medium">
                  The term the price above covers, and the cart link&apos;s billing cycle.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-annual-price" className="text-slate-200 font-bold">
                Annual price (12-month total)
              </Label>
              <Input
                id="product-annual-price"
                type="number"
                min="0"
                step="0.01"
                value={formData.annual_price}
                onChange={(e) => patch({ annual_price: e.target.value })}
                className={inputClass}
                placeholder="Optional — leave blank for no annual price"
                aria-invalid={errors.annual_price !== undefined}
                aria-describedby={
                  errors.annual_price
                    ? "product-annual-price-help product-annual-price-error"
                    : "product-annual-price-help"
                }
              />
              <p
                id="product-annual-price-help"
                className="text-xs text-slate-300 font-medium leading-relaxed"
              >
                <strong className="font-black text-slate-200">Optional.</strong> The whole amount
                WHMCS charges for 12 months — copy it from WHMCS rather than working it out, and do
                not enter a monthly figure here. Leave it blank and the site&apos;s annual toggle
                only changes the term the cart opens on; the price a visitor sees stays the same.
              </p>
              {errors.annual_price && (
                <p
                  id="product-annual-price-error"
                  role="alert"
                  className="text-xs font-bold text-red-400"
                >
                  {errors.annual_price}
                </p>
              )}
            </div>

            {annualEntered && (
              <div className="space-y-1 rounded-xl border border-white/10 bg-slate-950 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                  Annual term
                </p>
                {annualComparison ? (
                  <>
                    <p className="text-xs font-bold text-emerald-300">
                      {formatPrice(annualComparison.effectiveMonthly, formData.currency)} per month
                      — saving {formatPrice(annualComparison.saving, formData.currency)} (
                      {formatAmount(annualComparison.savingPercent)}%) against{" "}
                      {formatPrice(annualComparison.twelveMonthlyPayments, formData.currency)} for
                      12 monthly payments.
                    </p>
                    <p className="text-xs font-medium text-slate-300">
                      Both figures come from the two prices above — no discount is invented.
                    </p>
                  </>
                ) : (
                  <p className="text-xs font-medium text-slate-300">{annualPreviewNote}</p>
                )}
              </div>
            )}
          </section>

          <section
            aria-labelledby="link-section-heading"
            className="space-y-4 rounded-[1.5rem] border border-blue-500/20 bg-blue-500/[0.06] p-5"
          >
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-blue-300" aria-hidden="true" />
              <h3
                id="link-section-heading"
                className="text-sm font-black uppercase tracking-widest text-blue-200"
              >
                Buy Button Destination
              </h3>
            </div>

            <div className="space-y-2">
              <span id="product-link-mode-label" className="block text-sm font-bold text-slate-200">
                Link this product by
              </span>
              <div
                role="radiogroup"
                aria-labelledby="product-link-mode-label"
                aria-describedby="product-link-mode-help"
                className="grid grid-cols-1 sm:grid-cols-2 gap-1 rounded-xl border border-white/10 bg-slate-950 p-1"
              >
                {LINK_MODES.map((mode) => {
                  const active = linkMode === mode.value;
                  return (
                    <button
                      key={mode.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setLinkMode(mode.value)}
                      className={`min-h-11 rounded-lg px-4 text-xs font-black uppercase tracking-widest cursor-pointer transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        active
                          ? "bg-blue-600 text-white"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {mode.label}
                    </button>
                  );
                })}
              </div>
              <p
                id="product-link-mode-help"
                className="text-xs text-slate-300 font-medium leading-relaxed"
              >
                Pick whichever this product actually uses — only one destination is ever active. A
                WHMCS product ID you have already entered stays on the record either way, so you can
                switch back without retyping it.
              </p>
            </div>

            {linkMode === "pid" ? (
              <div className="space-y-2">
                <Label htmlFor="product-whmcs-pid" className="text-slate-200 font-bold">
                  WHMCS Product ID
                </Label>
                <Input
                  id="product-whmcs-pid"
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  value={formData.whmcs_pid}
                  onChange={(e) => patch({ whmcs_pid: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. 12"
                  aria-invalid={errors.whmcs_pid !== undefined}
                  aria-describedby={
                    errors.whmcs_pid
                      ? "product-whmcs-pid-help product-whmcs-pid-error"
                      : "product-whmcs-pid-help"
                  }
                />
                <p
                  id="product-whmcs-pid-help"
                  className="text-xs text-slate-300 font-medium leading-relaxed"
                >
                  The <code className="text-blue-300">pid</code> from the product&apos;s URL in
                  WHMCS (e.g. <code className="text-blue-300">…/cart.php?a=add&amp;pid=12</code>).
                  Cart links are generated automatically from it — leave it blank and the buy button
                  falls back to the WHMCS store front.
                </p>
                {errors.whmcs_pid && (
                  <p
                    id="product-whmcs-pid-error"
                    role="alert"
                    className="text-xs font-bold text-red-400"
                  >
                    {errors.whmcs_pid}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="product-whmcs-link" className="text-slate-200 font-bold">
                  Custom URL
                </Label>
                <Input
                  id="product-whmcs-link"
                  type="url"
                  value={formData.whmcs_link}
                  onChange={(e) => patch({ whmcs_link: e.target.value })}
                  className={inputClass}
                  placeholder="https://client.growuphost.com/promo-bundle"
                  aria-describedby="product-whmcs-link-help"
                />
                <p
                  id="product-whmcs-link-help"
                  className="text-xs text-slate-300 font-medium leading-relaxed"
                >
                  For products that are not bought through a WHMCS cart link: your own order form, a
                  promo landing page, or an external partner&apos;s site. Any full URL works, and it
                  replaces the WHMCS product ID completely. Leave it empty and the product falls
                  back to its product ID, so switch to the other option instead if you want the cart
                  link back.
                </p>
              </div>
            )}

            <div className="space-y-2 rounded-xl border border-white/10 bg-slate-950 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                Buy button will open
              </p>
              <a
                href={resolvedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-2 text-xs font-bold text-blue-300 hover:text-blue-200 underline decoration-blue-500/40 break-all transition-colors duration-200 cursor-pointer"
              >
                {resolvedUrl}
                <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
              </a>
              <p className="text-xs font-medium text-slate-300">{linkPreviewNote}</p>
            </div>
          </section>

          <div className="space-y-2">
            <Label htmlFor="product-description" className="text-slate-300 font-bold">
              Description / Caption
            </Label>
            <Textarea
              id="product-description"
              value={formData.description}
              onChange={(e) => patch({ description: e.target.value })}
              className="bg-slate-950 border-white/10 text-white rounded-xl h-24 transition-colors duration-200 focus-visible:border-blue-500"
              placeholder="Premium NVMe SSD, free SSL, 24/7 support…"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-features" className="text-slate-300 font-bold">
              Features
            </Label>
            <Textarea
              id="product-features"
              value={formData.features}
              onChange={(e) => patch({ features: e.target.value })}
              className="bg-slate-950 border-white/10 text-white rounded-xl h-32 transition-colors duration-200 focus-visible:border-blue-500"
              placeholder={"10 GB NVMe storage\nUnmetered bandwidth\nFree SSL certificate"}
              aria-describedby="product-features-help"
            />
            <p id="product-features-help" className="text-xs text-slate-300 font-medium">
              One feature per line. These are the bullet points shown on the plan card.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-8 bg-slate-950/50 p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <Switch
                id="product-featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => patch({ is_featured: checked })}
                className="cursor-pointer"
              />
              <Label
                htmlFor="product-featured"
                className="text-white font-bold text-sm cursor-pointer"
              >
                Featured Product
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Label
                htmlFor="product-order"
                className="text-slate-300 text-sm font-bold whitespace-nowrap"
              >
                Display Order
              </Label>
              <Input
                id="product-order"
                type="number"
                step="1"
                value={formData.display_order}
                onChange={(e) => patch({ display_order: e.target.value })}
                className="bg-slate-950 border-white/10 text-white w-24 h-11 rounded-xl"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
            className="text-slate-300 hover:text-white hover:bg-white/5 rounded-xl font-bold min-h-11 cursor-pointer transition-colors duration-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 rounded-xl min-h-11 cursor-pointer transition-colors duration-200"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving…" : "Save Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

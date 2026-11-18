import { useState, useEffect, useRef, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { X, ArrowRight, Copy, Check, Heart, RefreshCw } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { sanitizeUrl } from "@/config/whmcs";
import { asInternalPath } from "@/lib/internal-links";
import { useBrokenImage } from "@/hooks/use-broken-image";
import { toMediaSrc } from "@/lib/media-url";

const CTA_CLASS =
  "w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#f6b82c] to-[#e89e17] hover:from-[#f9c64a] hover:to-[#f3a822] text-slate-950 rounded-full py-3.5 sm:py-4 px-8 text-sm sm:text-base font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/25 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

function getPromoEyebrow(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes("black friday")) return "BLACK FRIDAY SALE";
  if (lower.includes("cyber monday")) return "CYBER MONDAY DEAL";
  if (lower.includes("new year")) return "NEW YEAR SPECIAL";
  if (lower.includes("initial")) return "SPECIAL PROMOTION";
  if (lower.includes("summer")) return "SUMMER SALE";
  return "EXCLUSIVE DEAL";
}

function formatPromoTitle(title: string) {
  // If title has pattern "Extra 10% OFF ...", highlight "Extra 10%" in gold and the rest in white
  const extraPctRegex = /^(Extra\s+\d+%)\s*(.*)$/i;
  const matchExtra = title.match(extraPctRegex);
  if (matchExtra && matchExtra[1]) {
    return (
      <>
        <span className="text-[#f6b82c] font-black">{matchExtra[1]} </span>
        <span className="text-white font-black">{matchExtra[2]}</span>
      </>
    );
  }

  // If title has pattern "50% OFF ...", highlight "50% OFF" in gold
  const pctOffRegex = /^(\d+%\s*OFF|Save\s+\d+%|Up to\s+\d+%\s*OFF)\s*(.*)$/i;
  const matchPct = title.match(pctOffRegex);
  if (matchPct && matchPct[1]) {
    return (
      <>
        <span className="text-[#f6b82c] font-black">{matchPct[1]} </span>
        <span className="text-white font-black">{matchPct[2]}</span>
      </>
    );
  }

  // Fallback: first word in gold, remainder in white
  const parts = title.split(" ");
  if (parts.length > 1) {
    return (
      <>
        <span className="text-[#f6b82c] font-black">{parts[0]} </span>
        <span className="text-white font-black">{parts.slice(1).join(" ")}</span>
      </>
    );
  }
  return <span className="text-white font-black">{title}</span>;
}

function formatPromoDescription(desc: string) {
  const lines = desc.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length > 1) {
    return (
      <>
        <p className="text-white/95 text-sm sm:text-base font-semibold leading-relaxed">{lines[0]}</p>
        <p className="text-white/60 text-xs sm:text-sm leading-relaxed mt-1.5">{lines.slice(1).join(" ")}</p>
      </>
    );
  }
  return <p className="text-white/85 text-xs sm:text-sm font-medium leading-relaxed">{desc}</p>;
}

function PromoCta({
  href,
  onActivate,
  children,
}: {
  href: string;
  onActivate: () => void;
  children: ReactNode;
}) {
  const internal = asInternalPath(href);

  if (internal) {
    return (
      <Link to={internal} onClick={onActivate} className={CTA_CLASS}>
        <span>{children}</span>
        <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
      </Link>
    );
  }

  return (
    <a href={href} onClick={onActivate} className={CTA_CLASS}>
      <span>{children}</span>
      <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
    </a>
  );
}

export const PromoPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);

  const { data: activePopup } = useQuery({
    queryKey: ["active-promo-popup"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promo_popups")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const isDismissed = localStorage.getItem("promo-popup-dismissed");
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (activePopup && !dismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [activePopup, dismissed]);

  const handleClose = (dontShowAgain = false) => {
    setIsOpen(false);
    if (dontShowAgain) {
      localStorage.setItem("promo-popup-dismissed", "true");
      setDismissed(true);
    }
  };

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const opener = document.activeElement;
    const dialog = dialogRef.current;
    dialog?.focus();

    const handleTab = (event: KeyboardEvent): void => {
      if (event.key !== "Tab" || !dialog) return;

      const focusable = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
        (node) => node.getClientRects().length > 0,
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first || !last) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleTab);
    return () => {
      window.removeEventListener("keydown", handleTab);
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, [isOpen]);

  const promoImageSrc = toMediaSrc(activePopup?.image_url);
  const promoImage = useBrokenImage(promoImageSrc);

  const [copied, setCopied] = useState(false);
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (copyResetTimer.current !== null) clearTimeout(copyResetTimer.current);
    },
    [],
  );

  const handleCopyCoupon = async (code: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success(`Coupon code ${code} copied!`);
      if (copyResetTimer.current !== null) clearTimeout(copyResetTimer.current);
      copyResetTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy automatically — tap the code to select it");
    }
  };

  const ctaUrl = activePopup ? sanitizeUrl(activePopup.cta_url, "") : "";

  const cardMotion = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { scale: 0.92, y: 16 }, animate: { scale: 1, y: 0 }, exit: { scale: 0.92, y: 16 } };

  return (
    <AnimatePresence>
      {activePopup && !dismissed && isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <motion.div
            {...cardMotion}
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="promo-popup-title"
            className="relative w-full max-w-[420px] rounded-[2.5rem] border border-purple-500/30 bg-gradient-to-b from-[#1c1134] via-[#140b28] to-[#0d061a] p-6 sm:p-8 text-center shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden focus:outline-none"
          >
            {/* Ambient Purple/Amber glow in background */}
            <div
              className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-44 bg-purple-600/30 blur-3xl rounded-full"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 blur-3xl rounded-full"
              aria-hidden="true"
            />

            {/* Circular Close Button */}
            <button
              type="button"
              onClick={() => handleClose()}
              aria-label="Close promotion"
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative z-10 flex flex-col items-center">
              {/* 1. Centered floating visual / icon */}
              {promoImageSrc && !promoImage.isBroken ? (
                <div className="relative mb-3 flex items-center justify-center">
                  <div className="absolute inset-0 bg-purple-500/30 blur-xl rounded-full" />
                  <img
                    src={promoImageSrc}
                    ref={promoImage.mediaRef}
                    alt=""
                    className="relative max-h-24 max-w-36 object-contain drop-shadow-[0_8px_20px_rgba(168,85,247,0.4)]"
                    loading="lazy"
                    decoding="async"
                    onError={promoImage.handleError}
                  />
                </div>
              ) : (
                <div className="relative mb-3.5 flex items-center justify-center">
                  <div className="absolute inset-0 w-20 h-20 -top-2 left-1/2 -translate-x-1/2 bg-purple-600/40 blur-2xl rounded-full pointer-events-none" />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2a1745] via-[#1b0d30] to-[#110620] border border-purple-500/30 shadow-[0_8px_25px_rgba(168,85,247,0.35)]">
                    <Heart className="h-7 w-7 text-purple-300 fill-purple-400/40 drop-shadow-[0_2px_8px_rgba(168,85,247,0.6)]" />
                  </div>
                </div>
              )}

              {/* 2. Glass Eyebrow Pill */}
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md px-4 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-white/90 shadow-sm mb-3">
                <span>{getPromoEyebrow(activePopup.title)}</span>
              </div>

              {/* 3. Main Heading with Golden Amber Accent */}
              <h2
                id="promo-popup-title"
                className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight mb-3"
              >
                {formatPromoTitle(activePopup.title)}
              </h2>

              {/* 4. Sub-badge highlight pill (Same Renewal) */}
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300 mb-3.5">
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Same Renewal</span>
              </div>

              {/* 5. Description text */}
              {activePopup.description && (
                <div className="space-y-1 mb-4 text-center max-w-xs">
                  {formatPromoDescription(activePopup.description)}
                </div>
              )}

              {/* 6. Dashed Golden Coupon Box */}
              {activePopup.coupon_code && (
                <div className="w-full flex justify-center mb-5">
                  <button
                    type="button"
                    onClick={() => void handleCopyCoupon(activePopup.coupon_code ?? "")}
                    className="group inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-amber-400/80 bg-amber-400/5 hover:bg-amber-400/10 px-6 py-3 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm"
                    title="Click to copy coupon code"
                  >
                    <span className="font-mono text-xl font-black tracking-widest text-amber-300 select-all">
                      {activePopup.coupon_code}
                    </span>
                    <span className="flex items-center text-amber-400 group-hover:text-amber-300 transition-colors">
                      {copied ? (
                        <Check className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                      ) : (
                        <Copy className="h-5 w-5" aria-hidden="true" />
                      )}
                    </span>
                  </button>
                </div>
              )}

              {/* 7. Golden Amber CTA Button */}
              <div className="w-full flex flex-col items-center gap-3">
                {ctaUrl ? (
                  <PromoCta href={ctaUrl} onActivate={() => handleClose(true)}>
                    {activePopup.cta_text || "Grab This Deal"}
                  </PromoCta>
                ) : (
                  <button type="button" onClick={() => handleClose(true)} className={CTA_CLASS}>
                    <span>{activePopup.cta_text || "Grab This Deal"}</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </button>
                )}

                {/* 8. "Maybe later" Link */}
                <button
                  type="button"
                  onClick={() => handleClose(true)}
                  className="text-xs font-semibold text-white/60 hover:text-white underline underline-offset-4 transition-colors cursor-pointer focus-visible:outline-none pt-1"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

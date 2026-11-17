import { useState, useEffect, useRef, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { X, ExternalLink, ArrowRight, Tag, Copy, Check } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { sanitizeUrl } from "@/config/whmcs";
import { asInternalPath } from "@/lib/internal-links";
import { useBrokenImage } from "@/hooks/use-broken-image";
import { toMediaSrc } from "@/lib/media-url";

const CTA_CLASS =
  "w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-5 text-lg font-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-blue-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

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
        {children}
        <ArrowRight className="w-5 h-5" />
      </Link>
    );
  }

  return (
    <a href={href} onClick={onActivate} className={CTA_CLASS}>
      {children}
      <ExternalLink className="w-5 h-5" />
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
      }, 2000);
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
      if (copyResetTimer.current !== null) clearTimeout(copyResetTimer.current);
      copyResetTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy automatically — tap the code to select it");
    }
  };

  const ctaUrl = activePopup ? sanitizeUrl(activePopup.cta_url, "") : "";

  const cardMotion = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { scale: 0.9, y: 20 }, animate: { scale: 1, y: 0 }, exit: { scale: 0.9, y: 20 } };

  return (
    <AnimatePresence>
      {activePopup && !dismissed && isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            {...cardMotion}
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="promo-popup-title"
            className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl focus:outline-none"
          >
            <button
              type="button"
              onClick={() => handleClose()}
              aria-label="Close promotion"
              className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white/70 hover:text-white hover:bg-black/40 transition-colors z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <X className="w-5 h-5" />
            </button>

            {promoImageSrc && !promoImage.isBroken && (
              <div className="relative h-64 w-full">
                <img
                  src={promoImageSrc}
                  ref={promoImage.mediaRef}
                  alt={activePopup.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  onError={promoImage.handleError}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              </div>
            )}

            <div className="p-8 space-y-6 text-center">
              <div className="space-y-2">
                <h2
                  id="promo-popup-title"
                  className="text-3xl font-black text-white tracking-tight"
                >
                  {activePopup.title}
                </h2>
                {activePopup.description && (
                  <p className="text-slate-400 font-medium leading-relaxed">
                    {activePopup.description}
                  </p>
                )}
              </div>

              {activePopup.coupon_code && (
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                  <Tag className="w-5 h-5 shrink-0 text-blue-400" aria-hidden="true" />

                  <span className="select-all text-lg font-black text-blue-400 tracking-wider">
                    {activePopup.coupon_code}
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleCopyCoupon(activePopup.coupon_code ?? "")}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-blue-400/30 bg-blue-500/10 px-3 text-xs font-black tracking-widest text-blue-200 uppercase transition-colors hover:bg-blue-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                    ) : (
                      <Copy className="h-4 w-4 shrink-0" aria-hidden="true" />
                    )}
                    Copy code
                  </button>

                  <span role="status" className="sr-only">
                    {copied ? "Coupon code copied" : ""}
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {ctaUrl ? (
                  <PromoCta href={ctaUrl} onActivate={() => handleClose(true)}>
                    {activePopup.cta_text || "Claim Offer"}
                  </PromoCta>
                ) : (
                  <button type="button" onClick={() => handleClose(true)} className={CTA_CLASS}>
                    {activePopup.cta_text || "Got it"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleClose(true)}
                  className="text-sm font-bold text-slate-400 hover:text-slate-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-md"
                >
                  Don't show this again
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

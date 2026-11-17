import type { UiBillingCycle } from "./plan-data";
import { formatAmount } from "./plan-data";

export interface BillingCycleToggleProps {
  value: UiBillingCycle;
  onChange: (value: UiBillingCycle) => void;
  annualSavingPercent?: number;
  size?: "sm" | "md";
  className?: string;
}

export function BillingCycleToggle({
  value,
  onChange,
  annualSavingPercent = 0,
  size = "md",
  className = "",
}: BillingCycleToggleProps) {
  const isMonthly = value === "monthly";
  const isAnnually = value === "annually";

  const btnPadding =
    size === "sm" ? "px-4 py-2 text-xs" : "px-6 py-2.5 sm:px-7 sm:py-3 text-xs sm:text-sm";

  return (
    <div
      role="group"
      aria-label="Choose billing term"
      className={`billing-cycle-toggle inline-flex items-center gap-2 p-1.5 sm:p-2 rounded-full border-2 border-slate-300 dark:border-white/20 bg-white/95 dark:bg-slate-900/90 shadow-md backdrop-blur-md shrink-0 transition-all ${className}`}
    >
      <button
        type="button"
        onClick={() => onChange("monthly")}
        aria-pressed={isMonthly}
        data-toggle-active={isMonthly ? "true" : undefined}
        data-neutral-btn={!isMonthly ? "true" : undefined}
        className={`billing-toggle-btn rounded-full font-black uppercase tracking-wider transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${btnPadding} ${
          isMonthly
            ? "active-toggle bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-500 scale-100"
            : "inactive-toggle bg-transparent text-slate-800 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10"
        }`}
      >
        Monthly
      </button>

      <button
        type="button"
        onClick={() => onChange("annually")}
        aria-pressed={isAnnually}
        data-toggle-active={isAnnually ? "true" : undefined}
        data-neutral-btn={!isAnnually ? "true" : undefined}
        className={`billing-toggle-btn inline-flex items-center gap-2.5 rounded-full font-black uppercase tracking-wider transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${btnPadding} ${
          isAnnually
            ? "active-toggle bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-500 scale-100"
            : "inactive-toggle bg-transparent text-slate-800 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10"
        }`}
      >
        <span>Annually</span>
        {annualSavingPercent > 0 ? (
          <span
            className={`toggle-save-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase transition-colors ${
              isAnnually
                ? "bg-amber-300 text-slate-950 shadow-xs"
                : "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30"
            }`}
          >
            −{formatAmount(annualSavingPercent)}%
          </span>
        ) : (
          <span
            className={`toggle-save-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase transition-colors ${
              isAnnually
                ? "bg-amber-300 text-slate-950 shadow-xs"
                : "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30"
            }`}
          >
            Save 20%
          </span>
        )}
      </button>
    </div>
  );
}

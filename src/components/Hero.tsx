import { Link } from "@tanstack/react-router";
import { motion, type MotionProps } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Cpu,
  Gauge,
  HardDrive,
  LayoutGrid,
  ShieldCheck,
  Zap,
  Activity,
  type LucideIcon,
} from "lucide-react";

import { CTA_PRIMARY, CTA_SECONDARY } from "@/components/sections/cta-styles";
import { Button } from "@/components/ui/button";
import { sanitizeUrl, WHMCS_LINKS } from "@/config/whmcs";
import { useHydratedReducedMotion } from "@/hooks/use-hydrated-reduced-motion";
import { useSiteSettings } from "@/hooks/use-site-settings";

const DEFAULT_HEADLINE_LEAD = "Trust your site to India's #1 web host with";
const DEFAULT_HEADLINE_EMPHASIS = "LiteSpeed 20x Speed";
const DEFAULT_SUBHEADLINE =
  "Blazing-fast High-Speed Enterprise NVMe SSD cloud hosting with LiteSpeed 20x speed engine, 99.9% uptime SLA & 24/7 expert engineer support in Mumbai Datacenter.";

const TRUST_CHIPS: readonly { icon: LucideIcon; label: string }[] = [
  { icon: Building2, label: "Tier 4 Mumbai DC" },
  { icon: HardDrive, label: "100% NVMe RAID-10" },
  { icon: Zap, label: "LiteSpeed 20x Engine" },
  { icon: ShieldCheck, label: "Anti-DDoS Scrubbing" },
];

const PROOF_STAT = { value: "99.9%", label: "Uptime SLA" } as const;

const FLOATING_METRICS: readonly {
  icon: LucideIcon;
  label: string;
  value: string;
  unit: string;
}[] = [
  { icon: Gauge, label: "Latency across India", value: "< 4", unit: "ms" },
  { icon: Cpu, label: "LiteSpeed Engine", value: "20x", unit: "faster" },
  { icon: ShieldCheck, label: "Attacks Filtered", value: "100%", unit: "automated" },
];

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];
const DURATION_S = 0.28;
const STAGGER_S = 0.04;

function entrance(
  animated: boolean,
  step: number,
  from: { opacity: number; y?: number; scale?: number },
): MotionProps & { "data-reveal": "" } {
  if (!animated) return { "data-reveal": "" };
  return {
    "data-reveal": "",
    initial: from,
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: DURATION_S, delay: step * STAGGER_S, ease: EASE_OUT },
  };
}

function LiveDot() {
  return (
    <span className="relative inline-flex h-2 w-2 shrink-0" aria-hidden="true">
      <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
    </span>
  );
}

export function Hero() {
  const { data: settings } = useSiteSettings();
  const prefersReducedMotion = useHydratedReducedMotion();
  const animated = !prefersReducedMotion;

  const headlineRaw = settings?.["banner_headline"]?.trim();
  const lead = headlineRaw ? headlineRaw : DEFAULT_HEADLINE_LEAD;
  const emphasis = headlineRaw ? "" : DEFAULT_HEADLINE_EMPHASIS;

  const subheadline =
    settings?.["banner_subheadline"]?.trim() ||
    settings?.["banner_subtext"]?.trim() ||
    DEFAULT_SUBHEADLINE;
  const primaryCtaUrl = sanitizeUrl(settings?.["hero_cta_url"], WHMCS_LINKS.store);

  return (
    <section
      className="relative z-10 overflow-hidden bg-slate-50 dark:bg-slate-950 pt-28 pb-12 sm:pt-40 sm:pb-20 lg:pt-48 lg:pb-28"
      aria-labelledby="hero-heading"
    >
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='8' cy='8' r='1' fill='%2338bdf8' fill-opacity='0.12'/%3E%3C/svg%3E\")",
            backgroundSize: "16px 16px",
            maskImage: "linear-gradient(to bottom, #000 70%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, #000 70%, transparent 100%)",
          }}
        />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-blue-600/12 blur-[140px]" />
        <div className="absolute top-10 right-0 h-[400px] w-[400px] rounded-full bg-sky-500/10 blur-[120px]" />
        <div className="absolute bottom-10 left-0 h-[350px] w-[350px] rounded-full bg-blue-700/10 blur-[100px]" />
      </div>

      <div className="relative z-20 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <motion.div
              className="inline-flex items-center gap-2.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-black tracking-wide text-blue-700 dark:text-blue-300 uppercase shadow-[0_0_20px_rgba(37,99,235,0.15)]"
              {...entrance(animated, 0, { opacity: 0, y: 12 })}
            >
              <LiveDot />
              <Zap
                className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400"
                aria-hidden="true"
              />
              <span>India&apos;s Ultra-Fast Cloud Platform</span>
            </motion.div>

            <motion.h1
              id="hero-heading"
              className="mt-4 sm:mt-6 text-2xl sm:text-4xl lg:text-6xl font-black tracking-tight text-slate-950 dark:text-white uppercase leading-[1.08]"
              {...entrance(animated, 1, { opacity: 0, y: 12 })}
            >
              {lead}{" "}
              {emphasis && (
                <span className="block mt-1 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-600 dark:from-blue-400 dark:via-sky-300 dark:to-blue-500 bg-clip-text text-transparent italic drop-shadow-[0_0_30px_rgba(56,189,248,0.25)]">
                  {emphasis}
                  <span className="text-blue-600 dark:text-blue-400 not-italic font-normal animate-pulse ml-1">
                    |
                  </span>
                </span>
              )}
            </motion.h1>

            <motion.p
              className="mt-3 sm:mt-5 max-w-2xl text-sm sm:text-base lg:text-lg font-medium text-slate-800 dark:text-slate-300 leading-relaxed"
              {...entrance(animated, 2, { opacity: 0, y: 12 })}
            >
              {subheadline}
            </motion.p>

            <motion.div
              className="mt-5 sm:mt-6 flex flex-wrap gap-2 sm:gap-2.5"
              {...entrance(animated, 3, { opacity: 0, y: 12 })}
            >
              {TRUST_CHIPS.map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl border border-slate-300 bg-white text-slate-900 shadow-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-300 px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold tracking-wide"
                >
                  <chip.icon
                    className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600 dark:text-blue-400 shrink-0"
                    aria-hidden="true"
                  />
                  {chip.label}
                </span>
              ))}
            </motion.div>

            <motion.div
              className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto"
              {...entrance(animated, 4, { opacity: 0, y: 12 })}
            >
              <Button
                size="lg"
                className={`h-12 sm:h-14 rounded-xl sm:rounded-2xl px-6 sm:px-8 text-xs sm:text-sm font-black tracking-wide ${CTA_PRIMARY}`}
                asChild
              >
                <a href={primaryCtaUrl} className="group">
                  Deploy Now{" "}
                  <ArrowRight
                    className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </a>
              </Button>

              <Button
                size="lg"
                className={`h-12 sm:h-14 rounded-xl sm:rounded-2xl px-5 sm:px-7 text-xs sm:text-sm font-black tracking-wide ${CTA_SECONDARY}`}
                asChild
              >
                <Link to="/packages">
                  <LayoutGrid className="mr-2 h-4 w-4 text-white" aria-hidden="true" /> Explore
                  Plans
                </Link>
              </Button>

              <div className="flex items-center gap-3 sm:gap-4 pt-1 sm:pt-0 sm:pl-4 sm:border-l sm:border-slate-300 dark:sm:border-white/10">
                <div>
                  <span className="block text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight tabular-nums">
                    {PROOF_STAT.value}
                  </span>
                  <span className="block text-[10px] sm:text-[11px] font-bold tracking-widest text-slate-600 dark:text-slate-400 uppercase">
                    {PROOF_STAT.label}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-5 relative">
            <motion.div
              className="relative rounded-2xl sm:rounded-3xl border border-blue-500/20 bg-white dark:bg-slate-900/80 p-4 sm:p-8 backdrop-blur-2xl shadow-xl dark:shadow-[0_20px_60px_-15px_rgba(37,99,235,0.25)]"
              {...entrance(animated, 2, { opacity: 0, scale: 0.98 })}
            >
              <div
                className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                aria-hidden="true"
              />

              <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Activity className="h-5 w-5 motion-safe:animate-pulse" />
                  </div>
                  <div>
                    <span className="block text-xs font-black tracking-widest uppercase text-slate-500 dark:text-slate-400">
                      Primary Infrastructure
                    </span>
                    <span className="text-sm font-black text-slate-950 dark:text-white">
                      Mumbai Datacenter (India)
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                  All Live
                </span>
              </div>

              <div className="relative my-6 flex justify-center items-center overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 p-4 sm:p-6 min-h-[220px]">
                <img
                  src="/growuphost/home.png"
                  alt="GROWUPHOST Cloud Infrastructure"
                  className="max-h-[190px] w-auto object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] transition-transform duration-300 hover:scale-105"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />

                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-blue-500/30 text-[11px] font-bold text-slate-900 dark:text-white shadow-md backdrop-blur-md">
                  <img
                    src="/growuphost/litespeed.png"
                    alt=""
                    className="h-3.5 w-3.5 object-contain"
                  />
                  <span>LiteSpeed 20x</span>
                </div>
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-blue-500/30 text-[11px] font-bold text-slate-900 dark:text-white shadow-md backdrop-blur-md">
                  <img src="/growuphost/cpanel.png" alt="" className="h-3.5 w-3.5 object-contain" />
                  <span>cPanel + WHM</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {FLOATING_METRICS.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 p-3 text-center"
                  >
                    <span className="block text-lg font-black text-slate-950 dark:text-white tabular-nums tracking-tight">
                      {metric.value}
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 ml-0.5">
                        {metric.unit}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 truncate">
                      {metric.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> Anti-DDoS
                  Scrubbing Active
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-extrabold">
                  99.9% Uptime
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

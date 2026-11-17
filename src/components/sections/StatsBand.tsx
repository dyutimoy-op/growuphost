import { useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { WHMCS_LINKS } from "@/config/whmcs";
import { useHydratedReducedMotion } from "@/hooks/use-hydrated-reduced-motion";

import { FOCUS_RING_BRAND } from "./cta-styles";
import { formatNumber } from "./plan-data";
import { Reveal } from "./Reveal";

interface Stat {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  label: string;
  caption: string;
}

const STATS: readonly Stat[] = [
  {
    value: 99.9,
    decimals: 1,
    suffix: "%",
    label: "Monthly Uptime SLA",
    caption: "Contractually committed per month",
  },
  {
    value: 15,
    prefix: "< ",
    suffix: " min",
    label: "Avg Ticket Response",
    caption: "Direct support from Linux engineers",
  },
  {
    value: 100,
    suffix: "%",
    label: "Enterprise NVMe",
    caption: "Pure NVMe Gen4 RAID-10 storage fleet",
  },
  {
    value: 10000,
    suffix: "+",
    label: "Websites Hosted",
    caption: "Across Mumbai Tier-4 Datacenter",
  },
];

const DURATION_MS = 1400;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function useCountProgress(active: boolean, enabled: boolean): number {
  const [progress, setProgress] = useState(enabled ? 0 : 1);

  useEffect(() => {
    if (!enabled) {
      setProgress(1);
      return undefined;
    }
    if (!active) return undefined;

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = Math.min(1, (now - start) / DURATION_MS);
      setProgress(elapsed);
      if (elapsed < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, enabled]);

  return progress;
}

export function StatsBand() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const prefersReducedMotion = useHydratedReducedMotion();
  const progress = useCountProgress(inView, !prefersReducedMotion);
  const eased = easeOutCubic(progress);

  return (
    <section
      aria-labelledby="stats-heading"
      className="relative overflow-hidden bg-slate-950 py-20 lg:py-28 border-y border-white/5"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 h-[420px] -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.12),transparent_65%)]"
        aria-hidden="true"
      />

      <div ref={ref} className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal preset="fade" duration={0.4} amount={0.3} className="mb-12 max-w-2xl lg:mb-16">
          <p className="mb-3 text-xs font-black tracking-[0.25em] text-blue-600 dark:text-blue-400 uppercase">
            Platform Metrics
          </p>
          <h2
            id="stats-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 dark:text-white uppercase leading-[1.05]"
          >
            Built by engineers who{" "}
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-600 dark:from-blue-400 dark:via-sky-300 dark:to-blue-500 bg-clip-text text-transparent italic">
              run servers
            </span>{" "}
            for a living.
          </h2>
          <p className="mt-4 text-base font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
            The infrastructure behind GROWUPHOST: enterprise NVMe arrays with LiteSpeed 20x,
            automated anti-DDoS scrubbing, and 24/7 dedicated sysadmins.
          </p>
        </Reveal>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4 lg:gap-x-8">
          {STATS.map((stat, index) => {
            const decimals = stat.decimals ?? 0;
            const current = formatNumber(stat.value * eased, decimals);
            const final = formatNumber(stat.value, decimals);
            const prefix = stat.prefix ?? "";
            const suffix = stat.suffix ?? "";

            return (
              <Reveal
                key={stat.label}
                preset="rise"
                delay={index * 0.05}
                duration={0.35}
                amount={0.3}
                className="relative flex flex-col-reverse gap-3 border-l border-slate-200 dark:border-white/10 pl-5 lg:border-t lg:border-l-0 lg:pt-6 lg:pl-0"
              >
                <dt>
                  <span
                    className="absolute top-0 left-0 h-8 w-px bg-blue-600 lg:h-px lg:w-10"
                    aria-hidden="true"
                  />
                  <span className="block text-xs font-black tracking-wider text-slate-950 dark:text-white uppercase">
                    {stat.label}
                  </span>
                  <span className="mt-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                    {stat.caption}
                  </span>
                </dt>
                <dd className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 dark:text-white tabular-nums">
                  <span className="inline-grid">
                    <span className="invisible col-start-1 row-start-1" aria-hidden="true">
                      {prefix}
                      {final}
                      {suffix}
                    </span>
                    <span className="col-start-1 row-start-1" aria-hidden="true">
                      {prefix}
                      {current}
                      {suffix}
                    </span>
                    <span className="sr-only">
                      {prefix}
                      {final}
                      {suffix}
                    </span>
                  </span>
                </dd>
              </Reveal>
            );
          })}
        </dl>

        <Reveal preset="fade" duration={0.35} amount={0.3}>
          <div className="mt-12 flex flex-col gap-6 border-t border-slate-200 dark:border-white/5 pt-8 lg:mt-16 lg:flex-row lg:items-center lg:justify-between">
            <p className="max-w-2xl text-xs leading-relaxed font-medium text-slate-600 dark:text-slate-400 lg:text-sm">
              Live metrics and verified commitments. The availability SLA is measured over each
              calendar month with instant ticket updates.
            </p>
            <a
              href={WHMCS_LINKS.announcements}
              className={`group inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-white text-slate-900 shadow-sm px-5 py-3 text-xs font-black tracking-[0.15em] uppercase transition-all duration-200 hover:border-blue-400 hover:bg-slate-50 hover:text-blue-600 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-blue-500/40 dark:hover:bg-blue-600/10 dark:hover:text-blue-300 ${FOCUS_RING_BRAND}`}
            >
              Platform Announcements
              <ArrowUpRight
                className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 transition-transform duration-200 motion-safe:group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

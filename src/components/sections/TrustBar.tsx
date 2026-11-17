import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Building2,
  FileCheck2,
  Headset,
  Lock,
  ShieldCheck,
  Zap,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { WHMCS_LINKS } from "@/config/whmcs";
import { FOCUS_RING_BRAND } from "./cta-styles";
import { Reveal } from "./Reveal";

interface TrustItem {
  icon: LucideIcon;
  label: string;
  detail: string;
}

const ITEMS: readonly TrustItem[] = [
  {
    icon: FileCheck2,
    label: "99.9% Monthly Uptime SLA",
    detail: "Guaranteed written commitment, measured every calendar month.",
  },
  {
    icon: Building2,
    label: "Tier 4 Mumbai DC",
    detail: "Ultra-low ping data centre located directly in Mumbai, India.",
  },
  {
    icon: Zap,
    label: "LiteSpeed 20x Engine",
    detail: "LSCache accelerated web server for blazing page loads.",
  },
  {
    icon: ShieldCheck,
    label: "Always-on Anti-DDoS",
    detail: "Upstream real-time traffic scrubbing included with every plan.",
  },
  {
    icon: Headset,
    label: "24/7/365 Dedicated Support",
    detail: "Direct ticket & WhatsApp help from engineers who run the platform.",
  },
  {
    icon: Lock,
    label: "100% Indian Jurisdiction",
    detail: "Your data stays safe in India with strict privacy policies.",
  },
];

const PROOF_LINK = [
  "group inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full",
  "border border-slate-300 bg-white text-slate-900 shadow-sm hover:bg-slate-50 hover:text-blue-600 hover:border-blue-400",
  "dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-blue-500/50 dark:hover:bg-blue-600/10 dark:hover:text-blue-300",
  "px-5 py-3 text-xs font-black tracking-[0.15em] uppercase transition-all duration-200",
  FOCUS_RING_BRAND,
].join(" ");

export function TrustBar() {
  return (
    <section
      aria-labelledby="assurances-heading"
      className="relative border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 py-16 lg:py-24"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.06),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal preset="fade" duration={0.35} amount={0.2}>
          <div className="flex flex-wrap items-center justify-between gap-6 pb-12 border-b border-slate-200 dark:border-white/5">
            <div>
              <p className="text-xs font-black tracking-[0.3em] text-blue-600 dark:text-blue-400 uppercase">
                Verified Commitments
              </p>
              <h2
                id="assurances-heading"
                className="mt-2 text-2xl lg:text-4xl font-black tracking-tight text-slate-950 dark:text-white uppercase"
              >
                Judge us on what you can{" "}
                <span className="bg-gradient-to-r from-blue-600 to-sky-600 dark:from-blue-400 dark:to-sky-300 bg-clip-text text-transparent italic">
                  verify
                </span>
                .
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-white/5 dark:border-white/10">
                <div className="flex text-amber-500 dark:text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-500 dark:fill-amber-400" />
                  ))}
                </div>
                <div className="text-left">
                  <span className="block text-xs font-black text-slate-950 dark:text-white">
                    4.9 / 5.0
                  </span>
                  <span className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                    Google Rating
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-white/5 dark:border-white/10">
                <div className="flex text-emerald-500 dark:text-emerald-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-emerald-500 dark:fill-emerald-400" />
                  ))}
                </div>
                <div className="text-left">
                  <span className="block text-xs font-black text-slate-950 dark:text-white">
                    4.8 / 5.0
                  </span>
                  <span className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                    Trustpilot Score
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <ul className="mt-12 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item, index) => (
            <li key={item.label}>
              <Reveal
                preset="rise"
                delay={index * 0.04}
                duration={0.3}
                amount={0.2}
                className="relative border-t border-slate-200 dark:border-white/10 pt-6 group"
              >
                <span
                  className="absolute top-0 left-0 h-px w-10 bg-blue-600 transition-all duration-300 group-hover:w-20 group-hover:bg-sky-500"
                  aria-hidden="true"
                />
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-blue-600 dark:bg-blue-600/10 dark:border-blue-500/20 dark:text-blue-400 group-hover:border-blue-500/50 group-hover:bg-blue-100 dark:group-hover:bg-blue-600/20 transition-colors">
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="text-sm lg:text-base font-black tracking-wide text-slate-950 dark:text-white uppercase">
                    {item.label}
                  </p>
                </div>
                <p className="mt-3 text-xs lg:text-sm font-medium text-slate-700 dark:text-slate-400 leading-relaxed">
                  {item.detail}
                </p>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal preset="fade" duration={0.3} amount={0.3}>
          <div className="mt-12 flex flex-col gap-6 border-t border-slate-200 dark:border-white/5 pt-8 sm:flex-row sm:items-center sm:justify-between lg:mt-16">
            <p className="text-xs font-bold tracking-[0.2em] text-slate-600 dark:text-slate-400 uppercase">
              Backed by our written SLA guarantee
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/legal/sla" className={PROOF_LINK}>
                Service Level Agreement
                <ArrowUpRight
                  className="h-3.5 w-3.5 text-blue-400 transition-transform duration-200 motion-safe:group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </Link>
              <a href={WHMCS_LINKS.announcements} className={PROOF_LINK}>
                Platform Announcements
                <ArrowUpRight
                  className="h-3.5 w-3.5 text-blue-400 transition-transform duration-200 motion-safe:group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

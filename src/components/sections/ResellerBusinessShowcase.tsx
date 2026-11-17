import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CloudUpload,
  Layers,
  MessageSquare,
  ShieldCheck,
  SlidersHorizontal,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Reveal } from "./Reveal";
import { WHMCS_LINKS } from "@/config/whmcs";

interface FeatureCard {
  icon: LucideIcon;
  cardClass: string;
  iconClass: string;
  badge: string;
  badgeClass: string;
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
  linkClass: string;
  borderDividerClass: string;
}

const RESELLER_FEATURES: readonly FeatureCard[] = [
  {
    icon: Layers,
    cardClass:
      "border-emerald-200/80 dark:border-emerald-500/30 bg-emerald-50/25 dark:bg-slate-900/80 hover:border-emerald-400 dark:hover:border-emerald-500/50 hover:shadow-[0_15px_30px_rgba(16,185,129,0.12)]",
    iconClass:
      "bg-emerald-100/80 dark:bg-emerald-500/15 border-emerald-300/80 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
    badge: "Free WHMCS Setup",
    badgeClass:
      "bg-emerald-100/60 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300",
    title: "Automated WHMCS & Billing",
    description:
      "Automated client invoicing, WHMCS installation, domain reseller setup, and Paytm gateway integration.",
    linkText: "Learn WHMCS Reseller",
    linkHref: "/packages",
    linkClass:
      "text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300",
    borderDividerClass: "border-emerald-200/60 dark:border-white/10",
  },
  {
    icon: SlidersHorizontal,
    cardClass:
      "border-blue-200/80 dark:border-blue-500/30 bg-blue-50/25 dark:bg-slate-900/80 hover:border-blue-400 dark:hover:border-blue-500/50 hover:shadow-[0_15px_30px_rgba(37,99,235,0.12)]",
    iconClass:
      "bg-blue-100/80 dark:bg-blue-500/15 border-blue-300/80 dark:border-blue-500/30 text-blue-700 dark:text-blue-400",
    badge: "White Label",
    badgeClass:
      "bg-blue-100/60 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/30 text-blue-800 dark:text-blue-300",
    title: "WHM & cPanel Control",
    description:
      "Full control over cPanel accounts, resource limits, DNS zones, and custom branded nameservers.",
    linkText: "Explore WHM Panels",
    linkHref: "/packages",
    linkClass: "text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300",
    borderDividerClass: "border-blue-200/60 dark:border-white/10",
  },
  {
    icon: Zap,
    cardClass:
      "border-amber-200/80 dark:border-amber-500/30 bg-amber-50/25 dark:bg-slate-900/80 hover:border-amber-400 dark:hover:border-amber-500/50 hover:shadow-[0_15px_30px_rgba(245,158,11,0.12)]",
    iconClass:
      "bg-amber-100/80 dark:bg-amber-500/15 border-amber-300/80 dark:border-amber-500/30 text-amber-700 dark:text-amber-400",
    badge: "20x Speed Engine",
    badgeClass:
      "bg-amber-100/60 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300",
    title: "LiteSpeed & LSCache",
    description:
      "Enterprise LiteSpeed Web Server with built-in LSCache engine for instant database execution.",
    linkText: "Explore LiteSpeed Hosting",
    linkHref: "/shared-hosting",
    linkClass: "text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300",
    borderDividerClass: "border-amber-200/60 dark:border-white/10",
  },
  {
    icon: ShieldCheck,
    cardClass:
      "border-blue-200/80 dark:border-blue-500/30 bg-blue-50/25 dark:bg-slate-900/80 hover:border-blue-400 dark:hover:border-blue-500/50 hover:shadow-[0_15px_30px_rgba(37,99,235,0.12)]",
    iconClass:
      "bg-blue-100/80 dark:bg-blue-500/15 border-blue-300/80 dark:border-blue-500/30 text-blue-700 dark:text-blue-400",
    badge: "Realtime WAF",
    badgeClass:
      "bg-blue-100/60 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/30 text-blue-800 dark:text-blue-300",
    title: "Imunify360 Security",
    description:
      "Multi-layered Web Application Firewall, automated malware scanning, and brute-force defense.",
    linkText: "Check Security Details",
    linkHref: "/packages",
    linkClass: "text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300",
    borderDividerClass: "border-blue-200/60 dark:border-white/10",
  },
  {
    icon: CloudUpload,
    cardClass:
      "border-emerald-200/80 dark:border-emerald-500/30 bg-emerald-50/25 dark:bg-slate-900/80 hover:border-emerald-400 dark:hover:border-emerald-500/50 hover:shadow-[0_15px_30px_rgba(16,185,129,0.12)]",
    iconClass:
      "bg-emerald-100/80 dark:bg-emerald-500/15 border-emerald-300/80 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
    badge: "Zero Downtime",
    badgeClass:
      "bg-emerald-100/60 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300",
    title: "Free Site Migration",
    description:
      "Our technical team transfers all your cPanel websites, databases, and SSL settings free of charge.",
    linkText: "Request Free Migration",
    linkHref: "/contact",
    linkClass:
      "text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300",
    borderDividerClass: "border-emerald-200/60 dark:border-white/10",
  },
  {
    icon: MessageSquare,
    cardClass:
      "border-purple-200/80 dark:border-purple-500/30 bg-purple-50/25 dark:bg-slate-900/80 hover:border-purple-400 dark:hover:border-purple-500/50 hover:shadow-[0_15px_30px_rgba(168,85,247,0.12)]",
    iconClass:
      "bg-purple-100/80 dark:bg-purple-500/15 border-purple-300/80 dark:border-purple-500/30 text-purple-700 dark:text-purple-400",
    badge: "24/7 Live Support",
    badgeClass:
      "bg-purple-100/60 dark:bg-purple-500/10 border-purple-300 dark:border-purple-500/30 text-purple-800 dark:text-purple-300",
    title: "WhatsApp & Ticket Support",
    description:
      "Round-the-clock technical assistance via WhatsApp and Client Ticket Portal for quick resolutions.",
    linkText: "Chat on WhatsApp",
    linkHref: "https://api.whatsapp.com/send?phone=917252890016&text=Hello%20GrowUpHost",
    linkClass:
      "text-purple-700 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300",
    borderDividerClass: "border-purple-200/60 dark:border-white/10",
  },
];

export function ResellerBusinessShowcase() {
  return (
    <section
      id="reseller-showcase"
      aria-labelledby="reseller-heading"
      className="relative overflow-hidden bg-white dark:bg-slate-950 px-4 py-20 sm:px-6 lg:px-8 lg:py-28 border-t border-slate-200 dark:border-white/5"
    >
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] rounded-full bg-blue-600/5 dark:bg-blue-600/10 blur-[160px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Reveal preset="fade" duration={0.4}>
            <h2
              id="reseller-heading"
              className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.08]"
            >
              Why Resellers &amp; Businesses Choose{" "}
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-600 dark:from-blue-400 dark:via-sky-300 dark:to-blue-500 bg-clip-text text-transparent italic">
                GrowUpHost
              </span>
            </h2>
          </Reveal>

          <Reveal preset="rise" delay={0.06} duration={0.4}>
            <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              Enterprise cloud infrastructure packed with automated management tools, high-speed
              LiteSpeed servers, and 24/7 expert assistance.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {RESELLER_FEATURES.map((feature, idx) => (
            <Reveal key={feature.title} preset="rise" delay={idx * 0.05} duration={0.35}>
              <div
                className={`h-full flex flex-col justify-between rounded-3xl border p-7 backdrop-blur-xl shadow-sm dark:shadow-lg transition-all duration-300 hover:-translate-y-1.5 ${feature.cardClass}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${feature.iconClass}`}
                    >
                      <feature.icon className="h-5 w-5" />
                    </div>

                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${feature.badgeClass}`}
                    >
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-950 dark:text-white tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className={`mt-6 pt-5 border-t ${feature.borderDividerClass}`}>
                  {feature.linkHref.startsWith("http") ? (
                    <a
                      href={feature.linkHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider transition-colors ${feature.linkClass}`}
                    >
                      {feature.linkText} <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <Link
                      to={feature.linkHref}
                      className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider transition-colors ${feature.linkClass}`}
                    >
                      {feature.linkText} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

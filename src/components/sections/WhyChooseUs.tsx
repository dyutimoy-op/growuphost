import { Clock, DatabaseBackup, Gauge, Rocket, ShieldCheck, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Reveal } from "./Reveal";

interface Benefit {
  icon: LucideIcon;
  imageIcon?: string;
  title: string;
  body: string;
  metric: string;
  focal?: boolean;
}

const BENEFITS: readonly Benefit[] = [
  {
    icon: Gauge,
    imageIcon: "/growuphost/litespeed.png",
    title: "LiteSpeed 20x NVMe Speed",
    body: "Every plan runs on enterprise Gen4 NVMe with LiteSpeed Web Server, LSCache, and dedicated resource isolation so your sites load in a fraction of a second.",
    metric: "20x Faster Loading",
    focal: true,
  },
  {
    icon: ShieldCheck,
    imageIcon: "/growuphost/security.png",
    title: "Enterprise DDoS Protection",
    body: "Malicious attack traffic is scrubbed upstream before it can touch your website, powered by automated real-time firewalls at no extra charge.",
    metric: "Always-on Filtering",
  },
  {
    icon: Clock,
    imageIcon: "/growuphost/support.png",
    title: "24/7/365 WhatsApp & Ticket Support",
    body: "Get instant answers from senior Linux sysadmins who run this platform in English and Hindi — zero bot runarounds.",
    metric: "< 15 Min Avg Response",
  },
  {
    icon: Rocket,
    imageIcon: "/growuphost/server.png",
    title: "Instant 60-Second Provisioning",
    body: "Automated WHMCS deployment instantly provisions your cPanel/root credentials right after checkout so you can go live immediately.",
    metric: "Live in Minutes",
  },
  {
    icon: DatabaseBackup,
    imageIcon: "/growuphost/backup.png",
    title: "Automated Daily Cloud Backups",
    body: "Snapshots and daily offsite backups ensure peace of mind, with 1-click restore available directly from your client area.",
    metric: "1-Click Restores",
  },
  {
    icon: TrendingUp,
    imageIcon: "/growuphost/offshore-server.png",
    title: "99.9% Contractual Uptime SLA",
    body: "A strict written commitment measured every calendar month, backed by our Tier-4 Mumbai datacenter infrastructure.",
    metric: "Written Guarantee",
  },
];

const CARD_BASE = [
  "group relative flex h-full flex-col overflow-hidden rounded-[2rem]",
  "border border-slate-200 bg-white shadow-md dark:border-white/10 dark:bg-slate-900/60 backdrop-blur-xl",
  "transition-all duration-300 hover:border-blue-400 hover:shadow-xl dark:hover:border-blue-500/40 dark:hover:bg-slate-900/90 dark:hover:shadow-[0_0_35px_rgba(37,99,235,0.2)]",
].join(" ");

export function WhyChooseUs() {
  return (
    <section
      aria-labelledby="why-heading"
      className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 py-12 sm:py-20 lg:px-8 lg:py-28"
    >
      <div
        className="pointer-events-none absolute top-0 right-0 h-[520px] w-[520px] translate-x-1/3 -translate-y-1/3 rounded-full bg-blue-600/10 blur-[140px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-[450px] w-[450px] -translate-x-1/3 translate-y-1/3 rounded-full bg-sky-500/10 blur-[130px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">
        <Reveal preset="left" duration={0.4} className="mb-8 sm:mb-12 max-w-2xl lg:mb-16">
          <p className="mb-2 sm:mb-3 text-xs font-black tracking-[0.25em] text-blue-600 dark:text-blue-400 uppercase">
            Why Choose GROWUPHOST
          </p>
          <h2
            id="why-heading"
            className="text-2xl sm:text-4xl lg:text-6xl font-black tracking-tight text-slate-950 dark:text-white uppercase leading-[1.05]"
          >
            Everything included.{" "}
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-600 dark:from-blue-400 dark:via-sky-300 dark:to-blue-500 bg-clip-text text-transparent italic">
              Nothing hidden.
            </span>
          </h2>
          <p className="mt-4 text-base lg:text-lg font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
            The features other hosting providers charge extra for — LiteSpeed cache, NVMe storage,
            anti-DDoS, and daily backups — are standard on every plan.
          </p>
        </Reveal>

        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {BENEFITS.map((benefit, index) => {
            const focal = benefit.focal === true;

            return (
              <li key={benefit.title} className={focal ? "lg:col-span-2 lg:row-span-2" : undefined}>
                <Reveal
                  preset="pop"
                  delay={index * 0.04}
                  duration={0.35}
                  amount={0.2}
                  className="h-full"
                >
                  <article className={CARD_BASE}>
                    <div
                      className="pointer-events-none absolute inset-x-0 -top-24 h-40 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.25),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      aria-hidden="true"
                    />

                    <div
                      className={`relative flex h-full flex-col p-7 sm:p-8 ${
                        focal ? "lg:p-10 xl:p-12" : "xl:p-9"
                      }`}
                    >
                      <div className="mb-6 flex items-start justify-between gap-4">
                        <span
                          className={`flex items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-600/10 transition-colors duration-300 group-hover:border-blue-500/50 group-hover:bg-blue-100 dark:group-hover:bg-blue-600/20 ${
                            focal ? "h-14 w-14" : "h-12 w-12"
                          }`}
                        >
                          {benefit.imageIcon ? (
                            <img
                              src={benefit.imageIcon}
                              alt=""
                              className={`${focal ? "h-8 w-8" : "h-6 w-6"} object-contain`}
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <benefit.icon
                              className={
                                focal
                                  ? "h-6 w-6 text-blue-600 dark:text-blue-400"
                                  : "h-5 w-5 text-blue-600 dark:text-blue-400"
                              }
                              aria-hidden="true"
                            />
                          )}
                        </span>
                        <span
                          className="text-xs font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 tabular-nums"
                          aria-hidden="true"
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      <h3
                        className={`font-black tracking-tight text-slate-950 dark:text-white ${
                          focal ? "text-2xl lg:text-3xl" : "text-lg lg:text-xl"
                        }`}
                      >
                        {benefit.title}
                      </h3>
                      <p
                        className={`mt-3 mb-8 leading-relaxed font-medium text-slate-700 dark:text-slate-300 ${
                          focal ? "max-w-xl text-base lg:text-lg" : "text-sm"
                        }`}
                      >
                        {benefit.body}
                      </p>

                      <p
                        className={`mt-auto flex items-center gap-3 border-t border-slate-200 dark:border-white/10 pt-5 font-black tracking-[0.18em] uppercase ${
                          focal
                            ? "text-xs text-slate-950 dark:text-white lg:text-sm"
                            : "text-xs text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span className="h-px w-6 shrink-0 bg-blue-600" aria-hidden="true" />
                        {benefit.metric}
                      </p>
                    </div>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

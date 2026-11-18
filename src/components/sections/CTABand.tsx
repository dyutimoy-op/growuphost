import { ArrowRight, Check, ServerCog, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WHMCS_LINKS } from "@/config/whmcs";

import { Reveal } from "./Reveal";
import { CTA_PRIMARY, CTA_SECONDARY } from "./cta-styles";

const ASSURANCES: readonly string[] = [
  "Provisioned in minutes",
  "Assisted migrations",
  "Upgrade any time",
  "24/7 engineer support",
];

export function CTABand() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="relative bg-slate-950 px-4 sm:px-6 pt-8 pb-16 lg:px-8 lg:pt-16 lg:pb-32"
    >
      <div className="mx-auto max-w-7xl">
        <Reveal preset="scale" duration={0.4} amount={0.3}>
          <div className="relative overflow-hidden rounded-2xl sm:rounded-[2.5rem] border border-blue-500/20 bg-white dark:bg-slate-900 px-4 py-10 sm:px-8 sm:py-16 text-center lg:rounded-[3rem] lg:px-20 lg:py-24 shadow-xl dark:shadow-[0_20px_60px_-15px_rgba(37,99,235,0.3)]">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.08),transparent_60%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.35),transparent_60%)]"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-32 left-1/2 h-64 w-[80%] -translate-x-1/2 rounded-full bg-blue-600/10 dark:bg-blue-600/25 blur-[120px]"
              aria-hidden="true"
            />

            <div
              className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent"
              aria-hidden="true"
            />

            <div className="relative">
              <Reveal preset="fade" duration={0.35} amount={0.3}>
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-black tracking-[0.2em] text-blue-700 dark:text-blue-200 uppercase">
                  <Sparkles
                    className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400"
                    aria-hidden="true"
                  />
                  Ready When You Are
                </span>

                <h2
                  id="cta-heading"
                  className="mx-auto mt-4 sm:mt-6 max-w-3xl text-2xl sm:text-4xl lg:text-6xl font-black tracking-tight text-slate-950 dark:text-white uppercase leading-[1.05]"
                >
                  Supercharge your website with{" "}
                  <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-600 dark:from-blue-400 dark:via-sky-300 dark:to-blue-500 bg-clip-text text-transparent italic">
                    GROWUPHOST
                  </span>
                </h2>

                <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed font-medium text-slate-700 dark:text-slate-300 lg:text-lg">
                  Deploy high-speed NVMe hosting in minutes. Our engineers handle zero-downtime
                  migrations if you are moving in from another host.
                </p>
              </Reveal>

              <Reveal preset="rise" delay={0.06} duration={0.35} amount={0.3}>
                <div className="mt-8 sm:mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
                  <Button
                    size="lg"
                    asChild
                    className={`group h-auto min-h-14 w-full rounded-2xl px-10 py-4 text-base font-black tracking-wide sm:w-auto md:min-w-[17rem] ${CTA_PRIMARY}`}
                  >
                    <a href={WHMCS_LINKS.register}>
                      Deploy With GrowUpHost
                      <ArrowRight
                        className="ml-2 h-4 w-4 transition-transform duration-200 motion-safe:group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </a>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className={`h-auto min-h-14 w-full gap-2 rounded-2xl px-8 py-4 text-sm font-black tracking-wide sm:w-auto ${CTA_SECONDARY}`}
                  >
                    <a href={WHMCS_LINKS.store}>
                      <ServerCog
                        className="h-4 w-4 text-blue-600 dark:text-blue-400"
                        aria-hidden="true"
                      />
                      Browse Every Plan
                    </a>
                  </Button>
                </div>
              </Reveal>

              <Reveal preset="fade" delay={0.12} duration={0.35} amount={0.3}>
                <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-x-8 gap-y-3 border-t border-slate-200 dark:border-white/10 pt-8">
                  {ASSURANCES.map((item) => (
                    <li
                      key={item}
                      className="inline-flex items-center gap-2 text-xs font-black tracking-[0.18em] text-slate-800 dark:text-slate-300 uppercase"
                    >
                      <Check
                        className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

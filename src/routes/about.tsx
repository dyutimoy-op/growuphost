import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Info, Globe, Shield, Zap } from "lucide-react";
import { buildPageHead } from "@/lib/seo/head";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { WHMCS_LINKS } from "@/config/whmcs";

const PATH = "/about";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () =>
    buildPageHead({
      title: "About GROWUPHOST | Enterprise Cloud Infrastructure Provider",
      description:
        "Learn about GROWUPHOST: our mission, our Tier 3 Mumbai data centres, and the NVMe infrastructure behind our shared hosting, VPS, and dedicated servers.",
      path: PATH,
      ogTitle: "About GROWUPHOST | Enterprise Cloud Infrastructure Provider",
      ogDescription:
        "Reliable, enterprise-grade hosting infrastructure for developers and scale-up businesses.",
      jsonLd: [
        webPageJsonLd({
          name: "About GROWUPHOST",
          description:
            "Who GROWUPHOST is, where our infrastructure runs, and how we support customers.",
          path: PATH,
        }),
        breadcrumbJsonLd([{ name: "About", path: PATH }]),
      ],
    }),
});

function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white selection:bg-blue-500/30 selection:text-blue-400">
      <Navbar />
      <main id="main-content" className="flex-grow pt-28 sm:pt-40 lg:pt-56">
        <section className="py-10 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="space-y-4 sm:space-y-6 mb-12 sm:mb-20 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-8 motion-safe:duration-700">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-1.5 text-blue-700 dark:text-blue-300 text-xs font-black tracking-widest uppercase">
              <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Our Story
            </div>
            <h1 className="text-2xl sm:text-5xl md:text-7xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.05] uppercase">
              REDEFINING THE <br />
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-600 dark:from-blue-400 dark:via-sky-300 dark:to-blue-500 bg-clip-text text-transparent italic">
                FUTURE
              </span>{" "}
              OF HOSTING.
            </h1>
            <p className="text-sm sm:text-lg lg:text-xl text-slate-700 dark:text-slate-300 max-w-3xl leading-relaxed font-medium">
              GROWUPHOST was founded with a single mission: to provide the most reliable,
              high-performance infrastructure for developers and enterprises worldwide.
            </p>
          </div>

          <section aria-labelledby="about-strengths-heading">
            <h2 id="about-strengths-heading" className="sr-only">
              What sets GROWUPHOST apart
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
              {[
                {
                  icon: Globe,
                  title: "Global Reach",
                  desc: "Low-latency routing from our Mumbai core, with peering built for traffic from across Asia, Europe, and North America.",
                },
                {
                  icon: Shield,
                  title: "Secure by Default",
                  desc: "Enterprise-grade DDoS protection and encrypted backups included with every server.",
                },
                {
                  icon: Zap,
                  title: "Pure Speed",
                  desc: "Latest NVMe SSDs and high-capacity 10Gbps networks for lightning-fast delivery.",
                },
                {
                  icon: Info,
                  title: "Expert Support",
                  desc: "Our engineers are available 24/7/365 to ensure your infrastructure stays online.",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="p-8 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-[2rem] space-y-4 hover:border-blue-500/40 shadow-sm dark:shadow-none transition-colors"
                >
                  <feature.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xl font-black text-slate-950 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div className="bg-blue-600 rounded-[3rem] p-12 md:p-20 text-center space-y-8 shadow-[0_15px_40px_rgba(37,99,235,0.25)] text-white">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white tracking-tight">
              Ready to experience the difference?
            </h2>
            <p className="text-white/90 max-w-2xl mx-auto font-medium text-base sm:text-lg">
              Browse our plans and deploy in minutes. Accounts, carts, and billing are handled in
              our secure client portal.
            </p>

            <a
              href={WHMCS_LINKS.store}
              className="inline-block bg-white text-blue-600 px-10 py-4.5 rounded-full font-black uppercase tracking-widest shadow-md hover:bg-slate-50 hover:scale-105 transition-all"
            >
              Deploy Your First Server
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

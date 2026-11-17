import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Shield, Lock, Clock, Mail, ExternalLink } from "lucide-react";
import { buildPageHead } from "@/lib/seo/head";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { WHMCS_LINKS } from "@/config/whmcs";

const PATH = "/legal/privacy";
const LAST_UPDATED_DISPLAY = "19-December-2021";
const LAST_UPDATED_ISO = "2021-12-19";

export const Route = createFileRoute("/legal/privacy")({
  component: PrivacyPage,
  head: () =>
    buildPageHead({
      title: "Privacy Policy | GROWUPHOST",
      description:
        "Official GrowupHost Privacy Policy: learn what information we collect, how we protect your data, and how policy updates are communicated.",
      path: PATH,
      twitterCard: "summary",
      jsonLd: [
        webPageJsonLd({
          name: "Privacy Policy",
          description:
            "Official GrowupHost Privacy Policy outlining data collection, usage, and privacy statement updates.",
          path: PATH,
          dateModified: LAST_UPDATED_ISO,
        }),
        breadcrumbJsonLd([{ name: "Privacy Policy", path: PATH }]),
      ],
    }),
});

export function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white transition-colors duration-200">
      <Navbar />
      <main id="main-content" className="flex-grow pt-56 sm:pt-64 lg:pt-72 pb-20">
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="space-y-6 mb-12 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-black tracking-widest uppercase shadow-sm">
              <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Legal &amp; Privacy Center
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 dark:text-white uppercase leading-tight">
              Privacy <span className="text-blue-600 dark:text-blue-400 italic">Policy</span>
            </h1>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 font-black text-xs uppercase tracking-wider shadow-sm">
                <Clock className="w-3.5 h-3.5" />
                Last Update On {LAST_UPDATED_DISPLAY}
              </span>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-6 sm:p-10 shadow-lg backdrop-blur-xl space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                  The Information We Collect :
                </h2>
              </div>

              <div className="space-y-4 text-sm sm:text-base leading-relaxed font-medium text-slate-800 dark:text-slate-300">
                <p>
                  By accessing or using the{" "}
                  <strong className="text-slate-950 dark:text-white font-black">
                    GrowupHost.com
                  </strong>{" "}
                  web site, you agree to the terms of the{" "}
                  <strong className="text-slate-950 dark:text-white font-black">
                    GrowupHost.com
                  </strong>{" "}
                  Privacy Policy, as outlined below. If you do not agree to these terms, please do
                  not access or use this site. GrowupHost reserves the right to change its Privacy
                  Policy from time to time at its sole discretion. Your use of this site will be
                  subject to the most current version of the Privacy Policy at the time of such use.
                </p>

                <p>
                  <strong className="text-slate-950 dark:text-white font-black">
                    GrowupHost.com
                  </strong>{" "}
                  collects your information in order to record and support your participation in the
                  activities you select. The information that you provide is also used as part of
                  our effort to keep you informed about special offers and other products and
                  services of{" "}
                  <strong className="text-slate-950 dark:text-white font-black">
                    GrowupHost.com
                  </strong>{" "}
                  and selected third parties.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-6 sm:p-10 shadow-lg backdrop-blur-xl space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="h-10 w-10 rounded-2xl bg-amber-50 dark:bg-amber-600/20 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                  Changes in this Privacy Statement :
                </h2>
              </div>

              <div className="space-y-4 text-sm sm:text-base leading-relaxed font-medium text-slate-800 dark:text-slate-300">
                <p>
                  If we decide to change our privacy policy, we will post those changes to this
                  privacy statement, the home page, and other places we deem appropriate so that you
                  are aware of what information we collect, how we use it, and under what
                  circumstances, if any, we disclose it.
                </p>

                <p>
                  We reserve the right to modify this privacy statement at any time, so please
                  review it frequently. If we make material changes to this policy, we will notify
                  you here, by email, or by means of a notice on our home page.
                </p>

                <div className="mt-6 p-4 rounded-2xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Official Contact
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-950 dark:text-white">
                      GrowupHost Privacy Department
                    </span>
                  </div>

                  <a
                    href="mailto:support@GrowupHost.com"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black tracking-wide shadow-md transition-all active:scale-95"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    support@GrowupHost.com
                  </a>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-950 dark:text-white uppercase tracking-wider">
                  Related Documents
                </h3>
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                  Review our complete service terms and SLA commitments.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" asChild className="rounded-xl font-bold text-xs">
                  <Link to="/legal/terms">Terms &amp; Conditions</Link>
                </Button>
                <Button variant="outline" asChild className="rounded-xl font-bold text-xs">
                  <Link to="/legal/sla">SLA Guarantee</Link>
                </Button>
                <Button
                  asChild
                  className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-md"
                >
                  <a href={WHMCS_LINKS.support} target="_blank" rel="noopener noreferrer">
                    Support Desk <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Button({
  children,
  className = "",
  asChild,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
  variant?: "default" | "outline";
}) {
  const base =
    "inline-flex items-center justify-center px-4 py-2 transition-all cursor-pointer " +
    (variant === "outline"
      ? "border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
      : "bg-blue-600 text-white hover:bg-blue-500") +
    " " +
    className;

  if (asChild) {
    return <span className={base}>{children}</span>;
  }

  return <button className={base}>{children}</button>;
}

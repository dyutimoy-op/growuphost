import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Clock, FileText, ShieldCheck, Wrench } from "lucide-react";
import { buildPageHead } from "@/lib/seo/head";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { WHMCS_LINKS } from "@/config/whmcs";

const PATH = "/legal/sla";
const LAST_UPDATED_DISPLAY = "19 August 2026";
const LAST_UPDATED_ISO = "2026-08-19";

export const Route = createFileRoute("/legal/sla")({
  component: SLAPage,
  head: () =>
    buildPageHead({
      title: "Service Level Agreement | 99.9% Uptime | GROWUPHOST",
      description:
        "GROWUPHOST's SLA: our 99.9% monthly network availability commitment, how uptime is measured, what is excluded, hardware replacement targets, and how to claim credits.",
      path: PATH,
      twitterCard: "summary",
      jsonLd: [
        webPageJsonLd({
          name: "Service Level Agreement",
          description:
            "GROWUPHOST's availability commitment, measurement method, exclusions, and service credit process.",
          path: PATH,
          dateModified: LAST_UPDATED_ISO,
        }),
        breadcrumbJsonLd([{ name: "Service Level Agreement", path: PATH }]),
      ],
    }),
});

interface Section {
  icon: typeof Clock;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

const SECTIONS: Section[] = [
  {
    icon: FileText,
    title: "1. Scope",
    paragraphs: [
      "This agreement applies to active, fully paid GROWUPHOST services — shared hosting, VPS, and dedicated servers — and covers the availability of our network and the infrastructure we operate.",
      "It does not cover software you install and manage yourself, third-party services you connect to, or domain registration and licence provisioning handled by external vendors.",
    ],
  },
  {
    icon: Clock,
    title: "2. Availability commitment",
    paragraphs: [
      "We commit to 99.9% network availability in each calendar month, measured across the month and excluding the situations listed in section 4. Availability means your service is reachable over our network; it does not measure the performance of applications running on it.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "3. How availability is measured",
    paragraphs: [
      "We monitor our network and host nodes continuously from our own monitoring systems. Downtime begins when our monitoring records an outage or when you open a ticket reporting one, whichever is earlier, and ends when the service is reachable again.",
      "Short, announced maintenance windows are planned outside peak hours wherever possible and are announced in advance in the client portal.",
    ],
  },
  {
    icon: FileText,
    title: "4. Exclusions",
    paragraphs: ["Time is not counted as downtime when it results from:"],
    bullets: [
      "Announced scheduled maintenance, or emergency maintenance required to close a security vulnerability.",
      "Your own software, configuration, updates, or resource exhaustion inside your service.",
      "Suspension or termination in line with our Terms of Service, including suspension for non-payment or acceptable-use breaches.",
      "Attacks whose volume exceeds the mitigation capacity of our infrastructure or that of our upstream providers.",
      "Failures in networks, transit providers, or services outside our control, including your own connectivity.",
      "Events beyond reasonable control, such as natural disasters, power grid failures beyond our redundancy, or government action.",
    ],
  },
  {
    icon: Wrench,
    title: "5. Hardware replacement",
    paragraphs: [
      "For faults our technical staff identify in hardware we own and operate — CPU, motherboard, memory, storage, or power supply — we target replacement within 4 hours of identification. Where a replacement requires a data restore, restore time depends on the size of the data set and is not included in that target.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "6. Security and network protection",
    paragraphs: [
      "We operate layered protections including automated DDoS mitigation, isolated tenant environments, and regular hardware and network audits. These reduce risk; they are not a warranty that an attack can never affect your service. Section 8 of our Terms of Service explains the responsibilities that stay with you.",
    ],
  },
  {
    icon: FileText,
    title: "7. Service credits",
    paragraphs: [
      "If we miss the availability commitment in a calendar month, you may claim a service credit. Credits are applied against future invoices for the affected service; they are not paid out in cash and do not stack with other compensation for the same incident.",
      "The credit amount available for each product is published with that product in the client portal. To claim, open a support ticket identifying the service and the affected period, in the billing cycle in which the incident occurred or the one immediately after it, so that we can verify the outage against our monitoring records.",
      "A service credit is the sole and exclusive remedy for missed availability under this agreement.",
    ],
  },
  {
    icon: Clock,
    title: "8. Support response",
    paragraphs: [
      "Our infrastructure is monitored around the clock, and tickets are answered around the clock. Incidents that affect availability are prioritised ahead of routine requests, and we post updates in the client portal for anything affecting multiple customers.",
    ],
  },
  {
    icon: FileText,
    title: "9. Changes to this agreement",
    paragraphs: [
      "We may update this agreement as our infrastructure changes. The revision date at the top of this page reflects the current version, and material changes are announced in the client portal before they take effect.",
    ],
  },
];

function SLAPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white transition-colors duration-200 selection:bg-blue-500/30 selection:text-blue-400">
      <Navbar />
      <main id="main-content" className="flex-grow pt-56 sm:pt-64 lg:pt-72 pb-20">
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="space-y-6 mb-16 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-black tracking-widest uppercase shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Legal Center
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-slate-950 dark:text-white tracking-tight leading-none uppercase">
              SERVICE LEVEL <br />
              <span className="text-blue-600 dark:text-blue-400 italic">AGREEMENT.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              Last updated:{" "}
              <time
                dateTime={LAST_UPDATED_ISO}
                className="text-slate-950 dark:text-white font-bold"
              >
                {LAST_UPDATED_DISPLAY}
              </time>
              . The reliability standards you can hold us to, and what happens when we miss them.
            </p>
          </div>

          <div className="space-y-10">
            {SECTIONS.map((section) => (
              <div
                key={section.title}
                className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-6 sm:p-8 shadow-lg backdrop-blur-xl space-y-4"
              >
                <div className="flex items-center gap-4 pb-2 border-b border-slate-100 dark:border-white/10">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <section.icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                    {section.title}
                  </h2>
                </div>
                <div className="space-y-3 pt-2 text-sm sm:text-base">
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 40)}
                      className="text-slate-800 dark:text-slate-300 leading-relaxed font-medium"
                    >
                      {paragraph}
                    </p>
                  ))}
                  {section.bullets && (
                    <ul className="space-y-2.5 pl-5 pt-1">
                      {section.bullets.map((bullet) => (
                        <li
                          key={bullet.slice(0, 40)}
                          className="list-disc text-slate-700 dark:text-slate-300 leading-relaxed font-medium marker:text-blue-500"
                        >
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}

            <div className="p-8 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-[2rem] space-y-4">
              <h2 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                10. Claim a credit
              </h2>
              <p className="leading-relaxed font-medium text-slate-700 dark:text-slate-300">
                Raise credit requests and outage reports through{" "}
                <a
                  href={WHMCS_LINKS.support}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                >
                  our support desk
                </a>
                , or check{" "}
                <a
                  href={WHMCS_LINKS.announcements}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                >
                  service announcements
                </a>{" "}
                for an incident already in progress.
              </p>
              <p className="leading-relaxed font-medium text-slate-600 dark:text-slate-400 text-sm">
                See also our{" "}
                <Link
                  to="/legal/terms"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/legal/privacy"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

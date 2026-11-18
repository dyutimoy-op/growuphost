import { ArrowUpRight, BookOpen, LifeBuoy } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WHMCS_LINKS } from "@/config/whmcs";
import { serializeJsonLd } from "@/lib/seo/jsonld";

import { FOCUS_RING_BRAND } from "./cta-styles";
import { Reveal } from "./Reveal";

interface FaqEntry {
  question: string;
  answer: string;
}

const FAQS: readonly FaqEntry[] = [
  {
    question: "How quickly is my hosting active after I pay?",
    answer:
      "Shared hosting, VPS plans and licences are provisioned automatically — in most cases your login details arrive by email within a few minutes of checkout. Dedicated servers and custom builds are confirmed by an engineer first, which usually takes a few hours during business hours.",
  },
  {
    question: "What does offshore hosting mean here?",
    answer:
      "It means your data sits in our Mumbai facility under Indian jurisdiction, with privacy-respecting policies and no third-party resale of your information. We still expect lawful use: spam, phishing, malware distribution and attacks launched from our network are not permitted.",
  },
  {
    question: "Is DDoS protection really included on every plan?",
    answer:
      "Yes. Attack filtering runs upstream of every server we operate, on shared hosting and dedicated hardware alike, and it is always on rather than something you enable once an attack starts. There is no separate charge for it. As our SLA sets out, no filtering can promise immunity from every possible attack.",
  },
  {
    question: "Do you keep backups of my data?",
    answer:
      "Where your plan includes backups, snapshots exist so a failed disk cannot take your data with it, and a restore can be requested from your client area. The schedule and retention that apply to your plan are set out on its order form. Either way, keep your own copy of anything business-critical — our backups are not a substitute for yours, and that is good practice with any host.",
  },
  {
    question: "Can I upgrade or downgrade my plan later?",
    answer:
      "Yes. Plans can be changed from your client area at any time. The billing adjustment for a mid-term change is calculated and shown to you before you confirm, so you see the exact amount first. Upgrades on VPS and shared hosting normally complete within minutes with no data migration on your side.",
  },
  {
    question: "Will you migrate my existing website or server?",
    answer:
      "Our support team handles migrations for standard cPanel, Plesk and DirectAdmin setups, and will work with you on custom stacks. Open a ticket with your current host's details before you cancel anything and we will plan the cutover with you to keep downtime minimal.",
  },
  {
    question: "What uptime do you actually guarantee?",
    answer:
      "Our network SLA commits to 99.9% availability in each calendar month, and the service credits that apply if we miss it are set out in full on our SLA page. Scheduled maintenance is announced in advance in the client area and excluded from the calculation, as is downtime caused by your own application.",
  },
  {
    question: "How do payments and invoices work?",
    answer:
      "Billing, invoices and renewals all live in our secure billing portal rather than on this site. The payment methods available for your region are shown at checkout, and every invoice, receipt and renewal date stays visible in your client area.",
  },
];

const FAQ_JSON_LD = serializeJsonLd({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
});

const FIRST_QUESTION = FAQS[0]?.question ?? "";

const RAIL_LINK = [
  "group inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full",
  "border border-slate-300 bg-white text-slate-900 shadow-sm hover:border-blue-400 hover:bg-slate-50 hover:text-blue-600",
  "dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-blue-500/40 dark:hover:bg-blue-600/10 dark:hover:text-blue-300",
  "px-5 py-3 text-xs font-black tracking-[0.15em] uppercase transition-all duration-200",
  FOCUS_RING_BRAND,
].join(" ");

const TRIGGER = [
  "gap-6 rounded-[1.25rem] px-5 py-5 text-left lg:px-6",
  "text-base font-black tracking-tight text-slate-950 dark:text-white lg:text-lg",
  "transition-colors duration-200 hover:no-underline hover:bg-slate-50 dark:hover:bg-white/[0.04]",
  "[&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-slate-400 [&>svg]:transition-all [&>svg]:duration-200",
  "[&[data-state=open]>svg]:text-blue-600 dark:[&[data-state=open]>svg]:text-blue-400",
  FOCUS_RING_BRAND,
].join(" ");

export function FAQ() {
  return (
    <section
      aria-labelledby="faq-heading"
      className="relative bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 py-12 sm:py-20 lg:px-8 lg:py-28 border-t border-slate-200 dark:border-white/5"
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: FAQ_JSON_LD }} />

      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[140px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl gap-8 sm:gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 xl:gap-20">
        <Reveal preset="left" duration={0.4} className="lg:sticky lg:top-32 lg:self-start">
          <p className="mb-2 sm:mb-3 text-xs font-black tracking-[0.25em] text-blue-600 dark:text-blue-400 uppercase">
            Frequently Asked Questions
          </p>
          <h2
            id="faq-heading"
            className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 dark:text-white uppercase leading-[1.05]"
          >
            Questions,{" "}
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-600 dark:from-blue-400 dark:via-sky-300 dark:to-blue-500 bg-clip-text text-transparent italic">
              answered
            </span>{" "}
            properly.
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed font-medium text-slate-700 dark:text-slate-300">
            Everything you need to know about our high-performance infrastructure, migrations, and
            support.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href={WHMCS_LINKS.support} className={RAIL_LINK}>
              <LifeBuoy
                className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400"
                aria-hidden="true"
              />
              Ask our team
              <ArrowUpRight
                className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 transition-transform duration-200 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </a>
            <a href={WHMCS_LINKS.knowledgebase} className={RAIL_LINK}>
              <BookOpen
                className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400"
                aria-hidden="true"
              />
              Knowledgebase
              <ArrowUpRight
                className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 transition-transform duration-200 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </a>
          </div>
        </Reveal>

        <Accordion type="single" collapsible defaultValue={FIRST_QUESTION} className="space-y-3">
          {FAQS.map((faq, index) => (
            <Reveal
              key={faq.question}
              preset="rise"
              delay={Math.min(index, 3) * 0.04}
              duration={0.3}
              amount={0.15}
            >
              <AccordionItem
                value={faq.question}
                className="rounded-[1.5rem] border border-slate-200 bg-white p-2 shadow-sm transition-colors duration-200 data-[state=open]:border-blue-400 data-[state=open]:shadow-md dark:border-white/5 dark:bg-slate-900/40 dark:data-[state=open]:border-blue-500/30 dark:data-[state=open]:bg-slate-900/80 dark:data-[state=open]:shadow-[0_0_25px_rgba(37,99,235,0.1)]"
              >
                <AccordionTrigger className={TRIGGER}>
                  <span className="flex min-w-0 items-baseline gap-4">
                    <span
                      className="text-xs font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 tabular-nums"
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {faq.question}
                  </span>
                </AccordionTrigger>

                <AccordionContent className="px-5 pt-0 pb-6 text-sm leading-relaxed font-medium text-slate-700 dark:text-slate-300 lg:px-6 lg:pl-16">
                  {" "}
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </Reveal>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

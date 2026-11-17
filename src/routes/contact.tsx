import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/sections/PageHero";
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Loader2,
  LifeBuoy,
  BookOpen,
  LayoutDashboard,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { WHMCS_BASE_URL, WHMCS_LINKS } from "@/config/whmcs";
import { buildPageHead } from "@/lib/seo/head";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () =>
    buildPageHead({
      title: "Contact GROWUPHOST | 24/7 Enterprise Infrastructure Support",
      description:
        "Get in touch with the GROWUPHOST enterprise support team. Available 24/7 for sales, technical support, and infrastructure consulting.",
      path: "/contact",
      ogTitle: "Contact GROWUPHOST | 24/7 Enterprise Support",
      ogDescription:
        "Get in touch with our infrastructure experts. Available 24/7 for your business.",
      twitterCard: "summary",
    }),
});

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name (at least 2 characters).")
    .max(100, "Name is too long."),
  email: z
    .string()
    .trim()
    .min(1, "We need an email address to reply to.")
    .email("That does not look like a valid email address.")
    .max(160, "Email is too long."),
  subject: z
    .string()
    .trim()
    .min(4, "Add a short subject so we can route your request.")
    .max(150, "Subject is too long."),
  message: z
    .string()
    .trim()
    .min(20, "Please describe your request in at least 20 characters.")
    .max(4000, "Message is too long — please keep it under 4000 characters."),
});

type ContactFormValues = z.infer<typeof contactSchema>;
type FieldName = keyof ContactFormValues;
type FieldErrors = Partial<Record<FieldName, string>>;

const FIELD_NAMES: readonly FieldName[] = ["name", "email", "subject", "message"];

function isFieldName(value: unknown): value is FieldName {
  return typeof value === "string" && FIELD_NAMES.some((field) => field === value);
}

const EMPTY_FORM: ContactFormValues = { name: "", email: "", subject: "", message: "" };

function firstNonEmpty(...values: Array<string | undefined>): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed && trimmed !== "#") return trimmed;
  }
  return "";
}

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function buildTicketUrl(values: ContactFormValues): string {
  const url = new URL(WHMCS_LINKS.support);
  url.searchParams.set("name", values.name);
  url.searchParams.set("email", values.email);
  url.searchParams.set("subject", values.subject);
  url.searchParams.set("message", values.message);
  return url.toString();
}

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-md";

const SUPPORT_ENTRY_POINTS = [
  {
    href: WHMCS_LINKS.support,
    icon: LifeBuoy,
    title: "Open a Ticket",
    body: "Fastest route for technical issues. Tracked, with SLA response times.",
  },
  {
    href: WHMCS_LINKS.knowledgebase,
    icon: BookOpen,
    title: "Knowledgebase",
    body: "Setup guides, migrations and answers to the questions we get most.",
  },
  {
    href: WHMCS_LINKS.clientArea,
    icon: LayoutDashboard,
    title: "Client Area",
    body: "Manage services, invoices and existing tickets in one place.",
  },
] as const;

function ContactPage() {
  const { data: settings } = useSiteSettings();

  const [values, setValues] = useState<ContactFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "failed">("idle");

  const phone = firstNonEmpty(
    settings?.["support_phone"],
    settings?.["contact_phone"],
    "+91 72 52 89 0016",
  );
  const email = firstNonEmpty(
    settings?.["support_email"],
    settings?.["contact_email"],
    "support@growuphost.com",
  );
  const address = firstNonEmpty(
    settings?.["support_address"],
    settings?.["contact_address"],
    "Mumbai, Maharashtra, India",
  );

  const billingHost = WHMCS_BASE_URL.replace(/^https?:\/\//i, "");

  const mailtoHref = useMemo(() => {
    const subject = values.subject.trim() || "Website enquiry";
    const body = [
      values.message.trim(),
      "",
      `— ${values.name.trim() || "Website visitor"} (${values.email.trim() || "no email given"})`,
    ].join("\n");
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [email, values]);

  const setField = (field: FieldName, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!(field in current)) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;

    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (isFieldName(key) && nextErrors[key] === undefined) {
          nextErrors[key] = issue.message;
        }
      }
      setErrors(nextErrors);
      setStatus("idle");
      toast.error("Please fix the highlighted fields before continuing.");
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      const ticketUrl = buildTicketUrl(parsed.data);
      toast.success("Opening our support desk with your message carried over…");
      window.location.assign(ticketUrl);
    } catch {
      setStatus("failed");
      toast.error("We could not open the support desk. Please email us instead.");
    }
  };

  const fieldClass = (field: FieldName, extra = "") =>
    `bg-slate-50 dark:bg-white/5 text-slate-950 dark:text-white placeholder:text-slate-400 rounded-2xl transition-all ${extra} ${
      errors[field]
        ? "border-red-500/60 focus-visible:border-red-500"
        : "border-slate-300 dark:border-white/10 focus-visible:border-blue-500"
    }`;

  const renderError = (field: FieldName) => {
    const message = errors[field];
    if (!message) return null;
    return (
      <p
        id={`${field}-error`}
        role="alert"
        className="flex items-center gap-2 text-[12px] font-bold text-red-400 ml-1"
      >
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        {message}
      </p>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white selection:bg-blue-500/30 selection:text-blue-400">
      <Navbar />
      <main id="main-content" className="flex-grow">
        <PageHero
          eyebrow="We reply 24/7/365"
          title="Get in Touch"
          subtitle="Questions about our infrastructure? Our team is available 24/7/365 for sales, migrations and technical support."
        />

        <section className="px-6 lg:px-8 pb-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUPPORT_ENTRY_POINTS.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className={`group p-8 rounded-[2rem] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 hover:border-blue-500/40 hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm dark:shadow-none transition-all ${FOCUS_RING}`}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 group-hover:bg-blue-600 transition-all">
                    <item.icon className="w-5 h-5 text-blue-400 group-hover:text-white" />
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                </div>
                <div className="text-lg font-black text-slate-950 dark:text-white tracking-tight mb-2">
                  {item.title}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  {item.body}
                </p>
              </a>
            ))}
          </div>
        </section>

        <section className="py-16 lg:py-20 px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                  Contact Information
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
                  Reach us directly, or use the form to start a tracked support ticket.
                </p>
              </div>

              <div className="space-y-8">
                <a
                  href={`mailto:${email}`}
                  className={`flex items-start gap-6 group ${FOCUS_RING}`}
                >
                  <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 group-hover:bg-blue-500 transition-all group-hover:scale-110">
                    <Mail className="w-6 h-6 text-blue-400 group-hover:text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">
                      Email Support
                    </div>
                    <div className="text-xl font-bold text-slate-950 dark:text-white break-all">
                      {email}
                    </div>
                  </div>
                </a>

                <a href={telHref(phone)} className={`flex items-start gap-6 group ${FOCUS_RING}`}>
                  <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 group-hover:bg-blue-500 transition-all group-hover:scale-110">
                    <Phone className="w-6 h-6 text-blue-400 group-hover:text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">
                      Sales &amp; Support
                    </div>
                    <div className="text-xl font-bold text-slate-950 dark:text-white">{phone}</div>
                  </div>
                </a>

                <div className="flex items-start gap-6 group">
                  <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                    <MapPin className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">
                      Headquarters
                    </div>
                    <div className="text-xl font-bold text-slate-950 dark:text-white leading-relaxed whitespace-pre-line">
                      {address}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 space-y-3 shadow-xs">
                <div className="text-xs font-black uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">
                  How this form works
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  We do not store messages on this website. When you continue, we open our support
                  desk at{" "}
                  <span className="text-slate-900 dark:text-slate-300 font-bold">
                    {billingHost}
                  </span>{" "}
                  with your details carried over — confirm there and your ticket is created, tracked
                  and answered by email.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 lg:p-12 backdrop-blur-3xl shadow-xl dark:shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16" />

              <form className="space-y-7 relative z-10" onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                  <div className="space-y-2">
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1"
                    >
                      Full Name
                    </label>
                    <Input
                      id="contact-name"
                      name="name"
                      autoComplete="name"
                      value={values.name}
                      onChange={(event) => setField("name", event.target.value)}
                      aria-invalid={errors.name ? true : undefined}
                      aria-describedby={errors.name ? "name-error" : undefined}
                      className={fieldClass("name", "py-6")}
                      placeholder="John Doe"
                    />
                    {renderError("name")}
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1"
                    >
                      Email Address
                    </label>
                    <Input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={values.email}
                      onChange={(event) => setField("email", event.target.value)}
                      aria-invalid={errors.email ? true : undefined}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      className={fieldClass("email", "py-6")}
                      placeholder="john@example.com"
                    />
                    {renderError("email")}
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="contact-subject"
                    className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1"
                  >
                    Subject
                  </label>
                  <Input
                    id="contact-subject"
                    name="subject"
                    value={values.subject}
                    onChange={(event) => setField("subject", event.target.value)}
                    aria-invalid={errors.subject ? true : undefined}
                    aria-describedby={errors.subject ? "subject-error" : undefined}
                    className={fieldClass("subject", "py-6")}
                    placeholder="Pre-sales question about VPS"
                  />
                  {renderError("subject")}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1"
                  >
                    Message
                  </label>
                  <Textarea
                    id="contact-message"
                    name="message"
                    value={values.message}
                    onChange={(event) => setField("message", event.target.value)}
                    aria-invalid={errors.message ? true : undefined}
                    aria-describedby={errors.message ? "message-error" : undefined}
                    className={fieldClass("message", "min-h-[170px] !rounded-3xl")}
                    placeholder="Tell us what you need — current setup, timelines, and anything specific."
                  />
                  {renderError("message")}
                </div>

                <div className="space-y-4">
                  <Button
                    type="submit"
                    disabled={status === "submitting"}
                    className={`w-full py-7 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-sm transition-all hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 shadow-xl shadow-blue-600/20 ${FOCUS_RING}`}
                  >
                    {status === "submitting" ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        Opening support desk…
                      </>
                    ) : (
                      <>
                        Continue to Support
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-slate-400 font-medium leading-relaxed text-center">
                    You will be taken to {billingHost} to confirm and send. Prefer email?{" "}
                    <a
                      href={mailtoHref}
                      className={`text-blue-400 hover:text-blue-300 font-bold ${FOCUS_RING}`}
                    >
                      Send this message by email instead
                    </a>
                    .
                  </p>

                  {status === "failed" && (
                    <p
                      role="alert"
                      className="flex items-center gap-2 justify-center text-[12px] font-bold text-red-400"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      We could not open the support desk. Please email {email} instead.
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

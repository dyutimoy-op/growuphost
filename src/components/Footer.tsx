import { Link } from "@tanstack/react-router";
import {
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  ShieldCheck,
  Zap,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  LifeBuoy,
  BookOpen,
  Megaphone,
  Receipt,
  LayoutDashboard,
  UserPlus,
  Link2,
} from "lucide-react";
import type { ComponentType } from "react";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { useNavLinks } from "@/hooks/use-nav-links";
import { NavLinkItem } from "@/components/nav/NavLinkItem";
import { WHMCS_BASE_URL, WHMCS_LINKS, sanitizeUrl } from "@/config/whmcs";
import { BrandMark } from "@/components/BrandMark";
import { resolveBrand } from "@/lib/brand";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-md";

const CURRENT_YEAR = new Date().getFullYear();

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

const PRODUCT_LINKS = [
  { to: "/shared-hosting", label: "Shared Hosting" },
  { to: "/vps-hosting", label: "VPS Hosting" },
  { to: "/dedicated-servers", label: "Dedicated Servers" },
  { to: "/licenses", label: "Software Licenses" },
  { to: "/packages", label: "All Packages" },
] as const;

const COMPANY_LINKS = [
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
  { to: "/legal/privacy", label: "Privacy Policy" },
  { to: "/legal/terms", label: "Terms of Service" },
  { to: "/legal/sla", label: "SLA Guarantee" },
] as const;

const WHMCS_LINK_ITEMS: ReadonlyArray<{
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { href: WHMCS_LINKS.clientArea, label: "Client Area", icon: LayoutDashboard },
  { href: WHMCS_LINKS.register, label: "Create Account", icon: UserPlus },
  { href: WHMCS_LINKS.support, label: "Open a Ticket", icon: LifeBuoy },
  { href: WHMCS_LINKS.knowledgebase, label: "Knowledgebase", icon: BookOpen },
  { href: WHMCS_LINKS.announcements, label: "Announcements", icon: Megaphone },
  { href: WHMCS_LINKS.invoices, label: "Invoices & Billing", icon: Receipt },
];

const SOCIAL_ITEMS: ReadonlyArray<{
  key: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  defaultHref: string;
}> = [
  {
    key: "social_facebook",
    label: "Facebook",
    icon: Facebook,
    defaultHref: "https://facebook.com/growuphost",
  },
  {
    key: "social_twitter",
    label: "X / Twitter",
    icon: Twitter,
    defaultHref: "https://twitter.com/growuphost",
  },
  {
    key: "social_instagram",
    label: "Instagram",
    icon: Instagram,
    defaultHref: "https://instagram.com/growuphost",
  },
  {
    key: "social_linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    defaultHref: "https://linkedin.com/company/growuphost",
  },
];

const linkClass = `text-white hover:text-sky-300 hover:translate-x-1 inline-flex items-center gap-2 transition-all ${FOCUS_RING}`;

export function Footer() {
  const { data: settings } = useSiteSettings();

  const footerLinks = useNavLinks("footer");

  const brand = resolveBrand(settings);
  const companyName = brand.name;
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

  const socials = SOCIAL_ITEMS.map((item) => {
    const configured = settings?.[item.key]?.trim();
    const href =
      configured && configured !== "#"
        ? sanitizeUrl(configured, item.defaultHref)
        : item.defaultHref;
    return {
      ...item,
      href,
    };
  });

  const billingHost = WHMCS_BASE_URL.replace(/^https?:\/\//i, "");

  return (
    <footer
      style={{ backgroundColor: "#020617", color: "#ffffff" }}
      className="site-footer bg-[#020617] text-white border-t border-slate-800/80 pt-12 sm:pt-20 lg:pt-28 pb-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 blur-[130px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[130px] rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-10 mb-10 sm:mb-16">
          <div className="lg:col-span-4 space-y-6 sm:space-y-8">
            <Link
              to="/"
              className={`text-2xl sm:text-3xl font-black italic tracking-tighter text-white uppercase inline-flex items-center gap-3 ${FOCUS_RING}`}
            >
              <BrandMark brand={brand} surface="footer" />
              {brand.showText && <span className="text-white">{companyName}</span>}
            </Link>

            <p className="text-white text-sm sm:text-base leading-relaxed max-w-sm font-medium">
              High-performance offshore, bulletproof and enterprise hosting — engineered for uptime,
              backed by 24/7/365 human support.
            </p>

            <div className="space-y-4 text-sm font-medium">
              <a
                href={telHref(phone)}
                className={`flex items-start gap-3 text-white hover:text-sky-300 transition-colors ${FOCUS_RING}`}
              >
                <Phone className="w-4 h-4 mt-0.5 text-blue-400 shrink-0" />
                <span className="text-white">{phone}</span>
              </a>
              <a
                href={`mailto:${email}`}
                className={`flex items-start gap-3 text-white hover:text-sky-300 transition-colors ${FOCUS_RING}`}
              >
                <Mail className="w-4 h-4 mt-0.5 text-blue-400 shrink-0" />
                <span className="break-all text-white">{email}</span>
              </a>
              <div className="flex items-start gap-3 text-white">
                <MapPin className="w-4 h-4 mt-0.5 text-blue-400 shrink-0" />
                <span className="whitespace-pre-line text-white">{address}</span>
              </div>
            </div>

            {socials.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {socials.map((social) => (
                  <a
                    key={social.key}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    data-icon-btn="true"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      borderColor: "rgba(255, 255, 255, 0.15)",
                      color: "#ffffff",
                    }}
                    className={`social-icon-btn flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 border border-white/15 text-white shadow-md transition-all duration-200 hover:text-white hover:bg-blue-600 hover:border-blue-500 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(37,99,235,0.4)] ${FOCUS_RING}`}
                  >
                    <social.icon className="w-5 h-5 shrink-0 text-white" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white">Products</h2>
            <ul className="space-y-4 text-[13px] font-bold">
              {PRODUCT_LINKS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white">Company</h2>
            <ul className="space-y-4 text-[13px] font-bold">
              {COMPANY_LINKS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white">
              Client &amp; Support
            </h2>

            <div
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                borderColor: "rgba(255, 255, 255, 0.15)",
              }}
              className="p-6 bg-slate-900/95 rounded-[2rem] border border-white/15 shadow-xl space-y-5 backdrop-blur-xl"
            >
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px] font-bold">
                {WHMCS_LINK_ITEMS.map((item) => (
                  <li key={item.href + item.label}>
                    <a href={item.href} className={linkClass}>
                      <item.icon className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="text-white hover:text-sky-300">{item.label}</span>
                    </a>
                  </li>
                ))}

                {footerLinks.map((link) => (
                  <li key={link.id}>
                    <NavLinkItem link={link} className={linkClass}>
                      <Link2 className="w-4 h-4 text-blue-400 shrink-0" aria-hidden="true" />
                      <span className="text-white hover:text-sky-300">{link.label}</span>
                    </NavLinkItem>
                  </li>
                ))}
              </ul>

              <p className="text-xs font-bold uppercase tracking-[0.15em] text-white flex items-center gap-2 pt-2 border-t border-white/10">
                <ExternalLink className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                Accounts, orders &amp; tickets live at {billingHost}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  borderColor: "rgba(255, 255, 255, 0.15)",
                  color: "#ffffff",
                }}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-white/10 rounded-full border border-white/15 text-xs font-black uppercase tracking-widest text-white shadow-sm"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
                Support 24/7/365
              </div>
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  borderColor: "rgba(255, 255, 255, 0.15)",
                  color: "#ffffff",
                }}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-white/10 rounded-full border border-white/15 text-xs font-black uppercase tracking-widest text-white shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                PCI-DSS
              </div>
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  borderColor: "rgba(255, 255, 255, 0.15)",
                  color: "#ffffff",
                }}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-white/10 rounded-full border border-white/15 text-xs font-black uppercase tracking-widest text-white shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                Tier 4
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/15 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap justify-center gap-6 lg:gap-10 text-xs font-black text-white uppercase tracking-[0.2em]">
            <Link
              to="/legal/sla"
              className={`text-white hover:text-sky-300 transition-colors ${FOCUS_RING}`}
            >
              SLA
            </Link>
            <Link
              to="/legal/privacy"
              className={`text-white hover:text-sky-300 transition-colors ${FOCUS_RING}`}
            >
              Privacy
            </Link>
            <Link
              to="/legal/terms"
              className={`text-white hover:text-sky-300 transition-colors ${FOCUS_RING}`}
            >
              Terms
            </Link>
            <a
              href={WHMCS_LINKS.announcements}
              className={`text-white hover:text-sky-300 transition-colors ${FOCUS_RING}`}
            >
              Status
            </a>
          </div>

          <div className="text-xs font-black text-white uppercase tracking-[0.2em] text-center lg:text-right flex flex-col md:flex-row gap-2 md:gap-4 items-center">
            <span className="text-white">
              © {CURRENT_YEAR} {companyName}. All rights reserved.
            </span>
            <span className="w-1 h-1 bg-slate-600 rounded-full hidden md:block" />
            <span className="text-white">Registered in India.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

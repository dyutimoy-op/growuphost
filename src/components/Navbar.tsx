import { Link } from "@tanstack/react-router";
import {
  Menu,
  X,
  Globe,
  ChevronRight,
  Bell,
  ArrowRight,
  Phone,
  Mail,
  ChevronDown,
  LogIn,
  LifeBuoy,
} from "lucide-react";
import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { useNavLinks } from "@/hooks/use-nav-links";
import { NavLinkItem } from "@/components/nav/NavLinkItem";
import type { Database } from "@/integrations/supabase/types";
import { WHMCS_LINKS, isExternalUrl, sanitizeUrl } from "@/config/whmcs";
import { CTA_PRIMARY, CTA_SECONDARY } from "@/components/sections/cta-styles";
import {
  navCategoriesQueryOptions,
  newsAlertQueryOptions,
} from "@/components/sections/use-nav-chrome";
import { asInternalPath } from "@/lib/internal-links";
import { BrandMark } from "@/components/BrandMark";
import { resolveBrand, WORDMARK_INK_PADDING } from "@/lib/brand";
import { ThemeToggle } from "@/components/ThemeToggle";

type Category = Database["public"]["Tables"]["categories"]["Row"];

const CURRENT_YEAR = new Date().getFullYear();

function firstNonEmpty(...values: Array<string | undefined>): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

const STALE_AUTH_PATHS: readonly string[] = [
  "/auth",
  "/login",
  "/signin",
  "/sign-in",
  "/register",
  "/signup",
  "/sign-up",
  "/clientarea",
  "/client-area",
  "/dashboard",
];

function resolveAuthUrl(setting: string | undefined, fallback: string): string {
  const value = setting?.trim();
  if (!value) return fallback;
  if (!isExternalUrl(value)) {
    const path = (value.split(/[?#]/)[0] ?? value).replace(/\/+$/, "").toLowerCase();
    if (STALE_AUTH_PATHS.includes(path)) return fallback;
  }
  return sanitizeUrl(value, fallback);
}

interface SmartLinkProps {
  href: string;
  children: ReactNode;
  className?: string;

  onNavigate?: (() => void) | undefined;

  newTab?: boolean;
  ariaLabel?: string | undefined;
}

function SmartLink({
  href,
  children,
  className,
  onNavigate,
  newTab = false,
  ariaLabel,
}: SmartLinkProps) {
  const internal = asInternalPath(href);

  if (internal) {
    return (
      <Link to={internal} className={className} onClick={onNavigate} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={className}
      onClick={onNavigate}
      aria-label={ariaLabel}
      {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

const HEADER_LINK_CLASS = `text-[13px] font-bold uppercase tracking-[0.18em] text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative z-50 py-4 rounded-md ${FOCUS_RING}`;

const MOBILE_LINK_CLASS = `flex items-center justify-between text-3xl font-black text-slate-950 dark:text-white py-4 active:text-blue-600 dark:active:text-blue-400 transition-colors rounded-2xl ${FOCUS_RING}`;

const TOP_BAR_LINK_CLASS = `flex items-center gap-2 hover:text-blue-200 transition-colors shrink-0 rounded-full ${FOCUS_RING} focus-visible:ring-offset-blue-600`;

export function Navbar() {
  const { data: settings } = useSiteSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const offset = window.scrollY;
          const nextScrolled = offset > 20;
          const nextPastHero = offset > window.innerHeight * 0.8;
          setIsScrolled((prev) => (prev !== nextScrolled ? nextScrolled : prev));
          setIsPastHero((prev) => (prev !== nextPastHero ? nextPastHero : prev));
          ticking = false;
        });
        ticking = true;
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  const { data: categories } = useQuery(navCategoriesQueryOptions());

  const { data: newsAlert } = useQuery(newsAlertQueryOptions());

  const headerLinks = useNavLinks("header");
  const topBarLinks = useNavLinks("topbar");

  const topLevelCategories: Category[] =
    categories?.filter((cat) => cat.show_in_nav && !cat.parent_id) ?? [];

  const childrenOf = (parentId: string): Category[] =>
    categories?.filter((sub) => sub.parent_id === parentId && sub.show_in_nav) ?? [];

  const slugSegment = (slug: string): string => slug.trim().replace(/^\/+/, "");

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

  const clientAreaUrl = resolveAuthUrl(settings?.["login_url"], WHMCS_LINKS.clientArea);
  const registerUrl = resolveAuthUrl(settings?.["register_url"], WHMCS_LINKS.register);

  return (
    <header className="w-full fixed top-0 left-0 right-0 z-50">
      {!isScrolled && newsAlert && (
        <div className="w-full bg-blue-600 text-white border-b border-blue-500/20 overflow-hidden h-10 sm:h-11 flex items-center relative z-[52]">
          <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-center gap-4 relative">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex items-center gap-1.5 bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider motion-safe:animate-pulse whitespace-nowrap">
                <Bell className="w-3 h-3" />
                {newsAlert.badge_text || "OFFER"}
              </div>
              <div className="text-white text-xs sm:text-sm font-bold tracking-wide truncate">
                {newsAlert.content}
              </div>
            </div>
            {newsAlert.link_url && (
              <SmartLink
                href={sanitizeUrl(newsAlert.link_url)}
                className={`absolute right-6 hidden sm:flex items-center gap-1.5 text-blue-100 hover:text-white transition-colors text-xs font-black uppercase tracking-wider whitespace-nowrap rounded-full ${FOCUS_RING} focus-visible:ring-offset-blue-600`}
              >
                Learn More <ArrowRight className="w-3 h-3" />
              </SmartLink>
            )}
          </div>
        </div>
      )}

      {!isScrolled && (
        <div className="w-full bg-slate-100 dark:bg-slate-950/95 text-slate-800 dark:text-slate-300 py-2 px-6 border-b border-slate-200 dark:border-white/5 relative z-[51]">
          <div className="max-w-7xl mx-auto flex justify-between items-center text-xs font-bold uppercase tracking-[0.08em] sm:tracking-widest">
            <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-1">
              <a
                href={telHref(phone)}
                aria-label={`Call us on ${phone}`}
                className={`flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0 rounded-full ${FOCUS_RING} focus-visible:ring-offset-slate-950`}
              >
                <Phone className="w-3 h-3 text-blue-500" aria-hidden="true" />{" "}
                <span className="hidden sm:inline">{phone}</span>
              </a>
              <div className="w-px h-3 bg-slate-300 dark:bg-white/10 shrink-0" />
              <a
                href={`mailto:${email}`}
                aria-label={`Email us at ${email}`}
                className={`flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0 rounded-full ${FOCUS_RING} focus-visible:ring-offset-slate-950`}
              >
                <Mail className="w-3 h-3 text-blue-500" aria-hidden="true" />{" "}
                <span className="hidden sm:inline">{email}</span>
              </a>
            </div>
            <div className="flex items-center gap-3 sm:gap-6 ml-4">
              {topBarLinks.map((link) => (
                <NavLinkItem key={link.id} link={link} className={TOP_BAR_LINK_CLASS} />
              ))}
              <a
                href={WHMCS_LINKS.support}
                aria-label="Support — opens the GROWUPHOST client area"
                className={`flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0 rounded-full ${FOCUS_RING} focus-visible:ring-offset-slate-950`}
              >
                <LifeBuoy className="w-3 h-3 text-blue-500" aria-hidden="true" />{" "}
                <span className="hidden sm:inline">Support</span>
              </a>
              <div className="hidden sm:block w-px h-3 bg-slate-300 dark:bg-white/10 shrink-0" />
              <div className="hidden sm:flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Globe className="w-3 h-3 text-blue-500" aria-hidden="true" /> INR (₹)
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className={`w-full relative z-50 transition-all duration-500 ${isScrolled ? "py-2 px-4" : "py-0"}`}
      >
        <div
          className={`absolute inset-x-0 top-0 transition-all duration-500 ease-out ${
            isScrolled
              ? "h-full rounded-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.8)]"
              : "h-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-white/5"
          }`}
        />

        <nav
          aria-label="Primary"
          className="relative max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-16 sm:h-20"
        >
          <div className="flex items-center min-w-0">
            <Link
              to="/"
              onClick={closeMenu}
              className={`text-xl sm:text-3xl font-black tracking-tighter italic text-slate-950 dark:text-white flex items-center gap-2 sm:gap-3 group relative z-50 rounded-xl min-w-0 ${FOCUS_RING}`}
            >
              <BrandMark brand={brand} surface="navbar" className="rounded-lg" />

              {brand.showText && (
                <span className={`relative z-50 truncate ${WORDMARK_INK_PADDING}`}>
                  {companyName}
                </span>
              )}
            </Link>
          </div>

          <div className="flex-1 hidden lg:flex justify-center">
            <div className="flex items-center gap-8">
              {headerLinks.map((link) => (
                <NavLinkItem key={link.id} link={link} className={HEADER_LINK_CLASS} />
              ))}
              {topLevelCategories.map((category) => {
                const subcategories = childrenOf(category.id);

                return (
                  <div key={category.id} className="relative group py-4">
                    <Link
                      to="/$categorySlug"
                      params={{ categorySlug: slugSegment(category.slug) }}
                      className={`text-[13px] font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative z-50 flex items-center gap-1 rounded-md ${FOCUS_RING}`}
                    >
                      {category.name}
                      {subcategories.length > 0 && (
                        <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform" />
                      )}
                    </Link>

                    {subcategories.length > 0 && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-300 z-[100]">
                        <div className="bg-white dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-4 min-w-[200px] shadow-2xl">
                          <div className="grid gap-2">
                            {subcategories.map((sub) => (
                              <Link
                                key={sub.id}
                                to="/$categorySlug"
                                params={{ categorySlug: slugSegment(sub.slug) }}
                                className={`text-xs font-bold uppercase tracking-widest text-slate-700 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 p-2 rounded-xl transition-all ${FOCUS_RING}`}
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <Link to="/packages" className={HEADER_LINK_CLASS}>
                Packages
              </Link>
              <Link to="/contact" className={HEADER_LINK_CLASS}>
                Contact
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 lg:gap-4 ml-auto relative z-50">
            <ThemeToggle variant="navbar" />

            <div className="hidden lg:flex items-center gap-3">
              <SmartLink
                href={clientAreaUrl}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest ${CTA_SECONDARY}`}
              >
                <LogIn className="w-3.5 h-3.5" />
                Client Area
              </SmartLink>

              <SmartLink
                href={registerUrl}
                className={`flex items-center gap-2 rounded-xl px-6 py-2.5 font-black text-xs uppercase tracking-widest ${CTA_PRIMARY}`}
              >
                Get Started
                <ArrowRight className="w-3.5 h-3.5" />
              </SmartLink>
            </div>

            <div
              className={`lg:hidden w-[104px] sm:w-[128px] shrink-0 flex justify-end transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${
                isPastHero && !isMenuOpen
                  ? "opacity-100 translate-y-0 visible"
                  : "opacity-0 -translate-y-1.5 invisible pointer-events-none"
              }`}
            >
              <SmartLink
                href={registerUrl}
                className={`inline-flex items-center justify-center gap-1.5 min-h-11 min-w-11 px-3 sm:px-4 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap ${CTA_PRIMARY}`}
              >
                Get Started
                <ArrowRight className="w-3.5 h-3.5" />
              </SmartLink>
            </div>

            <button
              type="button"
              className={`lg:hidden p-2.5 min-h-11 min-w-11 flex items-center justify-center text-white hover:bg-white/5 rounded-lg relative z-50 ${FOCUS_RING}`}
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </div>

      <div
        id="mobile-menu"
        aria-hidden={!isMenuOpen}
        aria-label="Mobile navigation"
        className={`lg:hidden fixed inset-0 top-0 bg-slate-950/98 backdrop-blur-2xl z-40 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isMenuOpen
            ? "translate-x-0 opacity-100 visible pointer-events-auto"
            : "translate-x-full opacity-0 invisible pointer-events-none"
        }`}
      >
        <div className="flex flex-col h-full pt-24 px-8 pb-12 overflow-y-auto">
          <div className="flex-1 space-y-12">
            <div className="space-y-4">
              <div className="text-xs font-black uppercase tracking-[0.4em] text-blue-500 mb-6 flex items-center gap-2">
                <div className="w-4 h-[1px] bg-blue-500" />
                Infrastructure
              </div>
              <div className="grid gap-2">
                {headerLinks.map((link) => (
                  <NavLinkItem
                    key={link.id}
                    link={link}
                    className={MOBILE_LINK_CLASS}
                    onNavigate={closeMenu}
                  >
                    {link.label}
                    <ChevronRight className="w-8 h-8 text-blue-500/50" aria-hidden="true" />
                  </NavLinkItem>
                ))}
                {topLevelCategories.map((category) => (
                  <Link
                    key={category.id}
                    to="/$categorySlug"
                    params={{ categorySlug: slugSegment(category.slug) }}
                    className={`flex items-center justify-between text-3xl font-black text-white py-4 active:text-blue-400 transition-colors rounded-2xl ${FOCUS_RING}`}
                    onClick={closeMenu}
                  >
                    {category.name}
                    <ChevronRight className="w-8 h-8 text-blue-500/50" />
                  </Link>
                ))}
                <Link to="/packages" className={MOBILE_LINK_CLASS} onClick={closeMenu}>
                  Packages
                  <ChevronRight className="w-8 h-8 text-blue-500/50" />
                </Link>
                <Link to="/contact" className={MOBILE_LINK_CLASS} onClick={closeMenu}>
                  Contact
                  <ChevronRight className="w-8 h-8 text-blue-500/50" />
                </Link>
              </div>
            </div>

            <div className="space-y-4 pt-10 border-t border-white/5">
              <div className="text-xs font-black uppercase tracking-[0.4em] text-blue-500 mb-6 flex items-center gap-2">
                <div className="w-4 h-[1px] bg-blue-500" />
                Your Account
              </div>

              <SmartLink
                href={registerUrl}
                onNavigate={closeMenu}
                className={`w-full flex items-center justify-center gap-3 min-h-11 py-6 rounded-2xl text-base font-black uppercase tracking-widest ${CTA_PRIMARY}`}
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </SmartLink>

              <SmartLink
                href={clientAreaUrl}
                onNavigate={closeMenu}
                className={`w-full flex items-center justify-center gap-3 min-h-11 py-6 rounded-2xl text-base font-black uppercase tracking-widest ${CTA_SECONDARY}`}
              >
                <LogIn className="w-4 h-4" />
                Client Area
              </SmartLink>

              <a
                href={WHMCS_LINKS.support}
                onClick={closeMenu}
                className={`w-full flex items-center justify-center gap-3 text-slate-400 hover:text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-colors ${FOCUS_RING}`}
              >
                <LifeBuoy className="w-4 h-4" />
                Open a Support Ticket
              </a>
            </div>
          </div>

          <div className="pt-12 text-center">
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
              © {CURRENT_YEAR} {companyName}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

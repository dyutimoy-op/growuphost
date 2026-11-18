import { useState, type FormEvent } from "react";
import { Search, ArrowRight, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WHMCS_BASE_URL, WHMCS_LINKS } from "@/config/whmcs";
import { Reveal } from "./Reveal";

interface TldItem {
  extension: string;
  price: string;
  popular?: boolean;
}

const POPULAR_TLDS: readonly TldItem[] = [
  { extension: ".com", price: "₹799/yr", popular: true },
  { extension: ".in", price: "₹499/yr", popular: true },
  { extension: ".org", price: "₹899/yr" },
  { extension: ".net", price: "₹799/yr" },
  { extension: ".co.in", price: "₹399/yr" },
  { extension: ".xyz", price: "₹199/yr" },
];

export function DomainSearch() {
  const [domainQuery, setDomainQuery] = useState("");
  const [selectedTld, setSelectedTld] = useState(".com");

  const buildSearchUrl = (query: string, tldFallback: string = ".com"): string => {
    let clean = query
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//i, "")
      .replace(/\/.*$/, "");

    if (!clean) {
      return `${WHMCS_BASE_URL}/cart.php?a=add&domain=register`;
    }

    // If query doesn't already contain a dot extension, append selected TLD
    if (!clean.includes(".")) {
      clean = `${clean}${tldFallback}`;
    }

    return `${WHMCS_BASE_URL}/cart.php?a=add&domain=register&query=${encodeURIComponent(clean)}`;
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const url = buildSearchUrl(domainQuery, selectedTld);
    window.location.href = url;
  };

  const handleTldClick = (ext: string) => {
    setSelectedTld(ext);
    let base = domainQuery.trim().split(".")[0];
    if (base) {
      const full = `${base}${ext}`;
      setDomainQuery(full);
      window.location.href = `${WHMCS_BASE_URL}/cart.php?a=add&domain=register&query=${encodeURIComponent(full)}`;
    }
  };

  return (
    <section
      id="domain-search"
      aria-labelledby="domain-search-heading"
      className="relative scroll-mt-20 sm:scroll-mt-24 border-y border-slate-200 dark:border-white/5 bg-slate-100/60 dark:bg-slate-900/40 py-12 sm:py-16 backdrop-blur-sm"
    >
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal preset="fade" duration={0.3}>
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="domain-search-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white"
            >
              Find Your Ideal Domain Name
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Check availability and register your domain with instant DNS setup and free WHOIS privacy.
            </p>
          </div>
        </Reveal>

        <Reveal preset="rise" delay={0.05} duration={0.3} className="mt-6 sm:mt-8 max-w-3xl mx-auto">
          {/* Main Search Bar */}
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 shadow-lg dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-200"
          >
            <div className="flex items-center gap-2.5 px-3 py-2 w-full flex-1">
              <Search className="h-5 w-5 text-slate-400 shrink-0" aria-hidden="true" />
              <input
                type="text"
                value={domainQuery}
                onChange={(e) => setDomainQuery(e.target.value)}
                placeholder="Type your domain name (e.g. mycompany.com)..."
                className="w-full bg-transparent text-sm sm:text-base font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                aria-label="Domain name search input"
              />
            </div>

            {/* Quick Extension Selector */}
            <div className="hidden sm:flex items-center border-l border-slate-200 dark:border-slate-800 px-2">
              <select
                value={selectedTld}
                onChange={(e) => setSelectedTld(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 py-2 px-1 focus:outline-none cursor-pointer"
                aria-label="Select default domain extension"
              >
                {POPULAR_TLDS.map((t) => (
                  <option key={t.extension} value={t.extension} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {t.extension}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wide shadow-md transition-all active:scale-[0.98] shrink-0"
            >
              <span>Search Domain</span>
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </form>

          {/* Popular TLD badges */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {POPULAR_TLDS.map((tld) => (
              <button
                key={tld.extension}
                type="button"
                onClick={() => handleTldClick(tld.extension)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                  tld.popular
                    ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 hover:border-blue-400"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700"
                }`}
              >
                <span className="font-extrabold">{tld.extension}</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">{tld.price}</span>
              </button>
            ))}
          </div>

          {/* Transfer domain link */}
          <div className="mt-3.5 text-center">
            <a
              href={WHMCS_LINKS.domainTransfer}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Already own a domain? Transfer it to GROWUPHOST</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          {/* Features Checkmarks */}
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              Free WHOIS Privacy Protection
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              Instant DNS & Nameserver Setup
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              Free URL & Email Forwarding
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              24/7 Expert Support
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

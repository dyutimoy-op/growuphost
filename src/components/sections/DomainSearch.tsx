import { useState, type FormEvent } from "react";
import { Search, ArrowRight, Globe, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CTA_PRIMARY } from "./cta-styles";
import { Reveal } from "./Reveal";

interface TldPrice {
  extension: string;
  price: string;
  originalPrice?: string;
  popular?: boolean;
}

const POPULAR_TLDS: readonly TldPrice[] = [
  { extension: ".com", price: "₹799", originalPrice: "₹1,199", popular: true },
  { extension: ".in", price: "₹499", originalPrice: "₹899", popular: true },
  { extension: ".org", price: "₹899", originalPrice: "₹1,299" },
  { extension: ".net", price: "₹799", originalPrice: "₹1,149" },
  { extension: ".co.in", price: "₹399", originalPrice: "₹699" },
];

export function DomainSearch() {
  const [domainQuery, setDomainQuery] = useState("");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const cleanDomain = domainQuery
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/\/.*$/, "");
    const targetUrl = cleanDomain
      ? `http://client.growuphost.com/cart.php?a=add&domain=register&query=${encodeURIComponent(cleanDomain)}`
      : "http://client.growuphost.com/cart.php?a=add&domain=register";
    window.location.href = targetUrl;
  };

  const handleTldClick = (tld: string) => {
    let name = domainQuery.trim().split(".")[0];
    if (!name) name = "mybusiness";
    const full = `${name}${tld}`;
    window.location.href = `http://client.growuphost.com/cart.php?a=add&domain=register&query=${encodeURIComponent(full)}`;
  };

  return (
    <section
      id="domain-search"
      aria-labelledby="domain-search-heading"
      className="relative overflow-hidden border-y border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/60 py-16 sm:py-20 backdrop-blur-xl"
    >
      <div className="absolute inset-0 pointer-events-none opacity-40" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[130px] rounded-full" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal preset="fade" duration={0.4}>
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-1.5 text-xs font-black tracking-widest text-blue-700 dark:text-blue-300 uppercase">
              <Globe className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              Instant Domain Search
            </span>

            <h2
              id="domain-search-heading"
              className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 dark:text-white uppercase"
            >
              Find the perfect domain for your{" "}
              <span className="text-blue-600 dark:text-sky-400 italic">brand</span>
            </h2>

            <p className="mt-3 text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
              Secure your identity with ultra-fast DNS, free WHOIS privacy, and 1-click hosting
              setup.
            </p>
          </div>
        </Reveal>

        <Reveal
          preset="rise"
          delay={0.08}
          duration={0.4}
          className="mt-8 sm:mt-10 max-w-3xl mx-auto"
        >
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-300 dark:border-blue-500/30 shadow-[0_10px_35px_-10px_rgba(37,99,235,0.15)] dark:shadow-[0_10px_35px_-10px_rgba(37,99,235,0.3)] backdrop-blur-xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-400/40 transition-all duration-200"
          >
            <div className="flex items-center gap-3 px-4 py-2 w-full flex-1">
              <Search
                className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0"
                aria-hidden="true"
              />
              <input
                type="text"
                value={domainQuery}
                onChange={(e) => setDomainQuery(e.target.value)}
                placeholder="Enter your ideal domain name (e.g. yourbrand.com)..."
                className="w-full bg-transparent text-sm sm:text-base font-semibold text-slate-950 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-slate-400"
                aria-label="Domain search"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className={`w-full sm:w-auto h-12 rounded-xl px-7 text-xs font-black uppercase tracking-wider ${CTA_PRIMARY}`}
            >
              <span>Search Domain</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
            {POPULAR_TLDS.map((tld) => (
              <button
                key={tld.extension}
                type="button"
                data-neutral-btn="true"
                onClick={() => handleTldClick(tld.extension)}
                className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  tld.popular
                    ? "bg-blue-600 text-white shadow-md hover:bg-blue-700 border border-blue-500 dark:bg-blue-600/30 dark:border-blue-500/40 dark:text-white dark:hover:bg-blue-600/50"
                    : "bg-white border border-slate-300 text-slate-950 shadow-sm hover:border-blue-500 hover:text-blue-600 dark:bg-slate-900 dark:border-white/10 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                }`}
              >
                <span
                  className={
                    tld.popular
                      ? "font-black text-white"
                      : "font-black text-blue-600 dark:text-blue-400 group-hover:text-blue-700"
                  }
                >
                  {tld.extension}
                </span>
                <span
                  className={
                    tld.popular
                      ? "font-extrabold text-white"
                      : "font-extrabold text-slate-950 dark:text-white"
                  }
                >
                  {tld.price}
                </span>
                <span
                  className={
                    tld.popular
                      ? "text-[10px] text-blue-100"
                      : "text-[10px] text-slate-500 dark:text-slate-400"
                  }
                >
                  /yr
                </span>
                {tld.originalPrice && (
                  <span
                    className={`text-[10px] line-through hidden sm:inline ${
                      tld.popular ? "text-blue-200" : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {tld.originalPrice}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs font-bold text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Free WHOIS
              Privacy
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Instant
              Activation
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Free DNS
              Management
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

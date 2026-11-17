import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Check,
  CheckCircle2,
  Cloud,
  Database,
  ExternalLink,
  FolderOpen,
  Globe,
  HardDrive,
  Layers,
  Lock,
  Mail,
  RotateCcw,
  Search,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Terminal,
  User,
  Zap,
} from "lucide-react";

import { Reveal } from "./Reveal";
import { WHMCS_LINKS } from "@/config/whmcs";

interface AppCategory {
  id: string;
  label: string;
  apps: readonly { name: string; tag: string }[];
}

const APP_CATEGORIES: readonly AppCategory[] = [
  {
    id: "cms",
    label: "CMS Platforms",
    apps: [
      { name: "WordPress", tag: "v6.5" },
      { name: "Drupal", tag: "v10" },
      { name: "Joomla", tag: "v5" },
      { name: "Ghost", tag: "v5" },
    ],
  },
  {
    id: "ecommerce",
    label: "E-Commerce",
    apps: [
      { name: "WooCommerce", tag: "Store" },
      { name: "Magento 2", tag: "Enterprise" },
      { name: "PrestaShop", tag: "Store" },
      { name: "OpenCart", tag: "v3" },
    ],
  },
  {
    id: "crm",
    label: "CRM & ERP",
    apps: [
      { name: "SuiteCRM", tag: "CRM" },
      { name: "ERPNext", tag: "ERP" },
      { name: "Dolibarr", tag: "Billing" },
      { name: "Odoo", tag: "Business" },
    ],
  },
  {
    id: "scripts",
    label: "200+ Scripts",
    apps: [
      { name: "Laravel", tag: "Framework" },
      { name: "Node.js", tag: "v20" },
      { name: "Python", tag: "v3.12" },
      { name: "phpBB", tag: "Community" },
    ],
  },
];

const CPANEL_TOOLS = [
  { name: "File Manager", icon: FolderOpen, color: "text-amber-400" },
  { name: "phpMyAdmin", icon: Database, color: "text-blue-400" },
  { name: "SSL / TLS", icon: Lock, color: "text-emerald-400" },
  { name: "PHP 8.3", icon: Terminal, color: "text-purple-400" },
  { name: "Email Accounts", icon: Mail, color: "text-sky-400" },
  { name: "LiteSpeed Cache", icon: Zap, color: "text-amber-400" },
  { name: "CloudLinux LVE", icon: Cloud, color: "text-cyan-400" },
  { name: "Node.js App", icon: Server, color: "text-emerald-400" },
  { name: "Setup Python", icon: Terminal, color: "text-blue-400" },
  { name: "Imunify360", icon: ShieldCheck, color: "text-emerald-400" },
  { name: "Weekly Backup", icon: RotateCcw, color: "text-purple-400" },
  { name: "1-Click Apps", icon: Layers, color: "text-rose-400" },
] as const;

export function CloudBentoGrid() {
  const [activeTab, setActiveTab] = useState<string>("cms");
  const [cpanelSearch, setCpanelSearch] = useState<string>("");

  const activeCategory: AppCategory =
    APP_CATEGORIES.find((c) => c.id === activeTab) ?? APP_CATEGORIES[0]!;
  const filteredTools = CPANEL_TOOLS.filter((t) =>
    t.name.toLowerCase().includes(cpanelSearch.toLowerCase().trim()),
  );

  return (
    <section
      id="cloud-bento"
      aria-labelledby="bento-heading"
      className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 px-4 py-20 sm:px-6 lg:px-8 lg:py-28 border-t border-slate-200 dark:border-white/5"
    >
      <div
        className="pointer-events-none absolute top-1/3 left-10 h-[450px] w-[450px] rounded-full bg-blue-600/5 dark:bg-blue-600/10 blur-[150px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-10 right-10 h-[500px] w-[500px] rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-[150px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Reveal preset="fade" duration={0.4}>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-300 dark:border-blue-500/30 bg-blue-100/60 dark:bg-blue-500/10 px-4 py-1.5 text-xs font-black tracking-widest text-blue-800 dark:text-blue-300 uppercase">
              <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              High-Performance Architecture
            </span>
          </Reveal>

          <Reveal preset="rise" delay={0.06} duration={0.4}>
            <h2
              id="bento-heading"
              className="mt-4 text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 dark:text-white uppercase leading-[1.08]"
            >
              The Next-Gen{" "}
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-600 dark:from-blue-400 dark:via-sky-300 dark:to-blue-500 bg-clip-text text-transparent italic">
                Cloud Platform
              </span>
            </h2>
          </Reveal>

          <Reveal preset="rise" delay={0.1} duration={0.4}>
            <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              Experience flawless speed, sub-10ms CDN delivery, automated AI security, and seamless
              1-click cloud scaling engineered for growth.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          <div className="lg:col-span-4 flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-6 backdrop-blur-2xl shadow-sm dark:shadow-xl">
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/70 p-4 shadow-inner">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  <Lock className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  <span>growuphost.com</span>
                </div>
                <div className="w-6" />
              </div>

              <div className="rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/5 p-4 text-center shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <img
                      src="/growuphost/logo-light.png"
                      alt="GrowUpHost"
                      className="h-4 w-auto hidden dark:block"
                    />
                    <img
                      src="/growuphost/logo.png"
                      alt="GrowUpHost"
                      className="h-4 w-auto block dark:hidden"
                    />
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-black uppercase">
                    Portal
                  </span>
                </div>

                <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                  <Zap className="h-2.5 w-2.5 fill-amber-500 dark:fill-amber-400" /> #1 Web Host
                  India
                </div>
                <h4 className="text-sm font-black text-slate-950 dark:text-white">
                  Trust your site with cPanel
                </h4>
                <p className="mt-1 text-[10px] text-slate-600 dark:text-slate-300 line-clamp-2">
                  Ultra-fast NVMe cloud platform engineered for speed, high uptime, and zero
                  latency.
                </p>

                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-black">
                    Check Plans
                  </span>
                  <span className="px-3 py-1 rounded-lg border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-300 text-[10px] font-bold">
                    Learn More
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-4">
                <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Google PageSpeed Score</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center mb-4">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25">
                  <div className="h-10 w-10 mx-auto rounded-full border-2 border-emerald-500 dark:border-emerald-400 flex items-center justify-center text-xs font-black text-emerald-700 dark:text-emerald-400">
                    100
                  </div>
                  <span className="mt-1 block text-[9px] font-black uppercase text-slate-600 dark:text-slate-400">
                    Perf
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25">
                  <div className="h-10 w-10 mx-auto rounded-full border-2 border-emerald-500 dark:border-emerald-400 flex items-center justify-center text-xs font-black text-emerald-700 dark:text-emerald-400">
                    100
                  </div>
                  <span className="mt-1 block text-[9px] font-black uppercase text-slate-600 dark:text-slate-400">
                    Access
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25">
                  <div className="h-10 w-10 mx-auto rounded-full border-2 border-emerald-500 dark:border-emerald-400 flex items-center justify-center text-xs font-black text-emerald-700 dark:text-emerald-400">
                    100
                  </div>
                  <span className="mt-1 block text-[9px] font-black uppercase text-slate-600 dark:text-slate-400">
                    Best P.
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25">
                  <div className="h-10 w-10 mx-auto rounded-full border-2 border-emerald-500 dark:border-emerald-400 flex items-center justify-center text-xs font-black text-emerald-700 dark:text-emerald-400">
                    100
                  </div>
                  <span className="mt-1 block text-[9px] font-black uppercase text-slate-600 dark:text-slate-400">
                    SEO
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 py-1.5 font-bold text-blue-800 dark:text-blue-300">
                  <span className="font-black text-slate-950 dark:text-white">0.5s</span> LOAD
                </div>
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 py-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                  <span className="font-black text-slate-950 dark:text-white">100</span> SCORE
                </div>
                <div className="rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 py-1.5 font-bold text-purple-800 dark:text-purple-300">
                  <span className="font-black text-slate-950 dark:text-white">A+</span> GRADE
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-emerald-200 dark:border-emerald-500/25 bg-white dark:bg-slate-900/80 p-6 sm:p-8 backdrop-blur-2xl shadow-sm dark:shadow-xl">
            <div>
              <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                Advanced Security Shield
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                Enterprise-grade multi-layer protection shielding your websites from all cyber
                threats.
              </p>

              <div className="mt-6 space-y-3.5">
                <div className="flex items-start gap-3 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Automatic Free SSL &amp; HTTPS encryption</span>
                </div>
                <div className="flex items-start gap-3 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Enterprise Imunify360 DDoS &amp; Firewall protection</span>
                </div>
                <div className="flex items-start gap-3 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Real-time automated malware scanning &amp; cleanup</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center py-6">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                <div className="absolute inset-2 rounded-full border border-emerald-400/30 animate-pulse" />
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-400 text-emerald-600 dark:text-emerald-400 shadow-lg">
                  <ShieldCheck className="h-10 w-10" />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col justify-between rounded-3xl border border-blue-200 dark:border-blue-500/25 bg-white dark:bg-slate-900/80 p-6 backdrop-blur-2xl shadow-sm dark:shadow-xl">
            <div>
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/5 p-4 mb-4 flex items-center justify-between">
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                  <div className="h-2 w-2 rounded-full bg-sky-500" />
                  <div className="h-2 w-2 rounded-full bg-blue-700" />
                  <div className="h-2 w-2 rounded-full bg-cyan-500" />
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-blue-500 to-emerald-500 mx-3" />
                <div className="text-center">
                  <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black text-slate-950 dark:text-white mt-1 block">
                    Your Site
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-950 dark:text-white">
                Global Cloudflare CDN
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                Blazing fast sub-10ms content delivery from 200+ global edge nodes.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>Latency Across India</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-black">&lt; 4ms</span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="rounded-3xl border border-blue-200 dark:border-blue-500/30 bg-white dark:bg-slate-900/80 p-6 sm:p-8 backdrop-blur-2xl shadow-sm dark:shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                  Elastic NVMe Resource Scaling
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  Instantly scale CPU cores, RAM memory, and Gen4 NVMe disk space on-demand to
                  handle sudden traffic surges with 0 downtime.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex items-end gap-2 h-16 px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/5">
                  <div className="w-4 h-6 rounded-t bg-blue-300 dark:bg-blue-500/30" />
                  <div className="w-4 h-9 rounded-t bg-blue-400 dark:bg-blue-500/50" />
                  <div className="w-4 h-12 rounded-t bg-blue-600" />
                  <div className="w-4 h-15 rounded-t bg-sky-500 animate-pulse" />
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-black">
                  <span className="px-3 py-1.5 rounded-xl bg-blue-100/60 dark:bg-blue-500/10 border border-blue-300 dark:border-blue-500/30 text-blue-800 dark:text-blue-300">
                    Auto-scale
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-100/60 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300">
                    Zero Downtime
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-purple-100/60 dark:bg-purple-500/10 border border-purple-300 dark:border-purple-500/30 text-purple-800 dark:text-purple-300">
                    On-demand
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-6 sm:p-7 backdrop-blur-2xl shadow-sm dark:shadow-xl">
            <div>
              <h3 className="text-xl font-black text-slate-950 dark:text-white">
                1-Click Softaculous Apps &amp; CMS / CRM
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                Instantly deploy WordPress, WooCommerce, Drupal, SuiteCRM, Laravel &amp; 200+ web
                scripts in seconds.
              </p>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {APP_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveTab(cat.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                      activeTab === cat.id
                        ? "bg-blue-600 text-white shadow"
                        : "bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                {activeCategory.apps.map((app) => (
                  <div
                    key={app.name}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 transition-colors hover:border-blue-400 dark:hover:border-blue-500/40"
                  >
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {app.name}
                    </span>
                    <span className="text-[10px] font-black uppercase text-blue-700 dark:text-blue-400 bg-blue-100/60 dark:bg-blue-500/10 px-2 py-0.5 rounded-md">
                      {app.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>Automatic Script Updates</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-black">
                200+ Included
              </span>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-3xl border border-blue-200 dark:border-blue-500/30 bg-white dark:bg-slate-900/90 p-6 sm:p-7 backdrop-blur-2xl shadow-sm dark:shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950 text-white border border-slate-900 shadow-sm mb-5">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-black tracking-wider uppercase text-white ml-2">
                  cPanel Control Panel
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-200">
                  <User className="h-3 w-3" /> user_growuphost
                </span>
              </div>
            </div>

            <div className="my-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-black tracking-widest uppercase text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <SlidersHorizontal className="h-3.5 w-3.5" /> cPanel Tools &amp; Features
              </span>

              <div className="relative w-full sm:w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={cpanelSearch}
                  onChange={(e) => setCpanelSearch(e.target.value)}
                  placeholder="Search tools..."
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {filteredTools.map((tool) => (
                <div
                  key={tool.name}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 text-center transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-500/40 hover:bg-blue-50/50 dark:hover:bg-slate-900 group cursor-default"
                >
                  <tool.icon
                    className={`h-5 w-5 ${tool.color} group-hover:scale-110 transition-transform`}
                  />
                  <span className="mt-2 text-[11px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-white truncate max-w-full">
                    {tool.name}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Official cPanel &amp; WHM Partner
              </span>
              <a
                href={WHMCS_LINKS.clientArea}
                className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Access Client Portal <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

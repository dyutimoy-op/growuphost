import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Database,
  Globe2,
  HardDrive,
  Layers,
  Lock,
  Network,
  RefreshCw,
  Server,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Terminal,
  Zap,
} from "lucide-react";

import { Reveal } from "./Reveal";
import { WHMCS_LINKS } from "@/config/whmcs";

interface RuntimeInfo {
  id: string;
  label: string;
  command: string;
  output: string;
}

const RUNTIMES: readonly RuntimeInfo[] = [
  {
    id: "nodejs",
    label: "Node.js 20+",
    command: "node -v && npm -v",
    output: "v20.12.2 LTS (High-Performance V8 engine active) — npm v10.5.0",
  },
  {
    id: "php",
    label: "PHP 8.3",
    command: "php -v",
    output: "PHP 8.3.6 (cli) with Zend OPcache, LiteSpeed LSAPI & JIT enabled",
  },
  {
    id: "redis",
    label: "Redis Cache",
    command: "redis-cli ping",
    output: "PONG (In-memory object cache latency < 0.08ms)",
  },
  {
    id: "git",
    label: "Git Versioning",
    command: "git status",
    output: "On branch main — Working tree clean, automated webhook auto-deploy ready",
  },
  {
    id: "ssh",
    label: "SSH Terminal",
    command: "ssh admin@mumbai.growuphost.com",
    output: "Authenticated via RSA 4096-bit key — Chrooted jailed shell active",
  },
];

export function PerformanceMatrix() {
  const [activeRuntime, setActiveRuntime] = useState<string>("nodejs");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const currentRuntime: RuntimeInfo = RUNTIMES.find((r) => r.id === activeRuntime) ?? RUNTIMES[0]!;

  const handleRunScan = () => {
    setIsScanning(true);
    setScanResult("Scanning 14,200 filesystem files & live memory...");
    setTimeout(() => {
      setIsScanning(false);
      setScanResult("Clean! 0 Threats Detected. Real-time WAF & Kernel Protection Active.");
    }, 1200);
  };

  return (
    <section
      id="performance-matrix"
      aria-labelledby="matrix-heading"
      className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 px-4 py-20 sm:px-6 lg:px-8 lg:py-28 border-t border-slate-200 dark:border-white/5"
    >
      <div
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-blue-600/5 dark:bg-blue-600/10 blur-[150px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-10 right-10 h-[400px] w-[400px] rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-[140px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Reveal preset="fade" duration={0.4}>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300 dark:border-emerald-500/30 bg-emerald-100/60 dark:bg-emerald-500/10 px-4 py-1.5 text-xs font-black tracking-widest text-emerald-800 dark:text-emerald-400 uppercase">
              <Server className="h-3.5 w-3.5" />
              Enterprise Infrastructure Matrix
            </span>
          </Reveal>

          <Reveal preset="rise" delay={0.06} duration={0.4}>
            <h2
              id="matrix-heading"
              className="mt-4 text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 dark:text-white uppercase leading-[1.08]"
            >
              Engineered for{" "}
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-600 dark:from-blue-400 dark:via-sky-300 dark:to-blue-500 bg-clip-text text-transparent italic">
                Maximum Performance
              </span>
            </h2>
          </Reveal>

          <Reveal preset="rise" delay={0.1} duration={0.4}>
            <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              Enterprise cloud hosting architecture powered by Gen4 Enterprise SSD, LiteSpeed
              Enterprise, AI Security, and automated cloud management.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <Reveal preset="left" duration={0.4}>
              <div className="relative rounded-3xl border border-blue-200 dark:border-blue-500/25 bg-white dark:bg-slate-900/80 p-6 sm:p-8 backdrop-blur-2xl shadow-sm dark:shadow-[0_20px_50px_-15px_rgba(37,99,235,0.2)]">
                <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100/80 dark:bg-blue-600/20 border border-blue-300/80 dark:border-blue-500/30 text-blue-700 dark:text-blue-400">
                      <SlidersHorizontal className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-950 dark:text-white">
                        cPanel &amp; WHM Hub
                      </h3>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        Full Cloud Control
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-100/60 dark:bg-blue-500/10 border border-blue-300 dark:border-blue-500/30 text-blue-800 dark:text-blue-300">
                    <Zap className="h-3 w-3 text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400" />
                    Test Load
                  </span>
                </div>

                <p className="mt-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  Industry-standard control panel with full WHM reseller privileges, automated
                  client site creation, and 1-click app installs.
                </p>

                <div className="mt-6 space-y-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 p-4 sm:p-5">
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-300 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Cpu className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> CPU Usage
                        (12%)
                      </span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-black">
                        Normal
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500 w-[12%] transition-all duration-500" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-300 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> Memory
                        RAM (1.8GB / 8GB)
                      </span>
                      <span className="text-blue-700 dark:text-blue-400 font-black">22%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-blue-600 w-[22%] transition-all duration-500" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-300 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <HardDrive className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />{" "}
                        Enterprise Cloud Storage (42GB / 100GB)
                      </span>
                      <span className="text-sky-700 dark:text-sky-400 font-black">42%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-sky-500 w-[42%] transition-all duration-500" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/10">
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                    1-Click App Integrations Included
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-300">
                      <Globe2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> WordPress
                      1-Click
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-300">
                      <Lock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Free
                      AutoSSL
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-300">
                      <Zap className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" /> Softaculous
                      200+
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-300">
                      <RefreshCw className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />{" "}
                      JetBackup 5
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-300">
                      <Terminal className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />{" "}
                      Node.js &amp; Python
                    </span>
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    to="/packages"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-600/30 transition-all duration-200 hover:bg-blue-500 hover:shadow-blue-500/40 cursor-pointer"
                  >
                    <span>Explore WHM Features</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <Reveal preset="right" duration={0.4}>
              <div className="rounded-3xl border border-emerald-200 dark:border-emerald-500/25 bg-white dark:bg-slate-900/80 p-6 sm:p-7 backdrop-blur-2xl shadow-sm dark:shadow-[0_15px_40px_-10px_rgba(16,185,129,0.15)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100/80 dark:bg-emerald-500/20 border border-emerald-300/80 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-950 dark:text-white">
                        AI Malware Defense &amp; WAF
                      </h3>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        Automated Threat Mitigation
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRunScan}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100/60 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors cursor-pointer w-fit"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
                    {isScanning ? "Scanning..." : "Imunify360: Run Live AI Scan"}
                  </button>
                </div>

                <p className="mt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  Proactive 6-layer artificial intelligence security suite automatically scanning,
                  neutralizing malware, and stopping DDoS brute-force attacks in real time.
                </p>

                {scanResult && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    {scanResult}
                  </div>
                )}

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/60 p-3.5 text-center">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Threats Blocked
                    </span>
                    <span className="mt-1 block text-lg font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                      42,910 / Day
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/60 p-3.5 text-center">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Live WAF Filter
                    </span>
                    <span className="mt-1 block text-lg font-black text-blue-700 dark:text-blue-400 tabular-nums">
                      Sub-1ms Delay
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/60 p-3.5 text-center">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Kernel Patching
                    </span>
                    <span className="mt-1 block text-lg font-black text-purple-700 dark:text-purple-400 uppercase tracking-wide">
                      Rebootless
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Reveal preset="rise" delay={0.12} duration={0.4}>
                <div className="h-full flex flex-col justify-between rounded-3xl border border-cyan-200 dark:border-cyan-500/25 bg-white dark:bg-slate-900/80 p-6 backdrop-blur-2xl shadow-sm">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100/80 dark:bg-cyan-500/20 border border-cyan-300/80 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-400">
                        <RefreshCw className="h-4 w-4" />
                      </div>
                      <h3 className="text-base font-black text-slate-950 dark:text-white">
                        Automated Offsite Backups
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                      30-day snapshot retention stored on isolated cloud backup vaults with 1-click
                      instant data restore.
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs font-bold">
                    <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                      <Zap className="h-3.5 w-3.5" /> Test 1-Click Restore
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-100/60 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-300 text-[11px] font-black">
                      24h RPO
                    </span>
                  </div>
                </div>
              </Reveal>

              <Reveal preset="rise" delay={0.16} duration={0.4}>
                <div className="h-full flex flex-col justify-between rounded-3xl border border-amber-200 dark:border-amber-500/25 bg-white dark:bg-slate-900/80 p-6 backdrop-blur-2xl shadow-sm">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100/80 dark:bg-amber-500/20 border border-amber-300/80 dark:border-amber-500/30 text-amber-700 dark:text-amber-400">
                          <Network className="h-4 w-4" />
                        </div>
                        <h3 className="text-base font-black text-slate-950 dark:text-white">
                          Ultra-Low Ping Routing
                        </h3>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                      Direct Tier-1 carrier network connections optimized for lightning fast
                      database response times.
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                      <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-black">
                        <Zap className="h-3 w-3" /> Test Network Latency
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-black">
                        ● Live Ping
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs font-black">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-slate-950/80 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400">
                        Mumbai 4ms
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-slate-950/80 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400">
                        Singapore 18ms
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-slate-950/80 border border-blue-300 dark:border-blue-500/30 text-blue-800 dark:text-blue-400">
                        Frankfurt 32ms
                      </span>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Reveal preset="rise" delay={0.2} duration={0.4}>
            <div className="rounded-3xl border border-blue-200 dark:border-blue-500/30 bg-white dark:bg-slate-900/80 p-6 sm:p-8 backdrop-blur-2xl shadow-sm dark:shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-white/10">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-300 dark:border-blue-500/30 bg-blue-100/60 dark:bg-blue-500/10 px-3 py-1 text-xs font-black text-blue-800 dark:text-blue-300 uppercase mb-3">
                    <Terminal className="h-3.5 w-3.5" />
                    Developer Ready
                  </div>
                  <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                    Developer-Ready Runtime
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium max-w-2xl">
                    Deploy modern applications effortlessly with native support for Node.js 20+, PHP
                    8.3, Redis cache, Git repos, WP-CLI, and SSH access.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {RUNTIMES.map((runtime) => (
                    <button
                      key={runtime.id}
                      type="button"
                      onClick={() => setActiveRuntime(runtime.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                        activeRuntime === runtime.id
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/40 border border-blue-500"
                          : "bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
                      }`}
                    >
                      {runtime.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-slate-950 border border-slate-900 dark:border-white/10 p-4 sm:p-5 font-mono text-xs shadow-inner">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                    <span className="text-[11px] text-slate-400 ml-2">
                      bash — growuphost-cloud-shell
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    System Active
                  </span>
                </div>

                <div className="space-y-1.5 text-slate-300 leading-relaxed">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">growuphost@server:~$</span>
                    <span className="text-white font-semibold">{currentRuntime.command}</span>
                  </div>
                  <div className="text-blue-300 pl-4">{currentRuntime.output}</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

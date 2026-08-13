import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Info, Globe, Shield, Zap } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    title: "About GROWUPHOST | Our Infrastructure Mission",
    meta: [
      { name: "description", content: "Learn about the GROWUPHOST mission, our global infrastructure, and why businesses trust us for high-performance hosting." },
      { property: "og:title", content: "About GROWUPHOST" },
    ],
  }),
});

function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 selection:bg-indigo-500/30 selection:text-indigo-400">
      <Navbar />
      <main className="flex-grow pt-20">
        <section className="py-24 px-8 max-w-7xl mx-auto">
          <div className="space-y-6 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-black tracking-widest uppercase">
              <Info className="w-3 h-3" /> Our Story
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
              REDEFINING THE <br />
              <span className="text-indigo-500 italic">FUTURE</span> OF HOSTING.
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl leading-relaxed font-medium">
              GROWUPHOST was founded with a single mission: to provide the most reliable, high-performance infrastructure for developers and enterprises worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
            {[
              { icon: Globe, title: "Global Reach", desc: "Data centers strategically located across 24+ global locations for minimum latency." },
              { icon: Shield, title: "Secure by Default", desc: "Enterprise-grade DDoS protection and encrypted backups included with every server." },
              { icon: Zap, title: "Pure Speed", desc: "Latest NVMe SSDs and high-capacity 10Gbps networks for lightning-fast delivery." },
              { icon: Info, title: "Expert Support", desc: "Our engineers are available 24/7/365 to ensure your infrastructure stays online." }
            ].map((feature, i) => (
              <div key={i} className="p-8 bg-slate-900/50 border border-white/5 rounded-[2rem] space-y-4 hover:border-indigo-500/30 transition-colors">
                <feature.icon className="w-8 h-8 text-indigo-400" />
                <h3 className="text-xl font-black text-white">{feature.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-indigo-600 rounded-[3rem] p-12 md:p-20 text-center space-y-8 shadow-[0_0_80px_rgba(99,102,241,0.2)]">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Ready to experience the difference?</h2>
            <p className="text-white/80 max-w-2xl mx-auto font-medium text-lg">
              Join thousands of businesses that trust GROWUPHOST for their critical infrastructure.
            </p>
            <button className="bg-white text-indigo-600 px-10 py-5 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform">
              Deploy Your First Server
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
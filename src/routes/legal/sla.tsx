import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FileText, ShieldCheck, Clock } from "lucide-react";

export const Route = createFileRoute("/legal/sla")({
  component: SLAPage,
  head: () => ({
    title: "Service Level Agreement (SLA) | 99.9% Uptime Guarantee | GROWUPHOST",
    meta: [
      {
        name: "description",
        content: "Review the GROWUPHOST Service Level Agreement. We guarantee 99.9% network uptime and 4-hour hardware replacement for our enterprise Mumbai infrastructure.",
      },
      { property: "og:title", content: "Service Level Agreement (SLA) | GROWUPHOST" },
      { property: "og:description", content: "Our commitment to 99.9% uptime and enterprise reliability." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
});

function SLAPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 selection:bg-indigo-500/30 selection:text-indigo-400">
      <Navbar />
      <main className="flex-grow pt-20">
        <section className="py-24 px-8 max-w-4xl mx-auto">
          <div className="space-y-6 mb-20">
            <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-black tracking-widest uppercase">
              <ShieldCheck className="w-3 h-3" /> Legal Center
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
              SERVICE LEVEL <br />
              <span className="text-indigo-500 italic">AGREEMENT.</span>
            </h1>
            <p className="text-lg text-slate-400 font-medium leading-relaxed">
              Last updated: August 13, 2026. This agreement outlines the service reliability standards you can expect from GROWUPHOST.
            </p>
          </div>

          <div className="space-y-16">
            {[
              { 
                icon: Clock, 
                title: "1. Uptime Guarantee", 
                content: "GROWUPHOST guarantees a 99.9% monthly network uptime. If we fail to meet this guarantee, clients are eligible for service credits as defined in the tables below." 
              },
              { 
                icon: ShieldCheck, 
                title: "2. Security Standards", 
                content: "We implement multi-layered security protocols including automated DDoS mitigation, isolated VPC environments, and regular hardware audits to ensure infrastructure integrity." 
              },
              { 
                icon: FileText, 
                title: "3. Hardware Replacement", 
                content: "We guarantee the replacement of any failed hardware component within 4 hours of identification by our technical staff. This includes CPU, Motherboard, Memory, and Storage." 
              }
            ].map((section, i) => (
              <div key={i} className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400">
                     <section.icon className="w-5 h-5" />
                   </div>
                   <h2 className="text-2xl font-black text-white tracking-tight">{section.title}</h2>
                </div>
                <p className="text-slate-400 leading-relaxed font-medium pl-14">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
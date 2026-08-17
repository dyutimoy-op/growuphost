import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FileText, Scale } from "lucide-react";

export const Route = createFileRoute("/legal/terms")({
  component: TermsPage,
  head: () => ({
    title: "Terms of Service | GROWUPHOST Infrastructure Usage",
    meta: [
      {
        name: "description",
        content: "Review the GROWUPHOST Terms of Service. Guidelines for using our Mumbai hosting, VPS, and dedicated server infrastructure responsibly.",
      },
      { property: "og:title", content: "Terms of Service | GROWUPHOST" },
      { property: "og:description", content: "Enterprise infrastructure usage terms and conditions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
});

function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 selection:bg-indigo-500/30 selection:text-indigo-400">
      <Navbar />
      <main className="flex-grow pt-20">
        <section className="py-24 px-8 max-w-4xl mx-auto">
          <div className="space-y-6 mb-20">
            <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-black tracking-widest uppercase">
              <Scale className="w-3 h-3" /> Legal Center
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
              TERMS OF <br />
              <span className="text-indigo-500 italic">SERVICE.</span>
            </h1>
            <p className="text-lg text-slate-400 font-medium leading-relaxed">
              Last updated: August 17, 2026. Please read these terms carefully before using our services.
            </p>
          </div>

          <div className="space-y-12 text-slate-300">
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <FileText className="w-6 h-6 text-indigo-500" /> 1. Acceptance of Terms
              </h2>
              <p className="leading-relaxed font-medium">
                By accessing or using GROWUPHOST infrastructure, including shared hosting, VPS, and dedicated servers, you agree to be bound by these Terms of Service and all applicable laws and regulations in India.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white">2. Acceptable Use</h2>
              <p className="leading-relaxed font-medium">
                Our infrastructure must be used for lawful purposes only. Prohibited activities include hosting illegal content, performing DDoS attacks, or attempting to compromise the security of our network or other users.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white">3. Billing and Cancellations</h2>
              <p className="leading-relaxed font-medium">
                Services are billed in advance based on your selected cycle. You may cancel your service at any time through the control panel, subject to our refund policy.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Shield, Lock } from "lucide-react";

export const Route = createFileRoute("/legal/privacy")({
  component: PrivacyPage,
  head: () => ({
    title: "Privacy Policy | Data Protection | GROWUPHOST",
    meta: [
      {
        name: "description",
        content: "Read the GROWUPHOST Privacy Policy. Learn how we collect, use, and protect your data to ensure a secure hosting experience for our Mumbai infrastructure.",
      },
      { property: "og:title", content: "Privacy Policy | GROWUPHOST" },
      { property: "og:description", content: "Our commitment to data privacy and infrastructure security." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [
      { rel: "canonical", href: "https://growuphost.com/legal/privacy" },
    ],
  }),
});

function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 selection:bg-indigo-500/30 selection:text-indigo-400">
      <Navbar />
      <main className="flex-grow pt-20">
        <section className="py-24 px-8 max-w-4xl mx-auto">
          <div className="space-y-6 mb-20">
            <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-black tracking-widest uppercase">
              <Shield className="w-3 h-3" /> Legal Center
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
              PRIVACY <br />
              <span className="text-indigo-500 italic">POLICY.</span>
            </h1>
            <p className="text-lg text-slate-400 font-medium leading-relaxed">
              Last updated: August 17, 2026. Your privacy and data security are our top priorities.
            </p>
          </div>

          <div className="space-y-12 text-slate-300">
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <Lock className="w-6 h-6 text-indigo-500" /> 1. Data Collection
              </h2>
              <p className="leading-relaxed font-medium">
                We collect information you provide directly to us when creating an account, making a purchase, or contacting support. This includes your name, email address, billing information, and technical data related to your service usage.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white">2. Infrastructure Security</h2>
              <p className="leading-relaxed font-medium">
                Our Mumbai data centers implement strict physical and logical access controls. We use industry-standard encryption to protect your data both at rest and in transit across our global network.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white">3. Cookies and Tracking</h2>
              <p className="leading-relaxed font-medium">
                We use essential cookies to maintain your session and improve site performance. We do not sell your personal information to third parties for marketing purposes.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

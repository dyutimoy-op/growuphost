import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CategoryProductGrid } from "@/components/CategoryProductGrid";
import { Toaster } from "sonner";

export const Route = createFileRoute("/vps-hosting")({
  component: VPSHostingPage,
  head: () => ({
    title: "NVMe VPS Servers Mumbai | Scalable Cloud Infrastructure | GROWUPHOST",
    meta: [
      {
        name: "description",
        content: "High-performance NVMe VPS servers in Mumbai. Dedicated resources, full root access, and enterprise-grade infrastructure to power your applications.",
      },
      { property: "og:title", content: "High-Performance NVMe VPS | GROWUPHOST" },
      { property: "og:description", content: "Dedicated cloud resources with zero-latency Mumbai infrastructure." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function VPSHostingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 selection:bg-indigo-500/30 selection:text-indigo-400">
      <Toaster position="top-center" richColors />
      <Navbar />
      <main className="flex-grow">
        <div className="pt-20 bg-slate-950 px-8">
           <div className="max-w-7xl mx-auto py-20 text-center space-y-6">
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">VPS <span className="text-indigo-500">Servers</span></h1>
              <p className="text-slate-400 max-w-2xl mx-auto text-xl font-medium leading-relaxed">
                Experience dedicated resources and full root access with our high-performance NVMe Virtual Private Servers.
              </p>
           </div>
        </div>
        <CategoryProductGrid 
          categorySlug="vps-hosting" 
          title="VPS CONFIGURATIONS" 
          subtitle="Choose the perfect balance of power and value for your applications."
        />
      </main>
      <Footer />
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CategoryProductGrid } from "@/components/CategoryProductGrid";
import { Toaster } from "sonner";

export const Route = createFileRoute("/vps-hosting")({
  component: VPSHostingPage,
  head: () => ({
    title: "Cheap VPS Mumbai | Best NVMe Cloud Servers & High Performance | GROWUPHOST",
    meta: [
      {
        name: "description",
        content: "Buy cheap VPS servers in Mumbai with dedicated resources and full root access. Best high-performance NVMe storage for developers and enterprise scale.",
      },
      { property: "og:title", content: "NVMe VPS Mumbai | Enterprise Cloud Servers" },
      { property: "og:description", content: "Dedicated cloud resources with zero-latency Mumbai infrastructure. High-performance NVMe storage." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "NVMe VPS Mumbai | Enterprise Cloud Servers" },
      { name: "twitter:description", content: "High-performance NVMe VPS servers in Mumbai. Dedicated resources and full root access." },
    ],
    links: [
      { rel: "canonical", href: "https://growuphost.com/vps-hosting" },
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

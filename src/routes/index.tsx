import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";
import { Footer } from "@/components/Footer";
import { Toaster } from "sonner";


export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    title: "GROWUPHOST | Enterprise NVMe Hosting & VPS Mumbai",
    meta: [
      {
        name: "description",
        content: "High-performance enterprise infrastructure. Experience zero-latency NVMe hosting, VPS servers, and dedicated hardware in Mumbai. 99.9% uptime guaranteed.",
      },
      { property: "og:title", content: "GROWUPHOST | Enterprise Infrastructure" },
      { property: "og:description", content: "Unmatched performance with zero latency infrastructure. Scale your business with GROWUPHOST." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 selection:bg-indigo-500/30 selection:text-indigo-400 overflow-x-hidden">
      <Toaster position="top-center" richColors />
      <Navbar />

      <main className="flex-grow">
        <Hero />
        <div className="hidden">
          in header need register option also and header make it larger suitable with the website and navigation bar make 3d floting
        </div>
        <ProductGrid />
      </main>
      <Footer />
    </div>
  );
}

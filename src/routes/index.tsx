import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";
import { Footer } from "@/components/Footer";
import { Testimonials } from "@/components/Testimonials";
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
      { property: "og:title", content: "GROWUPHOST | Enterprise NVMe Hosting & VPS Mumbai" },
      { property: "og:description", content: "Unmatched performance with zero latency infrastructure. Scale your business with GROWUPHOST enterprise solutions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "GROWUPHOST | Enterprise NVMe Hosting & VPS Mumbai" },
      { name: "twitter:description", content: "High-performance enterprise infrastructure. Zero-latency NVMe hosting, VPS servers, and dedicated hardware in Mumbai." },
    ],
    links: [
      { rel: "canonical", href: "https://growuphost.com/" },
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
          no no dont add the color as per image have just make like this and color have in my website maintain the color don't change color dark color i have in my webiste its need to maintain
        </div>
        <ProductGrid />
        <Testimonials />

      </main>
      <Footer />
    </div>
  );
}

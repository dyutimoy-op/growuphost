import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { Toaster } from "sonner";
import React from "react";

const ProductGrid = React.lazy(() => import("@/components/ProductGrid").then(m => ({ default: m.ProductGrid })));
const Testimonials = React.lazy(() => import("@/components/Testimonials").then(m => ({ default: m.Testimonials })));



export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    title: "Cheap Trusted Offshore & Bulletproof Hosting Mumbai | Best Fast Antiban VPS | GROWUPHOST",
    meta: [
      {
        name: "description",
        content: "Experience the best cheap trusted offshore & bulletproof hosting in Mumbai with GROWUPHOST. High-performance antiban hosting, zero-latency offshore VPS, and secure webhosting. 99.9% uptime guaranteed.",
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
        <React.Suspense fallback={<div className="h-96 bg-slate-950 animate-pulse" />}>
          <ProductGrid />
          <Testimonials />
        </React.Suspense>
      </main>
      <Footer />
    </div>
  );
}

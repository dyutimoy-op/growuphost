import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CategoryProductGrid } from "@/components/CategoryProductGrid";
import { Toaster } from "sonner";

export const Route = createFileRoute("/dedicated-servers")({
  component: DedicatedServersPage,
});

function DedicatedServersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 selection:bg-indigo-500/30 selection:text-indigo-400">
      <Toaster position="top-center" richColors />
      <Navbar />
      <main className="flex-grow">
        <div className="pt-20 bg-slate-950 px-8">
           <div className="max-w-7xl mx-auto py-20 text-center space-y-6">
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">Dedicated <span className="text-indigo-500">Hardware</span></h1>
              <p className="text-slate-400 max-w-2xl mx-auto text-xl font-medium leading-relaxed">
                Raw power with 100% dedicated hardware. No noisy neighbors, just pure performance for your enterprise workloads.
              </p>
           </div>
        </div>
        <CategoryProductGrid 
          categorySlug="dedicated-servers" 
          title="ENTERPRISE NODES" 
          subtitle="High-availability hardware in Tier 3 data centers across the globe."
        />
      </main>
      <Footer />
    </div>
  );
}

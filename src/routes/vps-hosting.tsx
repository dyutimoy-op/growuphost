import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CategoryProductGrid } from "@/components/CategoryProductGrid";
import { Toaster } from "sonner";

export const Route = createFileRoute("/vps-hosting")({
  component: VPSHostingPage,
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

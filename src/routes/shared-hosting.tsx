import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CategoryProductGrid } from "@/components/CategoryProductGrid";
import { Toaster } from "sonner";

export const Route = createFileRoute("/shared-hosting")({
  component: SharedHostingPage,
});

function SharedHostingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 selection:bg-indigo-500/30 selection:text-indigo-400">
      <Toaster position="top-center" richColors />
      <Navbar />
      <main className="flex-grow">
        <div className="pt-20 bg-slate-950 px-8">
           <div className="max-w-7xl mx-auto py-20 text-center space-y-6">
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">Shared <span className="text-indigo-500">Hosting</span></h1>
              <p className="text-slate-400 max-w-2xl mx-auto text-xl font-medium leading-relaxed">
                Fast, secure, and affordable hosting for personal websites and small businesses. Powered by LiteSpeed and NVMe storage.
              </p>
           </div>
        </div>
        <CategoryProductGrid 
          categorySlug="shared-hosting" 
          title="CHOOSE YOUR PLAN" 
          subtitle="Simple pricing that scales with your growth. No hidden fees."
        />
      </main>
      <Footer />
    </div>
  );
}

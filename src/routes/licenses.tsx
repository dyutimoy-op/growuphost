import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CategoryProductGrid } from "@/components/CategoryProductGrid";
import { Toaster } from "sonner";

export const Route = createFileRoute("/licenses")({
  component: LicensesPage,
  head: () => ({
    title: "Software Licenses | cPanel, LiteSpeed, CloudLinux | GROWUPHOST",
    meta: [
      {
        name: "description",
        content: "Official enterprise software licenses with instant activation. cPanel, LiteSpeed, CloudLinux, and WHMCS at competitive prices.",
      },
      { property: "og:title", content: "Software Licenses | cPanel, LiteSpeed, CloudLinux" },
      { property: "og:description", content: "Instant activation for enterprise infrastructure software licenses. Official cPanel, LiteSpeed partners." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Software Licenses | cPanel, LiteSpeed, CloudLinux" },
      { name: "twitter:description", content: "Official enterprise software licenses with instant activation." },
    ],
    links: [
      { rel: "canonical", href: "https://growuphost.com/licenses" },
    ],
  }),
});

function LicensesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 selection:bg-indigo-500/30 selection:text-indigo-400">
      <Toaster position="top-center" richColors />
      <Navbar />
      <main className="flex-grow">
        <div className="pt-20 bg-slate-950 px-8">
           <div className="max-w-7xl mx-auto py-20 text-center space-y-6">
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">Software <span className="text-indigo-500">Licenses</span></h1>
              <p className="text-slate-400 max-w-2xl mx-auto text-xl font-medium leading-relaxed">
                Genuine licenses for cPanel, LiteSpeed, CloudLinux, and more. Instant activation and official support included.
              </p>
           </div>
        </div>
        <CategoryProductGrid 
          categorySlug="licenses" 
          title="CLOUD LICENSING" 
          subtitle="All the tools you need to manage your infrastructure professionally."
        />
      </main>
      <Footer />
    </div>
  );
}

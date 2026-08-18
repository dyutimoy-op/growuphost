import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Check, ArrowRight, Zap, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { Toaster } from "sonner";

export const Route = createFileRoute("/packages")({
  component: PackagesPage,
  head: () => ({
    title: "Hosting Packages & Pricing | Cheap Trusted Infrastructure | GROWUPHOST",
    meta: [
      {
        name: "description",
        content: "Explore our wide range of hosting packages including Shared, VPS, Dedicated, and Licenses. Bulletproof, Offshore, and Antiban solutions at the best prices.",
      },
    ],
  }),
});

function PackagesPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categories } = useQuery({
    queryKey: ["categories-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .order("price", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 selection:bg-indigo-500/30 selection:text-indigo-400">
      <Toaster position="top-center" richColors />
      <Navbar />
      
      <main className="flex-grow pt-24 sm:pt-32">
        <section className="px-6 lg:px-8 max-w-7xl mx-auto mb-20">
          <div className="text-center space-y-6 mb-16">
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
              OUR <span className="text-indigo-500">PACKAGES</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-xl font-medium leading-relaxed">
              Find the perfect plan for your project. From personal blogs to enterprise-grade offshore infrastructure.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between mb-12 bg-slate-900/40 border border-white/5 p-6 rounded-3xl">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input 
                placeholder="Search plans..." 
                className="bg-slate-950 border-white/10 pl-12 h-12 rounded-2xl text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="bg-slate-950 border border-white/10 p-1 rounded-xl flex">
                <button 
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${billingCycle === 'monthly' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  MONTHLY
                </button>
                <button 
                  onClick={() => setBillingCycle('annually')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${billingCycle === 'annually' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  ANNUALLY
                </button>
              </div>

              <select 
                className="bg-slate-950 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
              >
                <option value="">All Categories</option>
                {categories?.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => {
              const displayPrice = billingCycle === 'annually' ? (product.price * 0.8).toFixed(0) : product.price;
              
              return (
                <div
                  key={product.id}
                  className="group relative flex flex-col p-8 rounded-[2.5rem] bg-slate-900/40 border border-white/5 text-slate-300 transition-all duration-500 hover:scale-[1.02] hover:bg-slate-900 hover:border-indigo-500/30 shadow-2xl h-full"
                >
                  <div className="mb-8 space-y-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
                      {product.categories?.name}
                    </div>
                    <h4 className="text-2xl font-black text-white tracking-tighter uppercase">{product.name}</h4>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white">
                        {product.currency === 'INR' ? '₹' : ''}{displayPrice}
                      </span>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed">
                      {product.description || "High-performance infrastructure with isolated resources and enterprise reliability."}
                    </p>
                  </div>

                  <div className="space-y-4 mb-10 flex-grow">
                    {(product.features as string[])?.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs font-bold">
                        <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-indigo-400" />
                        </div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    asChild
                    className="w-full py-8 rounded-2xl bg-white/5 hover:bg-indigo-600 text-white border border-white/10 hover:border-indigo-500 font-black text-sm uppercase tracking-widest transition-all"
                  >
                    <a href={product.whmcs_link || "#"}>
                      Get Started <ArrowRight className="ml-2 w-4 h-4" />
                    </a>
                  </Button>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="col-span-full py-32 text-center text-slate-500">
                <Zap className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-xl font-bold uppercase tracking-widest opacity-50">No matching packages found</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

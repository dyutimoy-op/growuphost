import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Check, ArrowRight, Zap, Shield, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function ProductGrid() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  const { data: products, isLoading } = useQuery({
    queryKey: ["products-featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .order("price", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-500 bg-slate-950">
        <div className="animate-pulse flex flex-col items-center gap-4">
           <div className="w-12 h-12 rounded-full bg-slate-800" />
           <div className="h-4 w-48 bg-slate-800 rounded" />
        </div>
      </div>
    );
  }

  return (
    <section className="py-32 px-8 bg-slate-950 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-black tracking-widest uppercase">
              <Zap className="w-3 h-3 fill-current" /> Scalable Infrastructure
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
              PLANS FOR EVERY <br />
              <span className="text-slate-500 italic">STAGE.</span>
            </h2>
          </div>

          <div className="bg-slate-900/50 border border-white/5 p-1 rounded-2xl flex">
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${billingCycle === 'monthly' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              MONTHLY
            </button>
            <button 
              onClick={() => setBillingCycle('annually')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${billingCycle === 'annually' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              ANNUALLY <span className="ml-1 text-[10px] text-indigo-300">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {products?.map((product) => {
            const displayPrice = billingCycle === 'annually' ? (product.price * 0.8).toFixed(0) : product.price;
            
            return (
              <div
                key={product.id}
                className={`group relative flex flex-col p-10 rounded-[2.5rem] border transition-all duration-500 hover:scale-[1.02] ${
                  product.is_featured
                    ? "bg-slate-900 border-indigo-500/30 text-white shadow-[0_0_50px_rgba(99,102,241,0.1)]"
                    : "bg-slate-900/40 border-white/5 text-slate-300"
                }`}
              >
                {product.is_featured && (
                  <div className="absolute -top-4 left-10 bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl">
                    Most Popular
                  </div>
                )}

                <div className="mb-10 space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">
                        {product.categories?.name || "Hosting"}
                      </div>
                      <h4 className="text-3xl font-black text-white tracking-tighter">{product.name}</h4>
                    </div>
                    <div className="p-3 bg-white/5 rounded-2xl">
                       <Cpu className="w-6 h-6 text-indigo-400" />
                    </div>
                  </div>
                  
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-white">
                      {product.currency === 'INR' ? '₹' : displayPrice}
                    </span>
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                      /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">
                    Perfect for high-traffic applications requiring isolated resources and dedicated performance.
                  </p>
                </div>

                <div className="space-y-4 mb-12 flex-grow">
                  {(product.features as string[])?.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs font-semibold">
                      <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-indigo-400" />
                      </div>
                      <span className="group-hover:text-white transition-colors">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full py-8 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                    product.is_featured
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
                      : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                  }`}
                >
                  Configure Server <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
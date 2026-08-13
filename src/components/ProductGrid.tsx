import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProductGrid() {
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
      <div className="py-20 text-center text-slate-500">
        Loading our best plans...
      </div>
    );
  }

  return (
    <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-xs font-bold text-primary tracking-widest uppercase">Pricing Plans</h2>
        <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
          Ready to scale your business?
        </h3>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Choose the plan that fits your needs. All plans include 24/7 support and enterprise-grade hardware.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products?.map((product) => (
          <div
            key={product.id}
            className={`relative flex flex-col p-8 rounded-3xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
              product.is_featured
                ? "bg-slate-900 border-slate-800 text-white md:scale-105 z-10 shadow-xl"
                : "bg-white border-slate-100 text-slate-900"
            }`}
          >
            {product.is_featured && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${product.is_featured ? "text-primary" : "text-slate-400"}`}>
                {product.categories?.name || "Hosting"}
              </div>
              <h4 className="text-2xl font-extrabold mb-4">{product.name}</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black">{product.currency === 'INR' ? '₹' : '$'}{product.price}</span>
                <span className={`text-sm ${product.is_featured ? "text-slate-400" : "text-slate-500"}`}>/{product.billing_cycle}</span>
              </div>
            </div>

            <ul className="space-y-4 mb-10 flex-grow">
              {(product.features as string[])?.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${product.is_featured ? "bg-primary/20" : "bg-emerald-50"}`}>
                    <Check className={`w-3 h-3 ${product.is_featured ? "text-primary" : "text-emerald-500"}`} />
                  </div>
                  <span className={product.is_featured ? "text-slate-300" : "text-slate-600"}>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className={`w-full py-6 rounded-2xl font-bold gap-2 ${
                product.is_featured
                  ? "bg-primary hover:bg-primary/90 text-white"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200"
              }`}
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}

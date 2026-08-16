import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, Quote } from "lucide-react";

export function Testimonials() {
  const { data: testimonials } = useQuery({
    queryKey: ['testimonials-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
            TRUSTED BY <span className="text-indigo-500 italic">THOUSANDS</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg font-medium">
            Hear from our global customers who power their infrastructure with GROWUPHOST.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div 
              key={t.id}
              className="p-8 rounded-[2.5rem] bg-slate-900/50 border border-white/5 hover:border-indigo-500/20 transition-all group"
            >
              <div className="flex text-yellow-500 mb-6">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'fill-current' : 'opacity-20'}`} />
                ))}
              </div>
              
              <div className="relative">
                <Quote className="absolute -top-4 -left-4 w-8 h-8 text-indigo-500/20 group-hover:text-indigo-500/40 transition-colors" />
                <p className="text-slate-300 font-medium leading-relaxed italic relative z-10">
                  "{t.content}"
                </p>
              </div>

              <div className="mt-8 flex items-center gap-4">
                {t.avatar_url ? (
                  <img src={t.avatar_url} alt={t.name} className="w-12 h-12 rounded-2xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white">
                    {t.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-black text-white text-sm uppercase tracking-wider">{t.name}</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

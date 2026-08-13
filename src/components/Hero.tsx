import { Play, Shield, Zap, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/use-site-settings";

export function Hero() {
  const { data: settings } = useSiteSettings();
  return (
    <section className="relative w-full min-h-[90vh] lg:min-h-[85vh] flex items-center justify-center overflow-hidden bg-slate-950 pt-48 pb-20 lg:pt-40 lg:pb-0">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_50%)]" />
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        
        {/* Floating Gradients */}
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] lg:w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] -right-[10%] w-[50%] h-[50%] lg:w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div className="relative z-30 space-y-8 lg:space-y-10 animate-in fade-in slide-in-from-left-12 duration-1000 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mx-auto lg:mx-0">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
              <span className="text-indigo-400 text-[10px] lg:text-xs font-black tracking-[0.2em] uppercase">Enterprise Grade Infrastructure</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[0.95] lg:leading-[0.9] tracking-tighter">
                UNMATCHED <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400">
                  PERFORMANCE
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Enterprise-grade infrastructure for businesses that demand zero latency and 100% reliability.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-4 lg:gap-6">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-7 lg:py-8 rounded-2xl text-lg font-black shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all hover:scale-105 active:scale-95 w-full sm:w-auto" asChild>
                <a href={settings?.['hero_cta_url'] || "/"}>Get Started Now <ArrowRight className="ml-2 w-5 h-5" /></a>
              </Button>

              <Button size="lg" variant="outline" className="border-white/10 text-white hover:bg-white/5 px-10 py-7 lg:py-8 rounded-2xl text-lg font-black gap-2 backdrop-blur-md w-full sm:w-auto">
                <Play className="w-5 h-5 fill-current text-indigo-400" /> Infrastructure
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 sm:gap-12 pt-10 lg:pt-12 border-t border-white/5">
              {[
                { icon: Shield, label: 'Protected', sub: 'Layer 7 Guard' },
                { icon: Zap, label: '99.9% Uptime', sub: 'Tier 3 DC' },
                { icon: Globe, label: 'Global', sub: '24+ Nodes' }
              ].map((item) => (
                <div key={item.label} className="group">
                   <item.icon className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-400 mb-2 lg:mb-3 mx-auto lg:mx-0 group-hover:scale-110 transition-transform" />
                  <div className="text-white font-bold text-xs lg:text-sm tracking-wide">{item.label}</div>
                  <div className="text-slate-500 text-[8px] lg:text-[10px] uppercase tracking-widest">{item.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-8 lg:mt-0 px-4 sm:px-0">
            <div className="relative z-10 bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] lg:rounded-[2.5rem] p-8 lg:p-12 shadow-2xl overflow-hidden group">
               {/* Decorative Lines */}
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
               
               <div className="space-y-8 lg:space-y-12">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1 text-left">
                      <div className="text-slate-500 text-[8px] lg:text-[10px] uppercase font-bold tracking-widest">Selected Region</div>
                      <div className="text-white font-bold text-lg lg:text-xl flex items-center gap-2">
                         <Globe className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-400" /> Mumbai, India
                      </div>
                    </div>
                    <div className="px-2 lg:px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-[8px] lg:text-[10px] font-bold tracking-tighter shrink-0">LOW LATENCY</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 lg:gap-8">
                     <div className="p-4 lg:p-6 bg-white/5 rounded-2xl border border-white/5 text-left">
                        <div className="text-slate-500 text-[8px] lg:text-[10px] font-bold uppercase mb-1 lg:mb-2">Network In</div>
                        <div className="text-xl lg:text-2xl font-black text-white">842.1 <span className="text-[10px] lg:text-xs text-indigo-400">Mb/s</span></div>
                     </div>
                     <div className="p-4 lg:p-6 bg-white/5 rounded-2xl border border-white/5 text-left">
                        <div className="text-slate-500 text-[8px] lg:text-[10px] font-bold uppercase mb-1 lg:mb-2">Memory Use</div>
                        <div className="text-xl lg:text-2xl font-black text-white">12.4 <span className="text-[10px] lg:text-xs text-indigo-400">GB</span></div>
                     </div>
                  </div>

                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex justify-between items-center text-[8px] lg:text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                       <span>CPU Threads (32)</span>
                       <span className="text-indigo-400">7% LOAD</span>
                    </div>
                    <div className="flex gap-1 lg:gap-1.5 overflow-hidden">
                       {Array.from({length: 24}).map((_, i) => (
                         <div key={i} className={`h-8 lg:h-12 w-1 lg:w-1.5 rounded-full shrink-0 ${i < 4 ? 'bg-indigo-500' : 'bg-slate-800'}`} />
                       ))}
                    </div>
                  </div>
               </div>
            </div>
            
            {/* Background elements for depth */}
            <div className="absolute -bottom-10 -left-10 w-32 h-32 lg:w-40 lg:h-40 bg-indigo-600/20 blur-[60px] rounded-full" />
            <div className="absolute -top-10 -right-10 w-32 h-32 lg:w-40 lg:h-40 bg-blue-600/20 blur-[60px] rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

import { Play, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/use-site-settings";


export function Hero() {
  const { data: settings } = useSiteSettings();
  return (

    <section className="relative w-full h-[700px] flex items-center justify-center overflow-hidden bg-slate-900">
      {/* Background Video/GIF Simulation */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-slate-900 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072" 
          alt="Network Background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 md:px-8 text-center md:text-left grid grid-cols-1 md:grid-cols-2 items-center gap-12">
        <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary text-xs font-bold tracking-wider">ENTERPRISE CLOUD NODES</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
            Next Generation <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-primary">
              Cloud Hosting
            </span>
          </h1>

          <p className="text-lg text-slate-300 max-w-lg leading-relaxed">
            Deploy your high performance systems optimized for scalability with full root access, bare metal hardware, and isolated resources.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="bg-[#5831f7] hover:bg-[#4828d9] text-white px-8 py-7 rounded-2xl text-lg font-bold" asChild>
              <a href={settings?.hero_cta_url || "/"}>Get Started →</a>
            </Button>

            <Button size="lg" variant="outline" className="border-slate-700 text-white hover:bg-slate-800 px-8 py-7 rounded-2xl text-lg font-bold gap-2">
              <Play className="w-5 h-5 fill-current" /> View Demo
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-800">
            {[
              { label: '99.9% Uptime', sub: 'Guaranteed SLA' },
              { label: 'Free SSL', sub: 'On all domains' },
              { label: 'NVMe SSD', sub: 'Fastest storage' }
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-white font-bold">{stat.label}</div>
                <div className="text-slate-500 text-xs">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden md:block relative animate-in fade-in zoom-in duration-1000">
          <div className="absolute -inset-4 bg-primary/20 rounded-full blur-3xl opacity-20" />
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
              </div>
              <div className="text-slate-500 text-xs font-mono">system_monitor.sh</div>
            </div>
            
            <div className="space-y-6">
              {[
                { label: 'CPU Usage', val: '12%', color: 'bg-emerald-500' },
                { label: 'RAM Usage', val: '4.2GB / 64GB', color: 'bg-blue-500' },
                { label: 'Disk IO', val: 'Fast (0.1ms)', color: 'bg-primary' }
              ].map((m) => (
                <div key={m.label} className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{m.label}</span>
                    <span className="text-white">{m.val}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${m.color}`} style={{ width: m.label === 'CPU Usage' ? '12%' : m.label === 'RAM Usage' ? '30%' : '85%' }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <div className="text-emerald-500 text-xs font-bold">ALL SYSTEMS OPERATIONAL</div>
                <div className="text-slate-400 text-[10px]">Everything is running smoothly</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

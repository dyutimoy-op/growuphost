import { Link } from "@tanstack/react-router";
import { Github, Twitter, Linkedin, Facebook, ShieldCheck, Zap, Globe, ChevronRight } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";

export function Footer() {
  const { data: settings } = useSiteSettings();

  return (
    <footer className="bg-slate-950 border-t border-white/5 pt-16 lg:pt-24 pb-12 px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_bottom,rgba(99,102,241,0.05),transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 mb-16 lg:mb-20">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6 lg:space-y-8 text-center sm:text-left">
            <Link to="/" className="text-2xl lg:text-3xl font-black italic tracking-tighter text-white uppercase inline-flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center not-italic text-sm">G</div>
              {settings?.['company_name'] || 'GROWUPHOST'}
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto sm:mx-0 font-medium">
              Providing enterprise-grade infrastructure since 2018. High-performance cloud hosting for businesses that demand zero downtime.
            </p>
            <div className="flex justify-center sm:justify-start gap-3">
               {[Twitter, Github, Linkedin, Facebook].map((Icon, i) => (
                 <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-indigo-600 transition-all group">
                   <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                 </a>
               ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2 space-y-6 text-center sm:text-left">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Services</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
               <li><Link to="/shared-hosting" className="hover:text-white transition-colors">Shared Hosting</Link></li>
               <li><Link to="/vps-hosting" className="hover:text-white transition-colors">VPS Servers</Link></li>
               <li><Link to="/dedicated-servers" className="hover:text-white transition-colors">Dedicated Nodes</Link></li>
               <li><Link to="/licenses" className="hover:text-white transition-colors">Licenses</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-6 text-center sm:text-left">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Support</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
               <li><Link to="/" className="hover:text-white transition-colors">Knowledgebase</Link></li>
               <li><Link to="/" className="hover:text-white transition-colors">Client Area</Link></li>
               <li><Link to="/" className="hover:text-white transition-colors">Server Status</Link></li>
               <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-4 space-y-6 text-center sm:text-left">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Infrastructure</h4>
            <div className="grid grid-cols-1 gap-4">
               <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between sm:justify-start gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Mumbai, IN</span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                     Ping: 12ms
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="flex-1 bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-help" title="PCI-DSS Compliant">
                     <ShieldCheck className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div className="flex-1 bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-help" title="Tier 3 Certified">
                     <Zap className="w-6 h-6 text-indigo-400" />
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex flex-wrap justify-center gap-6 lg:gap-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <Link to="/legal/sla" className="hover:text-white transition-colors">SLA Guarantee</Link>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
           </div>
           
           <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center">
              © 2026 {settings?.['company_name'] || 'GROWUPHOST'}. Professional Infrastructure.
           </div>
        </div>
      </div>
    </footer>
  );
}

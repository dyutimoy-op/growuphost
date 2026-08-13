import { Link } from "@tanstack/react-router";
import { Check, Github, Twitter, Linkedin, Facebook, ShieldCheck, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/use-site-settings";

export function Footer() {
  const { data: settings } = useSiteSettings();

  return (
    <footer className="bg-slate-950 border-t border-white/5 pt-24 pb-12 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-8">
            <Link to="/" className="text-3xl font-black italic tracking-tighter text-white uppercase">
              {settings?.['company_name'] || 'GROWUPHOST'}
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Providing enterprise-grade infrastructure since 2018. We specialize in high-performance cloud hosting, dedicated servers, and managed services for businesses that can't afford downtime.
            </p>
            <div className="flex gap-4">
               {[Twitter, Github, Linkedin, Facebook].map((Icon, i) => (
                 <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-indigo-600 transition-all">
                   <Icon className="w-5 h-5" />
                 </a>
               ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Services</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
               <li><Link to="/" className="hover:text-white transition-colors">Shared Hosting</Link></li>
               <li><Link to="/" className="hover:text-white transition-colors">VPS Servers</Link></li>
               <li><Link to="/" className="hover:text-white transition-colors">Dedicated Nodes</Link></li>
               <li><Link to="/" className="hover:text-white transition-colors">Cloud GPUs</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Support</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
               <li><Link to="/" className="hover:text-white transition-colors">Knowledgebase</Link></li>
               <li><Link to="/" className="hover:text-white transition-colors">Client Area</Link></li>
               <li><Link to="/" className="hover:text-white transition-colors">Server Status</Link></li>
               <li><Link to="/" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Legal</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
               <li><Link to="/" className="hover:text-white transition-colors">Terms of Service</Link></li>
               <li><Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link></li>
               <li><Link to="/" className="hover:text-white transition-colors">SLA Guarantee</Link></li>
               <li><Link to="/" className="hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Region</h4>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-4">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-white">Mumbai, IN</span>
               </div>
               <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                  Latency: 12ms avg
               </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex gap-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-indigo-400" /> PCI-DSS COMPLIANT</div>
              <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-indigo-400" /> 10GBPS NETWORK</div>
              <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-indigo-400" /> 24 LOCATIONS</div>
           </div>
           
           <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              © 2026 {settings?.['company_name'] || 'GROWUPHOST'}. All Infrastructure Managed.
           </div>
        </div>
      </div>
    </footer>
  );
}
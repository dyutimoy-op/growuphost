import { Link } from "@tanstack/react-router";
import { Github, Twitter, Linkedin, Facebook, ShieldCheck, Zap, Globe, ChevronRight, Instagram } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";

export function Footer() {
  const { data: settings } = useSiteSettings();

  return (
    <footer className="bg-slate-950 border-t border-white/5 pt-20 lg:pt-32 pb-12 px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-20">
          
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-8 text-center md:text-left">
            <Link to="/" className="text-3xl font-black italic tracking-tighter text-white uppercase inline-flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center not-italic text-base shadow-lg shadow-indigo-600/20">G</div>
              {settings?.['company_name'] || 'GROWUPHOST'}
            </Link>
            <p className="text-slate-400 text-base leading-relaxed max-w-md mx-auto md:mx-0 font-medium italic opacity-80">
              "We provide the engine for your digital success. High-performance infrastructure with unmatched reliability in the heart of Mumbai."
            </p>
            
            <div className="flex flex-col gap-6 items-center md:items-start">
              <div className="flex gap-4">
                 {[
                   { icon: Facebook, key: 'social_facebook' },
                   { icon: Twitter, key: 'social_twitter' },
                   { icon: Instagram, key: 'social_instagram' },
                   { icon: Linkedin, key: 'social_linkedin' }
                 ].map((item, i) => (
                   <a 
                     key={i} 
                     href={settings?.[item.key] || '#'} 
                     className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-indigo-600 hover:-translate-y-1 transition-all group"
                   >
                     <item.icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                   </a>
                 ))}
              </div>

              
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Support 24/7/365
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  99.9% Uptime
                </div>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2 space-y-8 text-center md:text-left">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-400">Services</h4>
            <ul className="space-y-5 text-[13px] font-bold text-slate-500">
               <li><Link to="/shared-hosting" className="hover:text-white hover:translate-x-1 inline-block transition-all">Web Hosting</Link></li>
               <li><Link to="/vps-hosting" className="hover:text-white hover:translate-x-1 inline-block transition-all">Cloud VPS</Link></li>
               <li><Link to="/dedicated-servers" className="hover:text-white hover:translate-x-1 inline-block transition-all">Dedicated Hardware</Link></li>
               <li><Link to="/licenses" className="hover:text-white hover:translate-x-1 inline-block transition-all">Software Licenses</Link></li>
               <li><Link to="/contact" className="hover:text-white hover:translate-x-1 inline-block transition-all">SSL Certificates</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-8 text-center md:text-left">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-400">Company</h4>
            <ul className="space-y-5 text-[13px] font-bold text-slate-500">
               <li><Link to="/contact" className="hover:text-white hover:translate-x-1 inline-block transition-all">Contact Us</Link></li>
               <li><Link to="/" className="hover:text-white hover:translate-x-1 inline-block transition-all">Knowledgebase</Link></li>
               <li><Link to="/" className="hover:text-white hover:translate-x-1 inline-block transition-all">Service Status</Link></li>
               <li><Link to="/legal/sla" className="hover:text-white hover:translate-x-1 inline-block transition-all">SLA Guarantee</Link></li>
               <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all">Acceptable Use</a></li>
            </ul>
          </div>

          {/* Location/Infra */}
          <div className="lg:col-span-3 space-y-8 text-center md:text-left">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-400">Global Presence</h4>
            <div className="space-y-6">
               <div className="p-6 bg-gradient-to-br from-white/5 to-transparent rounded-3xl border border-white/5 group hover:border-indigo-500/20 transition-all">
                  <div className="flex items-center gap-4 mb-3 justify-center md:justify-start">
                    <Globe className="w-5 h-5 text-indigo-500 group-hover:animate-spin" />
                    <span className="text-sm font-black text-white uppercase tracking-wider">Mumbai Center 1</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-tighter">
                     <span className="text-slate-500">Node Status</span>
                     <span className="text-emerald-500">Active</span>
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-full mt-3 overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[94%]" />
                  </div>
               </div>

               <div className="flex gap-4">
                  <div className="flex-1 bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col items-center gap-2 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-help" title="PCI-DSS Compliant">
                     <ShieldCheck className="w-6 h-6 text-indigo-400" />
                     <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">PCI-DSS</span>
                  </div>
                  <div className="flex-1 bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col items-center gap-2 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-help" title="Tier 3 Certified">
                     <Zap className="w-6 h-6 text-indigo-400" />
                     <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">TIER III</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-10">
           <div className="flex flex-wrap justify-center gap-8 lg:gap-12 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              <Link to="/legal/sla" className="hover:text-white transition-colors">SLA</Link>
              <Link to="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/legal/terms" className="hover:text-white transition-colors">Terms</Link>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
           </div>
           
           <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] text-center lg:text-right flex flex-col md:flex-row gap-2 md:gap-4 items-center">
              <span>© 2026 {settings?.['company_name'] || 'GROWUPHOST'}. Professional Infrastructure.</span>
              <span className="w-1 h-1 bg-slate-700 rounded-full hidden md:block" />
              <span className="text-slate-500">Registered in India.</span>
           </div>
        </div>
      </div>
    </footer>
  );
}

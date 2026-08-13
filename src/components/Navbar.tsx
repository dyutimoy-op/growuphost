import { Link } from "@tanstack/react-router";
import { Menu, X, Search, Globe, ChevronRight, Bell, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/use-site-settings";

export function Navbar() {
  const { data: settings } = useSiteSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: newsAlert } = useQuery({
    queryKey: ["news-alert"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_alerts")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (error) return null;
      return data;
    },
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <header 
      className={`w-full fixed top-0 z-50 transition-all duration-700 pointer-events-none ${
        isScrolled 
          ? "py-2 sm:py-3" 
          : "py-2 sm:py-4"
      }`}
    >
      {/* Promotion News Ticker */}
      {!isScrolled && newsAlert && (
        <div className="w-full bg-[#3d31d4] pointer-events-auto border-b border-white/10 backdrop-blur-md">
          <div className="max-w-[95rem] mx-auto px-4 h-8 sm:h-10 flex items-center justify-center gap-4 sm:gap-8 overflow-hidden">
             <div className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/20">
               <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                 <Bell className="w-3 h-3 animate-bounce" />
                 {newsAlert.badge_text}
               </span>
             </div>
             
             <div className="flex-1 overflow-hidden relative group">
                <div className="whitespace-nowrap animate-marquee flex items-center gap-8">
                  <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                    {newsAlert.content}
                  </span>
                  {/* Duplicate for infinite loop if needed, or just single line */}
                  <span className="hidden md:inline-block text-xs sm:text-sm font-bold text-white/70 tracking-wide italic">
                    — Experience the power of NVMe Infrastructure
                  </span>
                </div>
             </div>

             <div className="hidden lg:flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold bg-black/20 px-3 py-1 rounded-lg border border-white/5">
                  <span className="text-white/50">ENDS IN:</span>
                  <span className="text-white tabular-nums">{formatTime(currentTime)}</span>
                </div>
                <a 
                  href={newsAlert.link_url || settings?.['offers_url'] || "#"} 
                  className="flex items-center gap-2 bg-[#ffdd00] text-[#3d31d4] px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-[#ffe54d] transition-all shadow-xl hover:scale-105 active:scale-95"
                >
                  {newsAlert.badge_text || "JOIN WAITLIST"} <ArrowRight className="w-3 h-3" />
                </a>
             </div>
          </div>
        </div>
      )}

      <div 
        className={`absolute inset-x-0 top-0 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] pointer-events-auto ${
          isScrolled 
            ? "mx-4 sm:mx-8 mt-2 sm:mt-3 h-14 sm:h-16 rounded-full bg-slate-950/70 backdrop-blur-2xl border border-white/10 shadow-[0_25px_60px_-15px_rgba(79,70,229,0.4),inset_0_1px_1px_0_rgba(255,255,255,0.1)] translate-y-0" 
            : `h-full bg-white translate-y-0 ${newsAlert ? 'mt-[4.5rem]' : 'mt-8'}`
        }`}
      />
      {/* Top Bar - Refined Desktop */}
      <div className={`hidden lg:flex bg-[#4f46e5] py-1.5 px-6 justify-between items-center text-[11px] font-bold text-white mb-0 transition-all duration-500 ${isScrolled ? "opacity-0 -translate-y-4 h-0 overflow-hidden my-0 border-0 pointer-events-none" : "opacity-100"}`}>
        <div className="flex gap-6">
           <span className="flex items-center gap-2">
             <Globe className="w-3 h-3 text-indigo-400" />
             Mumbai Data Center
           </span>
           <span className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             Status: <span className="text-emerald-400 uppercase tracking-tighter">Operational</span>
           </span>
        </div>
        <div className="flex items-center gap-6">
            <a href="mailto:support@growuphost.com" className="hover:text-indigo-200 transition-colors uppercase tracking-[0.15em]">support@growuphost.com</a>
            <div className="w-px h-3 bg-white/20" />
            <a href={settings?.['login_url'] || "/auth"} className="hover:text-indigo-200 transition-colors uppercase tracking-[0.15em]">Login</a>
            <div className="w-px h-3 bg-white/20" />
            <a href={settings?.['register_url'] || "/auth"} className="hover:text-indigo-200 transition-colors uppercase tracking-[0.15em]">Register</a>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-2">
              <Globe className="w-3 h-3" />
              <span className="uppercase tracking-[0.15em]">INR</span>
            </div>
        </div>
      </div>

      <nav className="relative max-w-[95rem] mx-auto px-6 sm:px-12 lg:px-20 flex items-center justify-between pointer-events-auto h-14 sm:h-16 lg:h-20">
        <div className="flex items-center gap-10 lg:gap-16">
          <Link to="/" className="text-xl sm:text-2xl font-black tracking-tighter italic text-slate-900 flex items-center gap-3 sm:gap-4 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center not-italic shadow-2xl shadow-indigo-600/40 transform transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 text-base sm:text-lg text-white">G</div>
            <span className="drop-shadow-sm">{settings?.['company_name'] || 'GROWUPHOST'}</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {categories?.filter((cat: any) => cat.show_in_nav).map((category: any) => (
              <Link 
                key={category.id} 
                to={category.slug.startsWith('/') ? (category.slug as any) : `/${category.slug}`}
                className={`text-xs font-black uppercase tracking-[0.2em] transition-all relative group ${isScrolled ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-indigo-600'}`}
              >
                {category.name}
                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-indigo-500 transition-all group-hover:w-full" />
              </Link>
            ))}
            <Link to="/contact" className={`text-xs font-black uppercase tracking-[0.2em] transition-all ${isScrolled ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-indigo-600'}`}>Contact</Link>
          </div>
        </div>

        <div className={`relative flex items-center gap-4 sm:gap-6 ${isScrolled ? '' : 'pt-2'}`}>
          <div className="hidden lg:flex items-center gap-6">
            <Search className={`w-5 h-5 cursor-pointer transition-colors ${isScrolled ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-indigo-600'}`} />
            <div className="flex items-center gap-3">
              <Button variant="outline" className={`rounded-lg sm:rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-[0.15em] transition-all h-10 sm:h-11 ${isScrolled ? 'border-indigo-500/30 hover:bg-indigo-500/10 text-white hover:border-indigo-500/60' : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`} asChild>
                <a href={settings?.['register_url'] || "/auth"}>Register</a>
              </Button>
              <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700 rounded-lg sm:rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-[0.15em] shadow-2xl shadow-indigo-600/40 transition-all h-10 sm:h-11 hover:scale-105 active:scale-95" asChild>
                <a href={settings?.['login_url'] || "/auth"}>Client Portal</a>
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu Toggle */}
          <button 
            className={`lg:hidden p-2 rounded-lg transition-colors ${isScrolled ? 'text-white hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100'}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay - Premium Full Screen */}
      <div 
        className={`lg:hidden fixed inset-0 top-0 bg-slate-950/98 backdrop-blur-2xl z-40 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        <div className="flex flex-col h-full pt-24 px-8 pb-12 overflow-y-auto">
          <div className="flex-1 space-y-12">
            <div className="space-y-4">
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-6 flex items-center gap-2">
                <div className="w-4 h-[1px] bg-indigo-500" />
                Infrastructure
              </div>
              <div className="grid gap-2">
                {categories?.filter((cat: any) => cat.show_in_nav).map((category: any) => (
                  <Link 
                    key={category.id} 
                    to={category.slug.startsWith('/') ? (category.slug as any) : `/${category.slug}`}
                    className="flex items-center justify-between text-4xl font-black text-white py-4 active:text-indigo-500 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                    <ChevronRight className="w-8 h-8 text-indigo-500/50" />
                  </Link>
                ))}
                <Link 
                  to="/contact" 
                  className="flex items-center justify-between text-4xl font-black text-white py-4 active:text-indigo-500 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Connect
                  <ChevronRight className="w-8 h-8 text-indigo-500/50" />
                </Link>
              </div>
            </div>

            <div className="space-y-6 pt-12 border-t border-white/5">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 py-8 rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all">
                Client Portal
              </Button>
              <div className="grid grid-cols-2 gap-4">
                 <a href={settings?.['login_url'] || "/auth"} className="flex items-center justify-center py-5 bg-white/5 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-300 active:bg-white/10 transition-colors">Login</a>
                 <a href={settings?.['register_url'] || "/auth"} className="flex items-center justify-center py-5 bg-white/5 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-300 active:bg-white/10 transition-colors">Signup</a>
              </div>
            </div>
          </div>
          
          <div className="pt-12 text-center">
            <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
              © 2026 {settings?.['company_name'] || 'GROWUPHOST'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

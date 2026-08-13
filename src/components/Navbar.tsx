import { Link } from "@tanstack/react-router";
import { Menu, X, Search, Globe, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/use-site-settings";

export function Navbar() {
  const { data: settings } = useSiteSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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

  return (
    <header 
      className={`w-full fixed top-0 z-50 transition-all duration-700 pointer-events-none ${
        isScrolled 
          ? "py-4 sm:py-6" 
          : "py-6 sm:py-8"
      }`}
    >
      <div 
        className={`absolute inset-x-0 top-0 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] pointer-events-auto ${
          isScrolled 
            ? "mx-4 sm:mx-8 mt-4 sm:mt-6 h-[4.5rem] sm:h-20 rounded-[2rem] bg-slate-950/70 backdrop-blur-2xl border border-white/10 shadow-[0_25px_60px_-15px_rgba(79,70,229,0.4),inset_0_1px_1px_0_rgba(255,255,255,0.1)] translate-y-0" 
            : "h-full bg-transparent translate-y-0"
        }`}
      />
      {/* Top Bar - Refined Desktop */}
      <div className={`hidden lg:flex bg-white/5 backdrop-blur-sm py-1.5 px-6 justify-between items-center text-[11px] font-bold text-slate-400 mb-3 rounded-full mx-auto max-w-6xl border border-white/5 transition-all duration-500 ${isScrolled ? "opacity-0 -translate-y-4 h-0 overflow-hidden my-0 border-0 pointer-events-none" : "opacity-100"}`}>
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
            <a href="mailto:support@growuphost.com" className="hover:text-indigo-400 transition-colors uppercase tracking-[0.15em]">Support</a>
            <div className="w-px h-3 bg-white/10" />
            <a href={settings?.['login_url'] || "/auth"} className="hover:text-indigo-400 transition-colors uppercase tracking-[0.15em]">Login</a>
            <div className="w-px h-3 bg-white/10" />
            <a href={settings?.['register_url'] || "/auth"} className="hover:text-indigo-400 transition-colors uppercase tracking-[0.15em] text-indigo-400">Register</a>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-2">
              <Globe className="w-3 h-3" />
              <span className="uppercase tracking-[0.15em]">INR</span>
            </div>
        </div>
      </div>

      <nav className="relative max-w-[95rem] mx-auto px-6 sm:px-12 lg:px-20 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-12 lg:gap-20">
          <Link to="/" className="text-2xl sm:text-4xl font-black tracking-tighter italic text-white flex items-center gap-3 sm:gap-4 group">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center not-italic shadow-2xl shadow-indigo-600/40 transform transition-all duration-500 group-hover:rotate-12 group-hover:scale-110">G</div>
            <span className="drop-shadow-2xl">{settings?.['company_name'] || 'GROWUPHOST'}</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-12">
            {categories?.filter((cat: any) => cat.show_in_nav).map((category: any) => (
              <Link 
                key={category.id} 
                to={category.slug.startsWith('/') ? (category.slug as any) : `/${category.slug}`}
                className="text-base font-black uppercase tracking-[0.2em] text-slate-300 hover:text-white transition-all relative group"
              >
                {category.name}
                <span className="absolute -bottom-3 left-0 w-0 h-1 bg-indigo-500 transition-all group-hover:w-full" />
              </Link>
            ))}
            <Link to="/contact" className="text-base font-black uppercase tracking-[0.2em] text-slate-300 hover:text-white transition-all">Contact</Link>
          </div>
        </div>

        <div className="relative flex items-center gap-4 sm:gap-8">
          <div className="hidden lg:flex items-center gap-8">
            <Search className="w-6 h-6 cursor-pointer text-slate-400 hover:text-white transition-colors" />
            <div className="flex items-center gap-4">
              <Button variant="outline" className="border-indigo-500/30 hover:bg-indigo-500/10 text-white rounded-xl sm:rounded-2xl px-8 py-5 sm:px-10 sm:py-6 text-sm sm:text-base font-black uppercase tracking-[0.2em] transition-all hover:border-indigo-500/60" asChild>
                <a href={settings?.['register_url'] || "/auth"}>Register</a>
              </Button>
              <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700 rounded-xl sm:rounded-2xl px-8 py-5 sm:px-10 sm:py-6 text-sm sm:text-base font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/40 transition-all hover:scale-105 active:scale-95" asChild>
                <a href={settings?.['login_url'] || "/auth"}>Client Portal</a>
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-white hover:bg-white/5 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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

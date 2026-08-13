import { Link } from "@tanstack/react-router";
import { Menu, X, Globe, ChevronRight, Bell, ArrowRight, Phone, Mail } from "lucide-react";
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

  return (
    <header className="w-full fixed top-0 z-50 transition-all duration-500">
      {/* Promotion Bar (Ticker) */}
      {!isScrolled && newsAlert && (
        <div className="w-full bg-indigo-600/95 backdrop-blur-md border-b border-white/10 overflow-hidden h-10 sm:h-12 flex items-center">
          <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
               <div className="flex items-center gap-2 bg-yellow-400 text-indigo-950 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse whitespace-nowrap">
                 <Bell className="w-3 h-3" />
                 {newsAlert.badge_text || "OFFER"}
               </div>
               <div className="text-white text-xs sm:text-sm font-bold tracking-wide truncate">
                 {newsAlert.content}
               </div>
            </div>
            {newsAlert.link_url && (
              <a 
                href={newsAlert.link_url}
                className="flex items-center gap-2 text-yellow-400 hover:text-white transition-colors text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap"
              >
                Join Waitlist <ArrowRight className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Info Bar (Top Bar) */}
      {!isScrolled && (
        <div className="w-full bg-indigo-700 text-white py-2 px-6 border-b border-white/5">
          <div className="max-w-7xl mx-auto flex justify-between items-center text-[11px] font-bold uppercase tracking-widest">
            <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-1">
              <a href="tel:+917252890016" className="flex items-center gap-2 hover:text-indigo-200 transition-colors shrink-0">
                <Phone className="w-3 h-3" /> <span className="hidden sm:inline">+91 72 52 89 0016</span>
              </a>
              <div className="w-px h-3 bg-white/20 shrink-0" />
              <a href="mailto:support@growuphost.com" className="flex items-center gap-2 hover:text-indigo-200 transition-colors shrink-0">
                <Mail className="w-3 h-3" /> <span className="hidden sm:inline">support@growuphost.com</span>
              </a>
            </div>
            <div className="flex items-center gap-6">
              <a href={settings?.['login_url'] || "/auth"} className="hover:text-indigo-200 transition-colors">Login</a>
              <div className="w-px h-3 bg-white/20" />
              <a href={settings?.['register_url'] || "/auth"} className="hover:text-indigo-200 transition-colors">Register</a>
              <div className="w-px h-3 bg-white/20" />
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3" /> INR
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <div className={`w-full transition-all duration-500 ${isScrolled ? "py-2 sm:py-3 px-4 sm:px-8" : "py-0"}`}>
        <div 
          className={`absolute inset-x-0 top-0 transition-all duration-500 ease-out ${
            isScrolled 
              ? "h-full rounded-full bg-slate-950/90 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]" 
              : "h-full bg-slate-950 border-b border-white/5"
          }`}
        />

        <nav className="relative max-w-7xl mx-auto px-6 flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center gap-12">
            <Link to="/" className="text-xl sm:text-2xl font-black tracking-tighter italic text-white flex items-center gap-3 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 rounded-lg flex items-center justify-center not-italic shadow-lg shadow-indigo-600/20 text-white">G</div>
              <span className="hidden xs:block">{settings?.['company_name'] || 'GROWUPHOST'}</span>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              {categories?.filter((cat: any) => cat.show_in_nav).map((category: any) => (
                <Link 
                  key={category.id} 
                  to={category.slug.startsWith('/') ? (category.slug as any) : `/${category.slug}`}
                  className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300 hover:text-white transition-colors"
                >
                  {category.name}
                </Link>
              ))}
              <Link to="/contact" className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300 hover:text-white transition-colors">Contact</Link>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden lg:flex items-center gap-4">
              <Button variant="ghost" className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300 hover:text-white hover:bg-white/5 px-6" asChild>
                <a href={settings?.['login_url'] || "/auth"}>Login</a>
              </Button>
              <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700 text-[11px] font-bold uppercase tracking-[0.2em] px-8 rounded-lg shadow-lg shadow-indigo-600/20 transition-all hover:scale-105" asChild>
                <a href={settings?.['register_url'] || "/auth"}>Register</a>
              </Button>
            </div>
            
            <button 
              className="lg:hidden p-2 text-white hover:bg-white/5 rounded-lg"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
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
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 py-8 rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all" asChild>
                 <a href={settings?.['login_url'] || "/auth"}>Client Portal</a>
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


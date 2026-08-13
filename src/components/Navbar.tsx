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
      className={`w-full fixed top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-slate-950/80 backdrop-blur-xl border-b border-white/10 py-2" : "bg-transparent py-4"
      }`}
    >
      {/* Top Bar - Hidden on Mobile */}
      <div className={`hidden lg:flex bg-slate-900/50 py-2 px-8 justify-between items-center text-xs text-slate-400 mb-2 rounded-full mx-8 border border-white/5 transition-opacity duration-300 ${isScrolled ? "opacity-0 h-0 overflow-hidden py-0 my-0 border-0" : "opacity-100"}`}>
        <div className="flex gap-4">
           <span>Support: support@growuphost.com</span>
           <span className="flex items-center gap-1.5">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             Live Status: Operational
           </span>
        </div>
        <div className="flex items-center gap-6">
            <a href={settings?.['login_url'] || "/auth"} className="hover:text-indigo-400 transition-colors">Login</a>
            <a href={settings?.['register_url'] || "/auth"} className="hover:text-indigo-400 transition-colors">Register</a>
            <Globe className="w-3 h-3" />
            <span>INR</span>
        </div>
      </div>

      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link to="/" className="text-2xl font-black tracking-tighter italic text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center not-italic">G</div>
            {settings?.['company_name'] || 'GROWUPHOST'}
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {categories?.filter((cat: any) => cat.show_in_nav).map((category: any) => (
              <Link 
                key={category.id} 
                to={category.slug.startsWith('/') ? (category.slug as any) : `/${category.slug}`}
                className="text-sm font-bold text-slate-300 hover:text-white transition-colors relative group"
              >
                {category.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all group-hover:w-full" />
              </Link>
            ))}
            <Link to="/contact" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">Contact</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4">
            <Search className="w-5 h-5 cursor-pointer text-slate-400 hover:text-white transition-colors" />
            <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-6 font-bold shadow-lg shadow-indigo-600/20">
              Portal
            </Button>
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

      {/* Mobile Menu Overlay */}
      <div 
        className={`lg:hidden fixed inset-0 top-[72px] bg-slate-950 z-40 transition-transform duration-500 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-8 space-y-8 h-full overflow-y-auto">
          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Services</div>
            {categories?.filter((cat: any) => cat.show_in_nav).map((category: any) => (
              <Link 
                key={category.id} 
                to={category.slug.startsWith('/') ? (category.slug as any) : `/${category.slug}`}
                className="flex items-center justify-between text-2xl font-black text-white py-4 border-b border-white/5"
                onClick={() => setIsMenuOpen(false)}
              >
                {category.name}
                <ChevronRight className="w-6 h-6 text-indigo-500" />
              </Link>
            ))}
            <Link 
              to="/contact" 
              className="flex items-center justify-between text-2xl font-black text-white py-4 border-b border-white/5"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
              <ChevronRight className="w-6 h-6 text-indigo-500" />
            </Link>
          </div>

          <div className="pt-8 space-y-4">
            <Button className="w-full bg-indigo-600 py-8 rounded-2xl text-lg font-black uppercase tracking-widest">
              Client Portal
            </Button>
            <div className="grid grid-cols-2 gap-4">
               <a href={settings?.['login_url'] || "/auth"} className="text-center py-4 bg-white/5 rounded-xl text-sm font-bold text-slate-300">Login</a>
               <a href={settings?.['register_url'] || "/auth"} className="text-center py-4 bg-white/5 rounded-xl text-sm font-bold text-slate-300">Register</a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

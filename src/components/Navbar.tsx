import { Link } from "@tanstack/react-router";
import { ChevronDown, Menu, User, Bell, ShieldCheck, Globe, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/use-site-settings";


export function Navbar() {
  const { data: settings } = useSiteSettings();
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      return data;
    },
  });


  return (
    <header className="w-full border-b border-white/10 bg-slate-950 text-white sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-slate-900/50 py-2 px-8 flex justify-between items-center text-xs text-slate-400">
        <div className="flex gap-4">
           <span>Support: support@growuphost.com</span>
           <span>Live Status: Operational</span>
        </div>
        <div className="flex items-center gap-6">
            <a href={settings?.['login_url'] || "/auth"} className="hover:text-indigo-400 transition-colors">Login</a>
            <a href={settings?.['register_url'] || "/auth"} className="hover:text-indigo-400 transition-colors">Register</a>
            <Globe className="w-3 h-3" />
            <span>INR</span>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link to="/" className="text-2xl font-black tracking-tighter italic text-white">
            {settings?.['company_name'] || 'GROWUPHOST'}
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {categories?.filter((cat: any) => cat.show_in_nav).map((category: any) => (
              <Link 

                key={category.id} 
                to={category.slug.startsWith('/') ? (category.slug as any) : `/${category.slug}`}
                className="text-sm font-medium hover:text-indigo-400 transition-colors"
              >
                {category.name}
              </Link>
            ))}
            <Link to="/contact" className="text-sm font-medium hover:text-indigo-400 transition-colors">Contact</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Search className="w-5 h-5 cursor-pointer hover:text-indigo-400" />
          <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-6">
            Client Area
          </Button>
        </div>
      </nav>
    </header>
  );
}
import { Link, useLocation } from '@tanstack/react-router';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Megaphone, 
  Star, 
  Settings, 
  LogOut,
  Globe,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';

const navItems = [
  { name: 'Overview', icon: LayoutDashboard, href: '/dashboard', value: 'overview' },
  { name: 'Products', icon: Package, href: '/dashboard', value: 'products' },
  { name: 'Categories', icon: Layers, href: '/dashboard', value: 'categories' },
  { name: 'Marketing', icon: Megaphone, href: '/dashboard', value: 'marketing' },
  { name: 'News & Alerts', icon: Bell, href: '/dashboard', value: 'news' },
  { name: 'Testimonials', icon: Star, href: '/dashboard', value: 'testimonials' },
  { name: 'Global Settings', icon: Settings, href: '/dashboard', value: 'settings' },
  { name: 'Media Library', icon: ImageIcon, href: '/dashboard', value: 'media' },
  { name: 'SEO & Performance', icon: Globe, href: '/dashboard', value: 'seo' },
];

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Signed out successfully');
      navigate({ to: '/auth' });
    }
  };

  return (
    <div className="w-64 bg-slate-900 border-r border-white/5 h-screen sticky top-0 flex flex-col">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
            G
          </div>
          <span className="text-xl font-black text-white tracking-tighter italic">GROWUPHOST</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 mb-4">
          Management
        </div>
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => onTabChange(item.value)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200",
              activeTab === item.value 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon className={cn("w-5 h-5", activeTab === item.value ? "text-white" : "text-slate-500")} />
            {item.name}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-2">
        <Link 
          to="/"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <Globe className="w-5 h-5 text-slate-500" />
          View Site
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}

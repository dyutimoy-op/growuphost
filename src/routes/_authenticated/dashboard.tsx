import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Layers, Users, TrendingUp, Settings, Save, Globe, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';


export const Route = createFileRoute('/_authenticated/dashboard')({
  component: AdminDashboard,
});

function AdminDashboard() {
  const queryClient = useQueryClient();
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [products, categories] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
      ]);
      return {
        products: products.count || 0,
        categories: categories.count || 0,
        activeUsers: 1,
        revenue: '₹45,900',
      };
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      return data;
    }
  });

  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_settings').select('*');
      if (error) throw error;
      const s: Record<string, string> = {};
      data.forEach(item => s[item.key] = item.value || '');
      return s;
    }
  });

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: async (newSettings: Record<string, string>) => {
      const updates = Object.entries(newSettings).map(([key, value]) => 
        supabase.from('site_settings').update({ value }).eq('key', key)
      );
      const results = await Promise.all(updates);
      const firstError = results.find(r => r.error);
      if (firstError) throw firstError.error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Settings updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update settings: ' + error.message);
    }
  });

  const cards = [
    { title: 'Total Products', value: stats?.products, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Categories', value: stats?.categories, icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Active Users', value: stats?.activeUsers, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Monthly Revenue', value: stats?.revenue, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl pb-20">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">GROWUPHOST Control Center</h1>
        <p className="text-slate-500 mt-2 font-medium">Enterprise infrastructure management interface.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Card key={card.title} className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-xl ${card.bg}`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-900 tracking-tight">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl p-8 bg-white">
          <CardHeader className="px-0 pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <Settings className="w-6 h-6 text-primary" />
                </div>
                <div>
                   <CardTitle className="text-xl font-black tracking-tight">Infrastructure Config</CardTitle>
                  <p className="text-sm text-slate-500">Global branding and service endpoint mapping.</p>
                </div>
              </div>
              <Button 
                onClick={() => updateSettings.mutate(localSettings)}
                disabled={updateSettings.isPending}
                className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 py-6 font-bold flex gap-2"
              >
                <Save className="w-4 h-4" />
                {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0 pt-8 space-y-8">
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Company Branding</label>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Company Name</label>
                <Input 
                  value={localSettings['company_name'] || ''} 
                  onChange={(e) => setLocalSettings({...localSettings, company_name: e.target.value})}
                  className="rounded-xl border-slate-200 focus:border-primary/50 py-6"
                  placeholder="e.g. GROWUPHOST"
                />
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">External Links & Navigation</label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Login URL</label>
                  <Input 
                    value={localSettings['login_url'] || ''} 
                    onChange={(e) => setLocalSettings({...localSettings, login_url: e.target.value})}
                    className="rounded-xl border-slate-200 py-6"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Register URL</label>
                  <Input 
                    value={localSettings['register_url'] || ''} 
                    onChange={(e) => setLocalSettings({...localSettings, register_url: e.target.value})}
                    className="rounded-xl border-slate-200 py-6"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Offers Page URL</label>
                  <Input 
                    value={localSettings['offers_url'] || ''} 
                    onChange={(e) => setLocalSettings({...localSettings, offers_url: e.target.value})}
                    className="rounded-xl border-slate-200 py-6"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Hero CTA Link</label>
                  <Input 
                    value={localSettings['hero_cta_url'] || ''} 
                    onChange={(e) => setLocalSettings({...localSettings, hero_cta_url: e.target.value})}
                    className="rounded-xl border-slate-200 py-6"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl p-8 bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
          <CardHeader className="px-0 pt-0">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-bold">Quick Links</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-0 space-y-4 pt-6">
            <a href="/" target="_blank" className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors border border-white/10 group">
              <span className="font-medium text-sm">View Website</span>
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary transition-colors">
                <Globe className="w-4 h-4" />
              </div>
            </a>
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <div className="text-emerald-500 text-xs font-bold uppercase tracking-widest">System Status</div>
              <div className="mt-1 text-sm font-medium">All functions operational</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm rounded-3xl p-8 bg-white">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-2xl">
              <Layers className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-black tracking-tight">Navigation Categories</CardTitle>
              <p className="text-sm text-slate-500">Toggle which categories appear in your main navigation bar.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(categoriesData as any)?.map((category: any) => (
              <div 

                key={category.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900">{category.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{category.slug}</span>
                </div>
                <Button
                  size="sm"
                  variant={category.show_in_nav ? "default" : "outline"}
                  className={`rounded-xl px-4 ${category.show_in_nav ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}`}
                  onClick={async () => {
                    const { error } = await (supabase
                      .from('categories')
                      .update({ show_in_nav: !category.show_in_nav } as any) as any)
                      .eq('id', category.id);

                    
                    if (error) {
                      toast.error("Failed to update: " + error.message);
                    } else {
                      queryClient.invalidateQueries({ queryKey: ['categories'] });
                      toast.success(`${category.name} ${!category.show_in_nav ? 'added to' : 'removed from'} navigation`);
                    }
                  }}
                >
                  {category.show_in_nav ? <Check className="w-4 h-4 mr-1" /> : <X className="w-4 h-4 mr-1" />}
                  {category.show_in_nav ? 'Visible' : 'Hidden'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

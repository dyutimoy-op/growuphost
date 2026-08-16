import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, Layers, Users, TrendingUp, Settings, Save, Globe, 
  Check, X, Bell, Trash2, Plus, Star, Megaphone, Layout,
  Smartphone, Mail, MessageSquare, Info, ExternalLink
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { MediaUpload } from '@/components/admin/MediaUpload';

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: AdminDashboard,
});

function AdminDashboard() {
  const queryClient = useQueryClient();
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});

  // Data Fetching
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [products, categories, testimonials, popups] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('testimonials').select('*', { count: 'exact', head: true }),
        supabase.from('promo_popups').select('*', { count: 'exact', head: true }),
      ]);
      return {
        products: products.count || 0,
        categories: categories.count || 0,
        testimonials: testimonials.count || 0,
        popups: popups.count || 0,
      };
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories-full'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      return data;
    }
  });

  const { data: productsData } = useQuery({
    queryKey: ['products-full'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*, categories(name)').order('name');
      if (error) throw error;
      return data;
    }
  });

  const { data: newsAlerts } = useQuery({
    queryKey: ['news-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('news_alerts').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: testimonials } = useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: popups } = useQuery({
    queryKey: ['promo-popups'],
    queryFn: async () => {
      const { data, error } = await supabase.from('promo_popups').select('*').order('created_at', { ascending: false });
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

  // Mutations
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
    onError: (error: any) => {
      toast.error('Failed to update settings: ' + error.message);
    }
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-full'] });
      toast.success('Product deleted');
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl pb-20 text-white">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Admin <span className="text-indigo-500">Control</span></h1>
          <p className="text-slate-400 mt-2 font-medium">Enterprise marketplace & infrastructure management.</p>
        </div>
        <div className="flex gap-2">
           <Button asChild variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 text-white">
             <Link to="/">View Website <ExternalLink className="ml-2 w-4 h-4" /></Link>
           </Button>
        </div>
      </header>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="bg-slate-900 border border-white/5 p-1 rounded-2xl h-auto flex flex-wrap justify-start gap-1">
          <TabsTrigger value="overview" className="rounded-xl px-6 py-3 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="products" className="rounded-xl px-6 py-3 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Products</TabsTrigger>
          <TabsTrigger value="categories" className="rounded-xl px-6 py-3 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Categories</TabsTrigger>
          <TabsTrigger value="marketing" className="rounded-xl px-6 py-3 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Marketing</TabsTrigger>
          <TabsTrigger value="testimonials" className="rounded-xl px-6 py-3 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Testimonials</TabsTrigger>
          <TabsTrigger value="settings" className="rounded-xl px-6 py-3 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Global Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Products', value: stats?.products, icon: Package, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
              { title: 'Categories', value: stats?.categories, icon: Layers, color: 'text-purple-400', bg: 'bg-purple-500/10' },
              { title: 'Popups', value: stats?.popups, icon: Megaphone, color: 'text-orange-400', bg: 'bg-orange-500/10' },
              { title: 'Reviews', value: stats?.testimonials, icon: Star, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            ].map((card) => (
              <Card key={card.title} className="border-white/5 shadow-2xl rounded-3xl overflow-hidden bg-slate-900/50 backdrop-blur-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-xl ${card.bg}`}>
                    <card.icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-white tracking-tight">{card.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <Card className="border-white/5 shadow-2xl rounded-3xl p-8 bg-slate-900/50 backdrop-blur-md">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl font-black text-white">System Status</CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0 space-y-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-sm font-bold text-emerald-400">Database Engine</span>
                    </div>
                    <span className="text-[10px] font-black uppercase text-emerald-500/50">Operational</span>
                  </div>
                  <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-indigo-500" />
                       <span className="text-sm font-bold text-indigo-400">Auth Gateway</span>
                    </div>
                    <span className="text-[10px] font-black uppercase text-indigo-500/50">Operational</span>
                  </div>
                </CardContent>
             </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center">
             <h2 className="text-2xl font-black">Manage Products</h2>
             <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-6">
               <Plus className="w-4 h-4 mr-2" /> Add Product
             </Button>
          </div>
          <div className="grid gap-4">
            {productsData?.map((product: any) => (
              <Card key={product.id} className="border-white/5 bg-slate-900/50 rounded-2xl hover:border-white/10 transition-all">
                <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                        <Package className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-black text-white">{product.name}</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{product.categories?.name} • ₹{product.price}/{product.billing_cycle}</p>
                      </div>
                   </div>
                   <div className="flex gap-2 w-full md:w-auto">
                      <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 flex-1 md:flex-none">Edit</Button>
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="rounded-xl flex-shrink-0"
                        onClick={() => {
                          if (confirm('Delete this product?')) deleteProduct.mutate(product.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                   </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="flex justify-between items-center">
             <h2 className="text-2xl font-black">Manage Categories</h2>
             <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-6">
               <Plus className="w-4 h-4 mr-2" /> New Category
             </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoriesData?.map((category: any) => (
              <Card key={category.id} className="border-white/5 bg-slate-900/50 rounded-3xl p-6 space-y-4">
                <div className="flex justify-between items-start">
                   <div>
                      <h3 className="text-lg font-black text-white">{category.name}</h3>
                      <p className="text-xs text-slate-500 font-mono">/{category.slug}</p>
                   </div>
                   <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={category.show_in_nav ? "default" : "outline"}
                        className={`rounded-xl ${category.show_in_nav ? 'bg-indigo-600 hover:bg-indigo-700' : 'border-white/10 text-slate-400'}`}
                        onClick={async () => {
                          await supabase.from('categories').update({ show_in_nav: !category.show_in_nav }).eq('id', category.id);
                          queryClient.invalidateQueries({ queryKey: ['categories-full'] });
                        }}
                      >
                        {category.show_in_nav ? <Check className="w-4 h-4 mr-1" /> : <X className="w-4 h-4 mr-1" />}
                        Nav
                      </Button>
                      <Button variant="outline" size="icon" className="rounded-xl border-white/10"><Settings className="w-4 h-4" /></Button>
                   </div>
                </div>
                <div className="space-y-2">
                   <MediaUpload 
                      label="Banner Media (Image/GIF/Video)"
                      currentUrl={category.background_media_url}
                      path="categories"
                      onUploadComplete={async (url) => {
                        await supabase.from('categories').update({ background_media_url: url }).eq('id', category.id);
                        toast.success('Banner updated');
                        queryClient.invalidateQueries({ queryKey: ['categories-full'] });
                      }}
                   />
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="marketing" className="space-y-8">
           <section className="space-y-6">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Megaphone className="w-6 h-6 text-orange-400" />
                  <h2 className="text-2xl font-black">Promo Popups</h2>
                </div>
                <Button 
                  onClick={async () => {
                    await supabase.from('promo_popups').insert({
                      title: 'New Offer!',
                      description: 'Get 20% off on all plans today.',
                      is_active: false
                    });
                    queryClient.invalidateQueries({ queryKey: ['promo-popups'] });
                  }}
                  className="bg-orange-600 hover:bg-orange-700 rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" /> Create Popup
                </Button>
             </div>
             <div className="grid gap-4">
                {popups?.map((popup: any) => (
                  <Card key={popup.id} className="border-white/5 bg-slate-900/50 p-6 rounded-3xl">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                           <Input 
                              defaultValue={popup.title} 
                              onBlur={async (e) => {
                                await supabase.from('promo_popups').update({ title: e.target.value }).eq('id', popup.id);
                              }}
                              className="bg-slate-950 border-white/10 font-bold"
                              placeholder="Title"
                           />
                           <Textarea 
                              defaultValue={popup.description}
                              onBlur={async (e) => {
                                await supabase.from('promo_popups').update({ description: e.target.value }).eq('id', popup.id);
                              }}
                              className="bg-slate-950 border-white/10 h-20"
                              placeholder="Description"
                           />
                        </div>
                        <div className="space-y-4">
                           <MediaUpload 
                              label="Promo Image"
                              currentUrl={popup.image_url}
                              path="popups"
                              onUploadComplete={async (url) => {
                                await supabase.from('promo_popups').update({ image_url: url }).eq('id', popup.id);
                                toast.success('Popup image updated');
                                queryClient.invalidateQueries({ queryKey: ['promo-popups'] });
                              }}
                           />
                           <div className="flex gap-2">
                              <Input 
                                defaultValue={popup.coupon_code}
                                onBlur={async (e) => {
                                  await supabase.from('promo_popups').update({ coupon_code: e.target.value }).eq('id', popup.id);
                                }}
                                className="bg-slate-950 border-white/10"
                                placeholder="Coupon (e.g. SAVE20)"
                              />
                              <Button 
                                variant={popup.is_active ? "default" : "outline"}
                                className={popup.is_active ? "bg-emerald-600 hover:bg-emerald-700" : "border-white/10 text-slate-400"}
                                onClick={async () => {
                                  await supabase.from('promo_popups').update({ is_active: !popup.is_active }).eq('id', popup.id);
                                  queryClient.invalidateQueries({ queryKey: ['promo-popups'] });
                                }}
                              >
                                {popup.is_active ? 'Enabled' : 'Disabled'}
                              </Button>
                           </div>
                           <Input 
                              defaultValue={popup.image_url}
                              onBlur={async (e) => {
                                await supabase.from('promo_popups').update({ image_url: e.target.value }).eq('id', popup.id);
                              }}
                              className="bg-slate-950 border-white/10"
                              placeholder="Image URL"
                           />
                        </div>
                     </div>
                  </Card>
                ))}
             </div>
           </section>
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-6">
           <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black">Customer Reviews</h2>
              <Button 
                onClick={async () => {
                  await supabase.from('testimonials').insert({
                    name: 'John Doe',
                    role: 'CEO, TechFlow',
                    content: 'Incredible service and support.',
                    rating: 5
                  });
                  queryClient.invalidateQueries({ queryKey: ['testimonials'] });
                }}
                className="bg-emerald-600 hover:bg-emerald-700 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Review
              </Button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testimonials?.map((t: any) => (
                <Card key={t.id} className="border-white/5 bg-slate-900/50 p-6 rounded-3xl space-y-4">
                   <div className="flex justify-between items-start">
                      <Input 
                        defaultValue={t.name}
                        onBlur={async (e) => {
                          await supabase.from('testimonials').update({ name: e.target.value }).eq('id', t.id);
                        }}
                        className="bg-transparent border-none font-black text-white p-0 h-auto w-auto"
                      />
                      <div className="flex text-yellow-500">
                        {Array(5).fill(0).map((_, i) => <Star key={i} className={`w-3 h-3 ${i < t.rating ? 'fill-current' : ''}`} />)}
                      </div>
                   </div>
                   <Textarea 
                      defaultValue={t.content}
                      onBlur={async (e) => {
                        await supabase.from('testimonials').update({ content: e.target.value }).eq('id', t.id);
                      }}
                      className="bg-slate-950 border-white/10 italic text-sm"
                   />
                </Card>
              ))}
           </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
           <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <Settings className="w-6 h-6 text-indigo-400" />
                 <h2 className="text-2xl font-black">Global Configuration</h2>
              </div>
              <Button 
                onClick={() => updateSettings.mutate(localSettings)}
                disabled={updateSettings.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8"
              >
                <Save className="w-4 h-4 mr-2" /> Save All Settings
              </Button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-white/5 bg-slate-900/50 p-8 rounded-[2rem] space-y-8">
                 <div className="space-y-6">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Layout className="w-4 h-4" /> Brand & Layout
                    </h3>
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-400">Company Name</label>
                          <Input 
                            value={localSettings['company_name'] || ''}
                            onChange={(e) => setLocalSettings({...localSettings, company_name: e.target.value})}
                            className="bg-slate-950 border-white/10 rounded-xl py-6"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-400">Hero Headline</label>
                          <Input 
                            value={localSettings['banner_headline'] || ''}
                            onChange={(e) => setLocalSettings({...localSettings, banner_headline: e.target.value})}
                            className="bg-slate-950 border-white/10 rounded-xl py-6"
                          />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Info className="w-4 h-4" /> Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-400 flex items-center gap-2"><Smartphone className="w-3 h-3" /> Phone</label>
                          <Input 
                            value={localSettings['contact_phone'] || ''}
                            onChange={(e) => setLocalSettings({...localSettings, contact_phone: e.target.value})}
                            className="bg-slate-950 border-white/10 rounded-xl"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-400 flex items-center gap-2"><Mail className="w-3 h-3" /> Email</label>
                          <Input 
                            value={localSettings['contact_email'] || ''}
                            onChange={(e) => setLocalSettings({...localSettings, contact_email: e.target.value})}
                            className="bg-slate-950 border-white/10 rounded-xl"
                          />
                       </div>
                    </div>
                 </div>
              </Card>

              <Card className="border-white/5 bg-slate-900/50 p-8 rounded-[2rem] space-y-8">
                 <div className="space-y-6">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                       <MessageSquare className="w-4 h-4" /> Social Presence
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                         <div key={social} className="space-y-2">
                            <label className="text-sm font-bold text-slate-400 capitalize">{social}</label>
                            <Input 
                              value={localSettings[`social_${social}`] || ''}
                              onChange={(e) => setLocalSettings({...localSettings, [`social_${social}`]: e.target.value})}
                              className="bg-slate-950 border-white/10 rounded-xl"
                              placeholder="https://..."
                            />
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-6">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Globe className="w-4 h-4" /> Navigation Links
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {['login_url', 'register_url', 'offers_url', 'hero_cta_url'].map((link) => (
                         <div key={link} className="space-y-2">
                            <label className="text-sm font-bold text-slate-400 capitalize">{link.replace('_', ' ')}</label>
                            <Input 
                              value={localSettings[link] || ''}
                              onChange={(e) => setLocalSettings({...localSettings, [link]: e.target.value})}
                              className="bg-slate-950 border-white/10 rounded-xl"
                            />
                         </div>
                       ))}
                    </div>
                 </div>
              </Card>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

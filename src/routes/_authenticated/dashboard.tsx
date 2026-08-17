import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ProductModal } from '@/components/admin/ProductModal';
import { CategoryModal } from '@/components/admin/CategoryModal';
import { MarketingModal } from '@/components/admin/MarketingModal';
import { AlertModal } from '@/components/admin/AlertModal';
import { TestimonialModal } from '@/components/admin/TestimonialModal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Package, Plus, Trash2, Settings, Megaphone, Star, Layers, Save, Globe, Zap, BarChart3, AlertCircle, CheckCircle2, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { runSEOAudit, type SEOAuditResult } from '@/utils/seo-audit';
import { MediaGallery } from '@/components/admin/MediaGallery';
import { Image as ImageIcon } from 'lucide-react';

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isMarketingModalOpen, setIsMarketingModalOpen] = useState(false);
  const [selectedPopup, setSelectedPopup] = useState<any>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<any>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const queryClient = useQueryClient();

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
      const { data, error } = await supabase.from('products').select('*, categories(name)').order('display_order');
      if (error) throw error;
      return data;
    }
  });

  const { data: popupsData } = useQuery({
    queryKey: ['promo-popups'],
    queryFn: async () => {
      const { data, error } = await supabase.from('promo_popups').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: alertsData } = useQuery({
    queryKey: ['news-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('news_alerts').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: testimonialsData } = useQuery({
    queryKey: ['testimonials-full'],
    queryFn: async () => {
      const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const deletePopup = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('promo_popups').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-popups'] });
      toast.success('Popup deleted');
    }
  });

  const deleteAlert = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('news_alerts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['news-alert'] });
      toast.success('Alert deleted');
    }
  });

  const deleteTestimonial = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials-full'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials-public'] });
      toast.success('Testimonial deleted');
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

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories-full'] });
      toast.success('Category deleted');
    }
  });
  return (
    <div className="flex bg-slate-950 min-h-screen">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
             {[
               { title: 'Products', value: stats?.products, icon: Package, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
               { title: 'Categories', value: stats?.categories, icon: Layers, color: 'text-purple-400', bg: 'bg-purple-500/10' },
               { title: 'Popups', value: stats?.popups, icon: Megaphone, color: 'text-orange-400', bg: 'bg-orange-500/10' },
               { title: 'Reviews', value: stats?.testimonials, icon: Star, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
               { title: 'Storage', value: 'Library', icon: ImageIcon, color: 'text-sky-400', bg: 'bg-sky-500/10', action: () => setActiveTab('media') },
             ].map((card) => (
               <Card 
                 key={card.title} 
                 className={cn(
                   "border-white/5 bg-slate-900/50 rounded-3xl p-6 transition-all",
                   card.action && "cursor-pointer hover:bg-slate-800/50 hover:border-white/10"
                 )}
                 onClick={card.action}
               >
                 <div className="flex justify-between items-start">
                   <div className={`p-3 rounded-2xl ${card.bg}`}>
                     <card.icon className={`w-6 h-6 ${card.color}`} />
                   </div>
                   <div className="text-3xl font-black text-white">{card.value}</div>
                 </div>
                 <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-4">{card.title}</div>
               </Card>
             ))}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
               <h2 className="text-3xl font-black text-white">Manage Products</h2>
               <Button onClick={() => { setSelectedProduct(null); setIsProductModalOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-6 font-bold">
                 <Plus className="w-4 h-4 mr-2" /> Add Product
               </Button>
            </div>
            <div className="grid gap-4">
              {productsData?.map((product: any) => (
                <Card key={product.id} className="border-white/5 bg-slate-900/50 p-6 rounded-2xl flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      <Package className="w-10 h-10 text-slate-600" />
                      <div>
                        <h3 className="font-black text-white">{product.name}</h3>
                        <p className="text-xs text-slate-500 font-bold">{product.categories?.name} • ₹{product.price}</p>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <Button variant="outline" onClick={() => { setSelectedProduct(product); setIsProductModalOpen(true); }} className="rounded-xl border-white/10">Edit</Button>
                      <Button variant="destructive" onClick={() => { if(confirm('Delete?')) deleteProduct.mutate(product.id); }} className="rounded-xl"><Trash2 className="w-4 h-4" /></Button>
                   </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
               <h2 className="text-3xl font-black text-white">Manage Categories</h2>
               <Button onClick={() => { setSelectedCategory(null); setIsCategoryModalOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-6 font-bold">
                 <Plus className="w-4 h-4 mr-2" /> New Category
               </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoriesData?.map((cat: any) => (
                <Card key={cat.id} className="border-white/5 bg-slate-900/50 p-6 rounded-3xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-black text-white">{cat.name}</h3>
                      <p className="text-xs text-slate-500">{cat.parent_id ? 'Subcategory' : 'Root'}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => { setSelectedCategory(cat); setIsCategoryModalOpen(true); }} className="rounded-xl"><Settings className="w-4 h-4" /></Button>
                      <Button variant="destructive" size="icon" onClick={() => { if(confirm('Delete?')) deleteCategory.mutate(cat.id); }} className="rounded-xl"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'news' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-white">News & Alerts</h2>
              <Button 
                onClick={() => { setSelectedAlert(null); setIsAlertModalOpen(true); }}
                className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-6 font-bold"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Alert
              </Button>
            </div>
            
            <div className="grid gap-4">
              {alertsData?.map((alert: any) => (
                <Card key={alert.id} className="border-white/5 bg-slate-900/50 p-6 rounded-3xl flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${alert.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-md uppercase tracking-widest">
                          {alert.badge_text || 'INFO'}
                        </span>
                        <h3 className="font-black text-white">{alert.content}</h3>
                      </div>
                      {alert.link_url && <p className="text-[10px] text-slate-500 font-bold truncate max-w-xs mt-1">{alert.link_url}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => { setSelectedAlert(alert); setIsAlertModalOpen(true); }} className="rounded-xl"><Settings className="w-4 h-4" /></Button>
                    <Button variant="destructive" size="icon" onClick={() => { if(confirm('Delete?')) deleteAlert.mutate(alert.id); }} className="rounded-xl"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </Card>
              ))}
              {alertsData?.length === 0 && <p className="text-slate-500 font-bold text-sm italic">No alerts found.</p>}
            </div>
          </div>
        )}

        {activeTab === 'marketing' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
               <h2 className="text-3xl font-black text-white">Marketing Popups</h2>
               <Button 
                 onClick={() => { setSelectedPopup(null); setIsMarketingModalOpen(true); }}
                 className="bg-orange-600 hover:bg-orange-700 rounded-xl px-6 font-bold"
               >
                 <Plus className="w-4 h-4 mr-2" /> Create Popup
               </Button>
            </div>
            <div className="grid gap-4">
               {popupsData?.map((popup: any) => (
                 <Card key={popup.id} className="border-white/5 bg-slate-900/50 p-6 rounded-3xl flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      {popup.image_url && <img src={popup.image_url} alt="" className="w-12 h-12 rounded-xl object-cover border border-white/5" />}
                      <div>
                        <h3 className="font-black text-white">{popup.title}</h3>
                        <p className="text-xs text-slate-500 font-bold">{popup.is_active ? 'Active' : 'Inactive'} • {popup.coupon_code || 'No coupon'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => { setSelectedPopup(popup); setIsMarketingModalOpen(true); }} className="rounded-xl"><Settings className="w-4 h-4" /></Button>
                      <Button variant="destructive" size="icon" onClick={() => { if(confirm('Delete?')) deletePopup.mutate(popup.id); }} className="rounded-xl"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                 </Card>
               ))}
               {popupsData?.length === 0 && <p className="text-slate-500 font-bold text-sm italic">No popups found.</p>}
            </div>
          </div>
        )}

        {activeTab === 'testimonials' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-white">Testimonials</h2>
              <Button 
                onClick={() => { setSelectedTestimonial(null); setIsTestimonialModalOpen(true); }}
                className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-6 font-bold"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Review
              </Button>
            </div>
            <div className="grid gap-4">
              {testimonialsData?.map((t: any) => (
                <Card key={t.id} className="border-white/5 bg-slate-900/50 p-6 rounded-3xl flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    {t.avatar_url ? (
                      <img src={t.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-black">{t.name.charAt(0)}</div>
                    )}
                    <div>
                      <h3 className="font-black text-white">{t.name}</h3>
                      <p className="text-xs text-slate-500 font-bold">{t.role} • {t.rating} Stars</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => { setSelectedTestimonial(t); setIsTestimonialModalOpen(true); }} className="rounded-xl"><Settings className="w-4 h-4" /></Button>
                    <Button variant="destructive" size="icon" onClick={() => { if(confirm('Delete?')) deleteTestimonial.mutate(t.id); }} className="rounded-xl"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </Card>
              ))}
              {testimonialsData?.length === 0 && <p className="text-slate-500 font-bold text-sm italic">No testimonials found.</p>}
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-white">Media Library</h2>
              <Button 
                onClick={() => setIsGalleryOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-6 font-bold"
              >
                <ImageIcon className="w-4 h-4 mr-2" /> Open Gallery
              </Button>
            </div>
            
            <Card className="border-white/5 bg-slate-900/50 p-12 rounded-3xl text-center">
              <ImageIcon className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-black text-white mb-2">Manage Your Assets</h3>
              <p className="text-slate-500 font-bold max-w-md mx-auto mb-8">
                Upload, view, and organize your images, videos, and GIFs in one central place.
              </p>
              <Button 
                onClick={() => setIsGalleryOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8 py-6 text-lg font-black"
              >
                Launch Media Library
              </Button>
            </Card>

            <MediaGallery 
              open={isGalleryOpen}
              onOpenChange={setIsGalleryOpen}
              onSelect={(url) => {
                toast.success("URL copied: " + url);
                navigator.clipboard.writeText(url);
              }}
            />
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-white">SEO & Performance</h2>
                <Button 
                  onClick={async () => {
                    const result = await runSEOAudit();
                    queryClient.invalidateQueries({ queryKey: ['site-settings'] });
                    toast.success(`Audit complete! Score: ${result.score}`);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 px-8 font-black rounded-xl"
                >
                  <BarChart3 className="w-4 h-4 mr-2" /> Run SEO Audit
                </Button>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Analytics Card */}
               <Card className="border-white/5 bg-slate-900/50 p-8 rounded-3xl space-y-6">
                 <h3 className="text-xl font-black text-white border-b border-white/5 pb-4 flex items-center gap-2">
                   <Zap className="w-5 h-5 text-indigo-400" /> Analytics & Tracking
                 </h3>
                 <div className="space-y-4">
                   <div className="space-y-2">
                     <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Google Analytics (GA4 ID)</label>
                     <Input 
                        placeholder="G-XXXXXXXXXX" 
                        defaultValue={queryClient.getQueryData<any>(['site-settings'])?.google_analytics_id}
                        className="bg-slate-950 border-white/10 text-white rounded-xl" 
                        onChange={async (e) => {
                          await supabase.from('site_settings').update({ value: e.target.value }).eq('key', 'google_analytics_id');
                        }}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Search Console Tag</label>
                     <Input 
                        placeholder="google-site-verification=..." 
                        defaultValue={queryClient.getQueryData<any>(['site-settings'])?.google_search_console_tag}
                        className="bg-slate-950 border-white/10 text-white rounded-xl" 
                        onChange={async (e) => {
                          await supabase.from('site_settings').update({ value: e.target.value }).eq('key', 'google_search_console_tag');
                        }}
                     />
                   </div>
                 </div>
               </Card>

               {/* Audit Results Card */}
               <Card className="border-white/5 bg-slate-900/50 p-8 rounded-3xl space-y-6">
                 <h3 className="text-xl font-black text-white border-b border-white/5 pb-4">Latest Audit Results</h3>
                 {(() => {
                   const auditStr = queryClient.getQueryData<any>(['site-settings'])?.seo_audit_results;
                   let audit: SEOAuditResult | null = null;
                   try { audit = auditStr ? JSON.parse(auditStr) : null; } catch(e) {}
                   
                   if (!audit?.last_run) return <div className="text-slate-500 font-bold italic">No audit run yet.</div>;

                   return (
                     <div className="space-y-4">
                       <div className="flex items-center justify-between">
                         <span className="text-slate-400 font-bold">Health Score:</span>
                         <span className={`text-2xl font-black ${audit.score > 80 ? 'text-emerald-400' : 'text-orange-400'}`}>
                           {audit.score}/100
                         </span>
                       </div>
                       <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                         {audit.issues.map((issue, i) => (
                           <div key={i} className="flex gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                             {issue.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-400 shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0" />}
                             <div className="text-xs">
                               <div className="text-white font-bold">{issue.message}</div>
                               <div className="text-slate-500 font-medium">Route: {issue.route}</div>
                             </div>
                           </div>
                         ))}
                         {audit.issues.length === 0 && (
                           <div className="text-emerald-400 font-bold text-sm">✓ No SEO issues detected!</div>
                         )}
                       </div>
                     </div>
                   );
                 })()}
               </Card>
             </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-white">Global Settings</h2>
                <Button 
                  onClick={() => toast.success('All settings saved successfully')}
                  className="bg-indigo-600 hover:bg-indigo-700 px-8 font-black rounded-xl"
                >
                  <Save className="w-4 h-4 mr-2" /> Save All Changes
                </Button>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <Card className="border-white/5 bg-slate-900/50 p-8 rounded-3xl space-y-6">
                 <h3 className="text-xl font-black text-white border-b border-white/5 pb-4">Branding & Hero</h3>
                 <div className="space-y-4">
                   <div className="space-y-2">
                     <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Company Name</label>
                     <Input defaultValue="GROWUPHOST" className="bg-slate-950 border-white/10 text-white rounded-xl" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Hero Headline</label>
                     <Input defaultValue="UNMATCHED PERFORMANCE" className="bg-slate-950 border-white/10 text-white rounded-xl" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Hero Subtext</label>
                     <Textarea defaultValue="Enterprise-grade infrastructure..." className="bg-slate-950 border-white/10 text-white rounded-xl h-24" />
                   </div>
                 </div>
                 <Button className="w-full bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl py-6">Save Branding</Button>
               </Card>

               <Card className="border-white/5 bg-slate-900/50 p-8 rounded-3xl space-y-6">
                 <h3 className="text-xl font-black text-white border-b border-white/5 pb-4">Contact & Links</h3>
                 <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Phone</label>
                       <Input defaultValue="+91 72 52 89 0016" className="bg-slate-950 border-white/10 text-white rounded-xl" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Email</label>
                       <Input defaultValue="support@growuphost.com" className="bg-slate-950 border-white/10 text-white rounded-xl" />
                     </div>
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Login URL</label>
                     <Input defaultValue="https://billing.growuphost.com" className="bg-slate-950 border-white/10 text-white rounded-xl" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Register URL</label>
                     <Input defaultValue="https://billing.growuphost.com/register.php" className="bg-slate-950 border-white/10 text-white rounded-xl" />
                   </div>
                 </div>
                 <Button className="w-full bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl py-6">Save Links</Button>
               </Card>
             </div>
          </div>
        )}
      </main>

      <ProductModal open={isProductModalOpen} onOpenChange={setIsProductModalOpen} product={selectedProduct} />
      <CategoryModal open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen} category={selectedCategory} allCategories={categoriesData || []} />
      <MarketingModal open={isMarketingModalOpen} onOpenChange={setIsMarketingModalOpen} popup={selectedPopup} />
      <AlertModal open={isAlertModalOpen} onOpenChange={setIsAlertModalOpen} alert={selectedAlert} />
      <TestimonialModal open={isTestimonialModalOpen} onOpenChange={setIsTestimonialModalOpen} testimonial={selectedTestimonial} />
    </div>
  );
}



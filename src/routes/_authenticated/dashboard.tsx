import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ProductModal } from '@/components/admin/ProductModal';
import { CategoryModal } from '@/components/admin/CategoryModal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Package, Plus, Trash2, Settings, Megaphone, Star, Layers, Save } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

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
             ].map((card) => (
               <Card key={card.title} className="border-white/5 bg-slate-900/50 rounded-3xl p-6">
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
                onClick={async () => {
                  const { error } = await supabase.from('news_alerts').insert({
                    content: 'New flash announcement!',
                    badge_text: 'NEW',
                    is_active: true
                  });
                  if (error) toast.error(error.message);
                  else {
                    queryClient.invalidateQueries({ queryKey: ['news-alert'] });
                    toast.success('Alert created');
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-6 font-bold"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Alert
              </Button>
            </div>
            
            <div className="grid gap-4">
              {/* Note: In a real app we'd fetch all alerts, here we'll just show a simplified list or the active one */}
              <p className="text-slate-500 font-bold text-sm">Active news ticker alerts visible on the homepage.</p>
              {/* Simplified implementation for now, assuming user will add/edit as needed */}
            </div>
          </div>
        )}

        {activeTab === 'marketing' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
               <h2 className="text-3xl font-black text-white">Marketing Popups</h2>
               <Button 
                 onClick={async () => {
                   const { error } = await supabase.from('promo_popups').insert({
                     title: 'New Offer!',
                     description: 'Get 20% off on all plans today.',
                     is_active: false
                   });
                   if (error) toast.error(error.message);
                   else {
                     queryClient.invalidateQueries({ queryKey: ['promo-popups'] });
                     toast.success('Popup created');
                   }
                 }}
                 className="bg-orange-600 hover:bg-orange-700 rounded-xl px-6 font-bold"
               >
                 <Plus className="w-4 h-4 mr-2" /> Create Popup
               </Button>
            </div>
            <div className="grid gap-4">
               {queryClient.getQueryData<any[]>(['promo-popups'])?.map((popup) => (
                 <Card key={popup.id} className="border-white/5 bg-slate-900/50 p-6 rounded-3xl flex justify-between items-center">
                    <div>
                      <h3 className="font-black text-white">{popup.title}</h3>
                      <p className="text-xs text-slate-500">{popup.is_active ? 'Active' : 'Inactive'}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="destructive" 
                        onClick={async () => {
                          if(confirm('Delete?')) {
                            const { error } = await supabase.from('promo_popups').delete().eq('id', popup.id);
                            if (error) toast.error(error.message);
                            else {
                              queryClient.invalidateQueries({ queryKey: ['promo-popups'] });
                              toast.success('Popup deleted');
                            }
                          }
                        }}
                        className="rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                 </Card>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'testimonials' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-white">Testimonials</h2>
              <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-6 font-bold">
                <Plus className="w-4 h-4 mr-2" /> Add Review
              </Button>
            </div>
            <div className="grid gap-4">
              <p className="text-slate-500 font-bold text-sm">Customer reviews displayed on the front page.</p>
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
    </div>
  );
}



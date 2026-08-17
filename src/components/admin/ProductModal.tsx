import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { MediaGallery } from './MediaGallery';
import { Image as ImageIcon } from 'lucide-react';

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: any;
}

export function ProductModal({ open, onOpenChange, product }: ProductModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<any>(product || {
    name: '',
    description: '',
    price: 0,
    image_url: '',
    billing_cycle: 'monthly',
    category_id: '',
    whmcs_link: '',
    is_featured: false,
    display_order: 0,
    currency: 'INR'
  });
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['categories-full'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      return data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (product?.id) {
        const { error } = await supabase.from('products').update(data).eq('id', product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-full'] });
      toast.success(product ? 'Product updated' : 'Product created');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error('Error: ' + error.message);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-white">{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription className="text-slate-400">
            Configure hosting plan details and features.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300 font-bold">Product Name</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-slate-950 border-white/10 text-white focus:border-indigo-500"
                placeholder="Starter Plan"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-slate-300 font-bold">Category</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(v) => setFormData({...formData, category_id: v})}
              >
                <SelectTrigger className="bg-slate-950 border-white/10 text-white">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-white">
                  {categories?.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id} className="focus:bg-indigo-600">
                      {cat.name} {cat.parent_id ? '(Subcategory)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-slate-300 font-bold">Price (₹)</Label>
              <Input 
                id="price" 
                type="number"
                value={formData.price} 
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                className="bg-slate-950 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing" className="text-slate-300 font-bold">Billing Cycle</Label>
              <Select 
                value={formData.billing_cycle} 
                onValueChange={(v) => setFormData({...formData, billing_cycle: v})}
              >
                <SelectTrigger className="bg-slate-950 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-white">
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                  <SelectItem value="biennially">Biennially</SelectItem>
                  <SelectItem value="triennially">Triennially</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whmcs" className="text-slate-300 font-bold">WHMCS Order Link</Label>
            <Input 
              id="whmcs" 
              value={formData.whmcs_link} 
              onChange={(e) => setFormData({...formData, whmcs_link: e.target.value})}
              className="bg-slate-950 border-white/10 text-white"
              placeholder="https://billing.growuphost.com/cart.php?a=add&pid=..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300 font-bold">Description / Caption</Label>
            <Textarea 
              id="description" 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-slate-950 border-white/10 text-white h-24"
              placeholder="Premium NVMe SSD, Free SSL, 24/7 Support..."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300 font-bold">Product Image</Label>
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <Input 
                  value={formData.image_url} 
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  className="bg-slate-950 border-white/10 text-white"
                  placeholder="https://..."
                />
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsGalleryOpen(true)}
                className="bg-slate-950 border-white/10 text-white hover:bg-indigo-600"
              >
                <ImageIcon className="w-4 h-4 mr-2" /> Gallery
              </Button>
            </div>
            {formData.image_url && (
              <div className="mt-2 w-32 h-32 rounded-xl overflow-hidden border border-white/10 bg-slate-950">
                <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <MediaGallery 
            open={isGalleryOpen} 
            onOpenChange={setIsGalleryOpen} 
            onSelect={(url) => setFormData({...formData, image_url: url})} 
          />

          <div className="flex items-center gap-8 bg-slate-950/50 p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <Switch 
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({...formData, is_featured: checked})}
              />
              <Label className="text-white font-bold text-sm">Featured Product</Label>
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-slate-400 text-sm whitespace-nowrap">Display Order:</Label>
              <Input 
                type="number"
                value={formData.display_order} 
                onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
                className="bg-slate-950 border-white/10 text-white w-20 h-8"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-white hover:bg-white/5">Cancel</Button>
          <Button 
            onClick={() => mutation.mutate(formData)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Saving...' : 'Save Product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

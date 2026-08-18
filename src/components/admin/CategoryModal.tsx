import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { MediaUpload } from '@/components/admin/MediaUpload';

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: any;
  allCategories?: any[];
}

export function CategoryModal({ open, onOpenChange, category, allCategories }: CategoryModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<any>(category || {
    name: '',
    slug: '',
    parent_id: '',
    show_in_nav: true,
    display_order: 0,
    background_media_url: '',
    seo_title: '',
    seo_description: ''
  });


  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        parent_id: data.parent_id === '' ? null : data.parent_id
      };
      if (category?.id) {
        const { error } = await supabase.from('categories').update(payload).eq('id', category.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories-full'] });
      toast.success(category ? 'Category updated' : 'Category created');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error('Error: ' + error.message);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">{category ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300 font-bold">Name</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-slate-950 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 font-bold">Slug</Label>
              <Input 
                value={formData.slug} 
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                className="bg-slate-950 border-white/10 text-white"
                placeholder="shared-hosting"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300 font-bold">SEO Title</Label>
              <Input 
                value={formData.seo_title || ''} 
                onChange={(e) => setFormData({...formData, seo_title: e.target.value})}
                className="bg-slate-950 border-white/10 text-white"
                placeholder="Meta title for SEO"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 font-bold">SEO Description</Label>
              <Input 
                value={formData.seo_description || ''} 
                onChange={(e) => setFormData({...formData, seo_description: e.target.value})}
                className="bg-slate-950 border-white/10 text-white"
                placeholder="Meta description for SEO"
              />
            </div>
          </div>

          <div className="space-y-2">

            <Label className="text-slate-300 font-bold">Parent Category</Label>
            <Select 
              value={formData.parent_id || ''} 
              onValueChange={(v) => setFormData({...formData, parent_id: v})}
            >
              <SelectTrigger className="bg-slate-950 border-white/10 text-white">
                <SelectValue placeholder="None (Root Category)" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-white">
                <SelectItem value="">None (Root Category)</SelectItem>
                {allCategories?.filter(c => c.id !== category?.id).map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <MediaUpload 
            label="Banner Media"
            currentUrl={formData.background_media_url}
            path="categories"
            onUploadComplete={(url) => setFormData({...formData, background_media_url: url})}
          />

          <div className="flex items-center justify-between bg-slate-950/50 p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <Switch 
                checked={formData.show_in_nav}
                onCheckedChange={(checked) => setFormData({...formData, show_in_nav: checked})}
              />
              <Label className="text-white font-bold">Show in Navigation</Label>
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-slate-400 text-sm">Order</Label>
              <Input 
                type="number"
                value={formData.display_order} 
                onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
                className="bg-slate-950 border-white/10 text-white w-20 h-8"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400">Cancel</Button>
          <Button 
            onClick={() => mutation.mutate(formData)}
            className="bg-indigo-600 hover:bg-indigo-700 font-black"
          >
            Save Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

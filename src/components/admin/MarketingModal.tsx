import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { MediaUpload } from './MediaUpload';
import { MediaGallery } from './MediaGallery';
import { Image as ImageIcon } from 'lucide-react';

interface MarketingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  popup?: any;
}

export function MarketingModal({ open, onOpenChange, popup }: MarketingModalProps) {
  const [loading, setLoading] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    coupon_code: '',
    cta_text: '',
    cta_url: '',
    image_url: '',
    is_active: false
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (popup) {
      setFormData(popup);
    } else {
      setFormData({
        title: '',
        description: '',
        coupon_code: '',
        cta_text: '',
        cta_url: '',
        image_url: '',
        is_active: false
      });
    }
  }, [popup, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSubmit = { ...formData };
      delete dataToSubmit.id;
      delete dataToSubmit.created_at;
      delete dataToSubmit.updated_at;

      if (popup?.id) {
        const { error } = await supabase
          .from('promo_popups')
          .update(dataToSubmit)
          .eq('id', popup.id);
        if (error) throw error;
        toast.success('Popup updated');
      } else {
        const { error } = await supabase
          .from('promo_popups')
          .insert(dataToSubmit);
        if (error) throw error;
        toast.success('Popup created');
      }
      queryClient.invalidateQueries({ queryKey: ['promo-popups'] });
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">{popup ? 'Edit Popup' : 'Create New Popup'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Title</label>
              <Input 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-slate-950 border-white/10 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Description</label>
              <Textarea 
                value={formData.description || ''} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-slate-950 border-white/10 rounded-xl min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Coupon Code</label>
                <Input 
                  value={formData.coupon_code || ''} 
                  onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value })}
                  className="bg-slate-950 border-white/10 rounded-xl"
                  placeholder="e.g. SAVE20"
                />
              </div>
              <div className="space-y-2 flex flex-col justify-end">
                <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-white/10">
                  <Switch 
                    checked={formData.is_active} 
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <span className="text-sm font-bold">Active Status</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">CTA Button Text</label>
                <Input 
                  value={formData.cta_text || ''} 
                  onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                  className="bg-slate-950 border-white/10 rounded-xl"
                  placeholder="e.g. Claim Now"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">CTA URL</label>
                <Input 
                  value={formData.cta_url || ''} 
                  onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                  className="bg-slate-950 border-white/10 rounded-xl"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Popup Image</label>
              <div className="flex gap-4 items-start mb-4">
                <div className="flex-1">
                  <Input 
                    value={formData.image_url || ''} 
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="bg-slate-950 border-white/10 rounded-xl"
                    placeholder="https://..."
                  />
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsGalleryOpen(true)}
                  className="bg-slate-950 border-white/10 text-white hover:bg-indigo-600 rounded-xl"
                >
                  <ImageIcon className="w-4 h-4 mr-2" /> Gallery
                </Button>
              </div>
              <MediaUpload 
                currentUrl={formData.image_url} 
                onUploadComplete={(url: string) => setFormData({ ...formData, image_url: url })}
                path="popups"
                label="Direct Upload"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl border-white/10">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8 font-bold">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>

        <MediaGallery 
          open={isGalleryOpen} 
          onOpenChange={setIsGalleryOpen} 
          onSelect={(url) => setFormData({ ...formData, image_url: url })} 
        />
      </DialogContent>
    </Dialog>
  );
}

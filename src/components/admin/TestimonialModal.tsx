import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { MediaUpload } from './MediaUpload';

interface TestimonialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonial?: any;
}

export function TestimonialModal({ open, onOpenChange, testimonial }: TestimonialModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: '',
    role: '',
    content: '',
    rating: 5,
    avatar_url: ''
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (testimonial) {
      setFormData(testimonial);
    } else {
      setFormData({
        name: '',
        role: '',
        content: '',
        rating: 5,
        avatar_url: ''
      });
    }
  }, [testimonial, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSubmit = { ...formData };
      delete dataToSubmit.id;
      delete dataToSubmit.created_at;

      if (testimonial?.id) {
        const { error } = await supabase
          .from('testimonials')
          .update(dataToSubmit)
          .eq('id', testimonial.id);
        if (error) throw error;
        toast.success('Testimonial updated');
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert(dataToSubmit);
        if (error) throw error;
        toast.success('Testimonial added');
      }
      queryClient.invalidateQueries({ queryKey: ['testimonials-full'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials-public'] });
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">{testimonial ? 'Edit Testimonial' : 'Add New Testimonial'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Customer Name</label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-950 border-white/10 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Role / Company</label>
                <Input 
                  value={formData.role || ''} 
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="bg-slate-950 border-white/10 rounded-xl"
                  placeholder="e.g. CEO, Tech Corp"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Rating (1-5)</label>
              <Input 
                type="number"
                min="1"
                max="5"
                value={formData.rating} 
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                className="bg-slate-950 border-white/10 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Testimonial Content</label>
              <Textarea 
                value={formData.content} 
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="bg-slate-950 border-white/10 rounded-xl min-h-[100px]"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Avatar Image</label>
              <MediaUpload 
                currentUrl={formData.avatar_url} 
                onUploadComplete={(url: string) => setFormData({ ...formData, avatar_url: url })}
                path="avatars"
                label="Avatar"
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
      </DialogContent>
    </Dialog>
  );
}

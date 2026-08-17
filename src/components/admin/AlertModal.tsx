import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface AlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert?: any;
}

export function AlertModal({ open, onOpenChange, alert }: AlertModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    content: '',
    badge_text: '',
    link_url: '',
    is_active: true
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (alert) {
      setFormData(alert);
    } else {
      setFormData({
        content: '',
        badge_text: '',
        link_url: '',
        is_active: true
      });
    }
  }, [alert, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (alert?.id) {
        const { error } = await supabase
          .from('news_alerts')
          .update(formData)
          .eq('id', alert.id);
        if (error) throw error;
        toast.success('Alert updated');
      } else {
        const { error } = await supabase
          .from('news_alerts')
          .insert(formData);
        if (error) throw error;
        toast.success('Alert created');
      }
      queryClient.invalidateQueries({ queryKey: ['news-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['news-alert'] });
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
          <DialogTitle className="text-2xl font-black">{alert ? 'Edit Alert' : 'Add New Alert'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Alert Content</label>
              <Input 
                value={formData.content} 
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="bg-slate-950 border-white/10 rounded-xl"
                placeholder="e.g. Flash Sale: 50% Off VPS!"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Badge Text</label>
                <Input 
                  value={formData.badge_text || ''} 
                  onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                  className="bg-slate-950 border-white/10 rounded-xl"
                  placeholder="e.g. NEW"
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

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Link URL (Optional)</label>
              <Input 
                value={formData.link_url || ''} 
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                className="bg-slate-950 border-white/10 rounded-xl"
                placeholder="https://..."
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

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Layers, 
  Package, 
  Megaphone, 
  Star,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { getMediaUsage, replaceMediaUrl } from '@/lib/media.functions';
import { useServerFn } from '@tanstack/react-start';
import { MediaGallery } from './MediaGallery';

interface UsagePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaUrl: string;
}

export function UsagePreview({ open, onOpenChange, mediaUrl }: UsagePreviewProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const fetchUsage = useServerFn(getMediaUsage);
  const replaceMedia = useServerFn(replaceMediaUrl);
  const queryClient = useQueryClient();

  const { data: usage, isLoading } = useQuery({
    queryKey: ['media-usage', mediaUrl],
    queryFn: () => fetchUsage({ url: mediaUrl }),
    enabled: open && !!mediaUrl
  });

  const handleReplace = async (newUrl: string) => {
    try {
      await replaceMedia({ oldUrl: mediaUrl, newUrl });
      toast.success('Media replaced successfully across all pages');
      queryClient.invalidateQueries();
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Replacement failed: ' + error.message);
    }
  };

  const totalUsage = (usage?.products.length || 0) + 
                     (usage?.categories.length || 0) + 
                     (usage?.popups.length || 0) + 
                     (usage?.testimonials.length || 0);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-slate-950 border-white/10 text-white max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-2">
              <Search className="w-6 h-6 text-indigo-400" />
              Usage Preview
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              See where this image is used and replace it safely across the site.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-6">
            <div className="flex gap-6 items-start bg-white/5 p-4 rounded-3xl border border-white/10">
              <img src={mediaUrl} alt="" className="w-32 h-32 object-cover rounded-2xl border border-white/10 shadow-2xl" />
              <div className="flex-1 space-y-1">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Selected Image</p>
                <p className="text-sm font-bold truncate max-w-[250px]">{mediaUrl.split('/').pop()}</p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-[10px] font-black rounded-lg uppercase">
                    {totalUsage} Locations
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Active Placements</h3>
              
              {isLoading ? (
                <div className="space-y-2 animate-pulse">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-white/5 rounded-xl" />
                  ))}
                </div>
              ) : totalUsage === 0 ? (
                <div className="text-center py-8 bg-white/5 rounded-3xl border border-dashed border-white/10">
                  <AlertCircle className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-slate-500 font-bold">Not currently used anywhere</p>
                </div>
              ) : (
                <div className="grid gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {usage?.products.map((p: any) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                      <Package className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold">{p.name} (Product)</span>
                    </div>
                  ))}
                  {usage?.categories.map((c: any) => (
                    <div key={c.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold">{c.name} (Category)</span>
                    </div>
                  ))}
                  {usage?.popups.map((p: any) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                      <Megaphone className="w-4 h-4 text-orange-400" />
                      <span className="text-xs font-bold">{p.title} (Popup)</span>
                    </div>
                  ))}
                  {usage?.testimonials.map((t: any) => (
                    <div key={t.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs font-bold">{t.name} (Testimonial)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-white">Close</Button>
            <Button 
              onClick={() => setIsGalleryOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 rounded-xl"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Replace Everywhere
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MediaGallery 
        open={isGalleryOpen} 
        onOpenChange={setIsGalleryOpen} 
        onSelect={handleReplace}
        title="Select Replacement Image"
      />
    </>
  );
}

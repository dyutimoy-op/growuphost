import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Image as ImageIcon, 
  Trash2, 
  Search, 
  FileText, 
  Film,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { MediaUpload } from './MediaUpload';
import { UsagePreview } from './UsagePreview';

interface MediaGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  title?: string;
}

export function MediaGallery({ 
  open, 
  onOpenChange, 
  onSelect,
  title = "Media Gallery"
}: MediaGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForUsage, setSelectedForUsage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: mediaItems, isLoading } = useQuery({
    queryKey: ['media-library'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: open
  });

  const deleteMedia = useMutation({
    mutationFn: async (id: string) => {
      // Note: We might want to also delete from storage, but for now just the library record
      const { error } = await supabase
        .from('media_library')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
      toast.success('Media removed from library');
    }
  });

  const filteredItems = mediaItems?.filter(item => 
    item.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-black text-white">{title}</DialogTitle>
          <DialogDescription className="text-slate-400">
            Upload new media or select from your existing library.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-6 space-y-4">
            <MediaUpload 
              path="gallery" 
              label="New Media" 
              onUploadComplete={() => queryClient.invalidateQueries({ queryKey: ['media-library'] })} 
            />
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input 
                placeholder="Search media..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-950 border-white/5 text-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-square bg-white/5 animate-pulse rounded-xl border border-white/5" />
                ))}
              </div>
            ) : filteredItems?.length === 0 ? (
              <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <ImageIcon className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">No media found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredItems?.map((item) => (
                  <div 
                    key={item.id}
                    className="group relative aspect-square bg-slate-950 rounded-xl overflow-hidden border border-white/5 hover:border-indigo-500 transition-all cursor-pointer"
                    onClick={() => {}}
                  >
                    {item.file_type?.startsWith('image/') ? (
                      <img 
                        src={`${item.url}${item.file_type !== 'image/gif' ? '?width=300&height=300&resize=contain' : ''}`} 
                        alt={item.filename} 
                        className="w-full h-full object-cover" 
                        loading="lazy"
                      />
                    ) : item.file_type?.startsWith('video/') ? (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-500/10">
                        <Film className="w-8 h-8 text-indigo-400" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900">
                        <FileText className="w-8 h-8 text-slate-500" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-indigo-600/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                      <p className="text-[10px] font-black uppercase tracking-tighter line-clamp-2 mb-1">{item.filename}</p>
                      <p className="text-[8px] font-bold opacity-70 mb-3">{formatSize(item.file_size || 0)}</p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="h-7 text-[10px] font-black bg-white text-indigo-600 hover:bg-slate-100 rounded-lg"
                          onClick={() => {
                            onSelect(item.url);
                            onOpenChange(false);
                          }}
                        >
                          SELECT
                        </Button>
                        <Button 
                          size="sm" 
                          className="h-7 text-[10px] font-black bg-indigo-500 text-white hover:bg-indigo-400 rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedForUsage(item.url);
                          }}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          USAGE
                        </Button>
                      </div>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if(confirm('Remove from library?')) deleteMedia.mutate(item.id);
                      }}
                      className="absolute top-1 right-1 p-1 bg-red-500 rounded-md text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {selectedForUsage && (
          <UsagePreview 
            open={!!selectedForUsage} 
            onOpenChange={(open) => !open && setSelectedForUsage(null)} 
            mediaUrl={selectedForUsage} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

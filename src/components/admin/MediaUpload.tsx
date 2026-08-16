import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Loader2, Image as ImageIcon, Film, X } from 'lucide-react';
import { uploadMedia } from '@/lib/storage';
import { toast } from 'sonner';

interface MediaUploadProps {
  onUploadComplete: (url: string) => void;
  currentUrl?: string | null;
  path: string;
  label?: string;
  accept?: string;
}

export function MediaUpload({ 
  onUploadComplete, 
  currentUrl, 
  path, 
  label = "Media", 
  accept = "image/*,video/*,image/gif" 
}: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: Add size limit check here if needed
    if (file.size > 10 * 1024 * 1024) { // 10MB limit example
      toast.error("File size exceeds 10MB limit");
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadMedia(file, path);
      setPreviewUrl(url);
      onUploadComplete(url);
      toast.success(`${label} uploaded successfully`);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const isVideo = previewUrl?.match(/\.(mp4|webm|ogg)$/i) || previewUrl?.includes('video');

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
        {label}
      </label>
      
      {previewUrl && (
        <div className="relative group w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden bg-slate-950 border border-white/10">
          {isVideo ? (
            <video 
              src={previewUrl} 
              className="w-full h-full object-cover" 
              controls 
              muted 
              loop
            />
          ) : (
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-full object-cover" 
            />
          )}
          <button 
            onClick={() => {
              setPreviewUrl(null);
              onUploadComplete('');
            }}
            className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
            id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
          />
          <label 
            htmlFor={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
            className={`
              flex items-center justify-center gap-2 w-full px-4 py-3 
              border-2 border-dashed border-white/10 rounded-2xl 
              cursor-pointer hover:border-indigo-500/50 hover:bg-white/5 
              transition-all text-sm font-bold
              ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            ) : (
              <Upload className="w-4 h-4 text-indigo-400" />
            )}
            {isUploading ? 'Uploading...' : `Upload ${label}`}
          </label>
        </div>
        
        {previewUrl && (
          <div className="flex gap-2">
            {isVideo ? <Film className="w-4 h-4 text-slate-500" /> : <ImageIcon className="w-4 h-4 text-slate-500" />}
          </div>
        )}
      </div>
    </div>
  );
}

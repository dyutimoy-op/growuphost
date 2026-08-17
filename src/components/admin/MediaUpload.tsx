import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Loader2, Image as ImageIcon, Film, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadMedia } from '@/lib/storage';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { validateFile, optimizeImage } from '@/utils/media-optimization';

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
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'optimizing' | 'uploading' | 'success' | 'error'>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    // 1. Validation
    const validation = validateFile(file);
    if (!validation.valid) {
      setUploadStatus('error');
      toast.error(validation.error);
      return;
    }

    setIsUploading(true);
    setUploadStatus('optimizing');

    try {
      // 2. Optimization
      const { file: optimizedFile, isOptimized, originalSize, optimizedSize } = await optimizeImage(file);
      
      if (isOptimized) {
        const reduction = (((originalSize - optimizedSize) / originalSize) * 100).toFixed(0);
        console.log(`Optimized image: ${reduction}% reduction`);
      }

      setUploadStatus('uploading');

      // 3. Upload
      const finalFile = optimizedFile instanceof Blob && !(optimizedFile instanceof File) 
        ? new File([optimizedFile], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: 'image/webp' })
        : optimizedFile as File;

      const url = await uploadMedia(finalFile, path);
      
      setPreviewUrl(url);
      onUploadComplete(url);
      setUploadStatus('success');
      toast.success(`${label} uploaded and optimized`);
      
      // Reset status to idle after a delay
      setTimeout(() => setUploadStatus('idle'), 3000);
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadStatus('error');
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
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
              setUploadStatus('idle');
            }}
            className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div 
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={cn(
            "relative flex-1 group",
            isDragging && "scale-[0.98] transition-transform"
          )}
        >
          <Input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
            id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
            ref={fileInputRef}
          />
          <label 
            htmlFor={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
            className={cn(
              "flex flex-col items-center justify-center gap-3 w-full px-4 py-8 border-2 border-dashed rounded-3xl cursor-pointer transition-all text-sm font-bold",
              isDragging 
                ? "border-indigo-500 bg-indigo-500/10" 
                : "border-white/10 hover:border-indigo-500/50 hover:bg-white/5",
              isUploading ? "opacity-50 cursor-not-allowed" : "",
              uploadStatus === 'success' ? "border-emerald-500/50 bg-emerald-500/5" : "",
              uploadStatus === 'error' ? "border-red-500/50 bg-red-500/5" : ""
            )}
          >
            {uploadStatus === 'idle' && (
              <>
                <div className="p-4 bg-indigo-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="text-center">
                  <p className="text-white">Click or drag & drop to upload</p>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">
                    Optimized Image or Video (Max 10MB)
                  </p>
                </div>
              </>
            )}

            {(uploadStatus === 'optimizing' || uploadStatus === 'uploading') && (
              <>
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                <div className="text-center">
                  <p className="text-white">{uploadStatus === 'optimizing' ? 'Optimizing Image...' : 'Uploading to Server...'}</p>
                  <div className="w-48 h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                    <div className={cn(
                      "h-full bg-indigo-500 transition-all duration-500",
                      uploadStatus === 'optimizing' ? "w-1/3" : "w-2/3"
                    )} />
                  </div>
                </div>
              </>
            )}

            {uploadStatus === 'success' && (
              <>
                <div className="p-4 bg-emerald-500/10 rounded-2xl">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-emerald-400">Successfully Uploaded & Optimized</p>
              </>
            )}

            {uploadStatus === 'error' && (
              <>
                <div className="p-4 bg-red-500/10 rounded-2xl">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <p className="text-red-400">Upload Failed. Try Again.</p>
              </>
            )}
          </label>
        </div>
      </div>
    </div>
  );
}

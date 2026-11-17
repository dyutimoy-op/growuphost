import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, X, CheckCircle2, AlertCircle } from "lucide-react";
import { isVideoUrl, uploadMedia } from "@/lib/storage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { toMediaSrc } from "@/lib/media-url";
import {
  ACCEPTED_UPLOAD_TYPES,
  allowedTypesFromAccept,
  isResizableImage,
  optimizeImage,
  validateFile,
} from "@/utils/media-optimization";
import { getErrorMessage } from "./admin-utils";
import { invalidateEntity } from "./admin-invalidation";

interface MediaUploadProps {
  onUploadComplete: (url: string) => void;
  currentUrl?: string | null | undefined;
  path: string;
  label?: string;

  accept?: string;
}

type UploadStatus = "idle" | "optimizing" | "uploading" | "success" | "error";

function describeSaving(originalSize: number, optimizedSize: number): string {
  const toMb = (bytes: number): string => `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
  if (originalSize <= 0 || optimizedSize >= originalSize) return `now ${toMb(optimizedSize)}`;
  const percent = Math.round((1 - optimizedSize / originalSize) * 100);
  return `${percent}% smaller (${toMb(originalSize)} → ${toMb(optimizedSize)})`;
}

export function MediaUpload({
  onUploadComplete,
  currentUrl,
  path,
  label = "Media",
  accept = ACCEPTED_UPLOAD_TYPES,
}: MediaUploadProps) {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl ?? null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const statusResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allowedTypes = useMemo(() => allowedTypesFromAccept(accept), [accept]);
  const allowsVideo = allowedTypes.some((type) => type.startsWith("video/"));

  const scheduleStatusReset = (): void => {
    if (statusResetTimer.current !== null) clearTimeout(statusResetTimer.current);
    statusResetTimer.current = setTimeout(() => setUploadStatus("idle"), 3000);
  };

  useEffect(
    () => () => {
      if (statusResetTimer.current !== null) clearTimeout(statusResetTimer.current);
    },
    [],
  );

  useEffect(() => {
    setPreviewUrl(
      currentUrl !== null && currentUrl !== undefined && currentUrl.length > 0 ? currentUrl : null,
    );
  }, [currentUrl]);

  const processFile = async (file: File): Promise<void> => {
    if (statusResetTimer.current !== null) clearTimeout(statusResetTimer.current);

    const validation = validateFile(file, allowedTypes);
    if (!validation.valid) {
      setUploadStatus("error");
      toast.error(validation.error ?? "That file cannot be uploaded");
      scheduleStatusReset();
      return;
    }

    setIsUploading(true);

    setUploadStatus(isResizableImage(file.type) ? "optimizing" : "uploading");

    try {
      const {
        file: finalFile,
        isOptimized,
        originalSize,
        optimizedSize,
      } = await optimizeImage(file);

      setUploadStatus("uploading");

      const url = await uploadMedia(finalFile, path);

      void invalidateEntity(queryClient, "media");

      setPreviewUrl(url);
      onUploadComplete(url);
      setUploadStatus("success");
      toast.success(`${label} uploaded`, {
        description: isOptimized
          ? `Resized to fit 1200px, still ${file.type.replace(/^image\//, "").toUpperCase()} — ${describeSaving(originalSize, optimizedSize)}.`
          : "Stored exactly as uploaded — same format, same filename, same quality.",
      });

      scheduleStatusReset();
    } catch (error: unknown) {
      setUploadStatus("error");
      toast.error(getErrorMessage(error, `${label} could not be uploaded`));

      scheduleStatusReset();
    } finally {
      setIsUploading(false);

      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) void processFile(file);
  };

  const onDragOver = (e: DragEvent): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (): void => {
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent): void => {
    e.preventDefault();
    setIsDragging(false);

    if (isUploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) void processFile(file);
  };

  const isVideo = isVideoUrl(previewUrl);

  const previewSrc = toMediaSrc(previewUrl);

  const inputId = `file-upload-${path}-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="space-y-3">
      <label
        htmlFor={inputId}
        className="text-[10px] font-black text-slate-300 uppercase tracking-widest block"
      >
        {label}
      </label>

      {previewUrl && (
        <div className="relative group w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden bg-slate-950 border border-white/10">
          {isVideo ? (
            <video src={previewSrc} className="w-full h-full object-cover" controls muted loop />
          ) : (
            <img
              src={previewSrc}
              alt="Preview"
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          )}

          <button
            type="button"
            aria-label={`Remove the current ${label.toLowerCase()}`}
            onClick={() => {
              setPreviewUrl(null);
              onUploadComplete("");
              setUploadStatus("idle");
            }}
            className="absolute top-0 right-0 grid place-items-center w-11 h-11 text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 cursor-pointer [@media(hover:none)]:opacity-100"
          >
            <span className="grid place-items-center w-7 h-7 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors duration-200">
              <X className="w-4 h-4" aria-hidden="true" />
            </span>
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={cn("relative flex-1 group", isDragging && "scale-[0.98] transition-transform")}
        >
          <Input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={isUploading}
            className="sr-only"
            id={inputId}
            ref={fileInputRef}
          />
          <label
            htmlFor={inputId}
            aria-live="polite"
            className={cn(
              "flex flex-col items-center justify-center gap-3 w-full px-4 py-8 border-2 border-dashed rounded-3xl cursor-pointer transition-colors duration-200 text-sm font-bold",
              isDragging
                ? "border-blue-500 bg-blue-500/10"
                : "border-white/10 hover:border-blue-500/50 hover:bg-white/5",
              isUploading ? "opacity-50 cursor-not-allowed" : "",
              uploadStatus === "success" ? "border-emerald-500/50 bg-emerald-500/5" : "",
              uploadStatus === "error" ? "border-red-500/50 bg-red-500/5" : "",
            )}
          >
            {uploadStatus === "idle" && (
              <>
                <div className="p-4 bg-blue-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-200">
                  <Upload className="w-6 h-6 text-blue-400" aria-hidden="true" />
                </div>
                <div className="text-center">
                  <p className="text-white">Click or drag &amp; drop to upload</p>

                  <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-widest">
                    Same format &amp; filename · JPG/PNG/WebP over 1200px resized · GIF
                    {allowsVideo ? " & video" : ""} untouched · Max 10MB
                  </p>
                </div>
              </>
            )}

            {(uploadStatus === "optimizing" || uploadStatus === "uploading") && (
              <>
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" aria-hidden="true" />
                <div className="text-center">
                  <p className="text-white">
                    {uploadStatus === "optimizing"
                      ? "Checking image size…"
                      : "Uploading to server…"}
                  </p>
                  <div className="w-48 h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                    <div
                      className={cn(
                        "h-full bg-blue-500 transition-all duration-500",
                        uploadStatus === "optimizing" ? "w-1/3" : "w-2/3",
                      )}
                    />
                  </div>
                </div>
              </>
            )}

            {uploadStatus === "success" && (
              <>
                <div className="p-4 bg-emerald-500/10 rounded-2xl">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" aria-hidden="true" />
                </div>
                <p className="text-emerald-400">Uploaded to the media library</p>
              </>
            )}

            {uploadStatus === "error" && (
              <>
                <div className="p-4 bg-red-500/10 rounded-2xl">
                  <AlertCircle className="w-6 h-6 text-red-400" aria-hidden="true" />
                </div>
                <p className="text-red-400">Upload failed. Try again.</p>
              </>
            )}
          </label>
        </div>
      </div>
    </div>
  );
}

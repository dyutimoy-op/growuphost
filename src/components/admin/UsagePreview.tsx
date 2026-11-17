import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Search,
  Layers,
  Package,
  Megaphone,
  Star,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { getMediaUsage, replaceMediaUrl } from "@/lib/media.functions";
import { toMediaSrc } from "@/lib/media-url";
import { useServerFn } from "@tanstack/react-start";
import { MediaGallery } from "./MediaGallery";
import { getErrorMessage } from "./admin-utils";

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

  const {
    data: usage,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["media-usage", mediaUrl],
    queryFn: () => fetchUsage({ data: { url: mediaUrl } }),
    enabled: open && mediaUrl.length > 0,
  });

  const replacement = useMutation({
    mutationFn: (newUrl: string) => replaceMedia({ data: { oldUrl: mediaUrl, newUrl } }),
    onSuccess: (result) => {
      const { products, categories, popups, testimonials } = result.replaced;
      const total = products + categories + popups + testimonials;
      if (total === 0) {
        toast.success("Nothing needed changing — no content referenced this file");
      } else {
        toast.success(`Replaced in ${total} ${total === 1 ? "place" : "places"} across the site`);
      }

      void queryClient.invalidateQueries();
      onOpenChange(false);
    },
    onError: (mutationError: unknown) => {
      toast.error(
        getErrorMessage(mutationError, "The replacement failed — nothing may have changed"),
      );
    },
  });

  const totalUsage =
    (usage?.products.length ?? 0) +
    (usage?.categories.length ?? 0) +
    (usage?.popups.length ?? 0) +
    (usage?.testimonials.length ?? 0);

  const filename = mediaUrl.split("/").pop() ?? mediaUrl;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-slate-950 border-white/10 text-white max-w-xl rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tighter flex items-center gap-2">
              <Search className="w-6 h-6 text-blue-400" aria-hidden="true" />
              Usage Preview
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium">
              See where this image is used and replace it safely across the site.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-6">
            <div className="flex gap-6 items-start bg-white/5 p-4 rounded-3xl border border-white/10">
              <img
                src={toMediaSrc(mediaUrl)}
                alt=""
                className="w-32 h-32 object-cover rounded-2xl border border-white/10 shadow-2xl"
                loading="lazy"
                decoding="async"
              />
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-xs font-black text-slate-300 uppercase tracking-widest">
                  Selected Image
                </p>
                <p className="text-sm font-bold truncate">{filename}</p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-[10px] font-black rounded-lg uppercase">
                    {totalUsage} {totalUsage === 1 ? "Location" : "Locations"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">
                Active Placements
              </h3>

              {isLoading ? (
                <div className="space-y-2 animate-pulse" aria-live="polite">
                  {Array.from({ length: 3 }, (_, index) => (
                    <div key={index} className="h-12 bg-white/5 rounded-xl" />
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8 bg-red-500/10 rounded-3xl border border-red-500/30">
                  <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" aria-hidden="true" />
                  <p role="alert" className="text-red-300 font-bold px-4">
                    {getErrorMessage(error, "Could not check where this file is used")}
                  </p>
                </div>
              ) : totalUsage === 0 ? (
                <div className="text-center py-8 bg-white/5 rounded-3xl border border-dashed border-white/10">
                  <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" aria-hidden="true" />
                  <p className="text-slate-300 font-bold">Not currently used anywhere</p>
                </div>
              ) : (
                <div className="grid gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {usage?.products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5"
                    >
                      <Package className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                      <span className="text-xs font-bold">{product.name} (Product)</span>
                    </div>
                  ))}
                  {usage?.categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5"
                    >
                      <Layers className="w-4 h-4 text-blue-400 shrink-0" aria-hidden="true" />
                      <span className="text-xs font-bold">{category.name} (Category)</span>
                    </div>
                  ))}
                  {usage?.popups.map((popup) => (
                    <div
                      key={popup.id}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5"
                    >
                      <Megaphone className="w-4 h-4 text-orange-400 shrink-0" aria-hidden="true" />
                      <span className="text-xs font-bold">{popup.title} (Popup)</span>
                    </div>
                  ))}
                  {usage?.testimonials.map((testimonial) => (
                    <div
                      key={testimonial.id}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5"
                    >
                      <Star className="w-4 h-4 text-yellow-400 shrink-0" aria-hidden="true" />
                      <span className="text-xs font-bold">{testimonial.name} (Testimonial)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={replacement.isPending}
              className="text-slate-300 hover:text-white min-h-11 cursor-pointer transition-colors duration-200"
            >
              Close
            </Button>
            <Button
              onClick={() => setIsGalleryOpen(true)}
              disabled={replacement.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 rounded-xl min-h-11 cursor-pointer transition-colors duration-200"
            >
              {replacement.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  Replacing…
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                  Replace Everywhere
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MediaGallery
        open={isGalleryOpen}
        onOpenChange={setIsGalleryOpen}
        onSelect={(newUrl) => replacement.mutate(newUrl)}
        title="Select Replacement Image"
      />
    </>
  );
}

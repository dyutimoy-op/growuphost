import { useEffect, useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MediaUpload } from "./MediaUpload";
import { MediaGallery } from "./MediaGallery";
import { Image as ImageIcon } from "lucide-react";
import { isVideoUrl } from "@/lib/storage";
import { ACCEPTED_IMAGE_TYPES } from "@/utils/media-optimization";
import type { PromoPopupInsert, PromoPopupRow } from "./admin-types";
import { invalidateEntity } from "./admin-invalidation";
import { emptyToNull, getErrorMessage } from "./admin-utils";

interface MarketingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  popup?: PromoPopupRow | null | undefined;
}

interface PopupFormState {
  title: string;
  description: string;
  coupon_code: string;
  cta_text: string;
  cta_url: string;
  image_url: string;
  is_active: boolean;
}

const EMPTY_FORM: PopupFormState = {
  title: "",
  description: "",
  coupon_code: "",
  cta_text: "",
  cta_url: "",
  image_url: "",
  is_active: false,
};

export function MarketingModal({ open, onOpenChange, popup }: MarketingModalProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [formData, setFormData] = useState<PopupFormState>(EMPTY_FORM);
  const [titleError, setTitleError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    setTitleError(null);
    if (popup) {
      setFormData({
        title: popup.title,
        description: popup.description ?? "",
        coupon_code: popup.coupon_code ?? "",
        cta_text: popup.cta_text ?? "",
        cta_url: popup.cta_url ?? "",
        image_url: popup.image_url ?? "",
        is_active: popup.is_active === true,
      });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [popup, open]);

  const patch = (changes: Partial<PopupFormState>): void => {
    setFormData((previous) => ({ ...previous, ...changes }));
  };

  const mutation = useMutation({
    mutationFn: async (payload: PromoPopupInsert) => {
      if (popup?.id) {
        const { error } = await supabase.from("promo_popups").update(payload).eq("id", popup.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("promo_popups").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      void invalidateEntity(queryClient, "popups");
      toast.success(popup ? "Popup updated" : "Popup created");
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Could not save the popup"));
    },
  });

  const handleSubmit = (event: FormEvent): void => {
    event.preventDefault();

    const title = formData.title.trim();
    if (title.length === 0) {
      setTitleError("A title is required.");
      return;
    }
    setTitleError(null);

    mutation.mutate({
      title,
      description: emptyToNull(formData.description),
      coupon_code: emptyToNull(formData.coupon_code),
      cta_text: emptyToNull(formData.cta_text),
      cta_url: emptyToNull(formData.cta_url),
      image_url: emptyToNull(formData.image_url),
      is_active: formData.is_active,
    });
  };

  const inputClass =
    "bg-slate-950 border-white/10 text-white rounded-xl min-h-11 transition-colors duration-200 focus-visible:border-blue-500";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl overflow-y-auto rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tighter">
            {popup ? "Edit Popup" : "Create New Popup"}
          </DialogTitle>
          <DialogDescription className="text-slate-400 font-medium">
            Only active popups are shown to visitors.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="popup-title" className="text-slate-300 font-bold">
                Title
              </Label>
              <Input
                id="popup-title"
                value={formData.title}
                onChange={(e) => patch({ title: e.target.value })}
                className={inputClass}
                aria-invalid={titleError !== null}
                aria-describedby={titleError ? "popup-title-error" : undefined}
                required
              />
              {titleError && (
                <p id="popup-title-error" role="alert" className="text-xs font-bold text-red-400">
                  {titleError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="popup-description" className="text-slate-300 font-bold">
                Description
              </Label>
              <Textarea
                id="popup-description"
                value={formData.description}
                onChange={(e) => patch({ description: e.target.value })}
                className="bg-slate-950 border-white/10 text-white rounded-xl min-h-[100px] transition-colors duration-200 focus-visible:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="popup-coupon" className="text-slate-300 font-bold">
                  Coupon Code
                </Label>
                <Input
                  id="popup-coupon"
                  value={formData.coupon_code}
                  onChange={(e) => patch({ coupon_code: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. SAVE20"
                />
              </div>
              <div className="space-y-2 flex flex-col justify-end">
                <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-white/10 min-h-11">
                  <Switch
                    id="popup-active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => patch({ is_active: checked })}
                    className="cursor-pointer"
                  />
                  <Label htmlFor="popup-active" className="text-sm font-bold cursor-pointer">
                    Active
                  </Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="popup-cta-text" className="text-slate-300 font-bold">
                  CTA Button Text
                </Label>
                <Input
                  id="popup-cta-text"
                  value={formData.cta_text}
                  onChange={(e) => patch({ cta_text: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. Claim Now"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="popup-cta-url" className="text-slate-300 font-bold">
                  CTA URL
                </Label>
                <Input
                  id="popup-cta-url"
                  type="url"
                  value={formData.cta_url}
                  onChange={(e) => patch({ cta_url: e.target.value })}
                  className={inputClass}
                  placeholder="https://…"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="popup-image-url" className="text-slate-300 font-bold">
                Popup Image URL
              </Label>
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <Input
                    id="popup-image-url"
                    value={formData.image_url}
                    onChange={(e) => patch({ image_url: e.target.value })}
                    className={inputClass}
                    placeholder="https://…"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsGalleryOpen(true)}
                  className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white rounded-xl min-h-11 cursor-pointer transition-colors duration-200"
                >
                  <ImageIcon className="w-4 h-4 mr-2" aria-hidden="true" /> Gallery
                </Button>
              </div>
              <MediaUpload
                key={popup?.id ?? "new-popup"}
                currentUrl={formData.image_url}
                onUploadComplete={(url) => patch({ image_url: url })}
                path="popups"
                label="Direct Upload"

                accept={ACCEPTED_IMAGE_TYPES}
              />
            </div>
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
              className="rounded-xl border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white min-h-11 cursor-pointer transition-colors duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 rounded-xl px-8 font-bold min-h-11 cursor-pointer transition-colors duration-200"
            >
              {mutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>

        <MediaGallery
          open={isGalleryOpen}
          onOpenChange={setIsGalleryOpen}

          onSelect={(url) => {
            if (isVideoUrl(url)) {
              toast.error("Pick an image for the popup", {
                description: "Video cannot be shown here. Choose a JPG, PNG, WebP or GIF.",
              });
              return;
            }
            patch({ image_url: url });
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

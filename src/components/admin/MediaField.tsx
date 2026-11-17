import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { isVideoUrl } from "@/lib/storage";
import { ACCEPTED_UPLOAD_TYPES, allowedTypesFromAccept } from "@/utils/media-optimization";

import { MediaGallery } from "./MediaGallery";
import { MediaUpload } from "./MediaUpload";

interface MediaFieldProps {
  onChange: (url: string) => void;
  currentUrl?: string | null | undefined;

  path: string;
  label?: string;

  accept?: string;

  pickerTitle?: string;
}

export function MediaField({
  onChange,
  currentUrl,
  path,
  label = "Media",
  accept = ACCEPTED_UPLOAD_TYPES,
  pickerTitle,
}: MediaFieldProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const allowsVideo = allowedTypesFromAccept(accept).some((type) => type.startsWith("video/"));

  const handleSelect = (url: string): void => {
    if (!allowsVideo && isVideoUrl(url)) {
      toast.error(`Pick an image for the ${label.toLowerCase()}`, {
        description: "Video cannot be shown here. Choose a JPG, PNG, WebP or GIF.",
      });
      return;
    }
    onChange(url);
  };

  return (
    <div className="space-y-3">
      <MediaUpload
        onUploadComplete={onChange}
        currentUrl={currentUrl}
        path={path}
        label={label}
        accept={accept}
      />

      <Button
        type="button"
        variant="outline"
        onClick={() => setIsPickerOpen(true)}
        className="w-full rounded-xl border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white min-h-11 cursor-pointer transition-colors duration-200"
      >
        <ImageIcon className="w-4 h-4 mr-2" aria-hidden="true" />
        Or choose from the media library
      </Button>

      {isPickerOpen && (
        <MediaGallery
          open
          onOpenChange={setIsPickerOpen}
          onSelect={handleSelect}
          {...(pickerTitle === undefined ? {} : { title: pickerTitle })}
        />
      )}
    </div>
  );
}

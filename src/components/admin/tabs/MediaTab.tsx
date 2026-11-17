import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MediaGallery } from "../MediaGallery";
import { getErrorMessage } from "../admin-utils";

export function MediaTab() {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const copyUrl = async (url: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied to the clipboard");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Could not copy the URL — copy it manually instead"));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter">Media Library</h2>
          <p className="text-sm font-medium text-slate-300 mt-1">
            Upload, inspect usage, and delete assets.
          </p>
        </div>
        <Button
          onClick={() => setIsGalleryOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6 font-bold min-h-11 cursor-pointer transition-colors duration-200"
        >
          <ImageIcon className="w-4 h-4 mr-2" aria-hidden="true" /> Open Gallery
        </Button>
      </div>

      <Card className="border-white/5 bg-slate-900/50 p-12 rounded-[2rem] text-center">
        <ImageIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" aria-hidden="true" />
        <h3 className="text-xl font-black text-white mb-2 tracking-tighter">Manage Your Assets</h3>
        <p className="text-slate-300 font-bold max-w-md mx-auto mb-8">
          Upload, view, and organise your images, videos, and GIFs in one central place. Deleting an
          asset removes the underlying file from storage as well.
        </p>
        <Button
          onClick={() => setIsGalleryOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 rounded-xl px-8 py-6 text-lg font-black cursor-pointer transition-colors duration-200"
        >
          Launch Media Library
        </Button>
      </Card>

      <MediaGallery
        open={isGalleryOpen}
        onOpenChange={setIsGalleryOpen}
        onSelect={(url) => void copyUrl(url)}
      />
    </div>
  );
}

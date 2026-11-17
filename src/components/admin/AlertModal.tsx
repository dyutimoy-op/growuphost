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
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { NewsAlertInsert, NewsAlertRow } from "./admin-types";
import { invalidateEntity } from "./admin-invalidation";
import { emptyToNull, getErrorMessage } from "./admin-utils";

interface AlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert?: NewsAlertRow | null | undefined;
}

interface AlertFormState {
  content: string;
  badge_text: string;
  link_url: string;
  is_active: boolean;
}

const EMPTY_FORM: AlertFormState = {
  content: "",
  badge_text: "",
  link_url: "",
  is_active: true,
};

export function AlertModal({ open, onOpenChange, alert }: AlertModalProps) {
  const [formData, setFormData] = useState<AlertFormState>(EMPTY_FORM);
  const [contentError, setContentError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    setContentError(null);
    if (alert) {
      setFormData({
        content: alert.content,
        badge_text: alert.badge_text ?? "",
        link_url: alert.link_url ?? "",
        is_active: alert.is_active !== false,
      });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [alert, open]);

  const patch = (changes: Partial<AlertFormState>): void => {
    setFormData((previous) => ({ ...previous, ...changes }));
  };

  const mutation = useMutation({
    mutationFn: async (payload: NewsAlertInsert) => {
      if (alert?.id) {
        const { error } = await supabase.from("news_alerts").update(payload).eq("id", alert.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("news_alerts").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      void invalidateEntity(queryClient, "news");
      toast.success(alert ? "Alert updated" : "Alert created");
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Could not save the alert"));
    },
  });

  const handleSubmit = (event: FormEvent): void => {
    event.preventDefault();

    const content = formData.content.trim();
    if (content.length === 0) {
      setContentError("Alert content is required.");
      return;
    }
    setContentError(null);

    mutation.mutate({
      content,
      badge_text: emptyToNull(formData.badge_text),
      link_url: emptyToNull(formData.link_url),
      is_active: formData.is_active,
    });
  };

  const inputClass =
    "bg-slate-950 border-white/10 text-white rounded-xl min-h-11 transition-colors duration-200 focus-visible:border-blue-500";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tighter">
            {alert ? "Edit Alert" : "Add New Alert"}
          </DialogTitle>
          <DialogDescription className="text-slate-400 font-medium">
            The active alert appears in the site-wide banner.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alert-content" className="text-slate-300 font-bold">
                Alert Content
              </Label>
              <Input
                id="alert-content"
                value={formData.content}
                onChange={(e) => patch({ content: e.target.value })}
                className={inputClass}
                placeholder="e.g. Flash Sale: 50% off VPS!"
                aria-invalid={contentError !== null}
                aria-describedby={contentError ? "alert-content-error" : undefined}
                required
              />
              {contentError && (
                <p id="alert-content-error" role="alert" className="text-xs font-bold text-red-400">
                  {contentError}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="alert-badge" className="text-slate-300 font-bold">
                  Badge Text
                </Label>
                <Input
                  id="alert-badge"
                  value={formData.badge_text}
                  onChange={(e) => patch({ badge_text: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. NEW"
                  aria-describedby="alert-badge-help"
                />
                <p id="alert-badge-help" className="text-xs font-medium text-slate-300">
                  Short label shown before the message. Defaults to INFO.
                </p>
              </div>
              <div className="space-y-2 flex flex-col justify-end">
                <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-white/10 min-h-11">
                  <Switch
                    id="alert-active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => patch({ is_active: checked })}
                    className="cursor-pointer"
                  />
                  <Label htmlFor="alert-active" className="text-sm font-bold cursor-pointer">
                    Active
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alert-link" className="text-slate-300 font-bold">
                Link URL (optional)
              </Label>
              <Input
                id="alert-link"
                type="url"
                value={formData.link_url}
                onChange={(e) => patch({ link_url: e.target.value })}
                className={inputClass}
                placeholder="https://…"
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
      </DialogContent>
    </Dialog>
  );
}

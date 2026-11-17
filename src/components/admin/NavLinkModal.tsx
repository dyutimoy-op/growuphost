import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { NAV_LINK_PLACEMENTS, newNavLinkId, type NavLinkPlacement } from "@/config/nav-links";
import { mutateNavLinks } from "@/lib/nav-links.functions";

import type { NavLinkRow } from "./admin-types";
import { invalidateEntity } from "./admin-invalidation";
import { getErrorMessage } from "./admin-utils";

interface NavLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  navLink?: NavLinkRow | null | undefined;
}

interface NavLinkFormState {
  label: string;
  url: string;
  placement: NavLinkPlacement;
  open_in_new_tab: boolean;
  display_order: string;
  is_active: boolean;
}

const EMPTY_FORM: NavLinkFormState = {
  label: "",
  url: "",
  placement: "both",
  open_in_new_tab: false,
  display_order: "0",
  is_active: true,
};

const PLACEMENT_OPTIONS: ReadonlyArray<{ value: NavLinkPlacement; label: string }> = [
  { value: "both", label: "Header and footer" },
  { value: "header", label: "Header only" },
  { value: "footer", label: "Footer only" },

  { value: "topbar", label: "Top bar only (thin purple strip)" },
];

function asPlacement(value: string): NavLinkPlacement {
  return NAV_LINK_PLACEMENTS.find((placement) => placement === value) ?? "both";
}

function navLinkUrlError(raw: string): string | null {
  const url = raw.trim();
  if (url.length === 0) return "A URL is required.";

  const absolute = /^(https?:\/\/|mailto:|tel:)\S+$/i.test(url);

  const relative = url === "/" || /^[/#?][^/]/.test(url);

  if (absolute || relative) return null;
  return "Use a full https:// URL, a mailto:/tel: link, or a path that starts with /.";
}

function parseDisplayOrder(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return 0;
  if (!/^\d+$/.test(trimmed)) return undefined;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

export function NavLinkModal({ open, onOpenChange, navLink }: NavLinkModalProps) {
  const [formData, setFormData] = useState<NavLinkFormState>(EMPTY_FORM);
  const [labelError, setLabelError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    setLabelError(null);
    setUrlError(null);
    setOrderError(null);
    if (navLink) {
      setFormData({
        label: navLink.label,
        url: navLink.url,
        placement: navLink.placement,
        open_in_new_tab: navLink.open_in_new_tab,
        display_order: String(navLink.display_order),
        is_active: navLink.is_active,
      });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [navLink, open]);

  const patch = (changes: Partial<NavLinkFormState>): void => {
    setFormData((previous) => ({ ...previous, ...changes }));
  };

  const mutation = useMutation({
    mutationFn: async (link: NavLinkRow) => {
      await mutateNavLinks({ data: { kind: "upsert", link } });
    },
    onSuccess: () => {
      void invalidateEntity(queryClient, "navLinks");
      toast.success(navLink ? "Link updated" : "Link created");
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Could not save the link"));
    },
  });

  const handleSubmit = (event: FormEvent): void => {
    event.preventDefault();

    const label = formData.label.trim();
    const nextLabelError = label.length === 0 ? "A link label is required." : null;
    const nextUrlError = navLinkUrlError(formData.url);
    const displayOrder = parseDisplayOrder(formData.display_order);
    const nextOrderError = displayOrder === undefined ? "Use a whole number, 0 or higher." : null;

    setLabelError(nextLabelError);
    setUrlError(nextUrlError);
    setOrderError(nextOrderError);
    if (nextLabelError || nextUrlError || displayOrder === undefined) return;

    mutation.mutate({
      id: navLink?.id ?? newNavLinkId(),
      label,
      url: formData.url.trim(),
      placement: formData.placement,
      open_in_new_tab: formData.open_in_new_tab,
      display_order: displayOrder,
      is_active: formData.is_active,
    });
  };

  const inputClass =
    "bg-slate-950 border-white/10 text-white rounded-xl min-h-11 transition-colors duration-200 focus-visible:border-blue-500";
  const selectClass =
    "bg-slate-950 border-white/10 text-white rounded-xl min-h-11 cursor-pointer w-full";
  const switchRowClass =
    "flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-white/10 min-h-11";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tighter">
            {navLink ? "Edit Link" : "Add New Link"}
          </DialogTitle>
          <DialogDescription className="text-slate-400 font-medium">
            Appears as a text link beside Packages and Contact — not as a button, so the two account
            buttons stay the loudest thing in the header.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nav-link-label" className="text-slate-300 font-bold">
                Link Text
              </Label>
              <Input
                id="nav-link-label"
                value={formData.label}
                onChange={(e) => patch({ label: e.target.value })}
                className={inputClass}
                placeholder="e.g. Affiliates"
                aria-invalid={labelError !== null}
                aria-describedby={labelError ? "nav-link-label-error" : undefined}
                required
              />
              {labelError && (
                <p
                  id="nav-link-label-error"
                  role="alert"
                  className="text-xs font-bold text-red-400"
                >
                  {labelError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nav-link-url" className="text-slate-300 font-bold">
                Destination
              </Label>

              <Input
                id="nav-link-url"
                value={formData.url}
                onChange={(e) => patch({ url: e.target.value })}
                className={inputClass}
                placeholder="/packages or https://…"
                aria-invalid={urlError !== null}
                aria-describedby={
                  urlError ? "nav-link-url-help nav-link-url-error" : "nav-link-url-help"
                }
                required
              />
              <p id="nav-link-url-help" className="text-xs font-medium text-slate-300">
                A path on this site (<code className="text-slate-200">/about</code>) or a full
                external URL. Paths this site routes are followed without a page reload.
              </p>
              {urlError && (
                <p id="nav-link-url-error" role="alert" className="text-xs font-bold text-red-400">
                  {urlError}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nav-link-placement" className="text-slate-300 font-bold">
                  Where It Shows
                </Label>
                <Select
                  value={formData.placement}
                  onValueChange={(value) => patch({ placement: asPlacement(value) })}
                >
                  <SelectTrigger id="nav-link-placement" className={selectClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-slate-900 text-white">
                    {PLACEMENT_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-sm font-bold"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nav-link-order" className="text-slate-300 font-bold">
                  Order
                </Label>
                <Input
                  id="nav-link-order"
                  inputMode="numeric"
                  value={formData.display_order}
                  onChange={(e) => patch({ display_order: e.target.value })}
                  className={inputClass}
                  placeholder="0"
                  aria-invalid={orderError !== null}
                  aria-describedby={
                    orderError ? "nav-link-order-help nav-link-order-error" : "nav-link-order-help"
                  }
                />
                <p id="nav-link-order-help" className="text-xs font-medium text-slate-300">
                  Lowest first. Ties fall back to alphabetical.
                </p>
                {orderError && (
                  <p
                    id="nav-link-order-error"
                    role="alert"
                    className="text-xs font-bold text-red-400"
                  >
                    {orderError}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={switchRowClass}>
                <Switch
                  id="nav-link-active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => patch({ is_active: checked })}
                  className="cursor-pointer"
                />
                <Label htmlFor="nav-link-active" className="text-sm font-bold cursor-pointer">
                  Active
                </Label>
              </div>
              <div className={switchRowClass}>
                <Switch
                  id="nav-link-new-tab"
                  checked={formData.open_in_new_tab}
                  onCheckedChange={(checked) => patch({ open_in_new_tab: checked })}
                  className="cursor-pointer"
                />
                <Label htmlFor="nav-link-new-tab" className="text-sm font-bold cursor-pointer">
                  Open in a new tab
                </Label>
              </div>
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

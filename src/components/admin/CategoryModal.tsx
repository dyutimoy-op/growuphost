import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { MediaField } from "@/components/admin/MediaField";
import { mediaKindFromUrl } from "@/lib/storage";
import type { CategoryInsert, CategoryRow } from "./admin-types";
import { invalidateEntity } from "./admin-invalidation";
import { emptyToNull, getErrorMessage } from "./admin-utils";

const NO_PARENT = "none";

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: CategoryRow | null | undefined;
  allCategories?: CategoryRow[] | undefined;
}

interface CategoryFormState {
  name: string;
  slug: string;
  description: string;
  parent_id: string;
  show_in_nav: boolean;
  display_order: string;
  background_media_url: string;
  seo_title: string;
  seo_description: string;
}

const EMPTY_FORM: CategoryFormState = {
  name: "",
  slug: "",
  description: "",
  parent_id: NO_PARENT,
  show_in_nav: true,
  display_order: "0",
  background_media_url: "",
  seo_title: "",
  seo_description: "",
};

function toFormState(category: CategoryRow): CategoryFormState {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    parent_id: category.parent_id ?? NO_PARENT,

    show_in_nav: category.show_in_nav === true,
    display_order: category.display_order === null ? "0" : String(category.display_order),
    background_media_url: category.background_media_url ?? "",
    seo_title: category.seo_title ?? "",
    seo_description: category.seo_description ?? "",
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type FieldErrors = Partial<Record<"name" | "slug", string>>;

export function CategoryModal({ open, onOpenChange, category, allCategories }: CategoryModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CategoryFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    setErrors({});
    if (category) {
      setFormData(toFormState(category));
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [category, open]);

  const patch = (changes: Partial<CategoryFormState>): void => {
    setFormData((previous) => ({ ...previous, ...changes }));
  };

  const mutation = useMutation({
    mutationFn: async (payload: CategoryInsert) => {
      if (category?.id) {
        const { error } = await supabase.from("categories").update(payload).eq("id", category.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      void invalidateEntity(queryClient, "categories");
      toast.success(category ? "Category updated" : "Category created");
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Could not save the category"));
    },
  });

  const handleSave = (): void => {
    const nextErrors: FieldErrors = {};

    const name = formData.name.trim();
    if (name.length === 0) nextErrors.name = "A category name is required.";

    const slug = slugify(formData.slug.trim().length > 0 ? formData.slug : name);
    if (slug.length === 0) {
      nextErrors.slug = "Enter a URL slug using letters, numbers and dashes.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    const displayOrder = Number.parseInt(formData.display_order.trim(), 10);
    const backgroundMediaUrl = emptyToNull(formData.background_media_url);

    mutation.mutate({
      name,
      slug,
      description: emptyToNull(formData.description),

      parent_id: formData.parent_id === NO_PARENT ? null : formData.parent_id,
      show_in_nav: formData.show_in_nav,
      display_order: Number.isFinite(displayOrder) ? displayOrder : 0,
      background_media_url: backgroundMediaUrl,

      background_media_type:
        backgroundMediaUrl === null ? null : mediaKindFromUrl(backgroundMediaUrl),
      seo_title: emptyToNull(formData.seo_title),
      seo_description: emptyToNull(formData.seo_description),
    });
  };

  const parentOptions = (allCategories ?? []).filter((option) => option.id !== category?.id);
  const inputClass =
    "bg-slate-950 border-white/10 text-white rounded-xl min-h-11 transition-colors duration-200 focus-visible:border-blue-500";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg overflow-y-auto rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tighter">
            {category ? "Edit Category" : "Add New Category"}
          </DialogTitle>
          <DialogDescription className="text-slate-400 font-medium">
            Categories become public pages and drive the site navigation.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category-name" className="text-slate-300 font-bold">
                Name
              </Label>
              <Input
                id="category-name"
                value={formData.name}
                onChange={(e) => patch({ name: e.target.value })}
                className={inputClass}
                placeholder="Shared Hosting"
                aria-invalid={errors.name !== undefined}
                aria-describedby={errors.name ? "category-name-error" : undefined}
              />
              {errors.name && (
                <p id="category-name-error" role="alert" className="text-xs font-bold text-red-400">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-slug" className="text-slate-300 font-bold">
                URL Slug
              </Label>

              <Input
                id="category-slug"
                value={formData.slug}
                onChange={(e) => patch({ slug: e.target.value })}
                onBlur={(e) => patch({ slug: slugify(e.target.value) })}
                className={inputClass}
                placeholder="shared-hosting"
                aria-invalid={errors.slug !== undefined}
                aria-describedby={
                  errors.slug ? "category-slug-help category-slug-error" : "category-slug-help"
                }
              />
              <p id="category-slug-help" className="text-xs text-slate-300 font-medium">
                The public page address. Left blank, it is generated from the name.
              </p>
              {errors.slug && (
                <p id="category-slug-error" role="alert" className="text-xs font-bold text-red-400">
                  {errors.slug}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-description" className="text-slate-300 font-bold">
              Description
            </Label>
            <Textarea
              id="category-description"
              value={formData.description}
              onChange={(e) => patch({ description: e.target.value })}
              className="bg-slate-950 border-white/10 text-white rounded-xl h-20 transition-colors duration-200 focus-visible:border-blue-500"
              placeholder="Shown as the intro copy on the category page."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category-seo-title" className="text-slate-300 font-bold">
                SEO Title
              </Label>
              <Input
                id="category-seo-title"
                value={formData.seo_title}
                onChange={(e) => patch({ seo_title: e.target.value })}
                className={inputClass}
                placeholder="Shared Hosting Plans | GROWUPHOST"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-seo-description" className="text-slate-300 font-bold">
                SEO Description
              </Label>
              <Input
                id="category-seo-description"
                value={formData.seo_description}
                onChange={(e) => patch({ seo_description: e.target.value })}
                className={inputClass}
                placeholder="Meta description for search results"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-parent" className="text-slate-300 font-bold">
              Parent Category
            </Label>
            <Select
              value={formData.parent_id}
              onValueChange={(value) => patch({ parent_id: value })}
            >
              <SelectTrigger id="category-parent" className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-white">
                <SelectItem value={NO_PARENT} className="focus:bg-blue-600 cursor-pointer">
                  None (Root Category)
                </SelectItem>
                {parentOptions.map((option) => (
                  <SelectItem
                    key={option.id}
                    value={option.id}
                    className="focus:bg-blue-600 cursor-pointer"
                  >
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-300 font-medium">
              Root categories appear in the main navigation; subcategories nest underneath their
              parent.
            </p>
          </div>

          <MediaField
            key={category?.id ?? "new-category"}
            label="Banner Media"
            currentUrl={formData.background_media_url}
            path="categories"
            pickerTitle="Choose banner media"
            onChange={(url) => patch({ background_media_url: url })}
          />

          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/50 p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <Switch
                id="category-show-in-nav"
                checked={formData.show_in_nav}
                onCheckedChange={(checked) => patch({ show_in_nav: checked })}
                className="cursor-pointer"
              />
              <Label htmlFor="category-show-in-nav" className="text-white font-bold cursor-pointer">
                Show in Navigation
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="category-order" className="text-slate-300 text-sm font-bold">
                Order
              </Label>
              <Input
                id="category-order"
                type="number"
                step="1"
                value={formData.display_order}
                onChange={(e) => patch({ display_order: e.target.value })}
                className="bg-slate-950 border-white/10 text-white w-24 h-11 rounded-xl"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
            className="text-slate-300 hover:text-white hover:bg-white/5 rounded-xl font-bold min-h-11 cursor-pointer transition-colors duration-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={mutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 font-black rounded-xl px-8 min-h-11 cursor-pointer transition-colors duration-200"
          >
            {mutation.isPending ? "Saving…" : "Save Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

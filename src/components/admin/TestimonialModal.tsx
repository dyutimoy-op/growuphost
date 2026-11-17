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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MediaField } from "./MediaField";
import { ACCEPTED_IMAGE_TYPES } from "@/utils/media-optimization";
import type { TestimonialInsert, TestimonialRow } from "./admin-types";
import { invalidateEntity } from "./admin-invalidation";
import { emptyToNull, getErrorMessage } from "./admin-utils";

interface TestimonialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonial?: TestimonialRow | null | undefined;
}

interface TestimonialFormState {
  name: string;
  role: string;
  content: string;
  rating: string;
  avatar_url: string;
}

const EMPTY_FORM: TestimonialFormState = {
  name: "",
  role: "",
  content: "",
  rating: "5",
  avatar_url: "",
};

export function TestimonialModal({ open, onOpenChange, testimonial }: TestimonialModalProps) {
  const [formData, setFormData] = useState<TestimonialFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<"name" | "content" | "rating", string>>>({});
  const queryClient = useQueryClient();

  useEffect(() => {
    setErrors({});
    if (testimonial) {
      setFormData({
        name: testimonial.name,
        role: testimonial.role ?? "",
        content: testimonial.content,
        rating: testimonial.rating === null ? "5" : String(testimonial.rating),
        avatar_url: testimonial.avatar_url ?? "",
      });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [testimonial, open]);

  const patch = (changes: Partial<TestimonialFormState>): void => {
    setFormData((previous) => ({ ...previous, ...changes }));
  };

  const mutation = useMutation({
    mutationFn: async (payload: TestimonialInsert) => {
      if (testimonial?.id) {
        const { error } = await supabase
          .from("testimonials")
          .update(payload)
          .eq("id", testimonial.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("testimonials").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      void invalidateEntity(queryClient, "testimonials");
      toast.success(testimonial ? "Testimonial updated" : "Testimonial added");
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Could not save the testimonial"));
    },
  });

  const handleSubmit = (event: FormEvent): void => {
    event.preventDefault();

    const nextErrors: Partial<Record<"name" | "content" | "rating", string>> = {};
    const name = formData.name.trim();
    const content = formData.content.trim();
    const rating = Number.parseInt(formData.rating.trim(), 10);

    if (name.length === 0) nextErrors.name = "A customer name is required.";
    if (content.length === 0) nextErrors.content = "The review text is required.";
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      nextErrors.rating = "Enter a whole number from 1 to 5.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    mutation.mutate({
      name,
      role: emptyToNull(formData.role),
      content,
      rating,
      avatar_url: emptyToNull(formData.avatar_url),
    });
  };

  const inputClass =
    "bg-slate-950 border-white/10 text-white rounded-xl min-h-11 transition-colors duration-200 focus-visible:border-blue-500";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg overflow-y-auto rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tighter">
            {testimonial ? "Edit Testimonial" : "Add New Testimonial"}
          </DialogTitle>
          <DialogDescription className="text-slate-400 font-medium">
            Reviews shown on the public homepage.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="testimonial-name" className="text-slate-300 font-bold">
                  Customer Name
                </Label>
                <Input
                  id="testimonial-name"
                  value={formData.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  className={inputClass}
                  aria-invalid={errors.name !== undefined}
                  aria-describedby={errors.name ? "testimonial-name-error" : undefined}
                  required
                />
                {errors.name && (
                  <p
                    id="testimonial-name-error"
                    role="alert"
                    className="text-xs font-bold text-red-400"
                  >
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="testimonial-role" className="text-slate-300 font-bold">
                  Role / Company
                </Label>
                <Input
                  id="testimonial-role"
                  value={formData.role}
                  onChange={(e) => patch({ role: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. CEO, Tech Corp"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="testimonial-rating" className="text-slate-300 font-bold">
                Rating (1–5)
              </Label>
              <Input
                id="testimonial-rating"
                type="number"
                min="1"
                max="5"
                step="1"
                value={formData.rating}
                onChange={(e) => patch({ rating: e.target.value })}
                className={inputClass}
                aria-invalid={errors.rating !== undefined}
                aria-describedby={errors.rating ? "testimonial-rating-error" : undefined}
              />
              {errors.rating && (
                <p
                  id="testimonial-rating-error"
                  role="alert"
                  className="text-xs font-bold text-red-400"
                >
                  {errors.rating}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="testimonial-content" className="text-slate-300 font-bold">
                Testimonial Content
              </Label>
              <Textarea
                id="testimonial-content"
                value={formData.content}
                onChange={(e) => patch({ content: e.target.value })}
                className="bg-slate-950 border-white/10 text-white rounded-xl min-h-[100px] transition-colors duration-200 focus-visible:border-blue-500"
                aria-invalid={errors.content !== undefined}
                aria-describedby={errors.content ? "testimonial-content-error" : undefined}
                required
              />
              {errors.content && (
                <p
                  id="testimonial-content-error"
                  role="alert"
                  className="text-xs font-bold text-red-400"
                >
                  {errors.content}
                </p>
              )}
            </div>

            <MediaField
              key={testimonial?.id ?? "new-testimonial"}
              currentUrl={formData.avatar_url}
              onChange={(url) => patch({ avatar_url: url })}
              path="avatars"
              label="Avatar Image"
              pickerTitle="Choose an avatar"

              accept={ACCEPTED_IMAGE_TYPES}
            />
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

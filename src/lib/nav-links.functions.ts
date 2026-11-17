import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { NAV_LINK_PLACEMENTS, type NavLinkRecord } from "@/config/nav-links";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MAX_LINKS = 200;
const MAX_LABEL_LENGTH = 120;
const MAX_URL_LENGTH = 2048;
const MAX_IDS_PER_BATCH = MAX_LINKS;

const idSchema = z
  .string()
  .trim()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9._:-]+$/, "Ids may use letters, digits, dot, underscore, colon and hyphen.");

const linkSchema = z.object({
  id: idSchema,
  label: z.string().trim().min(1).max(MAX_LABEL_LENGTH),
  url: z.string().trim().min(1).max(MAX_URL_LENGTH),
  placement: z.enum(NAV_LINK_PLACEMENTS),
  open_in_new_tab: z.boolean(),

  display_order: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
  is_active: z.boolean(),
});

const idsSchema = z.array(idSchema).min(1).max(MAX_IDS_PER_BATCH);

const mutationSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("upsert"), link: linkSchema }),
  z.object({ kind: z.literal("delete"), ids: idsSchema }),
  z.object({ kind: z.literal("setActive"), ids: idsSchema, isActive: z.boolean() }),
]);

export type NavLinkMutation = z.infer<typeof mutationSchema>;

export const getNavLinks = createServerFn({ method: "GET" }).handler(
  async (): Promise<NavLinkRecord[]> => {
    const { readNavLinks } = await import("./nav-links.server");
    return readNavLinks();
  },
);

export const mutateNavLinks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(mutationSchema)
  .handler(async ({ data }): Promise<NavLinkRecord[]> => {
    const { writeNavLinks } = await import("./nav-links.server");

    return writeNavLinks((current) => {
      if (data.kind === "upsert") {
        const { link } = data;
        const without = current.filter((existing) => existing.id !== link.id);

        if (without.length === current.length && without.length >= MAX_LINKS) {
          throw new Error(
            `This site already has the maximum of ${MAX_LINKS} extra navigation links. Delete one before adding another.`,
          );
        }
        return [...without, link];
      }

      if (data.kind === "delete") {
        const doomed = new Set(data.ids);
        return current.filter((link) => !doomed.has(link.id));
      }

      const targeted = new Set(data.ids);
      return current.map((link) =>
        targeted.has(link.id) ? { ...link, is_active: data.isActive } : link,
      );
    });
  });

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const mediaUrlSchema = z.string().trim().min(1).max(2048);

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

function containsPattern(url: string): string {
  return `%${escapeLikePattern(url)}%`;
}

function assertNoReadError(error: { message: string } | null, what: string): void {
  if (error) {
    throw new Error(`Could not check ${what} for this media URL: ${error.message}`);
  }
}

export const getMediaUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ url: mediaUrlSchema }))
  .handler(async ({ data: { url }, context }) => {
    const { supabase } = context;

    const [products, categories, popups, testimonials] = await Promise.all([
      supabase.from("products").select("id, name").ilike("description", containsPattern(url)),
      supabase.from("categories").select("id, name").eq("background_media_url", url),
      supabase.from("promo_popups").select("id, title").eq("image_url", url),
      supabase.from("testimonials").select("id, name").eq("avatar_url", url),
    ]);

    assertNoReadError(products.error, "products");
    assertNoReadError(categories.error, "categories");
    assertNoReadError(popups.error, "promo popups");
    assertNoReadError(testimonials.error, "testimonials");

    return {
      products: products.data ?? [],
      categories: categories.data ?? [],
      popups: popups.data ?? [],
      testimonials: testimonials.data ?? [],
    };
  });

function assertNoError(error: { message: string } | null, what: string): void {
  if (error) {
    throw new Error(`Failed to update ${what}: ${error.message}`);
  }
}

export const replaceMediaUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ oldUrl: mediaUrlSchema, newUrl: mediaUrlSchema }))
  .handler(async ({ data: { oldUrl, newUrl }, context }) => {
    const { supabase } = context;

    if (oldUrl === newUrl) {
      return {
        success: true,
        replaced: { products: 0, categories: 0, popups: 0, testimonials: 0 },
      };
    }

    const { data: productRows, error: productsReadError } = await supabase
      .from("products")
      .select("id, description")
      .ilike("description", containsPattern(oldUrl));

    if (productsReadError) {
      throw new Error(`Failed to read products: ${productsReadError.message}`);
    }

    let productsReplaced = 0;
    for (const product of productRows ?? []) {
      const { description } = product;
      if (!description) continue;

      const rewritten = description.replaceAll(oldUrl, newUrl);
      if (rewritten === description) continue;

      const { error } = await supabase
        .from("products")
        .update({ description: rewritten })
        .eq("id", product.id);

      assertNoError(error, "products");
      productsReplaced += 1;
    }

    const { data: categoryRows, error: categoriesError } = await supabase
      .from("categories")
      .update({ background_media_url: newUrl })
      .eq("background_media_url", oldUrl)
      .select("id");
    assertNoError(categoriesError, "categories");

    const { data: popupRows, error: popupsError } = await supabase
      .from("promo_popups")
      .update({ image_url: newUrl })
      .eq("image_url", oldUrl)
      .select("id");
    assertNoError(popupsError, "promo popups");

    const { data: testimonialRows, error: testimonialsError } = await supabase
      .from("testimonials")
      .update({ avatar_url: newUrl })
      .eq("avatar_url", oldUrl)
      .select("id");
    assertNoError(testimonialsError, "testimonials");

    return {
      success: true,
      replaced: {
        products: productsReplaced,
        categories: categoryRows?.length ?? 0,
        popups: popupRows?.length ?? 0,
        testimonials: testimonialRows?.length ?? 0,
      },
    };
  });

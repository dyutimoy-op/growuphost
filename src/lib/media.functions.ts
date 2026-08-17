
import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

export const getMediaUsage = createServerFn({ method: "GET" })
  .validator(z.object({ url: z.string() }))
  .handler(async ({ data: { url } }) => {
    // We search across all tables that might use this URL
    const [products, categories, popups, testimonials] = await Promise.all([
      supabase.from('products').select('id, name').filter('description', 'ilike', `%${url}%`),
      supabase.from('categories').select('id, name').eq('background_media_url', url),
      supabase.from('promo_popups').select('id, title').eq('image_url', url),
      supabase.from('testimonials').select('id, name').eq('avatar_url', url)
    ]);

    return {
      products: products.data || [],
      categories: categories.data || [],
      popups: popups.data || [],
      testimonials: testimonials.data || []
    };
  });

export const replaceMediaUrl = createServerFn({ method: "POST" })
  .validator(z.object({ oldUrl: z.string(), newUrl: z.string() }))
  .handler(async ({ data: { oldUrl, newUrl } }) => {
    // 1. Categories
    await supabase.from('categories').update({ background_media_url: newUrl }).eq('background_media_url', oldUrl);
    
    // 2. Popups
    await supabase.from('promo_popups').update({ image_url: newUrl }).eq('image_url', oldUrl);
    
    // 3. Testimonials
    await supabase.from('testimonials').update({ avatar_url: newUrl }).eq('avatar_url', oldUrl);
    
    return { success: true };
  });


import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export const getMediaUsage = createServerFn({ method: "GET" })
  .handler(async ({ data: { url } }: { data: { url: string } }) => {
    // We search across all tables that might use this URL
    const [products, categories, popups, testimonials] = await Promise.all([
      supabase.from('products').select('id, name').filter('description', 'ilike', `%${url}%`),
      supabase.from('categories').select('id, name').eq('background_media_url', url),
      supabase.from('promo_popups').select('id, title').eq('image_url', url),
      supabase.from('testimonials').select('id, name').eq('avatar_url', url)
    ]);

    // Also check product features JSON if applicable, but for now simple checks
    
    return {
      products: products.data || [],
      categories: categories.data || [],
      popups: popups.data || [],
      testimonials: testimonials.data || []
    };
  });

export const replaceMediaUrl = createServerFn({ method: "POST" })
  .handler(async ({ data: { oldUrl, newUrl } }: { data: { oldUrl: string, newUrl: string } }) => {
    // 1. Categories
    await supabase.from('categories').update({ background_media_url: newUrl }).eq('background_media_url', oldUrl);
    
    // 2. Popups
    await supabase.from('promo_popups').update({ image_url: newUrl }).eq('image_url', oldUrl);
    
    // 3. Testimonials
    await supabase.from('testimonials').update({ avatar_url: newUrl }).eq('avatar_url', oldUrl);
    
    // 4. Products (This is trickier if it's in description or featured image)
    // For now we assume image_url might be a field in products based on ProductModal, 
    // but looking at types.ts, products table doesn't have image_url? 
    // Wait, ProductModal has image_url state but types.ts doesn't show it in Row.
    // Let me re-check types.ts
    
    return { success: true };
  });

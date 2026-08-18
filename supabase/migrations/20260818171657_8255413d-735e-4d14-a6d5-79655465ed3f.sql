ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS seo_description TEXT;

-- Update existing categories with some defaults if they don't have them
UPDATE public.categories SET seo_title = name || ' | GROWUPHOST' WHERE seo_title IS NULL;
UPDATE public.categories SET seo_description = description WHERE seo_description IS NULL;

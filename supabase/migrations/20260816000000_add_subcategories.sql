ALTER TABLE public.categories ADD COLUMN parent_id uuid REFERENCES public.categories(id) ON DELETE CASCADE;

-- Update RLS policies just in case, though it's already there
-- We don't need to add a new policy if there's already one for all on categories for authenticated

-- Seed some settings if they don't exist
INSERT INTO public.site_settings (key, value) 
VALUES 
  ('hero_title', 'UNMATCHED PERFORMANCE'),
  ('hero_subtitle', 'Enterprise-grade hosting solutions with global reach.')
ON CONFLICT (key) DO NOTHING;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT SELECT ON public.categories TO anon;

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS show_in_nav BOOLEAN DEFAULT false;

-- Grant access to authenticated users since it's used in the admin panel
GRANT SELECT, UPDATE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.categories(id) ON DELETE CASCADE;

-- Grant permissions for subcategories
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT SELECT ON public.categories TO anon;

-- Add a display_order column if it doesn't exist for categories and products
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS display_order int DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS display_order int DEFAULT 0;

-- Ensure RLS is active
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Add policies if they don't exist (using DO blocks for safety)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Admins can manage categories') THEN
        CREATE POLICY "Admins can manage categories" ON public.categories
            FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Public can view categories') THEN
        CREATE POLICY "Public can view categories" ON public.categories
            FOR SELECT TO anon, authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Admins can manage products') THEN
        CREATE POLICY "Admins can manage products" ON public.products
            FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Public can view products') THEN
        CREATE POLICY "Public can view products" ON public.products
            FOR SELECT TO anon, authenticated USING (true);
    END IF;
END
$$;

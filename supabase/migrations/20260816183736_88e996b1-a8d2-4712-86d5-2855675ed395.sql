-- 1. Create testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT,
    content TEXT NOT NULL,
    avatar_url TEXT,
    rating INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
GRANT SELECT ON public.testimonials TO anon;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated users to manage testimonials') THEN
    CREATE POLICY "Allow authenticated users to manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public select on testimonials') THEN
    CREATE POLICY "Allow public select on testimonials" ON public.testimonials FOR SELECT TO anon USING (true);
  END IF;
END $$;

-- 2. Create promo_popups table
CREATE TABLE IF NOT EXISTS public.promo_popups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    coupon_code TEXT,
    cta_text TEXT DEFAULT 'Claim Offer',
    cta_url TEXT,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promo_popups TO authenticated;
GRANT ALL ON public.promo_popups TO service_role;
GRANT SELECT ON public.promo_popups TO anon;
ALTER TABLE public.promo_popups ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated users to manage popups') THEN
    CREATE POLICY "Allow authenticated users to manage popups" ON public.promo_popups FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public select on popups') THEN
    CREATE POLICY "Allow public select on popups" ON public.promo_popups FOR SELECT TO anon USING (true);
  END IF;
END $$;

-- 3. Add background_media_url to categories for custom banners
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='background_media_url') THEN
    ALTER TABLE public.categories ADD COLUMN background_media_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='background_media_type') THEN
    ALTER TABLE public.categories ADD COLUMN background_media_type TEXT DEFAULT 'image';
  END IF;
END $$;

-- 4. Add social links and contact info to site_settings
INSERT INTO public.site_settings (key, value) VALUES 
('contact_phone', '+91 1234567890'),
('contact_email', 'support@growuphost.com'),
('social_facebook', '#'),
('social_twitter', '#'),
('social_instagram', '#'),
('social_linkedin', '#'),
('banner_headline', 'UNMATCHED PERFORMANCE'),
('banner_subtext', 'Experience the power of enterprise-grade infrastructure.')
ON CONFLICT (key) DO NOTHING;
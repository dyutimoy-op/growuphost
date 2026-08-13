-- Create news_alerts table
CREATE TABLE public.news_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    badge_text TEXT DEFAULT 'NEWS',
    is_active BOOLEAN DEFAULT true,
    link_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Grant access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news_alerts TO authenticated;
GRANT ALL ON public.news_alerts TO service_role;
GRANT SELECT ON public.news_alerts TO anon;

-- Enable RLS
ALTER TABLE public.news_alerts ENABLE ROW LEVEL SECURITY;

-- Simple policies
CREATE POLICY "Public can view active news alerts" ON public.news_alerts
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage news alerts" ON public.news_alerts
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- Seed some initial data
INSERT INTO public.news_alerts (content, badge_text, is_active)
VALUES ('Independence Day Sale: 40% Off on all Hosting Plans!', 'PROMO', true);
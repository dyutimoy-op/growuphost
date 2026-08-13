CREATE TABLE IF NOT EXISTS public.news_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    badge_text TEXT,
    link_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT ON public.news_alerts TO anon, authenticated;
GRANT ALL ON public.news_alerts TO service_role;
ALTER TABLE public.news_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read news alerts" ON public.news_alerts
    FOR SELECT USING (true);

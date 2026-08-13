-- Create the site_settings table
CREATE TABLE public.site_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text UNIQUE NOT NULL,
    value text,
    created_at timestamptz DEFAULT now()
);

-- Initial settings
INSERT INTO public.site_settings (key, value) VALUES 
('company_name', 'GROWUPHOST'),
('login_url', '/auth'),
('register_url', '/auth'),
('hero_cta_url', '/'),
('offers_url', '/'),
('footer_partner_url', '/');

-- Grant access
GRANT SELECT ON public.site_settings TO authenticated;
GRANT SELECT ON public.site_settings TO anon;
GRANT ALL ON public.site_settings TO service_role;

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read access" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Allow admins to update" ON public.site_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Allow admins to insert" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

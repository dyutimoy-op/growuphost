-- Ensure categories exist
INSERT INTO public.categories (name, slug) VALUES 
('Shared Hosting', 'shared-hosting'),
('VPS Hosting', 'vps-hosting'),
('Dedicated Servers', 'dedicated-servers'),
('Cloud Licenses', 'licenses')
ON CONFLICT (slug) DO NOTHING;

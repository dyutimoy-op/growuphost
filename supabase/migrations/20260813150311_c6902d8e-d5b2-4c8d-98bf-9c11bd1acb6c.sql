-- Clear existing demo products to avoid confusion
DELETE FROM public.products;

-- Insert Shared Hosting Plans
INSERT INTO public.products (name, category_id, price, currency, features, is_featured) VALUES 
('Lite Start', (SELECT id FROM public.categories WHERE slug = 'shared-hosting'), 199, 'INR', '["1 Website", "10GB NVMe Storage", "Free SSL Certificate", "LiteSpeed Powered", "Daily Backups"]', false),
('Plus Pro', (SELECT id FROM public.categories WHERE slug = 'shared-hosting'), 499, 'INR', '["Unlimited Websites", "50GB NVMe Storage", "Free Domain", "LiteSpeed + LSCache", "Priority Support"]', true),
('Business Max', (SELECT id FROM public.categories WHERE slug = 'shared-hosting'), 999, 'INR', '["Unlimited Everything", "100GB NVMe Storage", "Dedicated IP", "Object Cache Pro", "VIP Support"]', false);

-- Insert VPS Hosting Plans
INSERT INTO public.products (name, category_id, price, currency, features, is_featured) VALUES 
('VPS-1', (SELECT id FROM public.categories WHERE slug = 'vps-hosting'), 1200, 'INR', '["2 vCPU Cores", "4GB DDR5 RAM", "80GB NVMe SSD", "10Gbps Uplink", "Full Root Access"]', false),
('VPS-2', (SELECT id FROM public.categories WHERE slug = 'vps-hosting'), 2400, 'INR', '["4 vCPU Cores", "8GB DDR5 RAM", "160GB NVMe SSD", "Dedicated IPv4", "Any OS Installation"]', true),
('VPS-3', (SELECT id FROM public.categories WHERE slug = 'vps-hosting'), 4800, 'INR', '["8 vCPU Cores", "16GB DDR5 RAM", "320GB NVMe SSD", "Weekly Snapshots", "Premium Support"]', false);

-- Insert Dedicated Servers
INSERT INTO public.products (name, category_id, price, currency, features, is_featured) VALUES 
('Xeon Node', (SELECT id FROM public.categories WHERE slug = 'dedicated-servers'), 8500, 'INR', '["Intel Xeon 1270v6", "32GB DDR4 RAM", "2x 500GB SSD", "1Gbps Unmetered", "IPMI Access"]', false),
('Ryzen Extreme', (SELECT id FROM public.categories WHERE slug = 'dedicated-servers'), 15000, 'INR', '["AMD Ryzen 5950X", "128GB DDR4 RAM", "2x 1TB NVMe", "DDoS Protection", "Instant Setup"]', true),
('EPYC Cloud', (SELECT id FROM public.categories WHERE slug = 'dedicated-servers'), 25000, 'INR', '["AMD EPYC 7702", "256GB DDR4 RAM", "4x 2TB NVMe", "10Gbps Private Network", "24/7 Monitoring"]', false);

-- Insert Software Licenses
INSERT INTO public.products (name, category_id, price, currency, features, is_featured) VALUES 
('cPanel Solo', (SELECT id FROM public.categories WHERE slug = 'licenses'), 1500, 'INR', '["1 Account Only", "Official cPanel", "Automatic Updates", "Security Suite"]', false),
('LiteSpeed 2-Worker', (SELECT id FROM public.categories WHERE slug = 'licenses'), 2500, 'INR', '["Unlimited RAM", "2 CPU Workers", "LSCache Included", "QUIC Support"]', true),
('CloudLinux OS', (SELECT id FROM public.categories WHERE slug = 'licenses'), 1200, 'INR', '["LVE Manager", "MySQL Governor", "PHP Selector", "Hardened Kernel"]', false);

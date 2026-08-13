-- Get the category IDs
DO $$
DECLARE
    hosting_id uuid;
    reseller_id uuid;
    server_id uuid;
    license_id uuid;
BEGIN
    SELECT id INTO hosting_id FROM public.categories WHERE slug = 'hosting';
    SELECT id INTO reseller_id FROM public.categories WHERE slug = 'reseller';
    SELECT id INTO server_id FROM public.categories WHERE slug = 'server';
    SELECT id INTO license_id FROM public.categories WHERE slug = 'license';

    -- Insert Hosting Products
    INSERT INTO public.products (category_id, name, description, price, features, is_featured)
    VALUES 
    (hosting_id, 'Starter Plan', 'Perfect for small blogs', 199.00, '["1 Website", "10GB NVMe SSD", "Free SSL", "24/7 Support"]', false),
    (hosting_id, 'Pro Plan', 'Best for growing businesses', 499.00, '["Unlimited Websites", "50GB NVMe SSD", "Free Domain", "Priority Support", "Daily Backups"]', true),
    (hosting_id, 'Business Plan', 'Enterprise grade performance', 999.00, '["Unlimited Everything", "100GB NVMe SSD", "Dedicated IP", "Premium Support", "Advanced Security"]', false);

    -- Insert Reseller Products
    INSERT INTO public.products (category_id, name, description, price, features, is_featured)
    VALUES 
    (reseller_id, 'Bronze Reseller', 'Start your own host', 1499.00, '["10 cPanel Accounts", "50GB SSD", "White Label", "WHM Access"]', false);

    -- Insert Server Products
    INSERT INTO public.products (category_id, name, description, price, features, is_featured)
    VALUES 
    (server_id, 'Dedicated E3', 'High performance node', 5999.00, '["Intel Xeon E3", "32GB RAM", "1TB SSD", "1Gbps Uplink"]', false);
END $$;

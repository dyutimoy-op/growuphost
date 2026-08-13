-- Create app_role enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        create type public.app_role as enum ('admin', 'user');
    END IF;
END$$;

-- Categories table
create table public.categories (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text unique not null,
    description text,
    icon text,
    created_at timestamp with time zone default now()
);

-- Products table
create table public.products (
    id uuid primary key default gen_random_uuid(),
    category_id uuid references public.categories(id) on delete cascade not null,
    name text not null,
    description text,
    price numeric(10, 2) not null default 0.00,
    currency text not null default 'INR',
    billing_cycle text not null default 'Monthly',
    features jsonb default '[]'::jsonb,
    is_featured boolean default false,
    whmcs_link text,
    created_at timestamp with time zone default now()
);

-- Media table for frontend assets
create table public.media (
    id uuid primary key default gen_random_uuid(),
    title text,
    url text not null,
    type text not null, -- 'video', 'image', 'gif'
    usage_tag text, -- e.g., 'hero_bg', 'feature_1'
    created_at timestamp with time zone default now()
);

-- User roles table
create table public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role app_role not null default 'user',
    unique (user_id, role)
);

-- Grants
grant select on public.categories to anon, authenticated;
grant all on public.categories to service_role;
grant all on public.categories to authenticated;

grant select on public.products to anon, authenticated;
grant all on public.products to service_role;
grant all on public.products to authenticated;

grant select on public.media to anon, authenticated;
grant all on public.media to service_role;
grant all on public.media to authenticated;

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

-- RLS
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.media enable row level security;
alter table public.user_roles enable row level security;

-- Security Definer Function for role check
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Policies for categories
create policy "Allow public read for categories" on public.categories for select to public using (true);
create policy "Admins can manage categories" on public.categories for all to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Policies for products
create policy "Allow public read for products" on public.products for select to public using (true);
create policy "Admins can manage products" on public.products for all to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Policies for media
create policy "Allow public read for media" on public.media for select to public using (true);
create policy "Admins can manage media" on public.media for all to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Initial Categories Seed
insert into public.categories (name, slug, description) values
('Hosting', 'hosting', 'Reliable entry-level hosting'),
('Reseller', 'reseller', 'Start your own hosting brand'),
('Server', 'server', 'High performance dedicated nodes'),
('License', 'license', 'cPanel, Litespeed, Cloudlinux and more');

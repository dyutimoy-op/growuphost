-- This script creates the user roles table and function if they don't exist.
-- It also grants admin access to a specific email by adding a trigger to automatically add the role.

CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role public.app_role not null,
    unique (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Ensure onepiece@gmail.com becomes an admin when they sign up
CREATE OR REPLACE FUNCTION public.handle_admin_signup()
RETURNS trigger AS $$
BEGIN
  IF (NEW.email = 'onepiece@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_admin_signup ON auth.users;
CREATE TRIGGER on_admin_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_admin_signup();


-- Temporary function to safely handle the user_roles assignment
CREATE OR REPLACE FUNCTION public.assign_admin_role(target_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
    
    IF target_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END;
$$;

-- Execute for the specific user
SELECT public.assign_admin_role('onepiece@gmail.com');

-- Clean up
DROP FUNCTION public.assign_admin_role(TEXT);

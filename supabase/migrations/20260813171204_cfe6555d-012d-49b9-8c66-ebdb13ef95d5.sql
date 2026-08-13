
DO $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    SELECT id, 'admin'
    FROM auth.users
    WHERE email = 'onepiece@gmail.com'
    ON CONFLICT (user_id, role) DO NOTHING;
END $$;

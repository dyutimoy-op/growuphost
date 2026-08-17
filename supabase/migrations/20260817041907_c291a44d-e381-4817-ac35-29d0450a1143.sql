-- Revoke all public execution rights for SECURITY DEFINER functions in public schema
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

REVOKE EXECUTE ON FUNCTION public.handle_admin_signup() FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_admin_signup() TO service_role;

-- Re-grant authenticated access to has_role because RLS policies need it, 
-- but we must ensure it's not exposed to direct RPC if possible. 
-- Actually, RLS runs as the current user, so 'authenticated' NEEDS EXECUTE to use it in policies.
-- The warning about 'authenticated' being able to execute it is expected for RLS helper functions.
-- We will keep it for authenticated but ensure search_path is secure (already set to public).
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- For handle_admin_signup, it's a trigger function, so it only needs service_role/postgres.
REVOKE EXECUTE ON FUNCTION public.handle_admin_signup() FROM authenticated;

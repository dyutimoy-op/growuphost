-- Explicitly revoke from PUBLIC (which includes anon) and authenticated for handle_admin_signup
REVOKE ALL ON FUNCTION public.handle_admin_signup() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_admin_signup() TO service_role;

-- Ensure has_role is only executable by authenticated and service_role
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

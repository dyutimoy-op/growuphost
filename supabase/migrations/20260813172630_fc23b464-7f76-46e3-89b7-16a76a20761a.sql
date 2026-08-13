-- Secure the functions by setting search_path and revoking public execute
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.handle_admin_signup() FROM PUBLIC;
-- This one is only for the internal trigger, so service_role is enough
GRANT EXECUTE ON FUNCTION public.handle_admin_signup() TO service_role;

-- We already set search_path = public on has_role.
-- Let's ensure handle_admin_signup also has it.
ALTER FUNCTION public.handle_admin_signup() SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Revoke execute on any other functions found in migrations if they are security definer
-- Checking assign_admin_role (already dropped in its migration)
-- Checking has_role (addressed above)
ALTER FUNCTION public.has_role(uuid, public.app_role) SECURITY INVOKER;

-- Re-grant access just in case changing security context reset them
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

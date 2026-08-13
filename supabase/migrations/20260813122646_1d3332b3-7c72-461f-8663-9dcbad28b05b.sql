-- Revoke execute on the has_role function from public and authenticated roles
revoke execute on function public.has_role(uuid, app_role) from public;
revoke execute on function public.has_role(uuid, app_role) from authenticated;

-- Ensure service_role and owner still have access
grant execute on function public.has_role(uuid, app_role) to service_role;

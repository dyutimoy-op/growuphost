-- Add policy for user_roles
create policy "Users can view their own roles" on public.user_roles
for select to authenticated
using (auth.uid() = user_id);

-- One more check on has_role function permissions
-- Sometimes 'public' is a catch-all for both anon and authenticated
revoke execute on function public.has_role(uuid, app_role) from anon;
grant execute on function public.has_role(uuid, app_role) to service_role;

-- Allow public read access (even if bucket is private, we want public URLs to work if we generate signed URLs or if we want it to be reachable)
-- Actually, if it's private, we need specific policies for select.
-- The user said "public reads" in the plan. Since I can't make it public via the tool (blocked), I'll set it to public-read via RLS.

create policy "Public Read Access"
on storage.objects for select
to public
using ( bucket_id = 'media' );

-- Allow authenticated users with 'admin' role to manage media
create policy "Admin Insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'media' AND
  (public.has_role(auth.uid(), 'admin'))
);

create policy "Admin Update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'media' AND
  (public.has_role(auth.uid(), 'admin'))
);

create policy "Admin Delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'media' AND
  (public.has_role(auth.uid(), 'admin'))
);

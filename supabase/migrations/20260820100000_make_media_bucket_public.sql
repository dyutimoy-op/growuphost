-- ============================================================================
-- FIX: reconcile an existing 'media' bucket that is not public.
--
-- STILL WORTH APPLYING, NO LONGER URGENT — READ THIS FIRST
-- When this migration was written it was the one thing standing between the owner
-- and working images. That is no longer true: media is served through the
-- same-origin `/media/*` proxy in `src/routes/media.$.tsx`, which reads the object
-- with the project's own API key and therefore works whether the bucket is public
-- or private. What remains valuable here is the *other* two columns this statement
-- sets — see "THE SIZE LIMIT AND MIME ALLOW-LIST" below — plus one saved network
-- hop if the flag is flipped. Nothing breaks if this is never run.
--
-- WHAT WENT WRONG ORIGINALLY
-- `20260819091300_create_media_storage_bucket.sql` creates the bucket with
-- `public = true`, but ends in `ON CONFLICT (id) DO NOTHING`. That guard is
-- correct for re-runs — it must not clobber a bucket an operator has tuned — but
-- it also means the migration is a complete no-op on any project where the
-- bucket already existed. And that is the common case: the bucket was clicked
-- into being in the Supabase dashboard long before the migration was written,
-- and the dashboard's "Public bucket" checkbox defaults to OFF.
--
-- The result was a bucket that accepted uploads and stored them correctly, while
-- every URL the site rendered was dead. `uploadMedia` used to finish by calling
-- `getPublicUrl(...)`, which does not check anything — it just formats
-- `/storage/v1/object/public/media/<path>`. On a private bucket that path
-- returns `{"code":"NoSuchBucket"}` to every visitor. So:
--
--   * the upload succeeded and the admin got a green "Uploaded" toast,
--   * the row landed in `media_library` with a working-looking URL,
--   * and the image was broken everywhere it was used — on the public site and in
--     the admin's own preview.
--
-- Nothing in that chain reported an error, and `PromoPopup`'s broken-image guard
-- hid the last symptom, so the bucket's `public` flag was invisible from the
-- application entirely. Verified on this project at the time: an authenticated
-- read of `gallery/4sf3f9vfmkd.webp` returned 200 `image/webp`, while the public
-- URL for the same object returned `NoSuchBucket`.
--
-- HOW THE APPLICATION ANSWERED INSTEAD
-- `uploadMedia` now stores a same-origin `/media/<objectPath>` path and does not
-- call `getPublicUrl` at all, and `toMediaSrc` in `src/lib/media-url.ts` rewrites
-- the old absolute URLs still sitting on older rows into that same shape at render
-- time. A bucket's `public` flag is a Storage dashboard checkbox the application
-- cannot read, so *depending* on it was the real defect; the proxy removes the
-- dependency instead of documenting it.
--
-- WHY UPDATE AND NOT INSERT … ON CONFLICT DO UPDATE
-- An `ON CONFLICT DO UPDATE` in the creating migration would fight an operator
-- who had deliberately narrowed the bucket. This is a separate, explicit,
-- one-purpose statement: bring the bucket in line with what the application
-- expects, and say why in one place.
--
-- THE SIZE LIMIT AND MIME ALLOW-LIST
-- These are the half of this statement that still carries its weight, and they are
-- set here for the same reason — a hand-created bucket has neither, so the
-- server-side half of the 10 MiB ceiling and the "no SVG" rule were never actually
-- enforced. Until this runs, the checks in `src/utils/media-optimization.ts` are
-- the only gate, and a browser-side check is a convenience rather than a control:
-- an admin session can POST straight at the Storage REST endpoint and skip it
-- entirely. SVG is the one to care about. It is an executable document, and uploads
-- are now served from this site's own origin through `/media/*`, which is exactly
-- what makes a stored SVG XSS against the admin session the Supabase client keeps
-- in `localStorage` — the proxy, not the bucket's public flag, is what put the
-- bytes on our origin. That proxy independently refuses to serve one as a document
-- (`SERVEABLE_CONTENT_TYPES` in `src/routes/media.$.tsx`), so this allow-list is
-- the write-end half of a pair and neither half is redundant. Both lists mirror
-- `src/utils/media-optimization.ts`; keep them in sync if either changes.
--
-- Idempotent: a plain UPDATE, safe to re-run, and a no-op once the flag is set.
-- ============================================================================

UPDATE storage.buckets
SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/ogg'
  ]::text[]
WHERE id = 'media';

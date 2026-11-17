-- ============================================================================
-- FIX: create the 'media' storage bucket that the admin panel uploads into.
--
-- WHAT BROKE
-- 20260816184626 created four storage.objects RLS policies scoped to
-- `bucket_id = 'media'` (public read; admin insert/update/delete), but no
-- migration ever inserted a row into storage.buckets. The bucket therefore only
-- exists in environments where somebody clicked it into being in the Supabase
-- dashboard. On a fresh project — a new branch, a preview environment, a local
-- `supabase start`, or a restore from migrations — every upload from the admin
-- Media Library fails with "Bucket not found", and the policies above sit there
-- guarding nothing.
--
-- Creating the bucket in SQL makes the storage layer part of the schema history
-- like everything else, instead of a manual dashboard step nobody remembers.
--
-- CHOICES MADE HERE
--   public = true
--     The site renders these assets as plain <img src> / <video src> from
--     unauthenticated marketing pages, so the objects must be reachable without
--     a signed URL. This matches the intent of the existing "Public Read Access"
--     policy on storage.objects. Note that writes stay admin-only: a public
--     bucket affects reads, not uploads.
--
--   file_size_limit = 10485760 (10 MiB)
--     Deliberately identical to MAX_FILE_SIZE in src/utils/media-optimization.ts
--     (10 * 1024 * 1024). The client-side check there is a UX affordance only —
--     it can be bypassed trivially by calling the storage API directly — so the
--     same ceiling is enforced server-side. Keep the two in sync if either
--     changes.
--
--   allowed_mime_types
--     Mirrors SUPPORTED_IMAGE_TYPES + SUPPORTED_VIDEO_TYPES from the same module.
--     Restricting the list server-side stops a compromised or simply misused
--     admin session from parking arbitrary content (HTML, SVG, executables) on
--     the site's own origin. SVG is intentionally NOT allowed: SVG is an active
--     content type and a stored-XSS vector when served same-origin from a public
--     bucket.
--
-- Idempotent: ON CONFLICT (id) DO NOTHING, so re-running never clobbers a bucket
-- an operator has already tuned by hand.
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  10485760,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/ogg'
  ]::text[]
)
ON CONFLICT (id) DO NOTHING;

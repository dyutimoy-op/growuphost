-- ============================================================================
-- Seed the public.site_settings keys the admin "Global Settings" tab reads and
-- writes, and repair three rows that earlier migrations left in a bad state.
--
-- WHY
-- The Global Settings tab was previously hardcoded in the UI and saved nowhere.
-- It is being reworked to persist to public.site_settings (a flat key/value
-- table). A key/value settings table only behaves well if the rows exist up
-- front: the admin form binds inputs to keys, and public.site_settings has an
-- admin UPDATE policy and an admin INSERT policy but the UI's save path is a
-- plain update per key. Seeding guarantees every field has a row to write to on
-- a fresh environment, and gives the public site sane values before an admin has
-- ever opened the tab.
--
-- The seeded values intentionally match the hardcoded fallbacks already present
-- in the frontend components (Navbar, Footer, Hero, contact page), so turning on
-- DB-backed settings does not visibly change the site.
--
-- UNIQUE CONSTRAINT
-- ON CONFLICT (key) requires a unique index on exactly (key). The original
-- CREATE TABLE in 20260813124754 declared `key text UNIQUE NOT NULL`, so the
-- constraint should already be present — but 20260816000000 and 20260817043847
-- already rely on ON CONFLICT (key) without ever verifying it, so this migration
-- asserts it defensively rather than assuming. The guard below checks for ANY
-- single-column unique index on `key` (constraint- or index-backed) and only
-- adds one if none exists.
--
-- Idempotent: guarded DDL, INSERT ... ON CONFLICT (key) DO NOTHING so an admin's
-- saved values are never clobbered, and the three repair UPDATEs are narrowly
-- predicated on the exact bad values so they are no-ops once corrected.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Guarantee ON CONFLICT (key) has an arbiter index to bind to.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_index i
    JOIN pg_class c ON c.oid = i.indrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'site_settings'
      AND i.indisunique
      AND i.indnatts = 1
      AND i.indkey[0] = (
        SELECT a.attnum
        FROM pg_attribute a
        WHERE a.attrelid = c.oid
          AND a.attname = 'key'
          AND NOT a.attisdropped
      )
  ) THEN
    ALTER TABLE public.site_settings
      ADD CONSTRAINT site_settings_key_unique UNIQUE (key);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2. Seed every key the Global Settings tab binds to.
--    DO NOTHING on conflict: existing operator-set values always win.
-- ---------------------------------------------------------------------------
INSERT INTO public.site_settings (key, value) VALUES
  -- Identity
  ('company_name',         'GROWUPHOST'),
  ('tagline',              'UNMATCHED PERFORMANCE'),

  -- Support / contact block rendered by the Footer and the contact page.
  ('support_phone',        '+91 72 52 89 0016'),
  ('support_email',        'support@growuphost.com'),
  ('support_address',      'Mumbai, Maharashtra, India'),

  -- WHMCS. This site is a marketing front-end only: it owns no accounts, no
  -- cart and no checkout, so every account-related destination must leave the
  -- site and land in the external WHMCS install. These rows exist so an operator
  -- can repoint billing (e.g. after moving WHMCS to HTTPS or a new host) without
  -- a redeploy; the frontend falls back to src/config/whmcs.ts when they are
  -- empty.
  ('whmcs_url',            'http://client.growuphost.com'),
  ('login_url',            'http://client.growuphost.com/clientarea.php'),
  ('register_url',         'http://client.growuphost.com/register.php'),

  -- Analytics / SEO tooling
  ('google_analytics_id',  ''),
  ('seo_audit_results',    ''),
  ('meta_title',           'GROWUPHOST | High-Performance Hosting, VPS & Dedicated Servers'),
  ('meta_description',     'Enterprise-grade shared hosting, reseller plans, VPS, dedicated servers and control panel licences on NVMe storage with LiteSpeed and 24/7 expert support.'),

  -- Hero / banner copy
  ('banner_headline',      'UNMATCHED PERFORMANCE'),
  ('banner_subheadline',   'Enterprise-grade infrastructure engineered for speed, uptime, and scale.'),

  -- Social profiles. Seeded empty rather than '#': an empty value lets the
  -- frontend hide the icon, whereas '#' renders a link that goes nowhere.
  ('social_twitter',       ''),
  ('social_facebook',      ''),
  ('social_linkedin',      '')
ON CONFLICT (key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3. Repair: banner_headline was overwritten with chat-prompt text.
--
-- 20260817080949 and 20260817081030 both wrote a block of instruction prose
-- ("Do not make any visual modifications. ...") into banner_headline — the
-- headline that renders at the top of the homepage. 20260817081320 reverted it
-- to 'UNMATCHED PERFORMANCE'. The revert appears to have landed, but because
-- the seed above cannot overwrite an existing row, verify rather than assume:
-- correct the value only if the prompt text (or an empty value) is still there.
-- ---------------------------------------------------------------------------
UPDATE public.site_settings
SET value = 'UNMATCHED PERFORMANCE'
WHERE key = 'banner_headline'
  AND (
    value IS NULL
    OR btrim(value) = ''
    OR value ILIKE '%Do not make any visual modifications%'
    OR value ILIKE '%I have approved the plan%'
    OR value ILIKE '%what update and changes%'
  );

-- ---------------------------------------------------------------------------
-- 4. Repair: login_url / register_url / whmcs_url still pointed in-app.
--
-- 20260813124754 seeded login_url and register_url as '/auth', from the era when
-- this site had its own customer signup. /auth is now the STAFF-ONLY admin login
-- (public signup has been removed), and src/components/Navbar.tsx does:
--     firstNonEmpty(settings?.["login_url"], WHMCS_LINKS.clientArea)
-- so a non-empty DB value is preferred over the WHMCS fallback. Left as-is, the
-- navbar's "Login" and "Get Started" buttons would aim paying customers at the
-- internal admin login instead of the WHMCS client area — the customer sees a
-- staff login form they can never pass, and staff credentials get typed into a
-- page customers were pointed at. The Navbar now defensively treats a stale
-- in-app auth path as "unset", so the live site is not broken either way; this
-- exists so the admin panel stops displaying a value the public site ignores.
--
-- GUARD: these three settings must be ABSOLUTE URLs on the WHMCS host. WHMCS
-- lives on a different origin, so a relative path can never be a valid value for
-- them — which makes `LIKE '/%'` a safe and complete test for "this is a leftover
-- in-app path" (/auth, /auth/, /login, /register, /clientarea, ...) without
-- risking a deliberate operator override, since any real override is absolute.
-- Bare pathless spellings are covered explicitly.
-- ---------------------------------------------------------------------------
UPDATE public.site_settings
SET value = 'http://client.growuphost.com/clientarea.php'
WHERE key = 'login_url'
  AND (
    value IS NULL
    OR btrim(value) = ''
    OR btrim(value) LIKE '/%'
    OR lower(btrim(value)) IN ('auth', 'login', 'signin', 'sign-in')
  );

UPDATE public.site_settings
SET value = 'http://client.growuphost.com/register.php'
WHERE key = 'register_url'
  AND (
    value IS NULL
    OR btrim(value) = ''
    OR btrim(value) LIKE '/%'
    OR lower(btrim(value)) IN ('auth', 'register', 'signup', 'sign-up')
  );

-- whmcs_url is newly introduced by the seed above, so on a current database this
-- is a no-op. It is guarded anyway so an environment that already has the key
-- (set by hand in the dashboard, or by a future branch) cannot keep a relative
-- path that could never reach the billing host.
UPDATE public.site_settings
SET value = 'http://client.growuphost.com'
WHERE key = 'whmcs_url'
  AND (
    value IS NULL
    OR btrim(value) = ''
    OR btrim(value) LIKE '/%'
    OR lower(btrim(value)) IN ('auth', 'whmcs', 'client', 'clientarea')
  );

-- ---------------------------------------------------------------------------
-- 5. Repair: hero_cta_url was seeded as '/' (the homepage).
--
-- Same class of bug as above. src/components/Hero.tsx does
--     settings?.["hero_cta_url"]?.trim() || WHMCS_LINKS.store
-- so the '/' seeded in 20260813124754 wins and the hero's primary
-- call-to-action reloads the homepage instead of opening the WHMCS store.
-- ---------------------------------------------------------------------------
UPDATE public.site_settings
SET value = 'http://client.growuphost.com/cart.php'
WHERE key = 'hero_cta_url'
  AND (value IS NULL OR btrim(value) IN ('', '/'));

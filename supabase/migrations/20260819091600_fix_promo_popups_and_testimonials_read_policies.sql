-- Fix two public-read policy problems on promo_popups and testimonials.
--
-- PROBLEM 1 (data leak) — promo_popups
-- `20260816183736` created:
--     CREATE POLICY "Allow public select on popups"
--       ON public.promo_popups FOR SELECT TO anon USING (true);
-- The table has both `is_active` and `coupon_code`. `USING (true)` ignores
-- `is_active`, so every DRAFT / SCHEDULED / DISABLED promo -- including its
-- coupon code -- is readable by any anonymous visitor holding the publishable
-- key (which ships in the browser bundle by design). Discount codes leak before
-- the campaign launches.
--
-- This is the same class of bug fixed for news_alerts in 20260819091200.
--
-- BEHAVIOUR CHANGE, intentional: before this migration every popup row was
-- publicly readable; after it, only rows with `is_active = true` are. Rows where
-- `is_active` is NULL are treated as inactive, which matches the admin UI
-- (MarketingModal defaults new popups to `is_active: false`). If a popup stops
-- appearing on the public site after applying this, tick its Active checkbox in
-- the admin panel -- that is the flag working as intended for the first time.
--
-- PROBLEM 2 (inconsistency) — both tables
-- Both public SELECT policies are scoped `TO anon` only, so a signed-in admin
-- reading through their own authenticated session sees nothing from these tables
-- unless a separate admin policy matches. Every other public-content table in
-- this schema uses `TO anon, authenticated`. Aligned here.
--
-- testimonials has no is_active / is_published column, so `USING (true)` is
-- correct for it -- there is nothing to hide. Only the role list changes.

-- === promo_popups ===========================================================

DROP POLICY IF EXISTS "Allow public select on popups" ON public.promo_popups;

CREATE POLICY "Public can view active popups"
  ON public.promo_popups
  FOR SELECT
  TO anon, authenticated
  USING (is_active IS TRUE);

-- Admins keep unrestricted access (including inactive drafts) via the existing
-- "Allow authenticated users to manage popups" FOR ALL policy. Permissive
-- policies OR together, so an admin still sees every row.

COMMENT ON POLICY "Public can view active popups" ON public.promo_popups IS
  'Anonymous and authenticated visitors see only active popups. Do NOT relax to USING (true): coupon_code would leak from unlaunched campaigns.';

-- === testimonials ===========================================================

DROP POLICY IF EXISTS "Allow public select on testimonials" ON public.testimonials;

CREATE POLICY "Public can view testimonials"
  ON public.testimonials
  FOR SELECT
  TO anon, authenticated
  USING (true);

COMMENT ON POLICY "Public can view testimonials" ON public.testimonials IS
  'All testimonials are public; the table has no active/published flag. Add one and gate this policy on it if draft testimonials are ever needed.';

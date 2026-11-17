-- ============================================================================
-- SECURITY FIX: resolve the contradictory RLS policies on public.news_alerts.
--
-- WHAT BROKE
-- 20260813200750 created the table with the correct intent:
--     "Public can view active news alerts"  FOR SELECT USING (is_active = true)
--     "Admins can manage news alerts"       FOR ALL TO authenticated
--                                           USING (public.has_role(auth.uid(),'admin'))
--
-- 20260813203708 then re-ran a CREATE TABLE IF NOT EXISTS for the same table
-- (so the table was untouched) and added a SECOND select policy:
--     "Allow public read news alerts"       FOR SELECT USING (true)
--
-- Postgres RLS policies of the same command are PERMISSIVE and OR'd together,
-- so adding a `USING (true)` select policy does not "replace" the restrictive
-- one — it completely defeats it. The net effect was that every draft /
-- deactivated news alert became readable by anon over the Data API, even though
-- the admin UI treats is_active = false as unpublished. Unpublished marketing
-- copy (pricing changes, unannounced promos, maintenance notices) leaking ahead
-- of schedule is exactly what the is_active flag exists to prevent.
--
-- WHAT THIS MIGRATION LEAVES BEHIND
-- Exactly two policies, with no overlap in intent:
--   * public (anon + authenticated) may SELECT only rows with is_active = true
--   * admins may do everything, including reading unpublished rows, because the
--     FOR ALL policy OR's in for them and the admin panel must list drafts
--
-- Every policy name any earlier migration created on this table is dropped with
-- DROP POLICY IF EXISTS first, so the end state is deterministic no matter which
-- subset of the earlier migrations a given environment has applied.
--
-- Idempotent: IF EXISTS drops followed by unconditional creates of the dropped
-- names.
-- ============================================================================

ALTER TABLE public.news_alerts ENABLE ROW LEVEL SECURITY;

-- From 20260813203708 — the offending `USING (true)` select policy.
DROP POLICY IF EXISTS "Allow public read news alerts" ON public.news_alerts;
-- From 20260813200750 — dropped and recreated below so the definition is pinned
-- here rather than depending on history.
DROP POLICY IF EXISTS "Public can view active news alerts" ON public.news_alerts;
DROP POLICY IF EXISTS "Admins can manage news alerts" ON public.news_alerts;

-- Public read: published rows only. NULL is_active is treated as unpublished
-- (the column is nullable with DEFAULT true), because `NULL = true` is NULL and
-- a NULL policy result denies the row — the safe direction.
CREATE POLICY "Public can view active news alerts" ON public.news_alerts
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Admin full control. WITH CHECK is stated explicitly: for a FOR ALL policy
-- Postgres would default the write check to the USING expression, but spelling
-- it out means an INSERT can never be accepted for a non-admin if the USING
-- clause is ever narrowed.
CREATE POLICY "Admins can manage news alerts" ON public.news_alerts
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Table-level grants are unchanged from 20260813200750; restated so a fresh
-- environment that only applied a subset of history still ends up consistent.
-- RLS, not the grant, is what confines authenticated writes to admins.
GRANT SELECT ON public.news_alerts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news_alerts TO authenticated;
GRANT ALL ON public.news_alerts TO service_role;

-- ============================================================================
-- SECURITY FIX: restore public.has_role() to SECURITY DEFINER and pin its
-- search_path.
--
-- WHAT BROKE
-- Migration 20260817041916 ran:
--     ALTER FUNCTION public.has_role(uuid, public.app_role) SECURITY INVOKER;
-- That was wrong on two counts.
--
-- 1. CORRECTNESS / AVAILABILITY. has_role() is the RLS helper behind every
--    admin policy in this database (categories, products, media, media_library,
--    site_settings, news_alerts, testimonials, promo_popups, and the
--    storage.objects policies for the 'media' bucket). Under SECURITY INVOKER
--    the body executes as the calling role. The calling role is `authenticated`,
--    which has SELECT on public.user_roles but is constrained by that table's
--    own RLS policy ("Users can view their own roles": auth.uid() = user_id).
--    Inside a policy evaluation that either returns false or produces recursive
--    policy evaluation, so admin policies silently stop matching and the whole
--    admin panel loses write access. SECURITY DEFINER is precisely why this
--    helper-function pattern exists: it reads the role table as the (table-
--    owning) function owner, outside the caller's RLS.
--
-- 2. THE REASON IT WAS FLIPPED IS ALSO ADDRESSED HERE. The preceding
--    migrations were clearly chasing a "SECURITY DEFINER function" linter
--    warning. The real mitigation for that warning is not to drop DEFINER, it
--    is to pin the search path so the definition cannot be hijacked. Without a
--    pinned search_path, any role able to create objects in a schema that
--    appears earlier on the caller's search_path can shadow a referenced table,
--    operator, or function and have it run with the owner's privileges. The
--    original definition set `search_path = public`, which omits pg_temp;
--    because pg_temp is implicitly searched first for tables unless it is
--    named explicitly, that left the classic temp-table shadowing hole open.
--    Listing pg_temp explicitly and LAST forces it to the end of resolution
--    order, so a caller-created temporary object can no longer shadow
--    public.user_roles.
--
-- The signature, return type, volatility (STABLE), language (sql) and body
-- semantics are preserved exactly as defined in 20260813122639 /
-- 20260813170700 / 20260813172621 — only the security context and search_path
-- change. CREATE OR REPLACE keeps the existing dependency graph, so none of the
-- RLS policies that reference this function need to be dropped and recreated.
--
-- Idempotent: CREATE OR REPLACE plus idempotent ALTER/GRANT/REVOKE statements.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Belt and braces: assert the two security-relevant attributes independently of
-- the CREATE OR REPLACE above, so this migration still corrects a function whose
-- body has drifted from the definition written here.
ALTER FUNCTION public.has_role(uuid, public.app_role) SECURITY DEFINER;
ALTER FUNCTION public.has_role(uuid, public.app_role) SET search_path = public, pg_temp;

COMMENT ON FUNCTION public.has_role(uuid, public.app_role) IS
  'RLS helper. MUST remain SECURITY DEFINER with a pinned search_path: every admin RLS policy depends on it reading public.user_roles outside the caller''s RLS. Do not switch to SECURITY INVOKER.';

-- Execute rights: `authenticated` genuinely needs EXECUTE because RLS policies
-- are evaluated as the calling role. anon must not have it — that would let an
-- unauthenticated visitor probe which user IDs hold the admin role.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

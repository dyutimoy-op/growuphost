-- ============================================================================
-- SECURITY FIX: remove the hardcoded admin-signup backdoor.
--
-- Migration 20260813172621 created:
--   * function public.handle_admin_signup()  -- SECURITY DEFINER
--   * trigger  on_admin_signup ON auth.users -- AFTER INSERT, FOR EACH ROW
--
-- The function granted the `admin` role in public.user_roles to ANY newly
-- inserted auth.users row whose email happened to be 'onepiece@gmail.com'.
-- Combined with the site's (now removed) open public signup form, that was a
-- complete privilege-escalation path: anyone who could reach /auth and register
-- that address became a CMS admin. Email addresses are not a secret and are not
-- an authentication factor, so an allow-list of literal emails is never a valid
-- authorization boundary.
--
-- This site is a marketing front-end only; all customer accounts live in the
-- external WHMCS install. The only accounts in Supabase auth are staff accounts,
-- which are provisioned by hand, so no automatic role-granting trigger is
-- needed at all. The backdoor is therefore removed outright rather than being
-- re-pointed at a different hardcoded address.
--
-- Existing admin grants in public.user_roles are intentionally left untouched
-- (migrations 20260813171204 / 20260816182305 already inserted them); dropping
-- the trigger only stops NEW signups from self-escalating.
--
-- Idempotent: both statements use IF EXISTS.
-- ============================================================================

-- The trigger must go first: the function cannot be dropped while a trigger
-- still depends on it (and we deliberately avoid CASCADE so this migration can
-- never silently drop something unrelated).
DROP TRIGGER IF EXISTS on_admin_signup ON auth.users;

DROP FUNCTION IF EXISTS public.handle_admin_signup();

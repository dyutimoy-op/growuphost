-- ============================================================================
-- Admin-managed navigation links for the header and the footer.
--
-- WHY THIS TABLE
-- Every link in the Navbar and the Footer is currently a hardcoded `<Link to>`
-- in `src/components/Navbar.tsx` / `src/components/Footer.tsx`, so adding one
-- means a code change and a deploy. This table lets an admin add, reorder,
-- retire, and re-publish extra text links from the dashboard.
--
-- These are deliberately *text* links, not buttons: the site already has exactly
-- two button-styled actions in the header (Client Area / Get Started) and their
-- weight is what makes them read as the primary conversion path. A third and
-- fourth button would flatten that hierarchy, so rows here render in the same
-- type style as the existing "Packages" / "Contact" links.
--
-- URL SAFETY
-- `url` becomes an `href`, so a `javascript:` or `data:text/html,` value would
-- execute on click. Only an admin can write rows (see the RLS policies below),
-- but a scheme allow-list is enforced *here* as well as in the application —
-- `sanitizeUrl` in `src/config/whmcs.ts` — because a constraint the database
-- holds cannot be bypassed by a direct PostgREST call, a SQL console, or a
-- future code path that forgets to sanitize.
--
-- PLACEMENT
-- One row, one `placement`: 'header', 'footer', or 'both'. A single column
-- rather than two booleans, so "in neither" is not a representable state — a row
-- that renders nowhere looks like a bug from the dashboard.
--
-- Idempotent: CREATE TABLE / INDEX IF NOT EXISTS, and IF EXISTS drops before
-- every policy create, so re-running lands on the same end state.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.nav_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    placement TEXT NOT NULL DEFAULT 'both',
    open_in_new_tab BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT nav_links_placement_check
        CHECK (placement IN ('header', 'footer', 'both')),

    -- NOT NULL alone still admits '' and '   ', which would render an invisible,
    -- unclickable link the admin cannot find on the page to remove.
    CONSTRAINT nav_links_label_not_blank CHECK (btrim(label) <> ''),
    CONSTRAINT nav_links_url_not_blank CHECK (btrim(url) <> ''),

    -- The scheme allow-list. Site-relative paths ('/packages', '#pricing',
    -- '?ref=x') carry no scheme and cannot execute, so they are accepted; a
    -- protocol-relative '//host/path' is not, because it silently leaves the
    -- origin. Anything with a scheme must present one of http/https/mailto/tel.
    CONSTRAINT nav_links_url_scheme_check CHECK (
        url ~* '^(https?://|mailto:|tel:)[^\s]+$'
        OR url ~ '^[/#?][^/]'
        OR url = '/'
    )
);

-- The public read path is `WHERE is_active = true ORDER BY display_order`, so the
-- index matches it rather than indexing the columns in schema order.
CREATE INDEX IF NOT EXISTS nav_links_active_order_idx
    ON public.nav_links (is_active, display_order);

ALTER TABLE public.nav_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active nav links" ON public.nav_links;
DROP POLICY IF EXISTS "Admins can manage nav links" ON public.nav_links;

-- Public read: published rows only. `is_active` is NOT NULL here (unlike
-- `news_alerts`), so there is no third "never set" state to reason about.
CREATE POLICY "Public can view active nav links" ON public.nav_links
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Admin full control. WITH CHECK is spelled out rather than left to default to
-- the USING expression, so narrowing USING later can never accidentally open
-- writes to a non-admin.
CREATE POLICY "Admins can manage nav links" ON public.nav_links
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.nav_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nav_links TO authenticated;
GRANT ALL ON public.nav_links TO service_role;

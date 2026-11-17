-- Add the WHMCS product ID to products.
--
-- Link model: whmcs_pid is the primary way a product points at WHMCS. The site
-- builds <base>/cart.php?a=add&pid=<whmcs_pid>&billingcycle=<cycle> from it, so
-- the billing base URL lives in exactly one place in the frontend config and
-- can be changed without touching product rows.
--
-- The pre-existing whmcs_link column is retained as an optional full-URL
-- override for special cases (promo landing pages, bundles, non-cart targets).
-- When both are set, whmcs_link wins.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS whmcs_pid integer;

COMMENT ON COLUMN public.products.whmcs_pid IS
  'WHMCS product ID (pid). Cart links are built from this. Takes second priority to whmcs_link.';

COMMENT ON COLUMN public.products.whmcs_link IS
  'Optional full-URL override for the product CTA. Wins over whmcs_pid when set.';

-- A pid must be a real positive WHMCS identifier if provided at all.
ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_whmcs_pid_positive;

ALTER TABLE public.products
  ADD CONSTRAINT products_whmcs_pid_positive
  CHECK (whmcs_pid IS NULL OR whmcs_pid > 0);

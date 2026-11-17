-- Add a real per-product annual price to products.
--
-- WHY A SECOND PRICE COLUMN
-- -------------------------
-- The marketing site already offers a monthly/annual toggle, but until now it
-- could only change the *term the WHMCS cart opens on* — there was no annual
-- number to show. The only way to advertise an annual saving was the site-wide
-- `annual_discount_percent` setting, which computes a price the cart never
-- agreed to and drifts the moment one plan's annual deal differs from another's.
--
-- `annual_price` fixes that: it is the real 12-month total the owner has set in
-- WHMCS, entered per product. When it is set, the annual side of the toggle
-- shows that exact figure and any advertised saving is derived from two real
-- numbers (price * 12 vs annual_price) rather than an invented percentage. When
-- it is NULL the site behaves exactly as before, so existing rows need no edit.
--
-- UNITS: `price` is one billing_cycle term (normally one month) and
-- `annual_price` is the total for a 12-month term — matching how WHMCS quotes an
-- annual cycle, so an admin can copy the figure across without converting it.
--
-- TYPE: `numeric(10, 2)`, deliberately identical to `products.price`
-- (20260813122639_*.sql:25). An unbounded `numeric` would accept a third decimal
-- place, and the two figures are not used the same way: the frontend *displays*
-- a rounded price but computes the advertised annual saving from the raw values
-- (`plan-data.ts`), so a 3-decimal annual price would let the printed total and
-- the printed saving disagree by a rounding step. Two money columns on one row
-- should also not have two different precisions.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS annual_price numeric(10, 2);

-- `ADD COLUMN IF NOT EXISTS` silently keeps the *existing* type, so on a database
-- where an earlier draft of this file already created the column as unbounded
-- `numeric` the line above is a no-op and the precision would never be applied.
-- This restates it unconditionally; it is a no-op when the type already matches,
-- and rounds any stored 3-decimal value to 2 places when it does not.
ALTER TABLE public.products
  ALTER COLUMN annual_price TYPE numeric(10, 2);

COMMENT ON COLUMN public.products.annual_price IS
  'Real total charged for a 12-month term, matching WHMCS. NULL = no annual price advertised; the monthly/annual toggle then only changes the cart cycle.';

-- A price may be zero (a free tier) but never negative.
ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_annual_price_non_negative;

ALTER TABLE public.products
  ADD CONSTRAINT products_annual_price_non_negative
  CHECK (annual_price IS NULL OR annual_price >= 0);

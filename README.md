# GROWUPHOST — marketing front-end

The public website for GROWUPHOST, a hosting provider selling shared hosting, VPS,
dedicated servers, and control-panel software licences from Tier 3 data centres in
Mumbai, India.

**This repository is the marketing front-end only.** It owns no customer accounts, no
cart, and no checkout. Those live in an external WHMCS install at
`client.growuphost.com`. The job of this site is to rank in search, look credible, and
hand visitors off to WHMCS — which is why SEO correctness is treated as a product
requirement here, not polish.

---

## Architecture at a glance

| Concern                                                          | Where it lives                     |
| ---------------------------------------------------------------- | ---------------------------------- |
| Public pages, SEO, content presentation                          | this repo (TanStack Start SSR)     |
| CMS content (plans, categories, banners, testimonials, settings) | Supabase Postgres                  |
| Staff/admin authentication                                       | Supabase Auth + `user_roles` + RLS |
| Customer accounts, carts, invoices, tickets, provisioning        | **WHMCS** (external)               |

Two rules follow from that split:

1. **Every outbound billing link comes from `src/config/whmcs.ts`.** It exports
   `WHMCS_LINKS` (`.store`, `.register`, `.clientArea`, `.support`, …),
   `resolveProductUrl()` for product CTAs, and `isExternalUrl()`. Never hardcode a
   `client.growuphost.com` URL anywhere else — one file changes when the billing host
   or its TLS scheme changes.
2. **Supabase is a CMS and an admin identity store, nothing else.** The only accounts
   in Supabase Auth are staff accounts. There is no public signup on this site.

The site origin (`https://growuphost.com`) is deliberately separate from the WHMCS
origin and is configured once in `src/lib/seo/canonical.ts`. Canonicals, `og:url`, and
the sitemap all derive from it.

---

## Stack

- **[TanStack Start](https://tanstack.com/start) 1.168** (SSR) on **TanStack Router 1.170**, file-based routes in `src/routes`
- **React 19**
- **Vite 8**, configured through `@lovable.dev/vite-tanstack-config`
- **Tailwind CSS 4** + **shadcn/ui** (Radix primitives, see `components.json`)
- **Supabase** (`@supabase/supabase-js`) for Postgres, Auth, and Storage
- **TanStack Query 5** for client data fetching
- **nitro** for the server build, pinned to the **`node-server`** preset (see
  _Deployment target_ below — the nav-links file store needs a writable disk)
- **sonner** for toasts, **framer-motion** for motion, **lucide-react** for icons
- TypeScript at maximum strictness (`strict`, `exactOptionalPropertyTypes`,
  `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature`,
  `noImplicitReturns`). Index-signature reads use bracket access:
  `settings?.['google_analytics_id']`.

`vite.config.ts` is intentionally tiny. The Lovable config preset already installs
TanStack Start, React, Tailwind, tsconfig paths, nitro, env injection, and the dev
plugins — **do not add those plugins manually**, duplicates break the app.

---

## Running it

**bun is the package manager.** `bun.lock` is committed and should stay in sync.

```sh
bun install
bun dev          # vite dev server
bun run build    # production build (nitro output in .output/)
bun run lint     # eslint
bun run format   # prettier
```

**There is no working `preview` script.** `vite preview` serves a plain Vite SSR build
from `dist/`, which a nitro build never produces. To run the production build, run it the
way the server will — `node .output/server/index.mjs` (see _Deployment target_ below).

`bunfig.toml` sets `minimumReleaseAge = 86400` — a 24-hour supply-chain guard that
refuses package versions published less than a day ago, which blunts the usual
compromised-release window. A short allowlist (`minimumReleaseAgeExcludes`) bypasses it
for the `@lovable.dev/*` packages; **confirm with the project owner before adding
anything to that list.**

### Environment variables

`.env` is already in the repo root and is **tracked, not gitignored** — see the
reasoning at the top of `.env.example`. It holds only the Supabase project ref, URL
and publishable key, all three of which Vite inlines into the client bundle anyway,
so a clone builds without hand-assembling three public values. Values come from the
Supabase project / Lovable Cloud.

**Never add a server-only secret to it.** The Supabase service-role key bypasses
row-level security completely; set it in the environment of the process that runs the
built server (systemd unit, pm2 ecosystem file, or your provider's dashboard) and
nowhere else. Local-only overrides belong in `.env.local`, which _is_ ignored.

Required for the browser bundle (Vite inlines `VITE_*` at build time):

| Variable                        | Purpose                       |
| ------------------------------- | ----------------------------- |
| `VITE_SUPABASE_URL`             | Supabase project URL          |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `VITE_SUPABASE_PROJECT_ID`      | Project ref, used by tooling  |

Optional on the server. Every server-side reader tries `import.meta.env["VITE_…"]`
first and falls back to these, so a bundle built from this `.env` needs none of them.
Set them only to point an already-built bundle at a different project without
rebuilding:

| Variable                   | Purpose                    |
| -------------------------- | -------------------------- |
| `SUPABASE_URL`             | same URL, server-side      |
| `SUPABASE_PUBLISHABLE_KEY` | same anon key, server-side |
| `SUPABASE_PROJECT_ID`      | project ref                |

Optional:

| Variable                    | Default                        | Purpose                                                                                                                                  |
| --------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_WHMCS_BASE_URL`       | `http://client.growuphost.com` | Billing host for every outbound link. Set this to the `https://` URL as soon as TLS is live on the billing subdomain.                    |
| `VITE_SITE_ORIGIN`          | `https://growuphost.com`       | Public origin used for canonicals, `og:url`, and `sitemap.xml`.                                                                          |
| `SUPABASE_SERVICE_ROLE_KEY` | —                              | Service-role key used by `src/integrations/supabase/client.server.ts`. Server-only, RLS-bypassing. Never expose it to the client bundle. |
| `NAV_LINKS_FILE`            | `<cwd>/data/nav-links.json`    | Absolute path to the header/footer links store. Only needed when the server is not started from the project root — see below.            |

---

## Deployment target: a Node server you control

`vite.config.ts` pins nitro's **`node-server`** preset. That is not incidental —
two things in this app need a real Node runtime with a writable disk, and both fail
silently on a serverless/edge target:

- **`data/nav-links.json`** — the header/footer links store (below) is a file the
  admin panel writes. A Cloudflare Worker has no writable filesystem, so every
  save would fail while the rest of the site kept working, making the breakage look
  like a nav bug rather than a platform mismatch.
- **`process.cwd()`** has to mean something, for the same reason.

Build and run:

```sh
npm run build                    # → .output/
node .output/server/index.mjs    # listens on $PORT, default 3000
```

Put a reverse proxy (nginx / Caddy) in front for TLS, and run the process under a
supervisor (systemd / pm2) so it restarts on boot and on crash. **Set the working
directory to the project root**, or set `NAV_LINKS_FILE` to an absolute path — see
the next section for why.

`.output/` is a self-contained bundle: it needs neither `node_modules` nor any
`SUPABASE_*` variable in the process environment, because Vite inlines the three
public Supabase values into the server bundle at build time. The only variable the
built server genuinely reads from its environment is the optional
`SUPABASE_SERVICE_ROLE_KEY`.

**The corollary is that `.env` is a build-time input, not a runtime one.** Changing a
Supabase value and restarting the process does nothing; you must rebuild.

### The header/footer links store

Links an admin adds under **Navigation** are stored in a JSON file, not in Supabase:

- `src/config/nav-links.ts` — `DEFAULT_NAV_LINKS`, the code defaults. Empty by
  design: the header and footer already ship their own links, so anything here is
  _additional_. Entries added here survive a wiped data directory.
- `src/lib/nav-links.server.ts` — the store. Reads `$NAV_LINKS_FILE`, else
  `<cwd>/data/nav-links.json`. Writes are atomic (temp file + `rename`) and
  serialised in-process, so two overlapping saves cannot leave a half-written array
  on disk. Reads never throw: a missing or unreadable file falls back to the code
  defaults, because the header renders on every page.

`/data/` is **gitignored on purpose** — it is runtime state, so a
`git pull && npm run build` on the server must not revert links the owner added
through the panel. Two consequences:

1. **Back it up separately.** Nothing else holds these links.
2. **Only one server process may own the file.** Writes are serialised within a
   process, not across processes, so two Node instances behind a load balancer can
   have the second write drop the first. Correct for one operator on one box; point
   `NAV_LINKS_FILE` at shared storage, or move the store to Postgres, before scaling
   out.

### Uploaded media is served by this app, not by Supabase directly

Uploads go to the private `media` Storage bucket, and the browser never talks to
Supabase Storage for them. `media_library.url` holds a same-origin path like
`/media/popups/photo.jpg`, served by `src/routes/media.$.tsx`, which streams the
object using the publishable key and the bucket's public-read policy.

- **The bucket must stay private-readable-by-policy, not public.** Public is
  harmless but unnecessary; the proxy does not use it.
- The proxy resolves its credentials the same way every other reader does —
  `import.meta.env["VITE_SUPABASE_*"]` first, `process.env["SUPABASE_*"]` second — so a
  built bundle serves media with no environment set. It answers
  `500 Media is not configured` only if both are missing.
- Rows written before the proxy existed hold absolute
  `/storage/v1/object/public/media/...` URLs. `toMediaSrc()` in
  `src/lib/media-url.ts` rewrites those at render time, so **no SQL migration of
  existing content is needed**. Every `<img>`/`<video>` that renders a stored URL
  goes through it.
- Formats are never converted. What an admin uploads is what is stored, filename
  included; only images over 1200×1200 are downscaled, in their own format. GIFs
  and video are byte-for-byte.

---

## Routes

Public, indexable, and listed in `sitemap.xml`:

`/` · `/packages` · `/shared-hosting` · `/vps-hosting` · `/dedicated-servers` ·
`/licenses` · `/contact` · `/about` · `/legal/terms` · `/legal/privacy` · `/legal/sla`
· `/{categorySlug}` (dynamic, from the `categories` table)

Private, `noindex`, and `Disallow`ed in `public/robots.txt`:

`/auth` (staff login) · `/dashboard` (admin panel, under `src/routes/_authenticated/`)

Machine-readable:

`/sitemap.xml` — server-rendered from `src/routes/sitemap[.]xml.tsx`. The `[.]` escapes
the literal dot so the router does not read it as a segment separator; the generated
route path is `/sitemap.xml`. It emits the static route inventory plus live category
pages queried from Supabase inside the route's server handler, and never includes
`/auth` or `/dashboard`.

### SEO conventions

`src/lib/seo/` holds the shared pieces, and it is worth following them:

- `canonical.ts` — the one place the site origin is written down; `canonicalLink(path)`
  builds a self-referencing canonical. **Only leaf routes emit a canonical.** TanStack
  Router concatenates `links` from every matched route without de-duplicating, so a
  canonical in `__root.tsx` would emit a second one on every page.
- `head.ts` — `buildPageHead({ title, description, path, jsonLd })` produces the
  title/description/OG/Twitter/canonical set for a page. Use it for new public routes.
- `jsonld.ts` — structured-data builders. `Organization` is emitted once from the root;
  inner pages add `BreadcrumbList` plus `Service`/`WebPage`/`CollectionPage`. No
  invented ratings, review counts, or prices — pricing is dynamic and lives in
  Supabase/WHMCS.
- `routes.ts` — the public route inventory shared by the sitemap and the admin audit.
- `analytics.ts` — gtag.js loader; browser-only, at most one tag per measurement ID.

---

## Admin panel and content model

Sign in at `/auth` with a staff Supabase account, then use `/dashboard`. The panel is a
single route with tabbed sections (the tab lives in the URL hash, e.g.
`/dashboard#products`): Overview, Products, Categories, Marketing, News & Alerts,
Testimonials, Media Library, Global Settings, and SEO & Performance.

Authorisation is defence-in-depth: the route component checks the `has_role` RPC and
fails closed, server functions go through `requireSupabaseAuth`
(`src/integrations/supabase/auth-middleware.ts`), and **Postgres RLS is the real
boundary** — every table requires `has_role(auth.uid(), 'admin')` for writes while
allowing public reads of published content.

Content tables:

| Table                     | What it drives                                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `categories`              | Product groupings, nav entries, dynamic `/{slug}` pages, per-category SEO title/description and background media                                  |
| `products`                | Plans shown in the grids: price, currency, billing cycle, features, `is_featured`, and the WHMCS handoff (`whmcs_pid` or a `whmcs_link` override) |
| `site_settings`           | Key/value site configuration — company name, social links, analytics IDs, stored SEO audit results                                                |
| `promo_popups`            | The site-wide promo modal                                                                                                                         |
| `news_alerts`             | Announcement banners                                                                                                                              |
| `testimonials`            | Customer quotes                                                                                                                                   |
| `media` / `media_library` | Uploaded images and video used by the CMS                                                                                                         |
| `user_roles`              | Staff roles, read through the `has_role` security-definer function                                                                                |

The **SEO & Performance** tab runs `src/utils/seo-audit.ts`. It fetches the
server-rendered HTML of every public route and reports per-route findings (missing or
duplicate canonicals, title/description length, `h1`, OG tags, duplicate titles across
pages). It does not see content that appears only after hydration, and the stored
result says so in its `scope` field — read that before trusting the score.

---

## Database migrations

Migrations are plain SQL files in `supabase/migrations/`, named
`<timestamp>_<slug>.sql`, and they are the source of truth for schema, grants, RLS
policies, and seed rows. `src/integrations/supabase/types.ts` is generated from the
schema — do not hand-edit it.

They are applied through the project's Supabase/Lovable Cloud integration by whoever
owns the project. **Do not apply migrations ad hoc** from a local checkout: the hosted
database is shared, and an out-of-band change desynchronises it from this history. Add
a new file, get it reviewed, and let the owner apply it.

### Standing up a brand-new Supabase project

Migrations are stored in chronological filename order inside `supabase/migrations/`.
When linking a new Supabase project or setting up the database, apply the migrations
in `supabase/migrations/` via the Supabase CLI (`supabase db push`) or through the
Supabase dashboard migration runner.

Then point the app at the new project: the values in `.env` and `project_id` in
`supabase/config.toml` are where the project ref appears. **Rebuild
afterwards** — Vite inlines `VITE_*` at build time, so editing `.env` and restarting the
server leaves the old project ref compiled into `.output/`.

Finally, grant yourself the admin role. Signing up does not grant it automatically (the
trigger that used to was removed as a privilege-escalation backdoor in
`20260819091000_drop_admin_signup_backdoor.sql`). Ensure your user account exists in `auth.users`
and has an `'admin'` role entry in `public.user_roles`.

---

## Working in this repository — hard constraints

Read `AGENTS.md` too; it is short.

- **This project is connected to [Lovable](https://lovable.dev). Do not rewrite
  published git history** — no force pushes, and no rebasing, amending, or squashing of
  commits that are already pushed. Doing so rewrites history on Lovable's side and the
  owner can lose their project history. Commits pushed to the connected branch sync back
  into the Lovable editor, so keep the branch working.
- Do not add plugins to `vite.config.ts` (see above).
- Do not edit `src/routeTree.gen.ts`; it is regenerated by the router plugin.
- Keep `src/config/whmcs.ts` as the only place billing URLs are constructed.
- Run `npx tsc --noEmit -p tsconfig.json` and `bun run lint` before pushing.

## Visual language

Dark, high-contrast, and deliberately blunt: `bg-slate-950` surfaces, `indigo-500`/`600`
accents, `font-black tracking-tighter` headings, `rounded-[2rem]` cards, `border-white/5`
hairlines. New pages should match it.

## Lovable

Continue developing this project in the
[Lovable editor](https://lovable.dev/projects/8a0f3be5-0067-4064-a418-6cc3e5287de1).
Changes made there are committed to this repository, and changes pushed here appear in
the editor.

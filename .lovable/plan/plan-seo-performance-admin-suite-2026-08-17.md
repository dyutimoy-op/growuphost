# Plan: SEO & Performance Admin Suite

Implement performance optimizations, Google Analytics/Search Console integration, and an automated SEO audit dashboard managed from the Admin Panel.

## User Review Required

> [!IMPORTANT]
> The automated SEO audit is a simulation that checks for presence of meta tags and common issues on the frontend. Real external indexing data requires valid Google Search Console API credentials which must be added via Settings later.

- **Google Analytics ID**: Do you have a tracking ID (e.g., G-XXXXXX)? If not, I will add a field in the Admin Panel so you can add it later.
- **Search Console**: I will add a field for the HTML verification tag.

## Proposed Changes

### 1. Database Schema

- Update `site_settings` table to include new keys:
  - `google_analytics_id`
  - `google_search_console_tag`
  - `performance_lazy_loading` (toggle)
  - `performance_image_optimization` (toggle)
  - `seo_audit_results` (JSON storage for latest audit)

### 2. Admin Panel Enhancements (`src/routes/_authenticated/dashboard.tsx`)

- Add a new "SEO & Performance" tab.
- **Analytics Section**: Inputs for GA4 ID and Search Console verification.
- **Performance Section**: Toggles for Core Web Vitals optimizations.
- **Audit Dashboard**: A "Run Audit" button that scans current routes for:
  - Missing Meta Titles/Descriptions
  - Missing Image Alt tags
  - Broken Internal Links (simulated)
  - Heading structure (H1 presence)
- **Results Display**: Visual indicator of site health score.

### 3. Performance Optimization

- **Images**: Update `src/components/ProductGrid.tsx` and `src/components/Hero.tsx` to use responsive sizing and lazy loading.
- **JS/CSS**: Implement dynamic imports for heavy components like `Testimonials` or `PromoPopup` if not already optimized.

### 4. Integration Logic

- **Head Integration**: Update `src/routes/__root.tsx` to conditionally inject Google Analytics scripts based on admin settings.
- **SEO Headings**: Ensure all routes have appropriate semantic tags.

## Technical Details

- **Optimization**: Use `loading="lazy"` and `decoding="async"` on all non-hero images.
- **Audit Logic**: A frontend utility that uses `document.querySelectorAll` or route metadata checks to verify SEO compliance.
- **Storage**: Audit results will be persisted in `site_settings` as a JSON string to track improvements over time.

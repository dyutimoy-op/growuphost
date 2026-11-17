# SEO Implementation Plan

The objective is to resolve failing SEO findings and optimize the application's search engine presence by implementing comprehensive metadata, ensuring consistent titles/descriptions, and adhering to SEO best practices across all routes.

## User Review Required

> [!IMPORTANT]
>
> - Please confirm if there are specific primary keywords beyond "Mumbai", "NVMe", "LiteSpeed", and "Enterprise Hosting" that you would like to target.
> - Verify if there are any specific social media image URLs you'd like to use for OG/Twitter previews, or if we should rely on standard preview generation.

## Proposed Changes

### SEO Metadata Optimization

- Implement a unified `head` configuration strategy across all content routes using TanStack Router.
- Add missing `og:image` and `twitter:image` tags to all public-facing content routes (using placeholder-free absolute URLs if available, otherwise optimized for automatic generation).
- Ensure every route has a unique, descriptive, and keyword-rich `<title>` (under 60 chars) and `<meta name="description">` (under 160 chars).
- Verify and standardize social graph tags (`og:type`, `twitter:card`, `twitter:site`).

### Route Specific Optimization

- **Home (`/`)**: Broaden keyword coverage for enterprise infrastructure and Mumbai data center presence.
- **Service Pages (`/shared-hosting`, `/vps-hosting`, etc.)**: Target service-specific high-intent keywords (e.g., "LiteSpeed Shared Hosting Mumbai").
- **Legal Pages (`/legal/*`)**: Maintain `noindex` for privacy/terms while ensuring descriptive titles for trust signals.
- **Auth Page (`/auth`)**: Explicitly `noindex` to keep internal portal links out of search results.

### Technical SEO Hardening

- Add canonical tags to prevent duplicate content issues.
- Ensure semantic HTML structure (single H1 per page, proper heading hierarchy).
- Verify accessibility (aria-labels, alt text for all images).

## Technical Details

- Update `head()` functions in `src/routes/*.tsx` to match the required metadata schema.
- Add canonical link support in `src/routes/__root.tsx`.
- Review `src/components/Footer.tsx` and `src/components/Navbar.tsx` for semantic link structure and alt text consistency.

## Verification Plan

### Automated Checks

- Use `npm run build` to ensure metadata implementation doesn't break the SSR bundle.
- Inspect the rendered HTML of key pages to verify tag presence and correct values.

### Manual Verification

- Confirm meta descriptions appear correctly in page source.
- Check social sharing previews using standard debuggers (OG/Twitter).
- Verify mobile responsiveness of metadata-driven elements (favicon, theme-color).

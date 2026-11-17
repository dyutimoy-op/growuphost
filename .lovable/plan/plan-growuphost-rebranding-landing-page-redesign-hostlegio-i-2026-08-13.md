# Plan: GROWUPHOST Rebranding & Landing Page Redesign (HostLegio Inspired)

Redesign the GROWUPHOST landing page to match the professional dark aesthetic of hostlegio.com, including advanced animations, dynamic product displays, and a multi-page structure.

## User Review Required

> [!IMPORTANT]
>
> - The redesign will use a **Dark Professional** aesthetic (Deep blues/blacks, high-contrast typography).
> - We will implement a dynamic sidebar-managed structure where categories and products are fetched from the database.
> - New pages (About, Contact, SLA) will be added to match the target site.

## Proposed Changes

### Visual & Design System

- Update `src/styles.css` with a refined color palette (Deep navy `#05070a`, Primary indigo `#6366f1`).
- Implement high-contrast typography and neon accent gradients for a "Cyber/Enterprise" feel.
- Add global animations for section entries (fade-in, slide-up).

### Component Redesign

- **Navbar**: Multi-level dropdowns for hosting services, integrated search/user menu, and a "Top bar" for announcements.
- **Hero**: Immersive background with particles or slow-motion video loop, floating service cards, and quick-search for domains.
- **Product Sections**: "Plan Selector" tabs (Monthly/Annually), feature comparison tables, and detailed product cards with "Add to Cart" logic.
- **Testimonials/Stats**: Interactive grid showing real-time server stats and client feedback.

### Page Implementation

- **Shared Layout**: Advanced footer with comprehensive sitemap and social integrations.
- **New Routes**:
  - `/about`: Company mission and infrastructure overview.
  - `/contact`: Interactive support form and contact details.
  - `/legal/sla`: Detailed Service Level Agreement page.

### Admin Panel Enhancements

- Add "Page Content" editor to allow editing static text on About/Contact pages.
- Enhance Product Management to include "Features List" as a dynamic array.

## Technical Details

- **Framework**: TanStack Start (React 19, Vite).
- **Styling**: Tailwind CSS v4.
- **Database**: Lovable Cloud (Supabase) for real-time product/setting synchronization.
- **Icons**: Lucide React.
- **Animations**: Framer Motion (if available) or Tailwind Animate.

## Alternative Considerations

- **Static vs Dynamic**: We will keep most content dynamic (fetched from Supabase) to ensure the admin panel remains useful for the user.

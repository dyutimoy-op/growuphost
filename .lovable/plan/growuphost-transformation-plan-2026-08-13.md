# GROWUPHOST Transformation Plan

Transform the current landing page into a multi-page, professional hosting site inspired by the aesthetics and structure of [hostlegio.com](https://hostlegio.com/).

## Proposed Changes

### 1. Visual Overhaul

- **Aesthetic Refinement**: Adopt the "Deep Dark" theme from hostlegio.com using indigo/violet accents and a refined typography scale.
- **Enhanced Components**: Upgrade the Hero, Navbar, and Footer with more detailed layouts and interactions.
- **Glassmorphism**: Use more backdrop-blur effects and subtle gradients for a premium "enterprise" feel.

### 2. Multi-Page Architecture

Create the following pages to match the reference site:

- **Shared Hosting**: Dedicated page for entry-level plans.
- **VPS Hosting**: Specialized page for virtual private servers.
- **Dedicated Servers**: High-performance hardware leasing page.
- **Cloud Licenses**: Page for cPanel, LiteSpeed, CloudLinux licenses (as requested).
- **Contact**: Modern contact form with business info.

### 3. Dynamic Functionality

- **Centralized Link Management**: All internal and external links (WHMCS) will be manageable from the Admin Panel.
- **Product Filtering**: Products will be automatically routed to their respective category pages based on their category in the database.

## Technical Details

### Database Updates

- Ensure `categories` table contains: `shared-hosting`, `vps-hosting`, `dedicated-hosting`, `licenses`.
- Update `site_settings` to include more customizable links for specific pages.

### Frontend Components

- **Category-specific Product Grids**: Reusable component that filters products by category slug.
- **Layout Consistency**: Ensure all new pages share the same `Navbar` and `Footer`.

### Routing

- Implement new routes: `/shared-hosting`, `/vps-hosting`, `/dedicated-servers`, `/licenses`, `/contact`.

---

**Next Steps**: I will begin by expanding the database categories and then building out the new routes and their respective components.

# Visual & UI Fixes Plan

The user reports mismatched CSS and layout issues on the front page, and is asking about Admin Panel access.

## Proposed Changes

### 1. Front-End UI Cleanup
*   **Fix Layout Shifts**: Ensure the mobile menu and other hidden elements don't cause horizontal overflow or layout jumps.
*   **Refine Card Grids**: Ensure uniform card heights and consistent padding across `ProductGrid` and `CategoryProductGrid`.
*   **Fix "White Space" Issues**: The user mentioned "mis match css details and in area", likely referring to empty spaces or misaligned sections.
*   **Admin Access Visibility**: Ensure the admin link is clearly accessible (or explain how to access it) when the user is logged in.

### 2. Admin Panel Polish
*   **Theme Consistency**: Update the Admin Panel to use a dark theme matching the landing page (currently it uses a light theme `bg-slate-50`).
*   **Sidebar Links**: Fix the dead links in the Admin Sidebar (currently many `to="/"` links).
*   **Dashboard Visuals**: Improve the dashboard stats cards to feel more "Enterprise".

## Technical Details
*   Modify `src/styles.css` to add utility for hiding horizontal overflow.
*   Update `src/routes/_authenticated/route.tsx` and `src/routes/_authenticated/dashboard.tsx` to use dark mode tokens.
*   Fix `Navbar.tsx` mobile menu state to prevent layout flickering.

## How to access the Admin Panel
1. Go to `/auth` to login or register.
2. Once authenticated, navigate to `/dashboard`.
3. The Admin Panel is protected and only accessible to logged-in users.

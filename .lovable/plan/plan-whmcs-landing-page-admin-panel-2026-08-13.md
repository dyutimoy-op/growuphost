# Plan - WHMCS Landing Page & Admin Panel

Build a modern hosting landing page for a WHMCS backend, featuring dynamic content management for hosting, reseller, servers, and licenses.

## User Review Required

> [!IMPORTANT]
> The admin panel will be built into the main app using Lovable Cloud (Supabase). Would you like the admin panel to be at a specific route like `/admin`, or should it be a separate dashboard?

## Proposed Changes

### Database Schema (Lovable Cloud)
- **Categories Table**: Store categories like 'Hosting', 'Reseller', 'Server', 'License'.
- **Products Table**: Store product details (name, description, price, features, category_id, is_featured).
- **Media Table**: Store loop videos, GIFs, and photos for the frontend.
- **Settings Table**: Store site-wide configuration (hero text, contact info).

### Frontend (Landing Page)
- **Navigation Bar**: Modern design with dropdowns for Hosting, Reseller, Server, etc. (inspired by user uploads).
- **Hero Section**: High-impact section with support for background videos/GIFs.
- **Product Sections**: Dynamic sections fetching products from the database, grouped by category.
- **Featured Products**: Highlighted products with distinctive UI.
- **Footer**: Detailed footer with "Company Stats", "About & Support", and "Legal & Trust" sections.

### Admin Panel
- **Dashboard**: Overview of products and categories.
- **Content Management**: Interfaces to add, edit, or delete categories and products.
- **Media Management**: Upload and manage videos, GIFs, and photos.
- **Settings Page**: Update text and visual highlights on the frontend.

## Technical Details
- **Backend**: Lovable Cloud (Supabase) for database, auth, and storage.
- **Styling**: Tailwind CSS v4 with Shadcn UI components.
- **Routing**: TanStack Router with `_authenticated` layout for the admin panel.
- **Media**: Videos and GIFs handled via Lovable Assets and displayed in loop.
- **Auth**: Admin-only access to the management routes.

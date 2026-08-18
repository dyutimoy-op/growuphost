---
title: Dynamic Category Routing & Packages Page
description: Implement automatic page creation for categories/subcategories and a dedicated /packages route.
technical_details:
  - Create a catch-all route `src/routes/$categorySlug.tsx` to handle dynamic category pages.
  - Implement a dedicated `src/routes/packages.tsx` page listing all products.
  - Update Admin category management to support slug-based routing automatically.
  - Ensure SEO metadata is dynamically generated for each category.
---

## User Requirements
- **Dynamic Category Pages**: Automatically create/show a page when a category or subcategory is created in the admin panel.
- **Packages Page**: Add a dedicated `/packages` page listing all hosting plans with pricing, specs, and purchase buttons.

## Proposed Changes

### 1. Dynamic Routing Architecture
- **Problem**: Currently, routes like `/shared-hosting` are hardcoded files.
- **Solution**: Move to a dynamic route structure using `src/routes/$categorySlug.tsx`.
- **Action**: 
    - Create `src/routes/$categorySlug.tsx` which uses the slug from the URL to fetch category data and products.
    - Keep existing hardcoded routes for specific customization if needed, but the dynamic route will handle any new categories.

### 2. Dedicated Packages Page
- **Route**: `src/routes/packages.tsx`
- **Content**: A comprehensive list of all products, grouped by category, with a search/filter interface.
- **Features**: Pricing toggle (Monthly/Annually), specifications list, and "Configure" buttons linking to WHMCS.

### 3. Admin Panel Enhancements
- Update the Navbar to ensure it links correctly to the dynamic routes.
- Add a "View Page" link in the Category management table to quickly check the public-facing page.

### 4. SEO & Metadata
- Implement a `head()` function in the dynamic route that fetches SEO titles and descriptions from the `categories` table (I will add `seo_title` and `seo_description` columns to the table).

## Technical Implementation Details
- **Dynamic Route**: `createFileRoute('/$categorySlug')`
- **Data Fetching**: Use TanStack Query to fetch category details and associated products by slug.
- **Database Migration**: Add `seo_title` and `seo_description` columns to the `categories` table.

# Product & Category Management Plan

The admin dashboard currently focuses on global settings and navigation. This plan will add comprehensive management for products and categories, allowing full control over the marketplace directly from the Admin Panel.

## Features

- **Product Management**: Add, edit, and delete products with fields for name, price, description, billing cycle, features (JSON list), and WHMCS links.
- **Category Management**: Create and manage product categories (Hosting, VPS, etc.) with control over descriptions and navigation visibility.
- **Improved Admin Navigation**: Tabs or sections to easily switch between Global Settings, Categories, and Products.

## Technical Details

- **Database**: Uses existing `products` and `categories` tables in Supabase.
- **UI Components**:
  - `ProductManager`: A new section in the dashboard with a list/table of products and a "Add Product" dialog.
  - `CategoryManager`: A new section to manage category metadata beyond just navigation toggles.
  - `FeatureEditor`: A simple interface to manage the JSON features list for each product.
- **State Management**: Uses TanStack Query for data fetching and mutations with optimistic updates and toast notifications for user feedback.

## Implementation Steps

1.  **Refactor Admin Dashboard**: Introduce a tabbed layout to separate "Global Config", "Products", and "Categories".
2.  **Add Category Management**: Extend the existing category section to support adding, editing (name/slug/description), and deleting categories.
3.  **Add Product Management**:
    - Build a product list with search and filtering.
    - Create a comprehensive "Add/Edit Product" form supporting all database fields.
    - Implement the delete functionality with confirmation.
4.  **Security**: Ensure all mutations are restricted to authenticated admin users via Supabase RLS policies (already in place).

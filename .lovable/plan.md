# GROWUPHOST Full Control Admin & Marketing Suite

This plan implements a comprehensive management system for GROWUPHOST, allowing the admin to control every aspect of the site, from products and categories to marketing popups and testimonials.

## Features

- **Marketing Popups**: Create and manage floating promotional popups with images, descriptions, and coupon codes. Admin can toggle them on/off and set "don't show again" behavior.
- **Product & Category Suite**: Full CRUD (Create, Read, Update, Delete) for hosting plans and categories.
  - **Dynamic Banners**: Support for images, GIFs, and short-duration video backgrounds in category headers.
- **Global Link & Info Management**: Centralized control for all social links, contact numbers, emails, and navigation buttons (Login/Register/Offers).
- **Testimonials & Trust**: Manage customer reviews and ratings displayed on the landing page.
- **Improved Admin Experience**: A tabbed, high-performance interface for managing these distinct areas.

## Technical Details

- **Database**:
  - `promo_popups`: Store active marketing campaigns.
  - `testimonials`: Store user feedback.
  - `categories`: Extended with `background_media_url` and `type`.
  - `site_settings`: Expanded to cover all contact/social/link configurations.
- **UI Components**:
  - `PromoPopup`: A client-side component that handles display logic and local storage persistence for the "close" state.
  - `AdminPanel (Refactor)`: Reorganized into Tabs: Dashboard, Products, Categories, Marketing (Popups/News), Testimonials, and Global Settings.
  - `MediaPicker`: Enhanced logic to handle Video/GIF/Image URLs for headers.

## Implementation Steps

1.  **Database Expansion**: Apply migrations for popups, testimonials, and category media fields.
2.  **Marketing & Social Admin**: Add dedicated management tabs for Promo Popups and Global Links (Social/Contact).
3.  **Product & Category Mastery**: Implement full CRUD forms with media type selection for banners.
4.  **Frontend Integration**:
    - Mount the `PromoPopup` component in the root route.
    - Update `CategoryProductGrid` and Hero components to use dynamic media backgrounds.
    - Implement a `Testimonials` section on the homepage.

# Plan: Enterprise Admin Overhaul & Subcategories

Complete overhaul of the Admin Panel UI and backend logic to support nested categories, reliable CRUD operations, and a sidebar-based professional interface.

## 1. UI Refactoring
- **Admin Sidebar**: Replace the top tab-bar with a professional dark sidebar on the left.
- **Improved Aesthetics**: Use deeper shadows, consistent glassmorphism, and better spacing.
- **Persistent Save Buttons**: Add explicit "Save Changes" buttons to all configuration sections to ensure user intent is captured.

## 2. Product Management Fixes
- **Functional CRUD**: Fix the "Add" and "Edit" buttons which are currently unresponsive.
- **Category Fetching**: Ensure the product form fetches and displays available categories and subcategories in a dropdown.
- **Product Listing**: Add a `display_order` to allow custom sorting.

## 3. Category & Subcategory System
- **Subcategories Support**: Implement `parent_id` logic to allow nesting (e.g., Hosting -> Shared Hosting).
- **Navigation Logic**: 
    - Subcategories will not appear directly in the main navbar.
    - Hovering over a parent category in the navbar will trigger a floating dropdown showing its subcategories.
- **Category CRUD**: Fix "New Category" and "Edit Settings" buttons; add a functional "Delete" button.

## 4. Marketing & Global Controls
- **Marketing CRUD**: Add a "Delete" button for promotional popups.
- **Global Settings**: Ensure all settings (Login/Register URLs, contact info) are reliably saved and reflected across the site.

## Technical Details
- **Database**: 
    - `categories` table updated with `parent_id` (UUID) and `display_order` (Int).
    - `products` table updated with `display_order` (Int).
- **Components**:
    - `AdminSidebar.tsx`: New component for navigation.
    - `Navbar.tsx`: Updated with `framer-motion` for subcategory dropdowns.
    - `dashboard.tsx`: Refactored to use a sidebar layout and separate views for each management section.
- **State Management**: Use `react-query` mutations for all operations with `sonner` toasts for success/error feedback.

## Next Steps
1. Refactor `src/routes/_authenticated/dashboard.tsx` for sidebar layout.
2. Implement functional Modals for Product/Category CRUD.
3. Update `src/components/Navbar.tsx` to handle subcategory hover states.

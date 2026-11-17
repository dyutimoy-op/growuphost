# Media Library & Image Upload Enhancement

Implement a robust media management system including a centralized gallery, enhanced upload reliability, and library integration across the admin panel.

## User Review Required

> [!IMPORTANT]
> A new `media_library` table has been created in the database to track all uploads. You can now access the "Media Library" tab in your admin dashboard.

- **Storage**: All media is stored in the 'media' bucket.
- **Library**: The new Gallery allows you to reuse previously uploaded images for Products and Marketing Popups.

## Proposed Changes

### Database & Storage

- Created `public.media_library` table to track filenames, URLs, types, and sizes.
- Updated `uploadMedia` utility to automatically register every successful upload into the library.

### Admin Components

- **MediaGallery**: A new modal component for browsing, searching, and selecting existing media.
- **MediaUpload**: Improved with file size checks and better error handling.
- **ProductModal**: Added "Gallery" button to select existing product images.
- **MarketingModal**: Added "Gallery" button for popup images.

### Dashboard Integration

- Added "Media Library" tab to the Admin Sidebar.
- Added a "Launch Media Library" section in the dashboard for general asset management.
- Implemented "Copy to Clipboard" when selecting an image from the library in the main Media tab.

## Technical Details

### SQL Schema

```sql
CREATE TABLE public.media_library (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    url text NOT NULL,
    filename text NOT NULL,
    file_type text,
    file_size bigint,
    created_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);
```

### New Files

- `src/components/admin/MediaGallery.tsx`: The main library UI component.
- `src/lib/storage.ts`: Updated with library registration logic.

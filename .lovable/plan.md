# Media Management Implementation Plan

Add image, GIF, and video upload support to the Admin Panel for categories (banners) and promotional popups using backend storage.

## User Review Required

> [!IMPORTANT]
> The implementation uses the backend's built-in storage system. Large video files may be subject to upload limits depending on the environment configuration.

## Proposed Changes

### Storage Infrastructure
- Create a `media` bucket in the backend storage.
- Add RLS policies to the `media` bucket:
  - `public` can read objects.
  - `authenticated` (admins) can upload, update, and delete objects.

### Admin Dashboard Enhancements
- Create a `MediaUpload` component for the dashboard.
  - Support drag-and-drop and file selection.
  - Filter by type (image, video, gif).
  - Handle upload state and progress.
  - Automatically update the corresponding record (category banner or popup image) with the new public URL.
- Refactor the **Categories** tab:
  - Replace the "Banner Media URL" text input with the new `MediaUpload` component.
  - Add a preview for the currently selected media.
- Refactor the **Marketing** (Popups) tab:
  - Add the `MediaUpload` component to each popup card to manage its promotional image.

### Visual Polish
- Add loading spinners and success toasts for uploads.
- Ensure media previews handle aspect ratios correctly (especially for wide banners).

## Technical Details

### Storage Helper
Create `src/lib/storage.ts` to encapsulate storage operations:
```typescript
export const uploadMedia = async (file: File, path: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${path}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('media')
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('media')
    .getPublicUrl(filePath);

  return publicUrl;
};
```

### Components
- `src/components/admin/MediaUpload.tsx`: A reusable component using `Input type="file"` styled with Tailwind.

### Database Updates
The `media` table already exists in the schema and will be used to track uploaded assets for easier management in a future "Media Library" tab if needed.

# Optimized Media Uploads & Drag-and-Drop Enhancement

Implement an advanced media management system featuring drag-and-drop uploads, automatic client-side image optimization (resizing/thumbnails), and strict validation for file sizes and types to ensure high performance and security.

## User Review Required

> [!IMPORTANT]
> The upload process now automatically optimizes your images before they reach the server. This means faster loading times for your visitors and less storage usage.

- **Drag & Drop**: You can now drag images directly into the upload area.
- **Auto-Optimization**: Images larger than 1200px are automatically resized, and quality is balanced for web performance.
- **Validation**: Strict checks for supported formats (JPG, PNG, GIF, WebP, MP4) and a 10MB size limit.

## Proposed Changes

### Media Upload Component

- **Drag-and-Drop**: Added `onDragOver`, `onDragLeave`, and `onDrop` handlers to `MediaUpload.tsx`.
- **Upload Progress**: Implemented visual feedback using a progress indicator during the optimization and upload phases.
- **Optimization Algorithm**: Added a client-side image processing utility that uses Canvas to resize large images and compress them before uploading.
- **Strict Validation**: Implemented detailed checks for MIME types and file extensions to prevent unsupported uploads.

### Database & Storage

- No schema changes required; these optimizations occur on the client side to minimize server load.

## Technical Details

### Image Optimization Strategy

- **Max Width/Height**: 1200px (configurable).
- **Format**: Converted to WebP where possible for superior compression, or high-quality JPEG as a fallback.
- **Thumbnail Generation**: Automatically handled by the optimization logic to ensure fast gallery loading.

### New Utilities

- Added `src/utils/media-optimization.ts` for handling client-side image processing.

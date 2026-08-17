/**
 * Media optimization utilities for client-side image processing.
 */

export const MAX_WIDTH = 1200;
export const MAX_HEIGHT = 1200;
export const QUALITY = 0.8;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

export interface OptimizationResult {
  file: File | Blob;
  isOptimized: boolean;
  originalSize: number;
  optimizedSize: number;
}

/**
 * Validates a file before upload
 */
export const validateFile = (file: File, allowedTypes?: string[]): { valid: boolean; error?: string } => {
  const types = allowedTypes || [...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_VIDEO_TYPES];
  
  if (!types.includes(file.type)) {
    return { 
      valid: false, 
      error: `Unsupported file type: ${file.type}. Supported types: ${types.join(', ')}` 
    };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `File too large: ${(file.size / (1024 * 1024)).toFixed(2)}MB. Max limit: 10MB` 
    };
  }
  
  return { valid: true };
};

/**
 * Resizes and optimizes an image client-side
 */
export const optimizeImage = async (file: File): Promise<OptimizationResult> => {
  // Only optimize images, not GIFs or videos
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type) || file.type === 'image/gif') {
    return {
      file,
      isOptimized: false,
      originalSize: file.size,
      optimizedSize: file.size
    };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Export as WebP if supported, otherwise JPEG
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({
                file: blob,
                isOptimized: true,
                originalSize: file.size,
                optimizedSize: blob.size
              });
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          'image/webp',
          QUALITY
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

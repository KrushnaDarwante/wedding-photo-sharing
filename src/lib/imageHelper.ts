/**
 * Client-side high performance image thumbnail generator and dimensions reader.
 */

import { WeddingPhoto } from '../types';

/**
 * Safe fallback image data URI (SVG) rendered if an image genuinely fails to load.
 * Premium champagne background with camera icon.
 */
export const FALLBACK_IMAGE_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450" fill="none">
  <rect width="600" height="450" fill="#FAF6F0"/>
  <rect x="1" y="1" width="598" height="448" stroke="#E8E0D2" stroke-width="2"/>
  <circle cx="300" cy="205" r="42" fill="#EFE8DC"/>
  <path d="M285 190H315L322 200H334C337.3 200 340 202.7 340 206V226C340 229.3 337.3 232 334 232H266C262.7 232 260 229.3 260 226V206C260 202.7 262.7 200 266 200H278L285 190Z" stroke="#9A7B4F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="300" cy="216" r="10" stroke="#9A7B4F" stroke-width="2"/>
  <text x="300" y="270" font-family="serif" font-size="14" fill="#6B5E4F" text-anchor="middle" letter-spacing="1">AuraWed Fine Art Archive</text>
  <text x="300" y="290" font-family="sans-serif" font-size="11" fill="#9C8E7E" text-anchor="middle">Photograph Archive Mode</text>
</svg>
`)}`;

/**
 * Normalizes image paths to ensure consistent loading across dev and production.
 * Automatically rewrites legacy /src/assets/images paths to /assets/images.
 */
export function normalizeImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') {
    return FALLBACK_IMAGE_DATA_URI;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return FALLBACK_IMAGE_DATA_URI;
  }

  // Already a data URI or blob URL
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Rewrite legacy Vite /src/ paths to public /assets/
  if (trimmed.startsWith('/src/assets/images/')) {
    return trimmed.replace('/src/assets/images/', '/assets/images/');
  }
  if (trimmed.startsWith('src/assets/images/')) {
    return '/' + trimmed.replace('src/assets/images/', 'assets/images/');
  }

  // If path starts with assets/images without leading slash
  if (trimmed.startsWith('assets/images/')) {
    return '/' + trimmed;
  }

  return trimmed;
}

/**
 * Get the best thumbnail URL for a wedding photo.
 */
export function getPhotoThumbnailUrl(photo: WeddingPhoto): string {
  const url = photo.thumbnailUrl || photo.cdnUrlThumb || photo.originalUrl;
  return normalizeImageUrl(url);
}

/**
 * Get the original full-resolution photo URL for Lightbox and HD downloads.
 */
export function getPhotoOriginalUrl(photo: WeddingPhoto): string {
  const url = photo.originalUrl || photo.cdnUrlOriginal || photo.thumbnailUrl;
  return normalizeImageUrl(url);
}

export interface ThumbnailResult {
  thumbnailUrl: string;
  width: number;
  height: number;
}

/**
 * Generate an optimized thumbnail from a File or Blob using HTML5 Canvas.
 */
export async function createOptimizedThumbnail(
  file: File,
  maxWidth: number = 700,
  maxHeight: number = 700,
  quality: number = 0.82
): Promise<ThumbnailResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const originalWidth = width;
        const originalHeight = height;

        // Calculate aspect-ratio preserved dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            thumbnailUrl: event.target?.result as string,
            width: originalWidth,
            height: originalHeight
          });
          return;
        }

        // High quality downscaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to data URL (prefer webp if supported, otherwise jpeg)
        try {
          const thumbDataUrl = canvas.toDataURL('image/webp', quality);
          resolve({
            thumbnailUrl: thumbDataUrl,
            width: originalWidth,
            height: originalHeight
          });
        } catch {
          const thumbDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve({
            thumbnailUrl: thumbDataUrl,
            width: originalWidth,
            height: originalHeight
          });
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for thumbnail creation'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };

    reader.readAsDataURL(file);
  });
}

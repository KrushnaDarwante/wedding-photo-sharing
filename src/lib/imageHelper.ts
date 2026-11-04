/**
 * Client-side high performance image thumbnail generator and dimensions reader.
 */

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

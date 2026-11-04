import JSZip from 'jszip';
import { WeddingPhoto } from '../types';

export type ZipProgressCallback = (current: number, total: number, percent: number, status: string) => void;

/**
 * Trigger download of a single photo file directly in the browser.
 */
export async function downloadSinglePhoto(photo: WeddingPhoto) {
  try {
    const response = await fetch(photo.originalUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = photo.filename || `wedding-photo-${photo.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.warn('Direct blob fetch failed, falling back to direct anchor download:', err);
    const link = document.createElement('a');
    link.href = photo.originalUrl;
    link.download = photo.filename || `wedding-photo-${photo.id}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Download an array of photos as a single zipped archive with progress updates.
 */
export async function downloadPhotosAsZip(
  photos: WeddingPhoto[],
  zipFilename: string,
  onProgress?: ZipProgressCallback
): Promise<void> {
  if (photos.length === 0) return;

  const zip = new JSZip();
  const total = photos.length;

  onProgress?.(0, total, 0, `Preparing archive for ${total} photograph${total > 1 ? 's' : ''}...`);

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const itemIndex = i + 1;
    const progressPercent = Math.round((i / total) * 80);

    onProgress?.(
      itemIndex,
      total,
      progressPercent,
      `Fetching photo ${itemIndex} of ${total} (${photo.filename})...`
    );

    try {
      const response = await fetch(photo.originalUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch photo ${photo.id}: ${response.statusText}`);
      }
      const blob = await response.blob();
      
      // Categorized folder structure inside ZIP: e.g. "Ceremony/photo.jpg"
      const folderName = photo.category ? photo.category.replace(/[^a-zA-Z0-9_-]/g, '_') : 'General';
      const cleanFileName = photo.filename || `wedding_photo_${photo.id}.jpg`;
      
      zip.folder(folderName)?.file(cleanFileName, blob);
    } catch (err) {
      console.error(`Error adding ${photo.filename} to ZIP:`, err);
      // Even if one fails, continue with the remaining photos
    }
  }

  onProgress?.(total, total, 85, 'Compressing photographs into ZIP archive...');

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    },
    (metadata) => {
      const compressionPercent = 85 + Math.round(metadata.percent * 0.15);
      onProgress?.(total, total, Math.min(100, compressionPercent), `Compressing ${Math.round(metadata.percent)}%...`);
    }
  );

  onProgress?.(total, total, 100, 'Download starting...');

  const downloadUrl = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = zipFilename.endsWith('.zip') ? zipFilename : `${zipFilename}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}

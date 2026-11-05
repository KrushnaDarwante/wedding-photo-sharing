/**
 * Large-Scale Cloud Object Storage & CDN Delivery Engine
 * Supports Cloudflare R2, AWS S3, Supabase Storage, and local caching.
 */

import { WeddingPhoto } from '../types';
import { normalizeImageUrl } from './imageHelper';

export interface StorageCostEstimate {
  storageProvider: 'Cloudflare R2' | 'AWS S3' | 'Supabase Storage';
  photoCount: number;
  originalStorageGb: number;
  optimizedStorageGb: number;
  thumbnailStorageGb: number;
  totalStorageGb: number;
  monthlyStorageCost: number;
  monthlyEgressCost: number; // Cloudflare R2 = $0! AWS S3 = $0.09/GB
  monthlyApiRequestsCost: number;
  totalMonthlyCost: number;
  notes: string;
}

/**
 * Real-world pricing benchmarks:
 * - Cloudflare R2: $0.015 / GB-month storage, $0.00 / GB egress (ZERO bandwidth fees!), $4.50 per 1M Class A operations
 * - AWS S3 Standard: $0.023 / GB-month storage, $0.09 / GB internet egress, $0.005 per 1,000 PUT operations
 * - Supabase Storage Pro: $0.021 / GB-month beyond 100GB, $0.09 / GB egress beyond 250GB
 */
export function calculateStorageCosts(params: {
  photoCount: number;
  originalSizeGb: number;
  guestCount: number;
  averageDownloadsPerGuest: number;
}): {
  r2: StorageCostEstimate;
  s3: StorageCostEstimate;
  supabase: StorageCostEstimate;
} {
  const { photoCount, originalSizeGb, guestCount, averageDownloadsPerGuest } = params;

  // Optimized WebP version is typically ~25% of raw HD size (e.g. 10MB JPG -> 2.5MB WebP 2048px)
  const optimizedSizeGb = originalSizeGb * 0.25;
  // Thumbnails (600px WebP) are ~3% of raw HD size (e.g. 10MB -> 300KB)
  const thumbSizeGb = originalSizeGb * 0.03;
  const totalStorageGb = originalSizeGb + optimizedSizeGb + thumbSizeGb;

  // Estimated egress:
  // Each guest views ~60 optimized images (60 * 2.5MB = 150MB)
  // Plus downloads: e.g. 5 HD originals (5 * 10MB = 50MB) + ~10% download full ZIP
  const guestBrowsingEgressGb = (guestCount * 60 * 2.5) / 1024;
  const guestDownloadEgressGb = (guestCount * averageDownloadsPerGuest * 10) / 1024;
  const bulkZipDownloadsCount = Math.round(guestCount * 0.08); // 8% download complete ZIP (divided into volumes)
  const bulkZipEgressGb = bulkZipDownloadsCount * (originalSizeGb * 0.85); // 15% ZIP compression
  const totalEgressGb = guestBrowsingEgressGb + guestDownloadEgressGb + bulkZipEgressGb;

  // 1. Cloudflare R2
  const r2Storage = totalStorageGb * 0.015;
  const r2Egress = 0.0; // $0 egress
  const r2Ops = (photoCount * 3 * 0.0000045) + (guestCount * 50 * 0.00000036);
  const r2Total = r2Storage + r2Egress + r2Ops;

  // 2. AWS S3 Standard
  const s3Storage = totalStorageGb * 0.023;
  const s3Egress = totalEgressGb * 0.09; // AWS charges $0.09/GB for data transfer out
  const s3Ops = (photoCount * 3 * 0.000005) + (guestCount * 50 * 0.0000004);
  const s3Total = s3Storage + s3Egress + s3Ops;

  // 3. Supabase Storage (Pro tier includes 100GB storage + 250GB bandwidth)
  const supabaseExtraStorage = Math.max(0, totalStorageGb - 100) * 0.021;
  const supabaseExtraEgress = Math.max(0, totalEgressGb - 250) * 0.09;
  const supabaseTotal = 25 /* base Pro fee */ + supabaseExtraStorage + supabaseExtraEgress;

  return {
    r2: {
      storageProvider: 'Cloudflare R2',
      photoCount,
      originalStorageGb: Math.round(originalSizeGb),
      optimizedStorageGb: Math.round(optimizedSizeGb),
      thumbnailStorageGb: Math.round(thumbSizeGb),
      totalStorageGb: Math.round(totalStorageGb),
      monthlyStorageCost: parseFloat(r2Storage.toFixed(2)),
      monthlyEgressCost: 0,
      monthlyApiRequestsCost: parseFloat(r2Ops.toFixed(2)),
      totalMonthlyCost: parseFloat(r2Total.toFixed(2)),
      notes: 'Recommended for 15,000+ photo weddings due to zero egress bandwidth costs and high global CDN performance.'
    },
    s3: {
      storageProvider: 'AWS S3',
      photoCount,
      originalStorageGb: Math.round(originalSizeGb),
      optimizedStorageGb: Math.round(optimizedSizeGb),
      thumbnailStorageGb: Math.round(thumbSizeGb),
      totalStorageGb: Math.round(totalStorageGb),
      monthlyStorageCost: parseFloat(s3Storage.toFixed(2)),
      monthlyEgressCost: parseFloat(s3Egress.toFixed(2)),
      monthlyApiRequestsCost: parseFloat(s3Ops.toFixed(2)),
      totalMonthlyCost: parseFloat(s3Total.toFixed(2)),
      notes: 'High egress costs ($0.09/GB) make AWS S3 prohibitively expensive for guest HD bulk downloads without CloudFront private pricing.'
    },
    supabase: {
      storageProvider: 'Supabase Storage',
      photoCount,
      originalStorageGb: Math.round(originalSizeGb),
      optimizedStorageGb: Math.round(optimizedSizeGb),
      thumbnailStorageGb: Math.round(thumbSizeGb),
      totalStorageGb: Math.round(totalStorageGb),
      monthlyStorageCost: parseFloat((25 + supabaseExtraStorage).toFixed(2)),
      monthlyEgressCost: parseFloat(supabaseExtraEgress.toFixed(2)),
      monthlyApiRequestsCost: 0,
      totalMonthlyCost: parseFloat(supabaseTotal.toFixed(2)),
      notes: 'Excellent native developer ergonomics and RLS security integration; costs scale cleanly with moderate egress.'
    }
  };
}

/**
 * Generate high-speed CDN URLs with responsive image delivery
 */
export function getOptimizedImageUrl(photo: WeddingPhoto, size: 'thumb' | 'optimized' | 'original' = 'optimized'): string {
  if (size === 'thumb') {
    return normalizeImageUrl(photo.cdnUrlThumb || photo.thumbnailUrl || photo.originalUrl);
  }
  if (size === 'optimized') {
    return normalizeImageUrl(photo.cdnUrlOptimized || photo.optimizedUrl || photo.thumbnailUrl || photo.originalUrl);
  }
  return normalizeImageUrl(photo.cdnUrlOriginal || photo.originalUrl);
}

/**
 * Verify image magic header to prevent corrupt files from polluting storage
 */
export async function verifyImageIntegrity(file: File): Promise<{ valid: boolean; format?: string; error?: string }> {
  try {
    const slice = file.slice(0, 12);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // JPEG: FF D8 FF
    if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
      return { valid: true, format: 'jpeg' };
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47 &&
      bytes[4] === 0x0D && bytes[5] === 0x0A && bytes[6] === 0x1A && bytes[7] === 0x0A
    ) {
      return { valid: true, format: 'png' };
    }

    // WEBP: RIFF .... WEBP
    if (
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
    ) {
      return { valid: true, format: 'webp' };
    }

    // HEIC / AVIF: .... ftyp
    if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
      return { valid: true, format: 'heic/avif' };
    }

    return {
      valid: false,
      error: `Invalid image signature or corrupted binary header in ${file.name}.`
    };
  } catch (err: any) {
    return {
      valid: false,
      error: `Failed to inspect file integrity: ${err?.message || 'Read error'}`
    };
  }
}

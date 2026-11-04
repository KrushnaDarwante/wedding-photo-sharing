export type ProcessingStatus = 'pending' | 'processing' | 'ready' | 'failed';
export type StorageProvider = 'r2' | 's3' | 'supabase' | 'local';

export interface PhotographerProfile {
  id: string;
  email: string;
  businessName: string;
  tagline?: string;
  logoUrl?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  plan: 'starter' | 'pro' | 'agency';
  storageLimitBytes: number;
  storageUsedBytes: number;
  storageOriginalsBytes?: number;
  storageOptimizedBytes?: number;
  storageThumbnailsBytes?: number;
  createdAt: string;
}

export interface WeddingEvent {
  id: string;
  photographerId: string;
  coupleNames: string;
  slug: string;
  weddingDate: string;
  venue?: string;
  description?: string;
  coverPhotoUrl: string;
  isQrActive: boolean;
  qrCodeUrl?: string;
  totalPhotos: number;
  totalViews: number;
  totalDownloads: number;
  storageBytes: number;
  categories: string[];
  retentionDays?: number; // Configurable archival retention
  deletedAt?: string | null; // Soft deletion
  createdAt: string;
  updatedAt: string;
}

export interface WeddingPhoto {
  id: string;
  eventId: string;
  photographerId: string;
  originalUrl: string;
  thumbnailUrl: string;
  optimizedUrl?: string;
  cdnUrlOriginal?: string;
  cdnUrlOptimized?: string;
  cdnUrlThumb?: string;
  storageProvider?: StorageProvider;
  storagePathOriginal?: string;
  storagePathOptimized?: string;
  storagePathThumb?: string;
  checksumSha256?: string;
  filename: string;
  fileSizeBytes: number;
  width?: number;
  height?: number;
  category: string;
  caption?: string;
  tags?: string[];
  viewsCount: number;
  downloadsCount: number;
  processingStatus?: ProcessingStatus;
  processingError?: string;
  uploadBatchId?: string;
  deletedAt?: string | null;
  createdAt: string;
  uploadedAt: string;
}

export interface PhotoCategory {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

export interface GalleryAnalytics {
  eventId: string;
  uniqueVisitors: number;
  totalViews: number;
  totalDownloads: number;
  bandwidthSavedBytes?: number;
  viewsByCategory: Record<string, number>;
  downloadsByCategory: Record<string, number>;
  lastVisitedAt: string;
}

export interface UploadProgressItem {
  id: string;
  file: File;
  name: string;
  size: number;
  category: string;
  progress: number; // 0 - 100
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error' | 'paused';
  errorMessage?: string;
  thumbnailUrl?: string;
  checksumSha256?: string;
  retryCount?: number;
}

export interface MultiVolumeZipArchive {
  id: string;
  volumeNumber: number;
  totalVolumes: number;
  title: string;
  category?: string;
  photoCount: number;
  estimatedSizeBytes: number;
  status: 'pending' | 'ready' | 'generating' | 'failed';
  downloadUrl?: string;
  expiresAt?: string;
  photoIds: string[];
}

export type AppView = 
  | { type: 'home' }
  | { type: 'auth'; initialMode?: 'login' | 'register' | 'forgot' }
  | { type: 'dashboard'; tab?: 'events' | 'create-event' | 'settings' | 'analytics' }
  | { type: 'event-detail'; eventId: string; tab?: 'photos' | 'qr' | 'analytics' | 'settings' }
  | { type: 'guest-gallery'; eventSlug: string; photoId?: string };

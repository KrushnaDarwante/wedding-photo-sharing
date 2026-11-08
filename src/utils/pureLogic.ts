/**
 * Pure helper functions and business rule validators for AuraWed.
 * Completely decoupled from React and DOM for high-speed deterministic unit testing.
 */

export interface PhotoValidationInput {
  name: string;
  type: string;
  size: number; // bytes
}

export const MAX_PHOTO_SIZE_BYTES = 50 * 1024 * 1024; // 50MB per photo
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/avif'];

/**
 * Format raw byte count into readable KB, MB, GB.
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Generate a clean, URL-safe slug for a wedding event.
 */
export function generateSlug(coupleNames: string, dateStr?: string): string {
  const cleanNames = coupleNames
    .toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!dateStr) return cleanNames;

  const datePart = dateStr.replace(/[^0-9]/g, '').slice(0, 8);
  return datePart ? `${cleanNames}-${datePart}` : cleanNames;
}

/**
 * Validate image file type and size.
 */
export function validatePhotoFile(file: PhotoValidationInput): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported file type (${file.type || 'unknown'}). Only JPG, PNG, WEBP, and HEIC are permitted.`
    };
  }

  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return {
      valid: false,
      error: `File exceeds the 50MB limit (${formatBytes(file.size)}). Please compress or resize.`
    };
  }

  if (file.size <= 0) {
    return { valid: false, error: 'File is empty (0 bytes).' };
  }

  return { valid: true };
}

/**
 * Calculate a lightweight deterministic duplicate detection key.
 */
export function calculateDuplicateKey(name: string, size: number, lastModified: number): string {
  return `${name.trim().toLowerCase()}_${size}_${lastModified}`;
}

export const STUDIO_OWNER_EMAIL = 'krushanadarwante@gmail.com';

/**
 * Core business rule: Guests must NEVER be granted upload privileges.
 */
export function isGuestAllowedToUpload(): boolean {
  return false;
}

/**
 * Single-Photographer Architecture:
 * Check if the current user is the authorized studio owner.
 */
export function isStudioOwner(userId: string | null | undefined): boolean {
  if (!userId) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId);
}

/**
 * Validate email address for password recovery.
 */
export function validatePasswordResetEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email address is required.' };
  }
  const trimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }
  return { valid: true };
}

/**
 * Check if the active session is authorized to manage events/photos.
 * In the single-photographer platform, only the studio owner has authorization.
 */
export function isPhotographerAuthorized(
  currentUserId: string | null | undefined,
  _eventOwnerId?: string
): boolean {
  return isStudioOwner(currentUserId);
}

/**
 * Filter photos by category, search keywords, and favourites.
 */
export interface PhotoFilterCandidate {
  id: string;
  category: string;
  caption?: string;
  tags?: string[];
  filename?: string;
}

export function filterPhotos<T extends PhotoFilterCandidate>(
  photos: T[],
  options: {
    selectedCategory?: string;
    searchQuery?: string;
    onlyFavorites?: boolean;
    favoriteIds?: Set<string>;
  }
): T[] {
  const {
    selectedCategory = 'all',
    searchQuery = '',
    onlyFavorites = false,
    favoriteIds = new Set<string>()
  } = options;

  const query = searchQuery.trim().toLowerCase();

  return photos.filter(photo => {
    // 1. Category check
    if (selectedCategory && selectedCategory !== 'all') {
      if (photo.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
    }

    // 2. Favorites check
    if (onlyFavorites) {
      if (!favoriteIds.has(photo.id)) {
        return false;
      }
    }

    // 3. Search query check
    if (query) {
      const matchCaption = photo.caption ? photo.caption.toLowerCase().includes(query) : false;
      const matchCategory = photo.category ? photo.category.toLowerCase().includes(query) : false;
      const matchFilename = photo.filename ? photo.filename.toLowerCase().includes(query) : false;
      const matchTags = photo.tags ? photo.tags.some(t => t.toLowerCase().includes(query)) : false;

      if (!matchCaption && !matchCategory && !matchFilename && !matchTags) {
        return false;
      }
    }

    return true;
  });
}

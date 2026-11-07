import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { WeddingEvent, WeddingPhoto } from '../types';

// Read environment variables or custom local storage override
const envSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const customSupabaseUrl = typeof window !== 'undefined' ? localStorage.getItem('aurawed_custom_supabase_url') || '' : '';
const customSupabaseAnonKey = typeof window !== 'undefined' ? localStorage.getItem('aurawed_custom_supabase_anon_key') || '' : '';

export const activeSupabaseUrl = customSupabaseUrl || envSupabaseUrl;
export const activeSupabaseAnonKey = customSupabaseAnonKey || envSupabaseAnonKey;

export const isSupabaseConfigured = Boolean(
  activeSupabaseUrl &&
  activeSupabaseAnonKey &&
  activeSupabaseUrl.startsWith('http')
);

export let supabaseClient: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabaseClient = createClient(activeSupabaseUrl, activeSupabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    supabaseClient = null;
  }
}

/**
 * Real-time event broadcaster for live photo updates across tabs and clients.
 */
export const liveBroadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('aurawed_realtime_wedding_channel')
  : null;

export interface RealtimePhotoBroadcastPayload {
  type: 'PHOTO_UPLOADED' | 'PHOTO_DELETED' | 'EVENT_UPDATED';
  eventId: string;
  photo?: any;
  timestamp: number;
}

export function broadcastPhotoEvent(payload: RealtimePhotoBroadcastPayload) {
  if (liveBroadcastChannel) {
    try {
      liveBroadcastChannel.postMessage(payload);
    } catch (e) {
      console.warn('Broadcast channel postMessage error:', e);
    }
  }

  // Also dispatch CustomEvent on window for same-page listeners
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('aurawed-live-photo', { detail: payload }));
  }
}

/**
 * Validates that an API key is NOT a service_role secret key before saving.
 */
export function isServiceRoleKey(key: string): boolean {
  try {
    const parts = key.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      return payload.role === 'service_role';
    }
  } catch {
    // If not a valid JWT, cannot verify
  }
  return false;
}

/**
 * Helper to update custom Supabase keys in local storage with security validation.
 */
export function saveCustomSupabaseCredentials(url: string, key: string): { success: boolean; error?: string } {
  if (typeof window === 'undefined') return { success: false, error: 'No browser window.' };
  
  const trimmedUrl = url.trim();
  const trimmedKey = key.trim();

  if (!trimmedUrl && !trimmedKey) {
    localStorage.removeItem('aurawed_custom_supabase_url');
    localStorage.removeItem('aurawed_custom_supabase_anon_key');
    window.location.reload();
    return { success: true };
  }

  if (trimmedKey && isServiceRoleKey(trimmedKey)) {
    return {
      success: false,
      error: 'Security Warning: You entered a service_role secret key! Only use the public Anonymous Key (anon key) on client web applications to protect your database.'
    };
  }

  if (!trimmedUrl.startsWith('https://') || !trimmedUrl.includes('.supabase.co')) {
    return {
      success: false,
      error: 'Invalid URL format. Supabase project URLs start with https:// and end with .supabase.co'
    };
  }

  localStorage.setItem('aurawed_custom_supabase_url', trimmedUrl);
  localStorage.setItem('aurawed_custom_supabase_anon_key', trimmedKey);
  window.location.reload();
  return { success: true };
}

/**
 * Test live connection to the configured Supabase database and storage bucket.
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  latencyMs?: number;
  tablesVerified: boolean;
  storageVerified: boolean;
  message: string;
  error?: string;
}> {
  if (!isSupabaseConfigured || !supabaseClient) {
    return {
      connected: false,
      tablesVerified: false,
      storageVerified: false,
      message: 'Supabase client is not configured. Currently using the local reactive storage engine.'
    };
  }

  const start = performance.now();
  try {
    // 1. Test database access by querying public.wedding_events table
    const { data, error: dbError } = await supabaseClient
      .from('wedding_events')
      .select('id, couple_names, slug')
      .limit(1);

    const latencyMs = Math.round(performance.now() - start);

    if (dbError) {
      return {
        connected: false,
        latencyMs,
        tablesVerified: false,
        storageVerified: false,
        message: `Database error: ${dbError.message}. Make sure supabase/schema.sql has been executed in the SQL Editor.`,
        error: dbError.message
      };
    }

    // 2. Test storage bucket access
    let storageVerified = false;
    try {
      // Check access to the known bucket directly. listBuckets() requires
      // permission to enumerate storage.buckets, which public clients should
      // not need just to use a public-read bucket.
      const { error: bucketError } = await supabaseClient
        .storage
        .from('wedding-photos')
        .list('', { limit: 1 });
      storageVerified = !bucketError;
    } catch {
      storageVerified = false;
    }

    return {
      connected: true,
      latencyMs,
      tablesVerified: true,
      storageVerified,
      message: storageVerified
        ? `Connected to Supabase in ${latencyMs}ms. PostgreSQL tables and 'wedding-photos' bucket are verified.`
        : `Connected to Supabase in ${latencyMs}ms. Database tables verified. Storage bucket 'wedding-photos' needs creation.`
    };
  } catch (err: any) {
    return {
      connected: false,
      tablesVerified: false,
      storageVerified: false,
      message: `Failed to connect to Supabase: ${err?.message || 'Network error'}`,
      error: err?.message
    };
  }
}

/**
 * Fetch remote wedding events from Supabase PostgreSQL
 */
export async function fetchEventsFromSupabase(): Promise<WeddingEvent[] | null> {
  if (!isSupabaseConfigured || !supabaseClient) return null;

  try {
    const { data, error } = await supabaseClient
      .from('wedding_events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((row: any) => ({
      id: row.id,
      photographerId: row.photographer_id,
      coupleNames: row.couple_names,
      slug: row.slug,
      weddingDate: row.wedding_date,
      venue: row.venue,
      description: row.description,
      coverPhotoUrl: row.cover_photo_url,
      isQrActive: row.is_qr_active,
      qrCodeUrl: row.qr_code_url,
      totalPhotos: row.total_photos,
      totalViews: row.total_views,
      totalDownloads: row.total_downloads,
      storageBytes: Number(row.storage_bytes || 0),
      categories: row.categories || ['Ceremony', 'Portraits', 'Reception'],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } catch {
    return null;
  }
}

/**
 * Fetch remote wedding photos from Supabase PostgreSQL
 */
export async function fetchPhotosFromSupabase(eventId?: string): Promise<WeddingPhoto[] | null> {
  if (!isSupabaseConfigured || !supabaseClient) return null;

  try {
    let query = supabaseClient
      .from('wedding_photos')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data, error } = await query;
    if (error || !data) return null;

    return data.map((row: any) => ({
      id: row.id,
      eventId: row.event_id,
      photographerId: row.photographer_id,
      originalUrl: row.original_url,
      thumbnailUrl: row.thumbnail_url || row.original_url,
      optimizedUrl: row.optimized_url || row.thumbnail_url,
      cdnUrlOriginal: row.cdn_url_original || row.original_url,
      cdnUrlOptimized: row.cdn_url_optimized || row.thumbnail_url,
      cdnUrlThumb: row.cdn_url_thumb || row.thumbnail_url,
      storageProvider: row.storage_provider || 'supabase',
      filename: row.filename,
      fileSizeBytes: Number(row.file_size_bytes || 0),
      width: row.width,
      height: row.height,
      category: row.category,
      caption: row.caption,
      tags: row.tags,
      viewsCount: row.views_count,
      downloadsCount: row.downloads_count,
      processingStatus: row.processing_status,
      createdAt: row.created_at,
      uploadedAt: row.uploaded_at
    }));
  } catch {
    return null;
  }
}

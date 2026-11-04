import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
 * Helper to update custom Supabase keys in local storage
 */
export function saveCustomSupabaseCredentials(url: string, key: string) {
  if (typeof window === 'undefined') return;
  if (!url || !key) {
    localStorage.removeItem('aurawed_custom_supabase_url');
    localStorage.removeItem('aurawed_custom_supabase_anon_key');
  } else {
    localStorage.setItem('aurawed_custom_supabase_url', url.trim());
    localStorage.setItem('aurawed_custom_supabase_anon_key', key.trim());
  }
  window.location.reload();
}

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  PhotographerProfile,
  WeddingEvent,
  WeddingPhoto,
  AppView
} from '../types';
import {
  DEFAULT_PHOTOGRAPHER,
  INITIAL_WEDDING_EVENTS,
  INITIAL_PHOTOS
} from '../lib/constants';
import {
  createOptimizedThumbnail
} from '../lib/imageHelper';
import {
  generateSlug,
  validatePhotoFile,
  calculateDuplicateKey,
  STUDIO_OWNER_EMAIL,
  isStudioOwner,
  validatePasswordResetEmail
} from '../utils/pureLogic';
import {
  broadcastPhotoEvent,
  liveBroadcastChannel,
  isSupabaseConfigured,
  supabaseClient,
  fetchEventsFromSupabase,
  fetchPhotosFromSupabase
} from '../lib/supabase';

export interface StorageArchitectureStatus {
  engine: 'local-browser' | 'supabase-cloud';
  isCloudConnected: boolean;
  notes: string;
}

interface WeddingContextType {
  photographer: PhotographerProfile | null;
  events: WeddingEvent[];
  photos: WeddingPhoto[];
  currentView: AppView;
  favorites: Set<string>;
  livePhotoAlert: { eventId: string; count: number } | null;
  storageArchitecture: StorageArchitectureStatus;
  clearLiveAlert: () => void;
  setCurrentView: (view: AppView) => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => void;
  updatePhotographerProfile: (updates: Partial<PhotographerProfile>) => void;
  createEvent: (data: { coupleNames: string; weddingDate: string; venue?: string; description?: string; coverPhotoUrl?: string; categories?: string[] }) => WeddingEvent;
  updateEvent: (eventId: string, updates: Partial<WeddingEvent>) => void;
  deleteEvent: (eventId: string) => void;
  toggleEventQr: (eventId: string, active: boolean) => void;
  regenerateQrSlug: (eventId: string) => string;
  uploadPhotoBatch: (
    eventId: string,
    fileItems: { file: File; category: string }[],
    onProgress?: (index: number, total: number, photo: WeddingPhoto) => void
  ) => Promise<WeddingPhoto[]>;
  deletePhoto: (photoId: string, eventId: string) => void;
  updatePhotoCategory: (photoId: string, eventId: string, category: string) => void;
  toggleFavorite: (photoId: string) => void;
  isFavorite: (photoId: string) => boolean;
  recordEventVisit: (eventId: string) => void;
  recordPhotoView: (photoId: string, eventId: string) => void;
  recordPhotoDownload: (photoId: string, eventId: string) => void;
  recordBulkDownload: (eventId: string, count: number) => void;
}

const WeddingContext = createContext<WeddingContextType | null>(null);

const STORAGE_KEYS = {
  PHOTOGRAPHER: 'aurawed_photographer_v2',
  EVENTS: 'aurawed_events_v2',
  PHOTOS: 'aurawed_photos_v2',
  FAVORITES: 'aurawed_favorites_v2'
};

const sanitizeAssetUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('/src/assets/images/')) {
    return url.replace('/src/assets/images/', '/images/');
  }
  return url;
};

export const WeddingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Photographer state - strictly initialized to null if no authenticated session exists in localStorage
  const [photographer, setPhotographer] = useState<PhotographerProfile | null>(null);
  */

  // 2. Events state
  const [events, setEvents] = useState<WeddingEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (saved) {
        const parsed: WeddingEvent[] = JSON.parse(saved);
        return parsed.map(e => ({
          ...e,
          coverPhotoUrl: sanitizeAssetUrl(e.coverPhotoUrl)
        }));
      }
      return INITIAL_WEDDING_EVENTS;
    } catch {
      return INITIAL_WEDDING_EVENTS;
    }
  });

  // 3. Photos state
  const [photos, setPhotos] = useState<WeddingPhoto[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PHOTOS);
      if (saved) {
        const parsed: WeddingPhoto[] = JSON.parse(saved);
        return parsed.map(p => ({
          ...p,
          originalUrl: sanitizeAssetUrl(p.originalUrl),
          thumbnailUrl: sanitizeAssetUrl(p.thumbnailUrl)
        }));
      }
      return INITIAL_PHOTOS;
    } catch {
      return INITIAL_PHOTOS;
    }
  });

  // 4. Favorites state (saved locally per guest device)
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // 5. Active App View / Routing
  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const eventSlug = urlParams.get('gallery') || urlParams.get('event');
      const photoId = urlParams.get('photo') || undefined;
      if (eventSlug) {
        return { type: 'guest-gallery', eventSlug, photoId };
      }
      const viewParam = urlParams.get('view');
      if (viewParam === 'dashboard') {
        return { type: 'dashboard' };
      }
    }
    return { type: 'home' };
  });

  // Live real-time notification alert when new photos arrive in current gallery
  const [livePhotoAlert, setLivePhotoAlert] = useState<{ eventId: string; count: number } | null>(null);

  // Storage architecture status
  const storageArchitecture: StorageArchitectureStatus = useMemo(() => {
    if (isSupabaseConfigured) {
      return {
        engine: 'supabase-cloud',
        isCloudConnected: true,
        notes: 'Connected to remote Supabase PostgreSQL & Cloud Object Storage.'
      };
    }
    return {
      engine: 'local-browser',
      isCloudConnected: false,
      notes: 'Operating on local browser storage engine. To sync photos across different devices worldwide, connect Supabase in Studio Dashboard.'
    };
  }, []);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      if (photographer) {
        localStorage.setItem(STORAGE_KEYS.PHOTOGRAPHER, JSON.stringify(photographer));
      } else {
        localStorage.removeItem(STORAGE_KEYS.PHOTOGRAPHER);
      }
    } catch (e) {
      console.warn('Failed to persist photographer:', e);
    }
  }, [photographer]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch (e) {
      console.warn('Failed to persist events:', e);
    }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(photos));
    } catch (e) {
      console.warn('Failed to persist photos:', e);
    }
  }, [photos]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(Array.from(favorites)));
    } catch (e) {
      console.warn('Failed to persist favorites:', e);
    }
  }, [favorites]);

  // Synchronize browser history / URL params cleanly
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);

    if (currentView.type === 'guest-gallery') {
      url.searchParams.set('gallery', currentView.eventSlug);
      if (currentView.photoId) {
        url.searchParams.set('photo', currentView.photoId);
      } else {
        url.searchParams.delete('photo');
      }
      url.searchParams.delete('view');
    } else if (currentView.type === 'dashboard') {
      url.searchParams.set('view', 'dashboard');
      url.searchParams.delete('gallery');
      url.searchParams.delete('photo');
    } else {
      url.searchParams.delete('gallery');
      url.searchParams.delete('photo');
      url.searchParams.delete('view');
    }

    window.history.replaceState({}, '', url.toString());
  }, [currentView]);

  // Restore owner access only from a verified Supabase Auth session.
  useEffect(() => {
    if (!supabaseClient) return;
    let active = true;
    const restoreSession = async () => {
      const { data: { session } } = await supabaseClient!.auth.getSession();
      const user = session?.user;
      if (!active || !user || user.email?.toLowerCase() !== STUDIO_OWNER_EMAIL.toLowerCase()) return;
      const { data: profile, error } = await supabaseClient!.from('photographer_profiles').select('*').eq('id', user.id).maybeSingle();
      if (!active || error || !profile) return;
      setPhotographer({ ...DEFAULT_PHOTOGRAPHER, id: user.id, email: user.email!, businessName: profile.business_name || DEFAULT_PHOTOGRAPHER.businessName, role: 'owner' });
    };
    void restoreSession();
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (!session || session.user.email?.toLowerCase() !== STUDIO_OWNER_EMAIL.toLowerCase()) {
        setPhotographer(null);
        localStorage.removeItem(STORAGE_KEYS.PHOTOGRAPHER);
      }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  // On initial load: If Supabase is configured, sync remote events and photos
  useEffect(() => {
    if (isSupabaseConfigured && supabaseClient) {
      Promise.all([
        fetchEventsFromSupabase(),
        fetchPhotosFromSupabase()
      ]).then(([remoteEvents, remotePhotos]) => {
        if (remoteEvents && remoteEvents.length > 0) {
          setEvents(remoteEvents);
        }
        if (remotePhotos && remotePhotos.length > 0) {
          setPhotos(remotePhotos);
        }
      }).catch(err => {
        console.warn('Failed to sync remote Supabase records, maintaining local state:', err);
      });
    }
  }, []);

  // Real-time listener for incoming photo uploads across tabs/windows
  useEffect(() => {
    const handleBroadcast = (data: any) => {
      if (!data || !data.type) return;

      if (data.type === 'PHOTO_UPLOADED' && data.photo) {
        const newPhoto: WeddingPhoto = data.photo;
        setPhotos(prev => {
          if (prev.some(p => p.id === newPhoto.id)) return prev;
          return [newPhoto, ...prev];
        });

        // Update event photo counts & storage in local state
        setEvents(prev => prev.map(evt => {
          if (evt.id === data.eventId) {
            return {
              ...evt,
              totalPhotos: evt.totalPhotos + 1,
              storageBytes: evt.storageBytes + (newPhoto.fileSizeBytes || 0),
              updatedAt: new Date().toISOString()
            };
          }
          return evt;
        }));

        // If currently viewing this gallery, trigger live alert
        if (currentView.type === 'guest-gallery') {
          const matchingEvent = events.find(e => e.slug === currentView.eventSlug);
          if (matchingEvent && matchingEvent.id === data.eventId) {
            setLivePhotoAlert(prev => ({
              eventId: data.eventId,
              count: (prev?.count || 0) + 1
            }));
          }
        }
      } else if (data.type === 'PHOTO_DELETED' && data.photoId) {
        setPhotos(prev => prev.filter(p => p.id !== data.photoId));
      } else if (data.type === 'EVENT_UPDATED' && data.event) {
        setEvents(prev => prev.map(e => e.id === data.event.id ? { ...e, ...data.event } : e));
      }
    };

    const onChannelMessage = (ev: MessageEvent) => {
      handleBroadcast(ev.data);
    };

    const onCustomEvent = (ev: Event) => {
      handleBroadcast((ev as CustomEvent).detail);
    };

    liveBroadcastChannel?.addEventListener('message', onChannelMessage);
    window.addEventListener('aurawed-live-photo', onCustomEvent);

    return () => {
      liveBroadcastChannel?.removeEventListener('message', onChannelMessage);
      window.removeEventListener('aurawed-live-photo', onCustomEvent);
    };
  }, [currentView, events]);

  const clearLiveAlert = useCallback(() => {
    setLivePhotoAlert(null);
  }, []);

  // Auth methods - Single Photographer (Studio Owner)
  const login = useCallback(async (email: string, pass: string) => {
    if (!supabaseClient) return { success: false, error: 'Supabase is not configured.' };
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== STUDIO_OWNER_EMAIL.toLowerCase()) return { success: false, error: 'Access denied: unauthorized studio owner email.' };
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email: normalizedEmail, password: pass });
    if (error || !data.user) return { success: false, error: error?.message || 'Authentication failed.' };
    const user = data.user;
    const { error: profileError } = await supabaseClient.from('photographer_profiles').upsert({ id: user.id, email: normalizedEmail, business_name: DEFAULT_PHOTOGRAPHER.businessName }, { onConflict: 'id' });
    if (profileError) { await supabaseClient.auth.signOut(); return { success: false, error: profileError.message }; }
    setPhotographer({ ...DEFAULT_PHOTOGRAPHER, id: user.id, role: 'owner', email: normalizedEmail });
    return { success: true };
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    const val = validatePasswordResetEmail(email);
    if (!val.valid) return { success: false, error: val.error };
    if (!supabaseClient) return { success: false, error: 'Supabase is not configured.' };
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email.trim().toLowerCase());
    return error ? { success: false, error: error.message } : { success: true, message: 'Password reset email requested. Check your inbox.' };
  }, []);

  const logout = useCallback(() => {
    void supabaseClient?.auth.signOut();
    setPhotographer(null);
    localStorage.removeItem(STORAGE_KEYS.PHOTOGRAPHER);
    setCurrentView({ type: 'home' });
  }, []);
  const updatePhotographerProfile = useCallback((updates: Partial<PhotographerProfile>) => {
    if (!photographer || !isStudioOwner(photographer.id)) {
      throw new Error('Unauthorized: Only the studio owner can update profile settings.');
    }
    setPhotographer(prev => prev ? { ...prev, ...updates } : null);
  }, [photographer]);

  // Event Management - strictly protected
  const createEvent = useCallback(async (data: {
    coupleNames: string;
    weddingDate: string;
    venue?: string;
    description?: string;
    coverPhotoUrl?: string;
    categories?: string[];
  }): Promise<WeddingEvent> => {
    const { data: { user } } = supabaseClient ? await supabaseClient.auth.getUser() : { data: { user: null } };
    if (!photographer || !user || user.id !== photographer.id || !isStudioOwner(user.id)) {
      throw new Error('Unauthorized: Only the authenticated studio owner can create wedding events.');
    }

    const baseSlug = generateSlug(data.coupleNames, data.weddingDate);
    const id = crypto.randomUUID();

    const newEvent: WeddingEvent = {
      id,
      photographerId: photographer.id,
      coupleNames: data.coupleNames,
      slug: baseSlug,
      weddingDate: data.weddingDate,
      venue: data.venue || 'Private Wedding Estate',
      description: data.description || 'Welcome to our celebration gallery. Browse and download your favorite memories.',
      coverPhotoUrl: data.coverPhotoUrl || '/images/hero_wedding_couple_1793789594998.jpg',
      isQrActive: true,
      totalPhotos: 0,
      totalViews: 0,
      totalDownloads: 0,
      storageBytes: 0,
      categories: data.categories && data.categories.length > 0
        ? data.categories
        : ['Haldi', 'Mehndi', 'Sangeet', 'Wedding', 'Reception'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!supabaseClient) throw new Error('Supabase is not configured.');
    const { error } = await supabaseClient.from('wedding_events').insert({
      id: newEvent.id, photographer_id: user.id, couple_names: newEvent.coupleNames, slug: newEvent.slug,
      wedding_date: newEvent.weddingDate, venue: newEvent.venue, description: newEvent.description,
      cover_photo_url: newEvent.coverPhotoUrl, is_qr_active: newEvent.isQrActive, categories: newEvent.categories
    });
    if (error) throw new Error(`Event could not be saved: ${error.message}`);
    setEvents(prev => [newEvent, ...prev]);
    return newEvent;
  }, [photographer]);

  const updateEvent = useCallback((eventId: string, updates: Partial<WeddingEvent>) => {
    if (!photographer || !isStudioOwner(photographer.id)) {
      throw new Error('Unauthorized: Only the studio owner can update wedding events.');
    }

    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        const updated = { ...evt, ...updates, updatedAt: new Date().toISOString() };
        broadcastPhotoEvent({ type: 'EVENT_UPDATED', eventId, timestamp: Date.now() });

        if (isSupabaseConfigured && supabaseClient) {
          supabaseClient.from('wedding_events').update({
            couple_names: updated.coupleNames,
            venue: updated.venue,
            description: updated.description,
            is_qr_active: updated.isQrActive,
            categories: updated.categories,
            updated_at: updated.updatedAt
          }).eq('id', eventId).then();
        }

        return updated;
      }
      return evt;
    }));
  }, [photographer]);

  const deleteEvent = useCallback((eventId: string) => {
    if (!photographer || !isStudioOwner(photographer.id)) {
      throw new Error('Unauthorized: Only the studio owner can delete wedding events.');
    }

    setEvents(prev => prev.filter(e => e.id !== eventId));
    setPhotos(prev => prev.filter(p => p.eventId !== eventId));

    if (isSupabaseConfigured && supabaseClient) {
      supabaseClient.from('wedding_events').delete().eq('id', eventId).then();
    }
  }, [photographer]);

  const toggleEventQr = useCallback((eventId: string, active: boolean) => {
    if (!photographer || !isStudioOwner(photographer.id)) {
      throw new Error('Unauthorized: Only the studio owner can toggle QR access.');
    }
    updateEvent(eventId, { isQrActive: active });
  }, [photographer, updateEvent]);

  const regenerateQrSlug = useCallback((eventId: string): string => {
    if (!photographer || !isStudioOwner(photographer.id)) {
      throw new Error('Unauthorized: Only the studio owner can regenerate QR links.');
    }

    const randomSuffix = Math.random().toString(36).substring(2, 6);
    let newSlug = '';
    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        newSlug = `${evt.slug.split('-v')[0]}-v${randomSuffix}`;
        const updated = { ...evt, slug: newSlug, updatedAt: new Date().toISOString() };

        if (isSupabaseConfigured && supabaseClient) {
          supabaseClient.from('wedding_events').update({ slug: newSlug, updated_at: updated.updatedAt }).eq('id', eventId).then();
        }

        return updated;
      }
      return evt;
    }));
    return newSlug;
  }, [photographer]);

  // Bulk / Live Upload Photos - Strict Owner-Only Permission
  const uploadPhotoBatch = useCallback(async (
    eventId: string,
    fileItems: { file: File; category: string }[],
    onProgress?: (index: number, total: number, photo: WeddingPhoto) => void
  ): Promise<WeddingPhoto[]> => {
    const { data: { user } } = supabaseClient ? await supabaseClient.auth.getUser() : { data: { user: null } };
    if (!photographer || !user || user.id !== photographer.id || user.email?.toLowerCase() !== STUDIO_OWNER_EMAIL.toLowerCase()) {
      throw new Error('Unauthorized: Sign in with the studio owner account before uploading.');
    }

    const photogId = user.id;
    const uploadedPhotosList: WeddingPhoto[] = [];
    const existingKeys = new Set(photos.map(p => calculateDuplicateKey(p.filename, p.fileSizeBytes, 0)));

    for (let i = 0; i < fileItems.length; i++) {
      const { file, category } = fileItems[i];
      const validation = validatePhotoFile({
        name: file.name,
        type: file.type,
        size: file.size
      });

      if (!validation.valid) {
        console.warn(`Skipping invalid file ${file.name}: ${validation.error}`);
        continue;
      }

      // Check duplicate
      const fileKey = calculateDuplicateKey(file.name, file.size, 0);
      if (existingKeys.has(fileKey)) {
        console.warn(`Duplicate skipped: ${file.name}`);
        continue;
      }
      existingKeys.add(fileKey);

      // Generate optimized thumbnail
      let thumbUrl = '';
      let imgWidth = 1920;
      let imgHeight = 1080;

      try {
        const thumbRes = await createOptimizedThumbnail(file, 800, 800, 0.85);
        thumbUrl = thumbRes.thumbnailUrl;
        imgWidth = thumbRes.width;
        imgHeight = thumbRes.height;
      } catch (err) {
        console.warn('Could not generate canvas thumbnail, using object URL:', err);
        thumbUrl = URL.createObjectURL(file);
      }

      let originalUrl = URL.createObjectURL(file);
      const photoId = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      let storageProvider: 'supabase' | 'local' = 'local';

      const filePath = `${eventId}/${photoId}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { error: uploadError } = await supabaseClient!.storage.from('wedding-photos')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw new Error(`Storage upload failed for ${file.name}: ${uploadError.message}`);
      const { data: publicUrlData } = supabaseClient!.storage.from('wedding-photos').getPublicUrl(filePath);
      if (!publicUrlData.publicUrl) {
        await supabaseClient!.storage.from('wedding-photos').remove([filePath]);
        throw new Error('Could not create a public URL for the uploaded photo.');
      }
      originalUrl = publicUrlData.publicUrl;
      storageProvider = 'supabase';
      const { error: metadataError } = await supabaseClient!.from('wedding_photos').insert({
        id: photoId, event_id: eventId, photographer_id: photogId,
        original_url: originalUrl, thumbnail_url: originalUrl,
        filename: file.name, file_size_bytes: file.size, width: imgWidth, height: imgHeight,
        category: category || 'Wedding', storage_provider: 'supabase',
        storage_path_original: filePath, processing_status: 'ready'
      });
      if (metadataError) {
        await supabaseClient!.storage.from('wedding-photos').remove([filePath]);
        throw new Error(`Photo metadata could not be saved: ${metadataError.message}`);
      }

      const newPhoto: WeddingPhoto = {
        id: photoId,
        eventId,
        photographerId: photogId,
        originalUrl,
        thumbnailUrl: thumbUrl,
        filename: file.name,
        fileSizeBytes: file.size,
        width: imgWidth,
        height: imgHeight,
        category: category || 'Wedding',
        storageProvider,
        viewsCount: 0,
        downloadsCount: 0,
        createdAt: new Date().toISOString(),
        uploadedAt: new Date().toISOString()
      };

      uploadedPhotosList.push(newPhoto);

      // Realtime broadcast to any open guest galleries
      broadcastPhotoEvent({
        type: 'PHOTO_UPLOADED',
        eventId,
        photo: newPhoto,
        timestamp: Date.now()
      });

      onProgress?.(i + 1, fileItems.length, newPhoto);
    }

    if (uploadedPhotosList.length > 0) {
      setPhotos(prev => [...uploadedPhotosList, ...prev]);

      // Update event metadata & photographer storage used
      const addedBytes = uploadedPhotosList.reduce((acc, p) => acc + p.fileSizeBytes, 0);
      setEvents(prev => prev.map(evt => {
        if (evt.id === eventId) {
          return {
            ...evt,
            totalPhotos: evt.totalPhotos + uploadedPhotosList.length,
            storageBytes: evt.storageBytes + addedBytes,
            updatedAt: new Date().toISOString()
          };
        }
        return evt;
      }));

      setPhotographer(prev => {
        if (!prev) return null;
        return {
          ...prev,
          storageUsedBytes: prev.storageUsedBytes + addedBytes
        };
      });
    }

    return uploadedPhotosList;
  }, [photographer, photos]);

  const deletePhoto = useCallback((photoId: string, eventId: string) => {
    if (!photographer || !isStudioOwner(photographer.id)) {
      throw new Error('Unauthorized: Only the studio owner can delete photos.');
    }

    const target = photos.find(p => p.id === photoId);
    if (!target) return;

    setPhotos(prev => prev.filter(p => p.id !== photoId));

    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        return {
          ...evt,
          totalPhotos: Math.max(0, evt.totalPhotos - 1),
          storageBytes: Math.max(0, evt.storageBytes - target.fileSizeBytes),
          updatedAt: new Date().toISOString()
        };
      }
      return evt;
    }));

    setPhotographer(prev => {
      if (!prev) return null;
      return {
        ...prev,
        storageUsedBytes: Math.max(0, prev.storageUsedBytes - target.fileSizeBytes)
      };
    });

    if (isSupabaseConfigured && supabaseClient) {
      supabaseClient.from('wedding_photos').delete().eq('id', photoId).then();
    }

    broadcastPhotoEvent({
      type: 'PHOTO_DELETED',
      eventId,
      photo: { id: photoId },
      timestamp: Date.now()
    });
  }, [photographer, photos]);

  const updatePhotoCategory = useCallback((photoId: string, _eventId: string, category: string) => {
    if (!photographer || !isStudioOwner(photographer.id)) {
      throw new Error('Unauthorized: Only the studio owner can categorize photos.');
    }

    setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, category } : p));

    if (isSupabaseConfigured && supabaseClient) {
      supabaseClient.from('wedding_photos').update({ category }).eq('id', photoId).then();
    }
  }, [photographer]);

  // Favorites
  const toggleFavorite = useCallback((photoId: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback((photoId: string) => {
    return favorites.has(photoId);
  }, [favorites]);

  // Analytics incrementors
  const recordEventVisit = useCallback((eventId: string) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, totalViews: e.totalViews + 1 } : e));
  }, []);

  const recordPhotoView = useCallback((photoId: string, eventId: string) => {
    setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, viewsCount: p.viewsCount + 1 } : p));
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, totalViews: e.totalViews + 1 } : e));
  }, []);

  const recordPhotoDownload = useCallback((photoId: string, eventId: string) => {
    setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, downloadsCount: p.downloadsCount + 1 } : p));
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, totalDownloads: e.totalDownloads + 1 } : e));
  }, []);

  const recordBulkDownload = useCallback((eventId: string, count: number) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, totalDownloads: e.totalDownloads + count } : e));
  }, []);

  const contextValue = useMemo(() => ({
    photographer,
    events,
    photos,
    currentView,
    favorites,
    livePhotoAlert,
    storageArchitecture,
    clearLiveAlert,
    setCurrentView,
    login,
    requestPasswordReset,
    logout,
    updatePhotographerProfile,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleEventQr,
    regenerateQrSlug,
    uploadPhotoBatch,
    deletePhoto,
    updatePhotoCategory,
    toggleFavorite,
    isFavorite,
    recordEventVisit,
    recordPhotoView,
    recordPhotoDownload,
    recordBulkDownload
  }), [
    photographer,
    events,
    photos,
    currentView,
    favorites,
    livePhotoAlert,
    storageArchitecture,
    clearLiveAlert,
    setCurrentView,
    login,
    requestPasswordReset,
    logout,
    updatePhotographerProfile,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleEventQr,
    regenerateQrSlug,
    uploadPhotoBatch,
    deletePhoto,
    updatePhotoCategory,
    toggleFavorite,
    isFavorite,
    recordEventVisit,
    recordPhotoView,
    recordPhotoDownload,
    recordBulkDownload
  ]);

  return (
    <WeddingContext.Provider value={contextValue}>
      {children}
    </WeddingContext.Provider>
  );
};

export const useWedding = (): WeddingContextType => {
  const context = useContext(WeddingContext);
  if (!context) {
    throw new Error('useWedding must be used within a WeddingProvider');
  }
  return context;
};

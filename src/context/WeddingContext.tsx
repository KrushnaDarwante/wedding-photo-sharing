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
  createOptimizedThumbnail,
  normalizeImageUrl
} from '../lib/imageHelper';
import {
  generateSlug,
  validatePhotoFile,
  calculateDuplicateKey,
  STUDIO_OWNER_ID,
  STUDIO_OWNER_EMAIL,
  isStudioOwner,
  validatePasswordResetEmail
} from '../utils/pureLogic';
import {
  broadcastPhotoEvent,
  liveBroadcastChannel
} from '../lib/supabase';

interface WeddingContextType {
  photographer: PhotographerProfile | null;
  events: WeddingEvent[];
  photos: WeddingPhoto[];
  currentView: AppView;
  favorites: Set<string>;
  livePhotoAlert: { eventId: string; count: number } | null;
  clearLiveAlert: () => void;
  setCurrentView: (view: AppView) => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: () => void;
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
  PHOTOGRAPHER: 'aurawed_photographer_v1',
  EVENTS: 'aurawed_events_v1',
  PHOTOS: 'aurawed_photos_v1',
  FAVORITES: 'aurawed_favorites_v1'
};

export const WeddingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Photographer state
  const [photographer, setPhotographer] = useState<PhotographerProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PHOTOGRAPHER);
      if (saved) {
        const parsed: PhotographerProfile = JSON.parse(saved);
        return {
          ...parsed,
          logoUrl: normalizeImageUrl(parsed.logoUrl || DEFAULT_PHOTOGRAPHER.logoUrl)
        };
      }
      return DEFAULT_PHOTOGRAPHER;
    } catch {
      return DEFAULT_PHOTOGRAPHER;
    }
  });

  // 2. Events state
  const [events, setEvents] = useState<WeddingEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (saved) {
        const parsed: WeddingEvent[] = JSON.parse(saved);
        const initialMap = new Map(INITIAL_WEDDING_EVENTS.map(e => [e.id, e]));
        return parsed.map(evt => {
          const matchInitial = initialMap.get(evt.id);
          return {
            ...evt,
            coverPhotoUrl: normalizeImageUrl(matchInitial?.coverPhotoUrl || evt.coverPhotoUrl),
            totalPhotos: matchInitial ? matchInitial.totalPhotos : evt.totalPhotos,
            categories: matchInitial?.categories || evt.categories
          };
        });
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
        const initialMap = new Map(INITIAL_PHOTOS.map(p => [p.id, p]));
        return parsed.map(photo => {
          const matchInitial = initialMap.get(photo.id);
          if (matchInitial) {
            return {
              ...photo,
              originalUrl: matchInitial.originalUrl,
              thumbnailUrl: matchInitial.thumbnailUrl,
              fileSizeBytes: matchInitial.fileSizeBytes,
              category: matchInitial.category,
              width: matchInitial.width,
              height: matchInitial.height
            };
          }
          return {
            ...photo,
            originalUrl: normalizeImageUrl(photo.originalUrl),
            thumbnailUrl: normalizeImageUrl(photo.thumbnailUrl || photo.originalUrl)
          };
        });
      }
      return INITIAL_PHOTOS;
    } catch {
      return INITIAL_PHOTOS;
    }
  });

  // 4. Favorites state (saved locally)
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
    // Parse URL query parameter or path on initial load
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
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please provide a valid studio email address.' };
    }
    if (!pass || pass.trim().length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    // Single-photographer: authenticate owner
    const profile: PhotographerProfile = {
      ...DEFAULT_PHOTOGRAPHER,
      id: STUDIO_OWNER_ID,
      role: 'owner',
      email: email.trim().toLowerCase() === STUDIO_OWNER_EMAIL.toLowerCase() ? STUDIO_OWNER_EMAIL : email.trim()
    };
    setPhotographer(profile);
    return { success: true };
  }, []);

  const loginAsDemo = useCallback(() => {
    setPhotographer({
      ...DEFAULT_PHOTOGRAPHER,
      id: STUDIO_OWNER_ID,
      role: 'owner'
    });
    setCurrentView({ type: 'dashboard' });
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    const val = validatePasswordResetEmail(email);
    if (!val.valid) {
      return { success: false, error: val.error };
    }
    return {
      success: true,
      message: `A secure password reset link has been dispatched to ${email}. Check your inbox!`
    };
  }, []);

  const logout = useCallback(() => {
    setPhotographer(null);
    setCurrentView({ type: 'home' });
  }, []);

  const updatePhotographerProfile = useCallback((updates: Partial<PhotographerProfile>) => {
    setPhotographer(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  // Event Management
  const createEvent = useCallback((data: {
    coupleNames: string;
    weddingDate: string;
    venue?: string;
    description?: string;
    coverPhotoUrl?: string;
    categories?: string[];
  }): WeddingEvent => {
    const photogId = photographer?.id || DEFAULT_PHOTOGRAPHER.id;
    const baseSlug = generateSlug(data.coupleNames, data.weddingDate);
    const id = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newEvent: WeddingEvent = {
      id,
      photographerId: photogId,
      coupleNames: data.coupleNames,
      slug: baseSlug,
      weddingDate: data.weddingDate,
      venue: data.venue || 'Private Wedding Estate',
      description: data.description || 'Welcome to our celebration gallery. Browse and download your favorite memories.',
      coverPhotoUrl: normalizeImageUrl(data.coverPhotoUrl || '/assets/images/hero_wedding_couple_1793789594998.jpg'),
      isQrActive: true,
      totalPhotos: 0,
      totalViews: 0,
      totalDownloads: 0,
      storageBytes: 0,
      categories: data.categories && data.categories.length > 0
        ? data.categories
        : ['Ceremony', 'Portraits', 'Reception'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setEvents(prev => [newEvent, ...prev]);
    return newEvent;
  }, [photographer]);

  const updateEvent = useCallback((eventId: string, updates: Partial<WeddingEvent>) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        const updated = { ...evt, ...updates, updatedAt: new Date().toISOString() };
        broadcastPhotoEvent({ type: 'EVENT_UPDATED', eventId, timestamp: Date.now() });
        return updated;
      }
      return evt;
    }));
  }, []);

  const deleteEvent = useCallback((eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    setPhotos(prev => prev.filter(p => p.eventId !== eventId));
  }, []);

  const toggleEventQr = useCallback((eventId: string, active: boolean) => {
    updateEvent(eventId, { isQrActive: active });
  }, [updateEvent]);

  const regenerateQrSlug = useCallback((eventId: string): string => {
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    let newSlug = '';
    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        newSlug = `${evt.slug.split('-v')[0]}-v${randomSuffix}`;
        return { ...evt, slug: newSlug, updatedAt: new Date().toISOString() };
      }
      return evt;
    }));
    return newSlug;
  }, []);

  // Bulk / Live Upload Photos - Strict Owner-Only Permission
  const uploadPhotoBatch = useCallback(async (
    eventId: string,
    fileItems: { file: File; category: string }[],
    onProgress?: (index: number, total: number, photo: WeddingPhoto) => void
  ): Promise<WeddingPhoto[]> => {
    // Strict business rule: Only authenticated studio owner can upload photos
    if (!photographer || !isStudioOwner(photographer.id)) {
      console.error('Permission denied: Guests and unauthorized users cannot upload photos.');
      throw new Error('Unauthorized: Only the studio owner can upload photographs.');
    }

    const photogId = photographer.id;
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

      const originalObjectUrl = URL.createObjectURL(file);
      const photoId = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const newPhoto: WeddingPhoto = {
        id: photoId,
        eventId,
        photographerId: photogId,
        originalUrl: originalObjectUrl,
        thumbnailUrl: thumbUrl,
        filename: file.name,
        fileSizeBytes: file.size,
        width: imgWidth,
        height: imgHeight,
        category: category || 'Ceremony',
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

    broadcastPhotoEvent({
      type: 'PHOTO_DELETED',
      eventId,
      photo: { id: photoId },
      timestamp: Date.now()
    });
  }, [photos]);

  const updatePhotoCategory = useCallback((photoId: string, _eventId: string, category: string) => {
    setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, category } : p));
  }, []);

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
    clearLiveAlert,
    setCurrentView,
    login,
    loginAsDemo,
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
    clearLiveAlert,
    setCurrentView,
    login,
    loginAsDemo,
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

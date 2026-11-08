import React, { useState, useEffect } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { fetchEventsFromSupabase } from '../../lib/supabase';
import { WeddingPhoto } from '../../types';
import { LightboxModal } from './LightboxModal';
import { SlideshowModal } from './SlideshowModal';
import { ShareModal } from './ShareModal';
import { BulkDownloadProgressModal } from './BulkDownloadProgressModal';
import { MultiVolumeDownloadModal } from './MultiVolumeDownloadModal';
import { downloadPhotosAsZip, downloadSinglePhoto } from '../../lib/zipHelper';
import { filterPhotos } from '../../utils/pureLogic';
import { ImageWithFallback } from '../Common/ImageWithFallback';
import {
  Heart,
  Download,
  Share2,
  Play,
  Search,
  CheckSquare,
  Square,
  Sparkles,
  Calendar,
  MapPin,
  Radio,
  Camera,
  Layers,
  ArrowLeft,
  AlertCircle,
  ChevronDown
} from 'lucide-react';

interface GuestGalleryViewProps {
  eventSlug: string;
  initialPhotoId?: string;
}

export const GuestGalleryView: React.FC<GuestGalleryViewProps> = ({
  eventSlug,
  initialPhotoId
}) => {
  const {
    events,
    photos,
    photographer,
    favorites,
    toggleFavorite,
    isFavorite,
    recordEventVisit,
    recordBulkDownload,
    livePhotoAlert,
    clearLiveAlert,
    setCurrentView
  } = useWedding();

  const [remoteEvent, setRemoteEvent] = useState<import('../../types').WeddingEvent | null>(null);
  const [isResolvingEvent, setIsResolvingEvent] = useState(true);

  useEffect(() => {
    let active = true;
    const resolveEvent = async () => {
      const localMatch = events.find(item => item.slug === eventSlug);
      if (localMatch) {
        setRemoteEvent(localMatch);
        setIsResolvingEvent(false);
        return;
      }
      setIsResolvingEvent(true);
      try {
        const remoteEvents = await fetchEventsFromSupabase();
        if (!active) return;
        const match = remoteEvents?.find(item => item.slug === eventSlug && item.isQrActive);
        setRemoteEvent(match || null);
      } catch (error) {
        console.error('Guest gallery event lookup failed:', error);
        if (active) setRemoteEvent(null);
      } finally {
        if (active) setIsResolvingEvent(false);
      }
    };
    void resolveEvent();
    return () => { active = false; };
  }, [eventSlug, events]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());

  // Progressive rendering / pagination (36 photos per slice for 15,000 photo scale)
  const [visibleCount, setVisibleCount] = useState<number>(36);

  // Lightbox, Slideshow, Share, and Bulk Download modals
  const [activeLightboxPhotoId, setActiveLightboxPhotoId] = useState<string | null>(initialPhotoId || null);
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);
  const [sharePhoto, setSharePhoto] = useState<WeddingPhoto | null>(null);
  const [isShareAllOpen, setIsShareAllOpen] = useState(false);
  const [isMultiVolumeOpen, setIsMultiVolumeOpen] = useState(false);

  // Bulk ZIP Progress state
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [zipStatusText, setZipStatusText] = useState('');
  const [zipTotal, setZipTotal] = useState(0);
  const [zipFinished, setZipFinished] = useState(false);

  // Find matching event
  const event = events.find(e => e.slug === eventSlug) || remoteEvent;

  useEffect(() => {
    if (event) {
      recordEventVisit(event.id);
    }
  }, [event?.id]);

  if (!event && isResolvingEvent) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 rounded-full border-4 border-[#E8E2D8] border-t-[#9A7B4F] animate-spin mb-4" />
        <h2 className="font-serif-luxury text-2xl font-bold text-slate-900 mb-2">Loading Wedding Gallery</h2>
        <p className="text-sm text-slate-500">Connecting to the studio gallery…</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-serif-luxury text-3xl font-bold text-slate-900 mb-2">
          Wedding Gallery Not Found
        </h2>
        <p className="text-sm text-slate-500 max-w-md mb-6">
          The requested wedding gallery link may have expired or is incorrect. Please check your QR code card.
        </p>
        <button
          onClick={() => setCurrentView({ type: 'home' })}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-[#1E1B18] rounded-xl hover:bg-[#36322D]"
        >
          Return to AuraWed Home
        </button>
      </div>
    );
  }

  // Deactivated event guard
  if (!event.isQrActive) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-serif-luxury text-3xl font-bold text-slate-900 mb-2">
          {event.coupleNames} Gallery is Currently Paused
        </h2>
        <p className="text-sm text-slate-600 max-w-md mb-6">
          The photographer has temporarily paused access to this wedding gallery. Please check back shortly or contact the wedding party.
        </p>
        <button
          onClick={() => setCurrentView({ type: 'home' })}
          className="px-5 py-2.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
        >
          Return Home
        </button>
      </div>
    );
  }

  const allEventPhotos = photos.filter(p => p.eventId === event.id);

  // Available categories for this event
  const eventCategories = ['all', ...(event.categories || ['Ceremony', 'Portraits', 'Reception'])];

  // Filtered photos using pure function
  const filteredPhotos = filterPhotos(allEventPhotos, {
    selectedCategory,
    searchQuery,
    onlyFavorites,
    favoriteIds: favorites
  });

  // Progressive rendering window (36 per page, auto-scales to 15,000 photos)
  useEffect(() => {
    setVisibleCount(36);
  }, [selectedCategory, searchQuery, onlyFavorites]);

  const displayedPhotos = filteredPhotos.slice(0, visibleCount);

  const formattedDate = new Date(event.weddingDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Toggle selection of photo
  const toggleSelectPhoto = (photoId: string) => {
    setSelectedPhotoIds(prev => {
      const next = new Set(prev);
      if (next.has(photoId)) next.delete(photoId);
      else next.add(photoId);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedPhotoIds.size === filteredPhotos.length) {
      setSelectedPhotoIds(new Set());
    } else {
      setSelectedPhotoIds(new Set(filteredPhotos.map(p => p.id)));
    }
  };

  // Bulk ZIP Download for All or Selected
  const handleDownloadZip = async (photosToZip: WeddingPhoto[], archiveName: string) => {
    if (photosToZip.length === 0) return;

    setIsZipping(true);
    setZipFinished(false);
    setZipTotal(photosToZip.length);
    setZipProgress(0);
    setZipStatusText('Starting download preparation...');

    try {
      await downloadPhotosAsZip(
        photosToZip,
        archiveName,
        (_curr, _total, percent, status) => {
          setZipProgress(percent);
          setZipStatusText(status);
        }
      );
      setZipFinished(true);
      recordBulkDownload(event.id, photosToZip.length);
    } catch (err: any) {
      setZipStatusText(`Error creating ZIP archive: ${err?.message || 'Check connection'}`);
    }
  };

  const handleDownloadAll = () => {
    // Open the high-scale partitioned multi-volume download engine
    setIsMultiVolumeOpen(true);
  };

  const handleDownloadSelected = () => {
    const selectedList = allEventPhotos.filter(p => selectedPhotoIds.has(p.id));
    const cleanNames = event.coupleNames.replace(/[^a-zA-Z0-9]/g, '_');
    handleDownloadZip(selectedList, `${cleanNames}_Selected_Photos.zip`);
  };

  const handleDownloadFavorites = () => {
    const favPhotos = allEventPhotos.filter(p => favorites.has(p.id));
    const cleanNames = event.coupleNames.replace(/[^a-zA-Z0-9]/g, '_');
    handleDownloadZip(favPhotos, `${cleanNames}_Favorite_Memories.zip`);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24">
      {/* Top back home navigation bar for guests */}
      <div className="bg-[#FAF8F5] border-b border-[#E8E2D8] py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setCurrentView({ type: 'home' })}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>AuraWed Platform</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Camera className="w-3.5 h-3.5 text-[#9A7B4F]" />
            <span>Photography by <strong className="text-slate-800">{photographer?.businessName || 'Lumière Studios'}</strong></span>
          </div>
        </div>
      </div>

      {/* Live Photos Real-Time Alert Banner */}
      {livePhotoAlert && livePhotoAlert.eventId === event.id && (
        <div className="bg-gradient-to-r from-[#9A7B4F] to-[#B39364] text-white py-2.5 px-4 text-center text-xs font-semibold shadow-md flex items-center justify-center gap-3 animate-fadeIn">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-200 animate-spin" />
            <span>{livePhotoAlert.count} new wedding photograph{livePhotoAlert.count > 1 ? 's' : ''} just added live by the photographer!</span>
          </div>
          <button
            onClick={clearLiveAlert}
            className="underline text-amber-100 hover:text-white text-xs cursor-pointer ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Luxury Wedding Header Banner */}
      <section className="relative overflow-hidden bg-white border-b border-[#E8E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Couple details & download all button */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2.5 text-xs text-[#9A7B4F] font-semibold tracking-wider uppercase">
                <span>Official Wedding Gallery</span>
                <span aria-hidden="true">·</span>
                <span>{formattedDate}</span>
                {event.venue && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-500 font-normal">{event.venue}</span>
                  </>
                )}
              </div>

              <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
                {event.coupleNames}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                {event.description}
              </p>

              {/* Action Buttons: Slideshow, Bulk ZIP, Share */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  onClick={() => setIsSlideshowOpen(true)}
                  disabled={allEventPhotos.length === 0}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-900 bg-white border border-[#E3DAC9] hover:bg-[#FAF5EB] rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 text-[#9A7B4F]" />
                  <span>Start Slideshow</span>
                </button>

                <button
                  onClick={handleDownloadAll}
                  disabled={allEventPhotos.length === 0}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#9A7B4F] to-[#B39364] hover:from-[#8A6D43] hover:to-[#A38356] rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download All Photos (ZIP)</span>
                </button>

                <button
                  onClick={() => setIsShareAllOpen(true)}
                  className="px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-[#FAF5EB] rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Gallery</span>
                </button>
              </div>
            </div>

            {/* Right Column: Hero thumbnail & live badge */}
            <div className="lg:col-span-4 relative">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-lg border border-[#E8E2D8] bg-[#FAF6F0]">
                <ImageWithFallback
                  src={event.coverPhotoUrl}
                  alt={event.coupleNames}
                  aspectRatioClass="aspect-[4/3]"
                  ritualCategory="Wedding"
                  coupleNames={event.coupleNames}
                  loading="eager"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4 text-white pointer-events-none">
                  <div className="flex items-center justify-between w-full text-xs">
                    <span className="font-medium text-[#FDFBF7]">{allEventPhotos.length} High-Res Photographs</span>
                    <span className="flex items-center gap-1.5 text-emerald-300 font-semibold text-[11px] bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-400/30">
                      <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                      Live Feed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Gallery Filter & Search Toolbar */}
      <div className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E2D8] py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Categories Tab Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {eventCategories.map((cat) => {
              const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
              const label = cat === 'all' ? 'All Memories' : cat;
              const count = cat === 'all'
                ? allEventPhotos.length
                : allEventPhotos.filter(p => p.category.toLowerCase() === cat.toLowerCase()).length;

              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setOnlyFavorites(false);
                  }}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    isActive && !onlyFavorites
                      ? 'bg-[#1E1B18] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 bg-white/70 border border-[#E8E2D8]'
                  }`}
                >
                  <span>{label}</span>
                  <span className="ml-1.5 opacity-60 font-mono text-[10px]">({count})</span>
                </button>
              );
            })}

            {/* Favourites Filter Button */}
            <button
              onClick={() => setOnlyFavorites(prev => !prev)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ml-1 ${
                onlyFavorites
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 bg-white/70 border border-[#E8E2D8]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-white' : 'text-red-500'}`} />
              <span>Favourites ({favorites.size})</span>
            </button>
          </div>

          {/* Search + Multi-Select Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search photos..."
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A7B4F] bg-white w-40 sm:w-52"
              />
            </div>

            <button
              onClick={() => {
                setIsSelectionMode(prev => !prev);
                setSelectedPhotoIds(new Set());
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                isSelectionMode
                  ? 'bg-[#9A7B4F] text-white border-[#9A7B4F]'
                  : 'text-slate-700 bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              {isSelectionMode ? 'Cancel Selection' : 'Select Photos'}
            </button>
          </div>
        </div>

        {/* Floating Selection Banner if in selection mode */}
        {isSelectionMode && (
          <div className="max-w-7xl mx-auto mt-3 p-3 bg-white rounded-xl border border-[#E8E2D8] shadow-sm flex items-center justify-between text-xs animate-fadeIn">
            <div className="flex items-center gap-3">
              <button
                onClick={selectAll}
                className="flex items-center gap-1.5 font-medium text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                {selectedPhotoIds.size === filteredPhotos.length ? (
                  <CheckSquare className="w-4 h-4 text-[#9A7B4F]" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>Select All ({filteredPhotos.length})</span>
              </button>
              <span className="text-slate-400">|</span>
              <span className="font-semibold text-slate-900">
                {selectedPhotoIds.size} photo{selectedPhotoIds.size === 1 ? '' : 's'} chosen
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadSelected}
                disabled={selectedPhotoIds.size === 0}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#9A7B4F] to-[#B39364] hover:from-[#8A6D43] hover:to-[#A38356] rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Selected as ZIP</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Responsive Photo Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {filteredPhotos.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-[#E8E2D8]">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-serif-luxury text-xl font-bold text-slate-900">
              {onlyFavorites ? 'No favourite memories marked yet' : 'No photos found'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {onlyFavorites
                ? 'Tap the heart icon on any wedding photo to add it to your personal favorites collection.'
                : 'Try adjusting your search query or selecting a different category tab.'}
            </p>
            {onlyFavorites && (
              <button
                onClick={() => setOnlyFavorites(false)}
                className="mt-4 px-4 py-2 text-xs font-semibold text-slate-800 bg-[#FAF5EB] border border-[#E8DFC8] rounded-xl hover:bg-[#F3EAD9]"
              >
                Browse All Photographs
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedPhotos.map((photo, index) => {
              const isFav = isFavorite(photo.id);
              const isSelected = selectedPhotoIds.has(photo.id);

              return (
                <div
                  key={photo.id}
                  className={`relative rounded-2xl overflow-hidden bg-white border shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group ${
                    isSelected ? 'border-[#800020] ring-2 ring-[#800020]/30' : 'border-[#E8E2D8] hover:border-[#D4AF37]/60'
                  }`}
                >
                  {/* Photo Image Container with Locked 4:3 Aspect Ratio */}
                  <div
                    onClick={() => {
                      if (isSelectionMode) {
                        toggleSelectPhoto(photo.id);
                      } else {
                        setActiveLightboxPhotoId(photo.id);
                      }
                    }}
                    className="cursor-pointer relative overflow-hidden bg-[#FAF6F0] aspect-[4/3] w-full"
                  >
                    <ImageWithFallback
                      src={photo.thumbnailUrl}
                      alt={photo.caption || photo.filename}
                      aspectRatioClass="aspect-[4/3]"
                      ritualCategory={photo.category}
                      coupleNames={event.coupleNames}
                      className="group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay for Top Badges */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    {/* Top Left: Ritual Badge or Checkbox */}
                    <div className="absolute top-3 left-3 z-10">
                      {isSelectionMode ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectPhoto(photo.id);
                          }}
                          className="p-1.5 rounded-lg bg-black/60 text-white backdrop-blur-sm cursor-pointer shadow-md"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#D4AF37]" />
                          ) : (
                            <Square className="w-4 h-4 text-white" />
                          )}
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold bg-[#800020]/85 text-[#FDFBF7] backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#D4AF37]/40 shadow-sm flex items-center gap-1">
                          <span>{photo.category}</span>
                        </span>
                      )}
                    </div>

                    {/* Top Right Floating Actions: Heart, Download HD, Share */}
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(photo.id);
                        }}
                        className={`p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer shadow-md ${
                          isFav
                            ? 'bg-rose-600 text-white shadow-rose-600/30'
                            : 'bg-black/50 hover:bg-black/80 text-white opacity-90 group-hover:opacity-100 hover:scale-105'
                        }`}
                        title={isFav ? 'Remove from Favourites' : 'Add to Favourites'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}`} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadSinglePhoto(photo);
                        }}
                        className="p-2 rounded-xl bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 hover:scale-105 cursor-pointer shadow-md"
                        title="Download Original HD Photograph"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSharePhoto(photo);
                        }}
                        className="p-2 rounded-xl bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 hover:scale-105 cursor-pointer shadow-md"
                        title="Share Photograph"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Designated Card Footer: Clean Typography, Captions Only Here */}
                  <div className="p-3.5 bg-white border-t border-[#F2EBE1] flex-1 flex flex-col justify-between min-h-[68px]">
                    <p className="text-xs font-medium text-slate-800 line-clamp-2 leading-relaxed" title={photo.caption || photo.filename}>
                      {photo.caption || photo.filename}
                    </p>
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span className="text-[#800020] font-medium font-sans">{photo.category}</span>
                      <span>#{index + 1}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progressive Pagination Controls for Large Collections */}
          {filteredPhotos.length > visibleCount && (
            <div className="mt-12 p-6 bg-white rounded-2xl border border-[#E8E2D8] text-center shadow-sm max-w-xl mx-auto space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Showing {displayedPhotos.length} of {filteredPhotos.length} memories</span>
                <span className="font-mono text-[#9A7B4F]">{Math.round((displayedPhotos.length / filteredPhotos.length) * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#9A7B4F] rounded-full transition-all duration-300"
                  style={{ width: `${Math.round((displayedPhotos.length / filteredPhotos.length) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setVisibleCount(prev => prev + 36)}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#9A7B4F] to-[#B39364] hover:from-[#8A6D43] hover:to-[#A38356] rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ChevronDown className="w-4 h-4" />
                  <span>Load 36 More Photos</span>
                </button>

                {filteredPhotos.length <= 1000 && (
                  <button
                    onClick={() => setVisibleCount(filteredPhotos.length)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-[#FAF8F5] border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <span>View All ({filteredPhotos.length})</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>

      {/* Floating Favourites Download Action Button if Favorites > 0 */}
      {favorites.size > 0 && !isSelectionMode && (
        <div className="fixed bottom-6 right-6 z-40 animate-fadeIn">
          <button
            onClick={handleDownloadFavorites}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold text-xs shadow-xl flex items-center gap-2 cursor-pointer transition-all hover:scale-103"
          >
            <Heart className="w-4 h-4 fill-white" />
            <span>Download All {favorites.size} Favourites (ZIP)</span>
          </button>
        </div>
      )}

      {/* Lightbox Modal */}
      {activeLightboxPhotoId && (
        <LightboxModal
          photos={filteredPhotos.length > 0 ? filteredPhotos : allEventPhotos}
          initialPhotoId={activeLightboxPhotoId}
          event={event}
          isOpen={Boolean(activeLightboxPhotoId)}
          onClose={() => setActiveLightboxPhotoId(null)}
        />
      )}

      {/* Slideshow Modal */}
      {isSlideshowOpen && (
        <SlideshowModal
          photos={allEventPhotos}
          event={event}
          isOpen={isSlideshowOpen}
          onClose={() => setIsSlideshowOpen(false)}
        />
      )}

      {/* Share Modals */}
      {sharePhoto && (
        <ShareModal
          isOpen={Boolean(sharePhoto)}
          onClose={() => setSharePhoto(null)}
          event={event}
          photo={sharePhoto}
        />
      )}

      {isShareAllOpen && (
        <ShareModal
          isOpen={isShareAllOpen}
          onClose={() => setIsShareAllOpen(false)}
          event={event}
        />
      )}

      {/* Bulk Download Progress Modal */}
      <BulkDownloadProgressModal
        isOpen={isZipping}
        onClose={() => setIsZipping(false)}
        progressPercent={zipProgress}
        statusText={zipStatusText}
        totalPhotos={zipTotal}
        isComplete={zipFinished}
      />

      {/* Multi-Volume Partitioned ZIP Download Engine */}
      {isMultiVolumeOpen && (
        <MultiVolumeDownloadModal
          isOpen={isMultiVolumeOpen}
          onClose={() => setIsMultiVolumeOpen(false)}
          event={event}
          photos={allEventPhotos}
        />
      )}
    </div>
  );
};

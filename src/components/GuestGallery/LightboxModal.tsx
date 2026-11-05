import React, { useState, useEffect, useCallback } from 'react';
import { WeddingPhoto, WeddingEvent } from '../../types';
import { useWedding } from '../../context/WeddingContext';
import { downloadSinglePhoto } from '../../lib/zipHelper';
import { formatBytes } from '../../utils/pureLogic';
import { normalizeImageUrl, FALLBACK_IMAGE_DATA_URI } from '../../lib/imageHelper';
import { ShareModal } from './ShareModal';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  Share2,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';

interface LightboxModalProps {
  photos: WeddingPhoto[];
  initialPhotoId: string;
  event: WeddingEvent;
  isOpen: boolean;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  photos,
  initialPhotoId,
  event,
  isOpen,
  onClose
}) => {
  const { toggleFavorite, isFavorite, recordPhotoView, recordPhotoDownload } = useWedding();
  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = photos.findIndex(p => p.id === initialPhotoId);
    return idx !== -1 ? idx : 0;
  });
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);

  const prevInitialIdRef = React.useRef(initialPhotoId);
  // Sync index only when initialPhotoId actually changes
  useEffect(() => {
    if (prevInitialIdRef.current !== initialPhotoId) {
      prevInitialIdRef.current = initialPhotoId;
      const idx = photos.findIndex(p => p.id === initialPhotoId);
      if (idx !== -1) {
        setCurrentIndex(idx);
        setZoomLevel(1);
      }
    }
  }, [initialPhotoId, photos]);

  const currentPhoto = photos[currentIndex] || photos[0];

  // Record view on photo open
  useEffect(() => {
    if (currentPhoto && isOpen) {
      recordPhotoView(currentPhoto.id, event.id);
    }
  }, [currentPhoto?.id, isOpen]);

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : photos.length - 1));
    setZoomLevel(1);
  }, [photos.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev < photos.length - 1 ? prev + 1 : 0));
    setZoomLevel(1);
  }, [photos.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrev, handleNext, onClose]);

  if (!isOpen || !currentPhoto) return null;

  const handleDownloadHD = async () => {
    setDownloadFeedback('Downloading full resolution original...');
    recordPhotoDownload(currentPhoto.id, event.id);
    await downloadSinglePhoto(currentPhoto);
    setTimeout(() => setDownloadFeedback(null), 2500);
  };

  const toggleZoom = () => {
    setZoomLevel(prev => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1));
  };

  const isFav = isFavorite(currentPhoto.id);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-fadeIn">
        {/* Top Header Controls */}
        <div className="flex items-center justify-between px-6 py-4 z-20 text-white bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <span className="font-serif-luxury text-base font-bold text-white tracking-wide">
              {event.coupleNames}
            </span>
            <span className="text-white/40">·</span>
            <span className="text-xs font-mono text-white/70">
              {currentIndex + 1} of {photos.length}
            </span>
            <span className="text-[11px] font-semibold bg-white/10 px-2 py-0.5 rounded text-amber-200">
              {currentPhoto.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {downloadFeedback && (
              <span className="text-xs text-amber-300 font-medium bg-black/60 px-2.5 py-1 rounded-lg border border-amber-300/30">
                {downloadFeedback}
              </span>
            )}

            <button
              onClick={toggleZoom}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Toggle Zoom (1x, 1.5x, 2x)"
            >
              {zoomLevel === 1 ? <ZoomIn className="w-4 h-4" /> : <ZoomOut className="w-4 h-4" />}
            </button>

            <button
              onClick={() => toggleFavorite(currentPhoto.id)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isFav ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title={isFav ? 'Remove from Favourites' : 'Add to Favourites'}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-white' : ''}`} />
            </button>

            <button
              onClick={() => setIsShareOpen(true)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Share Photograph"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleDownloadHD}
              className="px-3.5 py-2 rounded-xl bg-[#9A7B4F] hover:bg-[#85673E] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              title="Download Original HD Photo"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download HD</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors ml-2 cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Stage: Photo with navigation buttons */}
        <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden">
          {/* Previous Button */}
          {photos.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/10 transition-colors backdrop-blur-sm cursor-pointer"
              aria-label="Previous Photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Current Photo */}
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-200"
            style={{
              transform: `scale(${zoomLevel})`,
              cursor: zoomLevel > 1 ? 'zoom-out' : 'zoom-in'
            }}
            onClick={toggleZoom}
          >
            <img
              src={normalizeImageUrl(currentPhoto.originalUrl)}
              alt=""
              className="max-w-full max-h-[82vh] object-contain rounded-lg shadow-2xl transition-opacity duration-300"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE_DATA_URI;
              }}
            />
          </div>

          {/* Next Button */}
          {photos.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/10 transition-colors backdrop-blur-sm cursor-pointer"
              aria-label="Next Photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Bottom Metadata Bar */}
        <div className="px-6 py-4 z-20 bg-gradient-to-t from-black/80 to-transparent flex flex-col sm:flex-row items-center justify-between text-xs text-white/70 gap-2">
          <div className="truncate max-w-md">
            {currentPhoto.caption ? (
              <span className="text-white font-medium">{currentPhoto.caption}</span>
            ) : (
              <span className="font-mono">{currentPhoto.filename}</span>
            )}
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            {currentPhoto.width && currentPhoto.height && (
              <span>{currentPhoto.width} × {currentPhoto.height} px</span>
            )}
            <span>·</span>
            <span>{formatBytes(currentPhoto.fileSizeBytes)}</span>
            <span>·</span>
            <span>{currentPhoto.downloadsCount} downloads</span>
          </div>
        </div>
      </div>

      {isShareOpen && (
        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          event={event}
          photo={currentPhoto}
        />
      )}
    </>
  );
};

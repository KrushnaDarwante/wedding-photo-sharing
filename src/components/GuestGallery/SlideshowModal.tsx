import React, { useState, useEffect } from 'react';
import { WeddingPhoto, WeddingEvent } from '../../types';
import { generateIndianRoyalSvgFallback } from '../../utils/indianWeddingAssets';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  Sparkles
} from 'lucide-react';

interface SlideshowModalProps {
  photos: WeddingPhoto[];
  event: WeddingEvent;
  isOpen: boolean;
  onClose: () => void;
}

export const SlideshowModal: React.FC<SlideshowModalProps> = ({
  photos,
  event,
  isOpen,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [intervalSec, setIntervalSec] = useState<number>(4);

  useEffect(() => {
    if (!isOpen || !isPlaying || photos.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev < photos.length - 1 ? prev + 1 : 0));
    }, intervalSec * 1000);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, intervalSec, photos.length]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  const handlePrev = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between select-none animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 z-20 text-white bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="font-serif-luxury text-lg font-bold tracking-wide">
              {event.coupleNames} Slideshow
            </span>
          </div>
          <span className="text-white/40">·</span>
          <span className="text-xs font-mono text-white/70">
            {currentIndex + 1} of {photos.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Transition speed selector */}
          <div className="flex items-center gap-1.5 text-xs text-white/70 bg-white/10 px-2.5 py-1 rounded-xl">
            <Clock className="w-3.5 h-3.5" />
            <select
              value={intervalSec}
              onChange={(e) => setIntervalSec(Number(e.target.value))}
              className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
            >
              <option value={3} className="text-slate-900">3 seconds</option>
              <option value={4} className="text-slate-900">4 seconds</option>
              <option value={6} className="text-slate-900">6 seconds</option>
              <option value={8} className="text-slate-900">8 seconds</option>
            </select>
          </div>

          <button
            onClick={() => setIsPlaying(prev => !prev)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title={isPlaying ? 'Pause Slideshow' : 'Resume Slideshow'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Exit Slideshow"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Slideshow Stage */}
      <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden">
        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/30 hover:bg-black/60 text-white border border-white/10 transition-colors backdrop-blur-sm cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="w-full h-full flex items-center justify-center animate-fadeIn key={currentPhoto.id}">
          <img
            src={currentPhoto.originalUrl.replace(/^\/src\/assets\/images\//, '/images/')}
            alt={currentPhoto.caption || currentPhoto.filename}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = generateIndianRoyalSvgFallback(
                currentPhoto.category,
                currentPhoto.caption || currentPhoto.filename,
                event.coupleNames
              );
            }}
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl transition-all duration-700"
            referrerPolicy="no-referrer"
          />
        </div>

        <button
          onClick={handleNext}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/30 hover:bg-black/60 text-white border border-white/10 transition-colors backdrop-blur-sm cursor-pointer"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Photo Caption */}
      <div className="px-6 py-4 z-20 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between text-xs text-white/70">
        <div>
          <span className="text-amber-200 font-semibold uppercase text-[10px] mr-2">
            {currentPhoto.category}
          </span>
          <span className="text-white">
            {currentPhoto.caption || currentPhoto.filename}
          </span>
        </div>

        <div className="text-[11px] font-mono text-white/50">
          Auto-advancing every {intervalSec}s
        </div>
      </div>
    </div>
  );
};

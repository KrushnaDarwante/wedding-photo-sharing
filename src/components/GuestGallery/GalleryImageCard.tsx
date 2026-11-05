import React, { useState } from 'react';
import { WeddingPhoto } from '../../types';
import { getPhotoThumbnailUrl } from '../../lib/imageHelper';
import {
  Heart,
  Download,
  Share2,
  CheckSquare,
  Square,
  Camera
} from 'lucide-react';

interface GalleryImageCardProps {
  photo: WeddingPhoto;
  isSelected: boolean;
  isFav: boolean;
  isSelectionMode: boolean;
  onSelect: (photoId: string) => void;
  onOpenLightbox: (photoId: string) => void;
  onToggleFavorite: (photoId: string) => void;
  onDownload: (photo: WeddingPhoto) => void;
  onShare: (photo: WeddingPhoto) => void;
}

export const GalleryImageCard: React.FC<GalleryImageCardProps> = ({
  photo,
  isSelected,
  isFav,
  isSelectionMode,
  onSelect,
  onOpenLightbox,
  onToggleFavorite,
  onDownload,
  onShare
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const thumbUrl = getPhotoThumbnailUrl(photo);

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-white border shadow-sm hover:shadow-md transition-all group flex flex-col justify-between ${
        isSelected ? 'border-[#9A7B4F] ring-2 ring-[#9A7B4F]/30' : 'border-[#E8E2D8]'
      }`}
    >
      {/* Photo Image Container with consistent aspect ratio */}
      <div
        onClick={() => {
          if (isSelectionMode) {
            onSelect(photo.id);
          } else {
            onOpenLightbox(photo.id);
          }
        }}
        className="cursor-pointer relative overflow-hidden bg-[#FAF6F0] aspect-[4/3] w-full"
      >
        {/* Professional shimmer placeholder while loading */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#F5EFE6] via-[#EFE7DC] to-[#F5EFE6] animate-pulse flex items-center justify-center z-0">
            <Camera className="w-8 h-8 text-[#9A7B4F]/30" />
          </div>
        )}

        {/* Graceful fallback if image genuinely fails to load */}
        {hasError ? (
          <div className="absolute inset-0 bg-[#FAF6F0] flex flex-col items-center justify-center p-4 text-center z-1">
            <div className="w-12 h-12 rounded-full bg-[#EFE8DC] flex items-center justify-center text-[#9A7B4F] mb-2 shadow-inner">
              <Camera className="w-6 h-6 text-[#9A7B4F]" />
            </div>
            <span className="font-serif-luxury text-xs font-semibold text-slate-700">Archival Memory</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Click to preview</span>
          </div>
        ) : (
          <img
            src={thumbUrl}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className={`w-full h-full object-cover group-hover:scale-103 transition-all duration-500 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Dark subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" />

        {/* Top Floating Controls: Select Checkbox (if in select mode) or Category Badge */}
        <div className="absolute top-3 left-3 z-20">
          {isSelectionMode ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(photo.id);
              }}
              className="p-1.5 rounded-lg bg-black/50 text-white backdrop-blur-sm cursor-pointer hover:bg-black/70 transition-colors"
              aria-label={isSelected ? 'Deselect photo' : 'Select photo'}
            >
              {isSelected ? (
                <CheckSquare className="w-4 h-4 text-amber-300" />
              ) : (
                <Square className="w-4 h-4 text-white" />
              )}
            </button>
          ) : (
            <span className="text-[10px] font-semibold bg-black/60 text-white backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm">
              {photo.category}
            </span>
          )}
        </div>

        {/* Top Right Floating Actions: Heart, Download, Share */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(photo.id);
            }}
            className={`p-2 rounded-xl backdrop-blur-sm transition-all cursor-pointer ${
              isFav
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100'
            }`}
            title={isFav ? 'Remove from Favourites' : 'Add to Favourites'}
            aria-label="Toggle Favourite"
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload(photo);
            }}
            className="p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
            title="Download Full Resolution HD"
            aria-label="Download Photo"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare(photo);
            }}
            className="p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
            title="Share Photo"
            aria-label="Share Photo"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Caption & Metadata displayed strictly in its designated card section */}
      {photo.caption && (
        <div className="p-3.5 bg-white text-xs text-slate-700 font-medium border-t border-[#E8E2D8] flex items-center justify-between min-h-[50px]">
          <p className="line-clamp-2 leading-relaxed text-slate-700">{photo.caption}</p>
        </div>
      )}
    </div>
  );
};

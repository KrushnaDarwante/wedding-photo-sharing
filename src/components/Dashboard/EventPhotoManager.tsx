import React, { useState } from 'react';
import { WeddingPhoto } from '../../types';
import { useWedding } from '../../context/WeddingContext';
import { WEDDING_CATEGORIES } from '../../lib/constants';
import { formatBytes } from '../../utils/pureLogic';
import { downloadSinglePhoto } from '../../lib/zipHelper';
import { normalizeImageUrl, FALLBACK_IMAGE_DATA_URI } from '../../lib/imageHelper';
import {
  Trash2,
  Download,
  Eye,
  CheckSquare,
  Square,
  Search,
  Filter,
  Layers
} from 'lucide-react';

interface EventPhotoManagerProps {
  eventId: string;
}

export const EventPhotoManager: React.FC<EventPhotoManagerProps> = ({ eventId }) => {
  const { photos, deletePhoto, updatePhotoCategory } = useWedding();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());

  const eventPhotos = photos.filter(p => p.eventId === eventId);

  const filteredPhotos = eventPhotos.filter(photo => {
    if (selectedCategory !== 'all' && photo.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = photo.filename.toLowerCase().includes(q);
      const matchCaption = photo.caption ? photo.caption.toLowerCase().includes(q) : false;
      const matchCat = photo.category.toLowerCase().includes(q);
      if (!matchName && !matchCaption && !matchCat) return false;
    }
    return true;
  });

  const toggleSelectPhoto = (id: string) => {
    setSelectedPhotoIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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

  const handleBulkDelete = () => {
    if (selectedPhotoIds.size === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedPhotoIds.size} selected photograph(s)?`)) {
      selectedPhotoIds.forEach(id => deletePhoto(id, eventId));
      setSelectedPhotoIds(new Set());
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar: Category filter, search, selection tools */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E2D8] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search & Categories */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by filename or tag..."
              className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A7B4F] bg-slate-50 w-52 sm:w-64"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#9A7B4F] bg-slate-50 font-medium text-slate-700"
            >
              <option value="all">All Ceremonies ({eventPhotos.length})</option>
              {WEDDING_CATEGORIES.map(cat => {
                const count = eventPhotos.filter(p => p.category.toLowerCase() === cat.toLowerCase()).length;
                return (
                  <option key={cat} value={cat}>
                    {cat} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Selection Actions */}
        <div className="flex items-center gap-3">
          {filteredPhotos.length > 0 && (
            <button
              onClick={selectAll}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1.5 cursor-pointer"
            >
              {selectedPhotoIds.size === filteredPhotos.length ? (
                <CheckSquare className="w-4 h-4 text-[#9A7B4F]" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Select All</span>
            </button>
          )}

          {selectedPhotoIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">
                {selectedPhotoIds.size} selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Photos Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E8E2D8]">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-serif-luxury text-lg font-bold text-slate-900">
            No photographs found
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {eventPhotos.length === 0
              ? 'This wedding gallery is currently empty. Use the bulk uploader above to add photographs.'
              : 'No photos match the selected filter or search keywords.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredPhotos.map(photo => {
            const isSelected = selectedPhotoIds.has(photo.id);

            return (
              <div
                key={photo.id}
                className={`group relative bg-white rounded-xl overflow-hidden border shadow-sm transition-all flex flex-col justify-between ${
                  isSelected ? 'border-[#9A7B4F] ring-2 ring-[#9A7B4F]/30' : 'border-[#E8E2D8] hover:shadow-md'
                }`}
              >
                {/* Image Thumbnail Container */}
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={normalizeImageUrl(photo.thumbnailUrl || photo.originalUrl)}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE_DATA_URI;
                    }}
                  />

                  {/* Checkbox overlay */}
                  <button
                    onClick={() => toggleSelectPhoto(photo.id)}
                    className="absolute top-2 left-2 p-1 rounded-md bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors cursor-pointer"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-amber-300" />
                    ) : (
                      <Square className="w-4 h-4 text-white/80" />
                    )}
                  </button>

                  {/* Actions overlay */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => downloadSinglePhoto(photo)}
                      title="Download Original HD Photo"
                      className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${photo.filename}"?`)) {
                          deletePhoto(photo.id, eventId);
                        }
                      }}
                      title="Delete Photo"
                      className="p-1.5 rounded-lg bg-red-900/80 hover:bg-red-950 text-white backdrop-blur-sm transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Category Pill Tag */}
                  <div className="absolute bottom-2 left-2">
                    <span className="text-[10px] font-semibold bg-black/60 text-white backdrop-blur-sm px-2 py-0.5 rounded">
                      {photo.category}
                    </span>
                  </div>
                </div>

                {/* Photo metadata footer */}
                <div className="p-3 bg-white text-[11px] text-slate-600 flex items-center justify-between border-t border-slate-100">
                  <span className="truncate max-w-[120px]" title={photo.filename}>
                    {photo.filename}
                  </span>
                  <div className="flex items-center gap-2 text-slate-500 shrink-0">
                    <span className="flex items-center gap-1" title="Views">
                      <Eye className="w-3 h-3" />
                      {photo.viewsCount}
                    </span>
                    <span>·</span>
                    <span className="font-mono">{formatBytes(photo.fileSizeBytes)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

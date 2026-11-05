import React from 'react';
import { WeddingEvent } from '../../types';
import { useWedding } from '../../context/WeddingContext';
import { formatBytes } from '../../utils/pureLogic';
import { normalizeImageUrl, FALLBACK_IMAGE_DATA_URI } from '../../lib/imageHelper';
import { Eye, DownloadCloud, HardDrive, Users, BarChart3, TrendingUp } from 'lucide-react';

interface AnalyticsViewProps {
  event: WeddingEvent;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ event }) => {
  const { photos } = useWedding();
  const eventPhotos = photos.filter(p => p.eventId === event.id);

  // Calculate views & downloads by category
  const categoryStats: Record<string, { views: number; downloads: number; photos: number }> = {};

  eventPhotos.forEach(p => {
    const cat = p.category || 'Ceremony';
    if (!categoryStats[cat]) {
      categoryStats[cat] = { views: 0, downloads: 0, photos: 0 };
    }
    categoryStats[cat].views += p.viewsCount || 0;
    categoryStats[cat].downloads += p.downloadsCount || 0;
    categoryStats[cat].photos += 1;
  });

  const categoriesList = Object.entries(categoryStats);

  // Top downloaded photos
  const topDownloaded = [...eventPhotos]
    .sort((a, b) => b.downloadsCount - a.downloadsCount)
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Scans & Views</span>
            <Eye className="w-4 h-4 text-[#9A7B4F]" />
          </div>
          <div className="font-serif-luxury text-2xl font-bold text-slate-900 tabular-nums">
            {event.totalViews}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>Active guest engagement</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total HD Downloads</span>
            <DownloadCloud className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="font-serif-luxury text-2xl font-bold text-slate-900 tabular-nums">
            {event.totalDownloads}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Original full-resolution files
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Storage Consumed</span>
            <HardDrive className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-serif-luxury text-2xl font-bold text-slate-900 tabular-nums">
            {formatBytes(event.storageBytes)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across {event.totalPhotos} photographs
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Access Status</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-serif-luxury text-2xl font-bold text-slate-900">
            {event.isQrActive ? 'Live' : 'Paused'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {event.isQrActive ? 'QR code active & scannable' : 'QR code deactivated'}
          </div>
        </div>
      </div>

      {/* Breakdown by Category */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-sm space-y-4">
        <h3 className="font-serif-luxury text-lg font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#9A7B4F]" />
          <span>Guest Engagement by Ceremony</span>
        </h3>

        {categoriesList.length === 0 ? (
          <p className="text-xs text-slate-500">No photos uploaded to calculate engagement.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {categoriesList.map(([cat, stats]) => {
              const maxViews = Math.max(...categoriesList.map(c => c[1].views), 1);
              const viewPercentage = Math.round((stats.views / maxViews) * 100);

              return (
                <div key={cat} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{cat}</span>
                    <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
                      <span>{stats.photos} photos</span>
                      <span>{stats.views} views</span>
                      <span className="text-indigo-600 font-semibold">{stats.downloads} downloads</span>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#C8A97E] to-[#9A7B4F] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(viewPercentage, 8)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Most Downloaded Photos */}
      {topDownloaded.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-sm space-y-4">
          <h3 className="font-serif-luxury text-lg font-bold text-slate-900">
            Top Downloaded Photographs
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {topDownloaded.map(photo => (
              <div key={photo.id} className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <img
                  src={normalizeImageUrl(photo.thumbnailUrl || photo.originalUrl)}
                  alt=""
                  className="w-full aspect-video object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE_DATA_URI;
                  }}
                />
                <div className="p-2.5 text-[11px] text-slate-600">
                  <p className="font-medium truncate">{photo.filename}</p>
                  <div className="flex items-center justify-between text-slate-500 mt-1">
                    <span>{photo.category}</span>
                    <span className="text-[#9A7B4F] font-semibold">{photo.downloadsCount} downloads</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

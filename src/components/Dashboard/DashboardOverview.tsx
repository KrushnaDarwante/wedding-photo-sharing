import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { CreateEventModal } from './CreateEventModal';
import { QRCodeManagerModal } from './QRCodeManagerModal';
import { PhotographerSettings } from './PhotographerSettings';
import { EventDetailView } from './EventDetailView';
import { StorageCostDashboard } from './StorageCostDashboard';
import { formatBytes } from '../../utils/pureLogic';
import {
  Plus,
  QrCode,
  ExternalLink,
  Calendar,
  Layers,
  Eye,
  DownloadCloud,
  HardDrive,
  Settings,
  Sparkles,
  Camera,
  MapPin,
  Radio
} from 'lucide-react';
import { WeddingEvent } from '../../types';

export const DashboardOverview: React.FC = () => {
  const { photographer, events, photos, setCurrentView } = useWedding();
  const [activeTab, setActiveTab] = useState<'events' | 'storage' | 'settings'>('events');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [qrModalEvent, setQrModalEvent] = useState<WeddingEvent | null>(null);

  // If viewing a single event in detail
  if (selectedEventId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <EventDetailView
          eventId={selectedEventId}
          onBack={() => setSelectedEventId(null)}
        />
      </div>
    );
  }

  // Global aggregate stats
  const totalPhotosCount = photos.length;
  const totalViewsCount = events.reduce((acc, e) => acc + (e.totalViews || 0), 0);
  const totalDownloadsCount = events.reduce((acc, e) => acc + (e.totalDownloads || 0), 0);
  const totalStorageBytes = photographer?.storageUsedBytes || photos.reduce((acc, p) => acc + (p.fileSizeBytes || 0), 0);
  const storageLimit = photographer?.storageLimitBytes || 500 * 1024 * 1024 * 1024;
  const storagePercent = Math.min(100, Math.round((totalStorageBytes / storageLimit) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Studio Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E2D8] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={photographer?.logoUrl || '/src/assets/images/photographer_avatar_1793789596829.jpg'}
            alt={photographer?.businessName}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                {photographer?.businessName || 'Lumière Wedding Studios'}
              </h1>
              <span className="text-[10px] font-bold text-amber-900 bg-[#FAF5EB] border border-[#E8DFC8] px-2 py-0.5 rounded-full uppercase">
                {photographer?.plan || 'PRO'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {photographer?.tagline || 'Fine-art editorial wedding cinematography & photography'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#9A7B4F] to-[#B39364] hover:from-[#8A6D43] hover:to-[#A38356] rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Wedding</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Active Weddings</span>
            <Calendar className="w-4 h-4 text-[#9A7B4F]" />
          </div>
          <div className="font-serif-luxury text-2xl font-bold text-slate-900 tabular-nums">
            {events.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Galleries live
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total HD Photos</span>
            <Layers className="w-4 h-4 text-[#9A7B4F]" />
          </div>
          <div className="font-serif-luxury text-2xl font-bold text-slate-900 tabular-nums">
            {totalPhotosCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Curated memories
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Guest QR Scans</span>
            <Eye className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-serif-luxury text-2xl font-bold text-slate-900 tabular-nums">
            {totalViewsCount}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">
            Across all events
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Bulk Downloads</span>
            <DownloadCloud className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="font-serif-luxury text-2xl font-bold text-slate-900 tabular-nums">
            {totalDownloadsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Original files saved
          </div>
        </div>

        <div
          onClick={() => setActiveTab('storage')}
          className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-sm col-span-2 lg:col-span-1 cursor-pointer hover:border-[#9A7B4F]/50 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Storage Used</span>
            <HardDrive className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-serif-luxury text-xl font-bold text-slate-900 tabular-nums">
            {formatBytes(totalStorageBytes)}
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-[#9A7B4F] rounded-full"
              style={{ width: `${Math.max(storagePercent, 5)}%` }}
            />
          </div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E2D8] pb-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'events'
              ? 'text-slate-900 border-b-2 border-[#9A7B4F] bg-white'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Camera className="w-4 h-4 text-[#9A7B4F]" />
          <span>Wedding Events ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('storage')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'storage'
              ? 'text-slate-900 border-b-2 border-[#9A7B4F] bg-white'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <HardDrive className="w-4 h-4 text-amber-600" />
          <span>Storage & Cloud Cost Center</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'settings'
              ? 'text-slate-900 border-b-2 border-[#9A7B4F] bg-white'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Studio Branding & Settings</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'events' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt) => {
              const formattedDate = new Date(evt.weddingDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div
                  key={evt.id}
                  className="bg-white rounded-2xl overflow-hidden border border-[#E8E2D8] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Event Cover Photo */}
                    <div className="relative aspect-video overflow-hidden bg-slate-100">
                      <img
                        src={evt.coverPhotoUrl}
                        alt={evt.coupleNames}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-semibold bg-black/60 text-white backdrop-blur-sm px-2.5 py-1 rounded-md flex items-center gap-1">
                          <Radio className="w-2.5 h-2.5 text-emerald-400" />
                          {evt.isQrActive ? 'Live & Scannable' : 'QR Paused'}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3">
                        <button
                          onClick={() => setQrModalEvent(evt)}
                          className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-900 backdrop-blur-sm shadow transition-colors cursor-pointer"
                          title="Generate & View QR Code"
                        >
                          <QrCode className="w-4 h-4 text-[#9A7B4F]" />
                        </button>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <div className="text-xs text-amber-200 font-medium flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formattedDate}</span>
                        </div>
                        <h3 className="font-serif-luxury text-xl font-bold leading-tight mt-0.5 truncate">
                          {evt.coupleNames}
                        </h3>
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="p-5 space-y-3">
                      {evt.venue && (
                        <div className="text-xs text-slate-500 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{evt.venue}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                        <div>
                          <div className="text-xs font-bold text-slate-900 tabular-nums">
                            {evt.totalPhotos}
                          </div>
                          <div className="text-[10px] text-slate-500">Photos</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 tabular-nums">
                            {evt.totalViews}
                          </div>
                          <div className="text-[10px] text-slate-500">Views</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 tabular-nums">
                            {evt.totalDownloads}
                          </div>
                          <div className="text-[10px] text-slate-500">Downloads</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 bg-[#FAF8F5] border-t border-[#E8E2D8] flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedEventId(evt.id)}
                      className="px-3.5 py-2 text-xs font-semibold text-white bg-[#1E1B18] hover:bg-[#36322D] rounded-xl transition-colors flex-1 text-center cursor-pointer"
                    >
                      Manage Photos & Upload
                    </button>

                    <button
                      onClick={() => setCurrentView({ type: 'guest-gallery', eventSlug: evt.slug })}
                      title="Open Public Guest Gallery"
                      className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-[#E3DAC9] hover:bg-[#FAF5EB] rounded-xl transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4 text-[#9A7B4F]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : activeTab === 'storage' ? (
        <StorageCostDashboard />
      ) : (
        <PhotographerSettings />
      )}

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={(newEventId) => {
          setSelectedEventId(newEventId);
        }}
      />

      {/* QR Code Manager Modal */}
      {qrModalEvent && (
        <QRCodeManagerModal
          event={qrModalEvent}
          isOpen={Boolean(qrModalEvent)}
          onClose={() => setQrModalEvent(null)}
        />
      )}
    </div>
  );
};

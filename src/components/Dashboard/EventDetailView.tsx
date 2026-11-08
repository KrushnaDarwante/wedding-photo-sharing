import React, { useState } from 'react';
import { WeddingEvent } from '../../types';
import { useWedding } from '../../context/WeddingContext';
import { BulkUploader } from './BulkUploader';
import { EventPhotoManager } from './EventPhotoManager';
import { AnalyticsView } from './AnalyticsView';
import { QRCodeManagerModal } from './QRCodeManagerModal';
import { PrintableQRCard } from '../PrintableQRCard';
import { generateQRCodeDataUrl } from '../../lib/qrHelper';
import {
  ArrowLeft,
  QrCode,
  ExternalLink,
  UploadCloud,
  BarChart3,
  Settings,
  Layers,
  Calendar,
  MapPin,
  Trash2,
  Check,
  Radio
} from 'lucide-react';

interface EventDetailViewProps {
  eventId: string;
  initialTab?: 'photos' | 'qr' | 'analytics' | 'settings';
  onBack: () => void;
}

export const EventDetailView: React.FC<EventDetailViewProps> = ({
  eventId,
  initialTab = 'photos',
  onBack
}) => {
  const { events, photos, updateEvent, deleteEvent, setCurrentView, photographer } = useWedding();
  const [activeTab, setActiveTab] = useState<'photos' | 'qr' | 'analytics' | 'settings'>(initialTab);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [showPrintCard, setShowPrintCard] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  const event = events.find(e => e.id === eventId);

  // Settings form local state
  const [coupleNames, setCoupleNames] = useState(event?.coupleNames || '');
  const [weddingDate, setWeddingDate] = useState(event?.weddingDate || '');
  const [venue, setVenue] = useState(event?.venue || '');
  const [description, setDescription] = useState(event?.description || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [selectedCoverUrl, setSelectedCoverUrl] = useState(event?.coverPhotoUrl || '');
  const [coverSaveState, setCoverSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [coverSaveError, setCoverSaveError] = useState('');

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h3 className="text-lg font-bold text-slate-800">Wedding event not found</h3>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 text-xs font-semibold bg-[#1E1B18] text-white rounded-xl"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const galleryUrl = `${window.location.origin}${window.location.pathname}?gallery=${event.slug}`;

  const handleOpenPrint = async () => {
    try {
      const url = await generateQRCodeDataUrl(galleryUrl, { width: 800 });
      setQrDataUrl(url);
      setShowPrintCard(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateEvent(event.id, { coupleNames, weddingDate, venue, description });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Could not save event details.');
    }
  };

  const handleDelete = () => {
    if (confirm(`Permanently delete "${event.coupleNames}" and all associated photographs? This cannot be undone.`)) {
      deleteEvent(event.id);
      onBack();
    }
  };

  const formattedDate = new Date(event.weddingDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Weddings</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-[#E3DAC9] hover:bg-[#FAF5EB] rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-[#9A7B4F]" />
            <span>QR Code & Card</span>
          </button>

          <button
            onClick={() => setCurrentView({ type: 'guest-gallery', eventSlug: event.slug })}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#1E1B18] hover:bg-[#36322D] rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Preview Guest Gallery</span>
          </button>
        </div>
      </div>

      {/* Event Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E2D8] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1 text-[#9A7B4F] font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
            {event.venue && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {event.venue}
                </span>
              </>
            )}
            <span>·</span>
            <span className="flex items-center gap-1 text-emerald-700">
              <Radio className="w-3 h-3 text-emerald-600" />
              {event.isQrActive ? 'QR Active' : 'QR Paused'}
            </span>
          </div>

          <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
            {event.coupleNames}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Quick metrics chip cluster */}
        <div className="flex items-center gap-6 shrink-0 z-10 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div>
            <div className="font-serif-luxury text-2xl font-bold text-slate-900 tabular-nums">
              {event.totalPhotos}
            </div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">
              Photographs
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <div className="font-serif-luxury text-2xl font-bold text-slate-900 tabular-nums">
              {event.totalViews}
            </div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">
              Guest Views
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <div className="font-serif-luxury text-2xl font-bold text-slate-900 tabular-nums">
              {event.totalDownloads}
            </div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">
              Downloads
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-[#E8E2D8] pb-1">
        <button
          onClick={() => setActiveTab('photos')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'photos'
              ? 'text-slate-900 border-b-2 border-[#9A7B4F] bg-white'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <UploadCloud className="w-4 h-4 text-[#9A7B4F]" />
          <span>Photos & Bulk Upload ({event.totalPhotos})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'analytics'
              ? 'text-slate-900 border-b-2 border-[#9A7B4F] bg-white'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-[#9A7B4F]" />
          <span>Analytics & Downloads</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'settings'
              ? 'text-slate-900 border-b-2 border-[#9A7B4F] bg-white'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Event Settings</span>
        </button>
      </div>

      {/* Tab 1: Photos & Bulk Upload */}
      {activeTab === 'photos' && (
        <div className="space-y-8">
          <BulkUploader eventId={event.id} />
          <EventPhotoManager eventId={event.id} />
        </div>
      )}

      {/* Tab 2: Analytics */}
      {activeTab === 'analytics' && (
        <AnalyticsView event={event} />
      )}

      {/* Tab 3: Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl p-7 border border-[#E8E2D8] shadow-sm max-w-2xl space-y-6">
          <h3 className="font-serif-luxury text-xl font-bold text-slate-900">
            Edit Wedding Details
          </h3>
          <div className="rounded-xl border border-[#E8E2D8] p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Event Cover Photo</h4>
                <p className="text-xs text-slate-500">Choose an already uploaded studio photo. No duplicate upload.</p>
              </div>
              <button type="button" onClick={() => { setSelectedCoverUrl(event.coverPhotoUrl); setShowCoverPicker(v => !v); }}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-[#E3DAC9] hover:bg-[#FAF5EB]">
                {showCoverPicker ? 'Close photo picker' : 'Change Cover Photo'}
              </button>
            </div>
            <img src={selectedCoverUrl || event.coverPhotoUrl} alt="Selected event cover" className="w-full max-w-sm aspect-video object-cover rounded-lg bg-slate-100" />
            {showCoverPicker && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                {photos.filter(photo => photo.originalUrl && photo.deletedAt == null).map(photo => (
                  <button key={photo.id} type="button" onClick={() => { setSelectedCoverUrl(photo.originalUrl); setCoverSaveState('idle'); }}
                    className={`rounded-lg overflow-hidden border-2 text-left ${selectedCoverUrl === photo.originalUrl ? 'border-[#9A7B4F]' : 'border-transparent'}`}>
                    <img src={photo.thumbnailUrl || photo.originalUrl} alt={photo.filename} className="w-full aspect-[4/3] object-cover" />
                    <span className="block text-[10px] p-1 truncate">{photo.filename}</span>
                  </button>
                ))}
                {photos.filter(photo => photo.originalUrl && photo.deletedAt == null).length === 0 && (
                  <p className="col-span-full text-xs text-slate-500">No uploaded photos are available yet.</p>
                )}
              </div>
            )}
            <div className="flex items-center gap-3">
              <button type="button" disabled={!selectedCoverUrl || selectedCoverUrl === event.coverPhotoUrl || coverSaveState === 'saving'}
                onClick={async () => {
                  setCoverSaveState('saving'); setCoverSaveError('');
                  try { await updateEvent(event.id, { coverPhotoUrl: selectedCoverUrl }); setCoverSaveState('saved'); setShowCoverPicker(false); }
                  catch (error) { setCoverSaveState('error'); setCoverSaveError(error instanceof Error ? error.message : 'Could not update cover photo.'); }
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#1E1B18] rounded-lg disabled:opacity-40">
                {coverSaveState === 'saving' ? 'Saving…' : 'Save Cover Photo'}
              </button>
              {coverSaveState === 'saved' && <span className="text-xs text-emerald-700">Cover updated for guests.</span>}
              {coverSaveError && <span className="text-xs text-red-600">{coverSaveError}</span>}
            </div>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Wedding details saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Couple Names
              </label>
              <input
                type="text"
                required
                value={coupleNames}
                onChange={(e) => setCoupleNames(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A7B4F] bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Wedding Date
                </label>
                <input
                  type="date"
                  required
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A7B4F] bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Venue / Location
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A7B4F] bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Welcome Message for Guests
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A7B4F] bg-slate-50/50"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#9A7B4F] to-[#B39364] hover:from-[#8A6D43] hover:to-[#A38356] rounded-xl shadow transition-all cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>

          {/* Danger Zone */}
          <div className="pt-6 border-t border-red-100 space-y-3">
            <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider">
              Danger Zone
            </h4>
            <div className="p-4 bg-red-50/60 rounded-xl border border-red-200 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-red-900">Delete this Wedding Event</div>
                <div className="text-[11px] text-red-700 mt-0.5">
                  Permanently deletes the gallery, QR link, and all uploaded photographs.
                </div>
              </div>
              <button
                type="button"
                onClick={handleDelete}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shrink-0 shadow-sm cursor-pointer"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Manager Modal */}
      <QRCodeManagerModal
        event={event}
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

      {/* Printable Card Dialog */}
      {showPrintCard && (
        <PrintableQRCard
          event={event}
          photographer={photographer}
          qrDataUrl={qrDataUrl}
          onClose={() => setShowPrintCard(false)}
        />
      )}
    </div>
  );
};

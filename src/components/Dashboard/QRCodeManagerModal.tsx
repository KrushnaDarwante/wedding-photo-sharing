import React, { useState, useEffect } from 'react';
import { WeddingEvent } from '../../types';
import { useWedding } from '../../context/WeddingContext';
import { generateQRCodeDataUrl, downloadQRCodePNG } from '../../lib/qrHelper';
import { PrintableQRCard } from '../PrintableQRCard';
import {
  X,
  Download,
  Printer,
  Copy,
  Check,
  RefreshCw,
  PowerOff,
  Power,
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface QRCodeManagerModalProps {
  event: WeddingEvent;
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeManagerModal: React.FC<QRCodeManagerModalProps> = ({
  event,
  isOpen,
  onClose
}) => {
  const { photographer, toggleEventQr, regenerateQrSlug, setCurrentView } = useWedding();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showPrintCard, setShowPrintCard] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const galleryUrl = `${window.location.origin}${window.location.pathname}?gallery=${event.slug}`;

  useEffect(() => {
    if (event.slug) {
      generateQRCodeDataUrl(galleryUrl, { width: 800 })
        .then(setQrDataUrl)
        .catch(err => console.error('Failed to generate QR:', err));
    }
  }, [event.slug, galleryUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(galleryUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = () => {
    if (qrDataUrl) {
      downloadQRCodePNG(qrDataUrl, `${event.slug}-qr-code.png`);
      setStatusMsg('Downloaded high-resolution PNG QR code.');
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const handleToggleActive = () => {
    toggleEventQr(event.id, !event.isQrActive);
    setStatusMsg(`QR access has been ${!event.isQrActive ? 'activated' : 'paused'}.`);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleRegenerate = () => {
    if (confirm('Regenerating will invalidate the previous QR code and links. Do you wish to continue?')) {
      const newSlug = regenerateQrSlug(event.id);
      setStatusMsg(`Generated new secure link: ${newSlug}`);
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const handleOpenGuestGallery = () => {
    onClose();
    setCurrentView({ type: 'guest-gallery', eventSlug: event.slug });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-2xl max-w-lg w-full p-7 border border-[#E8E2D8] shadow-2xl relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-6">
            <div className="text-xs font-semibold text-[#9A7B4F] uppercase tracking-wider mb-1">
              QR Code & Table Cards
            </div>
            <h2 className="font-serif-luxury text-2xl font-bold text-slate-900">
              {event.coupleNames}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Every guest who scans this QR code will be routed directly to the live wedding gallery.
            </p>
          </div>

          {statusMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* QR Code Preview Frame */}
          <div className="p-6 bg-[#FAF8F5] rounded-2xl border border-[#E8DFC8] text-center my-4">
            <div className="relative inline-block">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Wedding QR Code"
                  className={`w-48 h-48 mx-auto rounded-xl bg-white p-2 border border-slate-200 shadow-sm ${
                    !event.isQrActive ? 'grayscale opacity-40' : ''
                  }`}
                />
              ) : (
                <div className="w-48 h-48 bg-slate-100 rounded-xl flex items-center justify-center text-xs text-slate-400">
                  Generating...
                </div>
              )}

              {!event.isQrActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-xl text-white p-2">
                  <AlertTriangle className="w-6 h-6 text-amber-400 mb-1" />
                  <span className="text-xs font-bold uppercase tracking-wider">Access Paused</span>
                </div>
              )}
            </div>

            {/* Link Bar */}
            <div className="mt-4 flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-600 truncate font-mono text-[11px] px-2 flex-1 text-left">
                {galleryUrl}
              </span>
              <button
                onClick={handleCopyLink}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Action Buttons: Download PNG, Print Table Card, Preview Gallery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <button
              onClick={handleDownloadPNG}
              className="w-full py-2.5 px-3 text-xs font-semibold text-slate-800 bg-white border border-[#E3DAC9] hover:bg-[#FAF5EB] rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#9A7B4F]" />
              <span>Download High-Res PNG</span>
            </button>

            <button
              onClick={() => setShowPrintCard(true)}
              className="w-full py-2.5 px-3 text-xs font-semibold text-white bg-gradient-to-r from-[#9A7B4F] to-[#B39364] hover:from-[#8A6D43] hover:to-[#A38356] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Table Card (PDF)</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={handleOpenGuestGallery}
              className="text-[#9A7B4F] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Guest Gallery View</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleActive}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  event.isQrActive
                    ? 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                    : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                {event.isQrActive ? (
                  <>
                    <PowerOff className="w-3.5 h-3.5" />
                    <span>Pause QR</span>
                  </>
                ) : (
                  <>
                    <Power className="w-3.5 h-3.5" />
                    <span>Activate QR</span>
                  </>
                )}
              </button>

              <button
                onClick={handleRegenerate}
                title="Regenerate link and QR"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPrintCard && (
        <PrintableQRCard
          event={event}
          photographer={photographer}
          qrDataUrl={qrDataUrl}
          onClose={() => setShowPrintCard(false)}
        />
      )}
    </>
  );
};

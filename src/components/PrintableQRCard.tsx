import React from 'react';
import { WeddingEvent, PhotographerProfile } from '../types';
import { Camera, Sparkles, Printer, X } from 'lucide-react';
import { printElement } from '../lib/qrHelper';

interface PrintableQRCardProps {
  event: WeddingEvent;
  photographer: PhotographerProfile | null;
  qrDataUrl: string;
  onClose?: () => void;
}

export const PrintableQRCard: React.FC<PrintableQRCardProps> = ({
  event,
  photographer,
  qrDataUrl,
  onClose
}) => {
  const formattedDate = new Date(event.weddingDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      {/* Top action bar (hidden during print) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 no-print">
        <button
          onClick={() => printElement('printable-card-frame')}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-[#800020] hover:bg-[#660019] border border-[#D4AF37]/50 rounded-xl shadow-xl transition-all flex items-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4 text-[#D4AF37]" />
          <span>Print Table Cards (PDF)</span>
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2.5 bg-white text-slate-700 hover:text-slate-900 rounded-xl shadow-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* The Printable Card Frame */}
      <div
        id="printable-card-frame"
        className="bg-[#FCF9F2] rounded-3xl p-10 max-w-md w-full shadow-2xl border-4 border-[#800020] text-center relative mx-auto my-8 print:border-2 print:shadow-none print:m-0 print:max-w-none"
      >
        {/* Inner Gold Foil Inset Border */}
        <div className="border border-[#D4AF37] p-6 rounded-2xl relative">
          {/* Sanskrit Blessing Header */}
          <div className="flex flex-col items-center justify-center gap-1 mb-4">
            <span className="text-sm font-semibold tracking-widest text-[#800020]">
              ॥ शुभ विवाह ॥
            </span>
            <span className="text-[11px] font-serif-luxury uppercase tracking-widest text-[#B38738]">
              CELEBRATION OF SACRED VOWS
            </span>
          </div>

          {/* Couple Names */}
          <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#800020] mb-2 leading-tight">
            {event.coupleNames}
          </h1>

          <div className="text-xs text-slate-600 font-medium tracking-wide uppercase mb-4">
            {formattedDate} {event.venue ? `· ${event.venue}` : ''}
          </div>

          {/* Golden Divider */}
          <div className="flex items-center justify-center gap-2 my-3">
            <div className="h-px w-16 bg-[#D4AF37]/60" />
            <span className="text-[#D4AF37] text-xs">❖</span>
            <div className="h-px w-16 bg-[#D4AF37]/60" />
          </div>

          {/* QR Code Container */}
          <div className="my-4 inline-block p-4 bg-white rounded-2xl border-2 border-[#D4AF37]/40 shadow-md">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Scan to View Wedding Photos"
                className="w-48 h-48 sm:w-56 sm:h-56 mx-auto object-contain"
              />
            ) : (
              <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-slate-400">
                Generating QR Code...
              </div>
            )}
          </div>

          {/* Scan Callout */}
          <div className="space-y-1 mb-4">
            <div className="font-serif-luxury text-base font-bold text-slate-900 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>Scan to View & Download Photos</span>
            </div>
            <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
              Open your phone camera and point at this code to explore the live wedding album and download full-resolution memories.
            </p>
          </div>

          {/* Photographer Studio Credit / Referral */}
          <div className="pt-4 border-t border-[#E8DFC8] flex items-center justify-center gap-2 text-xs text-slate-500">
            <Camera className="w-3.5 h-3.5 text-[#800020]" />
            <span>Photography by <strong className="text-slate-800">{photographer?.businessName || 'Vedic Vows & Royal Indian Weddings'}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};


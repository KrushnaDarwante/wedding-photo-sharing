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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      {/* Top action bar (hidden during print) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 no-print">
        <button
          onClick={() => printElement('printable-card-frame')}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#9A7B4F] hover:bg-[#83653B] rounded-xl shadow-lg transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Table Cards (PDF)</span>
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 bg-white text-slate-700 hover:text-slate-900 rounded-xl shadow-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* The Printable Card Frame */}
      <div
        id="printable-card-frame"
        className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl border-4 border-[#EBDBC2] text-center relative mx-auto my-8 print:border-2 print:shadow-none print:m-0 print:max-w-none"
      >
        {/* Subtle decorative floral border accents */}
        <div className="flex items-center justify-center gap-2 text-xs font-serif-luxury uppercase tracking-widest text-[#9A7B4F] mb-4">
          <span>✧</span>
          <span>Celebration of Love</span>
          <span>✧</span>
        </div>

        {/* Couple Names */}
        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-slate-900 mb-2 leading-tight">
          {event.coupleNames}
        </h1>

        <div className="text-xs text-slate-500 font-medium tracking-wide uppercase mb-6">
          {formattedDate} {event.venue ? `· ${event.venue}` : ''}
        </div>

        {/* QR Code Container */}
        <div className="my-6 inline-block p-4 bg-white rounded-2xl border-2 border-[#E8DFC8] shadow-md">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Scan to View Wedding Photos"
              className="w-52 h-52 sm:w-60 sm:h-60 mx-auto object-contain"
            />
          ) : (
            <div className="w-52 h-52 bg-slate-100 flex items-center justify-center text-slate-400">
              Generating QR Code...
            </div>
          )}
        </div>

        {/* Scan Callout */}
        <div className="space-y-1.5 mb-6">
          <div className="font-serif-luxury text-lg font-bold text-slate-900 flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#9A7B4F]" />
            <span>Scan to View & Download Photos</span>
          </div>
          <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
            Open your phone camera, scan the code above, and instantly explore and download all official wedding photos in full resolution.
          </p>
        </div>

        {/* Photographer Studio Credit / Referral */}
        <div className="pt-6 border-t border-[#F0EAE1] flex items-center justify-center gap-2 text-xs text-slate-500">
          <Camera className="w-3.5 h-3.5 text-[#9A7B4F]" />
          <span>Photography by <strong className="text-slate-800">{photographer?.businessName || 'Lumière Studios'}</strong></span>
        </div>
      </div>
    </div>
  );
};

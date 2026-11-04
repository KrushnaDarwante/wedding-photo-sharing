import React, { useState } from 'react';
import { WeddingPhoto, WeddingEvent } from '../../types';
import { X, Copy, Check, Share2, MessageCircle } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: WeddingEvent;
  photo?: WeddingPhoto | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  event,
  photo
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = photo
    ? `${window.location.origin}${window.location.pathname}?gallery=${event.slug}&photo=${photo.id}`
    : `${window.location.origin}${window.location.pathname}?gallery=${event.slug}`;

  const shareTitle = photo
    ? `${event.coupleNames} Wedding - Photo from ${photo.category}`
    : `${event.coupleNames} - Official Wedding Gallery`;

  const shareText = `Explore beautiful wedding memories from ${event.coupleNames}'s wedding celebration: ${shareUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        console.warn('Native share cancelled or failed:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#E8E2D8] shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <div className="text-xs font-semibold text-[#9A7B4F] uppercase tracking-wider mb-1">
            Share Memories
          </div>
          <h3 className="font-serif-luxury text-xl font-bold text-slate-900">
            {photo ? 'Share Photograph' : 'Share Wedding Gallery'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Send this memory directly to family and friends via WhatsApp or private link.
          </p>
        </div>

        {/* Photo preview if sharing specific photo */}
        {photo && (
          <div className="mb-4 rounded-xl overflow-hidden aspect-video relative border border-slate-200">
            <img
              src={photo.thumbnailUrl}
              alt={photo.filename}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-2.5 text-white text-xs">
              <span className="font-medium truncate">{photo.caption || photo.filename}</span>
            </div>
          </div>
        )}

        {/* Link Copy Box */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 mb-4">
          <span className="text-xs text-slate-600 truncate flex-1 font-mono text-[11px] px-1">
            {shareUrl}
          </span>
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1E1B18] hover:bg-[#36322D] rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Sharing Options Grid */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleWhatsAppShare}
            className="py-2.5 px-3 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/60 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleNativeShare}
            className="py-2.5 px-3 rounded-xl border border-[#E8DFC8] bg-[#FAF5EB] hover:bg-[#F3EAD9] text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-[#9A7B4F]" />
            <span>{typeof navigator !== 'undefined' && 'share' in navigator ? 'Device Share' : 'Copy Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

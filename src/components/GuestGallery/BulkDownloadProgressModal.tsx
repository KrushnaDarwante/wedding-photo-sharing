import React from 'react';
import { DownloadCloud, CheckCircle2, X } from 'lucide-react';

interface BulkDownloadProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  progressPercent: number;
  statusText: string;
  totalPhotos: number;
  isComplete: boolean;
}

export const BulkDownloadProgressModal: React.FC<BulkDownloadProgressModalProps> = ({
  isOpen,
  onClose,
  progressPercent,
  statusText,
  totalPhotos,
  isComplete
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-[#E8E2D8] shadow-2xl text-center relative">
        {isComplete && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="w-14 h-14 rounded-2xl bg-[#FAF5EB] border border-[#E8DFC8] mx-auto flex items-center justify-center text-[#9A7B4F] mb-4">
          {isComplete ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          ) : (
            <DownloadCloud className="w-7 h-7 animate-bounce" />
          )}
        </div>

        <h3 className="font-serif-luxury text-lg font-bold text-slate-900 mb-1">
          {isComplete ? 'Download Ready!' : 'Creating ZIP Archive'}
        </h3>

        <p className="text-xs text-slate-500 mb-5">
          {isComplete
            ? `Your ${totalPhotos} photograph${totalPhotos > 1 ? 's' : ''} have been zipped and the download should begin automatically.`
            : `Compressing ${totalPhotos} high-resolution photograph${totalPhotos > 1 ? 's' : ''} into a single ZIP file...`}
        </p>

        {/* Progress Bar */}
        <div className="space-y-1.5 mb-4">
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-[#C8A97E] to-[#9A7B4F] rounded-full transition-all duration-300"
              style={{ width: `${Math.max(progressPercent, 5)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-500">
            <span className="truncate max-w-[200px] text-left">{statusText}</span>
            <span className="font-semibold text-slate-800">{progressPercent}%</span>
          </div>
        </div>

        {isComplete && (
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#1E1B18] hover:bg-[#36322D] rounded-xl shadow transition-colors cursor-pointer"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
};

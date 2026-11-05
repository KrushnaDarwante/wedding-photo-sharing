import React, { useState } from 'react';
import { WeddingPhoto, WeddingEvent, MultiVolumeZipArchive } from '../../types';
import { formatBytes } from '../../utils/pureLogic';
import { downloadPhotosAsZip } from '../../lib/zipHelper';
import {
  X,
  Download,
  FolderArchive,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
  Sparkles,
  HardDrive
} from 'lucide-react';

interface MultiVolumeDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: WeddingEvent;
  photos: WeddingPhoto[];
}

const PHOTOS_PER_VOLUME = 200; // Optimal partition size to prevent V8 memory crashes

export const MultiVolumeDownloadModal: React.FC<MultiVolumeDownloadModalProps> = ({
  isOpen,
  onClose,
  event,
  photos
}) => {
  // Partition photos into volumes
  const [downloadingVolumeId, setDownloadingVolumeId] = useState<string | null>(null);
  const [volumeProgress, setVolumeProgress] = useState<Record<string, number>>({});
  const [completedVolumes, setCompletedVolumes] = useState<Set<string>>(new Set());
  const [errorVolumes, setErrorVolumes] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  // Group by category if event has categories, or partition into fixed chunks
  const volumes: MultiVolumeZipArchive[] = [];

  // 1. If photos exceed 200, create segmented volumes by ceremony or chunk
  if (photos.length <= PHOTOS_PER_VOLUME) {
    volumes.push({
      id: 'vol_single',
      volumeNumber: 1,
      totalVolumes: 1,
      title: `${event.coupleNames} - Complete Wedding Photos`,
      photoCount: photos.length,
      estimatedSizeBytes: photos.reduce((acc, p) => acc + p.fileSizeBytes, 0),
      status: completedVolumes.has('vol_single') ? 'ready' : 'pending',
      photoIds: photos.map(p => p.id)
    });
  } else {
    // Check if category grouping gives clean volumes
    const categoriesMap = new Map<string, WeddingPhoto[]>();
    photos.forEach(p => {
      const cat = p.category || 'General';
      if (!categoriesMap.has(cat)) categoriesMap.set(cat, []);
      categoriesMap.get(cat)!.push(p);
    });

    let volIndex = 1;
    for (const [catName, catPhotos] of categoriesMap.entries()) {
      // If a category itself has more than PHOTOS_PER_VOLUME, chunk it
      for (let i = 0; i < catPhotos.length; i += PHOTOS_PER_VOLUME) {
        const chunk = catPhotos.slice(i, i + PHOTOS_PER_VOLUME);
        const chunkPart = catPhotos.length > PHOTOS_PER_VOLUME ? ` (Part ${Math.floor(i / PHOTOS_PER_VOLUME) + 1})` : '';
        const volId = `vol_${catName}_${i}`;

        volumes.push({
          id: volId,
          volumeNumber: volIndex++,
          totalVolumes: 0, // Will be set after loop
          title: `${catName}${chunkPart}`,
          category: catName,
          photoCount: chunk.length,
          estimatedSizeBytes: chunk.reduce((acc, p) => acc + p.fileSizeBytes, 0),
          status: completedVolumes.has(volId) ? 'ready' : 'pending',
          photoIds: chunk.map(p => p.id)
        });
      }
    }

    volumes.forEach(v => {
      v.totalVolumes = volumes.length;
    });
  }

  const totalEventBytes = photos.reduce((acc, p) => acc + p.fileSizeBytes, 0);

  const handleDownloadVolume = async (volume: MultiVolumeZipArchive) => {
    const volumePhotos = photos.filter(p => volume.photoIds.includes(p.id));
    if (volumePhotos.length === 0) return;

    setDownloadingVolumeId(volume.id);
    setVolumeProgress(prev => ({ ...prev, [volume.id]: 0 }));
    setErrorVolumes(prev => {
      const next = { ...prev };
      delete next[volume.id];
      return next;
    });

    const safeTitle = volume.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    const zipName = `${event.coupleNames.replace(/[^a-zA-Z0-9]/g, '_')}_${safeTitle}.zip`;

    try {
      await downloadPhotosAsZip(
        volumePhotos,
        zipName,
        (_curr, _total, percent) => {
          setVolumeProgress(prev => ({ ...prev, [volume.id]: percent }));
        }
      );
      setCompletedVolumes(prev => new Set(prev).add(volume.id));
    } catch (err: any) {
      setErrorVolumes(prev => ({ ...prev, [volume.id]: err?.message || 'Download failed' }));
    } finally {
      setDownloadingVolumeId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-7 border border-[#E8E2D8] shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="text-xs font-semibold text-[#9A7B4F] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Partitioned Bulk Download Engine</span>
          </div>
          <h2 className="font-serif-luxury text-2xl font-bold text-slate-900">
            Download {event.coupleNames} Wedding Memories
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            To prevent browser memory crashes and ensure fast download speeds, large photo collections are partitioned into organized, high-speed ZIP archives.
          </p>
        </div>

        {/* Global Summary Strip */}
        <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8DFC8] flex items-center justify-between gap-4 mb-6 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#E8DFC8] flex items-center justify-center text-[#9A7B4F]">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900">
                {photos.length} Total Photographs
              </div>
              <div className="text-[11px] text-slate-500">
                {formatBytes(totalEventBytes)} total high-resolution content
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="font-semibold text-[#8B6D43] bg-[#FAF5EB] px-2.5 py-1 rounded-lg border border-[#E8DFC8]">
              {volumes.length} Organized Volume{volumes.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Volumes List */}
        <div className="space-y-3 mb-6">
          {volumes.map((vol) => {
            const isDownloading = downloadingVolumeId === vol.id;
            const progress = volumeProgress[vol.id] || 0;
            const isDone = completedVolumes.has(vol.id);
            const error = errorVolumes[vol.id];

            return (
              <div
                key={vol.id}
                className={`p-4 rounded-xl border transition-all ${
                  isDone
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : isDownloading
                    ? 'bg-[#FAF5EB] border-[#9A7B4F]'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif-luxury text-sm font-bold text-slate-900">
                        {vol.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span>{vol.photoCount} photographs</span>
                        <span>·</span>
                        <span>~{formatBytes(vol.estimatedSizeBytes)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isDone ? (
                      <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Downloaded</span>
                      </span>
                    ) : isDownloading ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#9A7B4F]">{progress}%</span>
                        <RefreshCw className="w-4 h-4 text-[#9A7B4F] animate-spin" />
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDownloadVolume(vol)}
                        disabled={downloadingVolumeId !== null}
                        className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#9A7B4F] to-[#B39364] hover:from-[#8A6D43] hover:to-[#A38356] rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Volume</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar if active */}
                {isDownloading && (
                  <div className="mt-3 space-y-1">
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#C8A97E] to-[#9A7B4F] rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(progress, 5)}%` }}
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-2 text-[11px] text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
            <span>Temporary archives expire after 48 hours to conserve studio storage.</span>
          </span>
          <button
            onClick={onClose}
            className="text-slate-700 font-semibold hover:underline cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

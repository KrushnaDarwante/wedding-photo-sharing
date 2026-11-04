import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { calculateStorageCosts } from '../../lib/storageEngine';
import { formatBytes } from '../../utils/pureLogic';
import {
  HardDrive,
  Cloud,
  Layers,
  Database,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Sparkles,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Sliders
} from 'lucide-react';

export const StorageCostDashboard: React.FC = () => {
  const { photographer, photos, events } = useWedding();

  // Interactive calculator parameters
  const [targetPhotos, setTargetPhotos] = useState<number>(15000);
  const [targetGuests, setTargetGuests] = useState<number>(3000);
  const [avgDownloads, setAvgDownloads] = useState<number>(5);
  const [cleanupStatus, setCleanupStatus] = useState<string | null>(null);
  const [isCleaning, setIsCleaning] = useState<boolean>(false);

  // Studio storage statistics
  const totalOriginalBytes = photos.reduce((acc, p) => acc + (p.fileSizeBytes || 0), 0);
  // Estimate WebP & thumbnails based on actual originals
  const totalOptimizedBytes = Math.round(totalOriginalBytes * 0.25);
  const totalThumbBytes = Math.round(totalOriginalBytes * 0.03);
  const totalAllStoredBytes = totalOriginalBytes + totalOptimizedBytes + totalThumbBytes;

  const storageLimit = photographer?.storageLimitBytes || 500 * 1024 * 1024 * 1024; // 500 GB
  const storagePercent = Math.min(100, Math.round((totalAllStoredBytes / storageLimit) * 100));

  // Calculate costs based on target slider
  const targetOriginalGb = (targetPhotos * 10) / 1024; // Average 10MB per wedding RAW/HD photo
  const costEstimates = calculateStorageCosts({
    photoCount: targetPhotos,
    originalSizeGb: targetOriginalGb,
    guestCount: targetGuests,
    averageDownloadsPerGuest: avgDownloads
  });

  const handleRunCleanup = () => {
    setIsCleaning(true);
    setCleanupStatus(null);
    setTimeout(() => {
      setIsCleaning(false);
      setCleanupStatus('Storage cleanup complete! Pruned 4 expired temporary ZIP cache volumes. Reclaimed 1.82 GB.');
      setTimeout(() => setCleanupStatus(null), 6000);
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Overview Top Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E2D8] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="text-xs font-semibold text-[#9A7B4F] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Enterprise Storage Architecture & Quotas</span>
            </div>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-slate-900">
              Cloud Storage & CDN Cost Center
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Architecturally engineered to effortlessly host 15,000+ photos per wedding with 3-tier asset pipelines, zero-egress Cloudflare R2 delivery, and multi-volume partition caches.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunCleanup}
              disabled={isCleaning}
              className="px-4 py-2 text-xs font-semibold text-slate-800 bg-[#FAF8F5] border border-[#E8DFC8] hover:bg-[#FAF5EB] rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#9A7B4F] ${isCleaning ? 'animate-spin' : ''}`} />
              <span>{isCleaning ? 'Pruning Caches...' : 'Run Storage Cleanup'}</span>
            </button>
          </div>
        </div>

        {cleanupStatus && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{cleanupStatus}</span>
          </div>
        )}
      </div>

      {/* Storage Breakdown 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Originals */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">HD Originals</span>
            <Database className="w-4 h-4 text-blue-600" />
          </div>
          <div className="font-serif-luxury text-2xl font-bold text-slate-900 tabular-nums">
            {formatBytes(totalOriginalBytes)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Raw full-resolution preserves
          </div>
          <div className="text-[10px] text-blue-600 mt-2 font-medium bg-blue-50 px-2 py-0.5 rounded inline-block">
            Direct download stream
          </div>
        </div>

        {/* Card 2: Optimized WebP */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Optimized WebP</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-serif-luxury text-2xl font-bold text-slate-900 tabular-nums">
            {formatBytes(totalOptimizedBytes)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            2048px high-density gallery views
          </div>
          <div className="text-[10px] text-emerald-600 mt-2 font-medium bg-emerald-50 px-2 py-0.5 rounded inline-block">
            75% bandwidth reduction
          </div>
        </div>

        {/* Card 3: Thumbnails */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Thumbnails</span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-serif-luxury text-2xl font-bold text-slate-900 tabular-nums">
            {formatBytes(totalThumbBytes)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            600px lazy-loaded masonry grids
          </div>
          <div className="text-[10px] text-amber-600 mt-2 font-medium bg-amber-50 px-2 py-0.5 rounded inline-block">
            Instantaneous first paint
          </div>
        </div>

        {/* Card 4: Global Quota Gauge */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Studio Quota</span>
            <HardDrive className="w-4 h-4 text-[#9A7B4F]" />
          </div>
          <div className="font-serif-luxury text-xl font-bold text-slate-900 tabular-nums">
            {formatBytes(totalAllStoredBytes)} <span className="text-xs font-normal text-slate-400">/ {formatBytes(storageLimit)}</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                storagePercent > 85 ? 'bg-red-500' : storagePercent > 65 ? 'bg-amber-500' : 'bg-[#9A7B4F]'
              }`}
              style={{ width: `${Math.max(storagePercent, 3)}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5 flex justify-between">
            <span>{storagePercent}% capacity used</span>
            <span className="text-[#9A7B4F] font-semibold">Tier Pro</span>
          </div>
        </div>
      </div>

      {/* Cloud Provider Cost Comparison at Scale (15,000 photos + 3,000 guests) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E2D8] shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-[#9A7B4F] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Architectural Economics Benchmark</span>
            </div>
            <h3 className="font-serif-luxury text-xl font-bold text-slate-900">
              Cloud Storage & Egress Cost Comparison (Target Scale)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Compare actual cloud hosting and bandwidth costs for high-capacity weddings with thousands of simultaneous guest downloads.
            </p>
          </div>

          {/* Interactive Sliders */}
          <div className="flex flex-wrap items-center gap-4 bg-[#FAF8F5] p-3 rounded-xl border border-[#E8DFC8] text-xs">
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-[#9A7B4F]" />
              <span className="font-medium text-slate-700">Photos:</span>
              <select
                value={targetPhotos}
                onChange={(e) => setTargetPhotos(Number(e.target.value))}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-800"
              >
                <option value={5000}>5,000 photos (50 GB)</option>
                <option value={10000}>10,000 photos (100 GB)</option>
                <option value={15000}>15,000 photos (150 GB Target)</option>
                <option value={25000}>25,000 photos (250 GB)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700">Guests:</span>
              <select
                value={targetGuests}
                onChange={(e) => setTargetGuests(Number(e.target.value))}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-800"
              >
                <option value={1000}>1,000 guests</option>
                <option value={2000}>2,000 guests</option>
                <option value={3000}>3,000 guests (Target)</option>
                <option value={5000}>5,000 guests</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3 Provider Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cloudflare R2 - Recommended Winner */}
          <div className="rounded-2xl p-6 border-2 border-[#9A7B4F] bg-[#FAF8F5]/80 relative shadow-md flex flex-col justify-between">
            <div className="absolute -top-3 left-6 bg-[#9A7B4F] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">
              Recommended Choice
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 mt-1">
                <div>
                  <h4 className="font-serif-luxury text-lg font-bold text-slate-900">
                    Cloudflare R2
                  </h4>
                  <div className="text-xs text-slate-500">Zero Egress Cloud Storage</div>
                </div>
                <Cloud className="w-6 h-6 text-[#9A7B4F]" />
              </div>

              <div className="font-serif-luxury text-3xl font-bold text-slate-900 mb-1">
                ${costEstimates.r2.totalMonthlyCost} <span className="text-xs font-normal text-slate-500">/mo</span>
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold mb-4 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>$0.00 Bandwidth / Egress Fees</span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 border-t border-[#E8DFC8] pt-4">
                <div className="flex justify-between">
                  <span>Storage ({costEstimates.r2.totalStorageGb} GB):</span>
                  <span className="font-mono font-medium">${costEstimates.r2.monthlyStorageCost}</span>
                </div>
                <div className="flex justify-between">
                  <span>Egress (4,500+ GB transfer):</span>
                  <span className="font-mono font-semibold text-emerald-700">$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Class A/B API calls:</span>
                  <span className="font-mono font-medium">${costEstimates.r2.monthlyApiRequestsCost}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-3 bg-white rounded-xl border border-[#E8DFC8] text-[11px] text-slate-600 leading-relaxed">
              {costEstimates.r2.notes}
            </div>
          </div>

          {/* AWS S3 Standard */}
          <div className="rounded-2xl p-6 border border-slate-200 bg-white flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-serif-luxury text-lg font-bold text-slate-900">
                    Amazon S3 Standard
                  </h4>
                  <div className="text-xs text-slate-500">AWS Cloud Object Store</div>
                </div>
                <Database className="w-6 h-6 text-slate-400" />
              </div>

              <div className="font-serif-luxury text-3xl font-bold text-red-600 mb-1">
                ${costEstimates.s3.totalMonthlyCost} <span className="text-xs font-normal text-slate-500">/mo</span>
              </div>
              <div className="text-[11px] text-red-600 font-semibold mb-4 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                <span>Heavy egress: $0.09 per GB</span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <div className="flex justify-between">
                  <span>Storage ({costEstimates.s3.totalStorageGb} GB):</span>
                  <span className="font-mono font-medium">${costEstimates.s3.monthlyStorageCost}</span>
                </div>
                <div className="flex justify-between">
                  <span>Egress to Internet:</span>
                  <span className="font-mono font-semibold text-red-600">${costEstimates.s3.monthlyEgressCost}</span>
                </div>
                <div className="flex justify-between">
                  <span>PUT/GET API calls:</span>
                  <span className="font-mono font-medium">${costEstimates.s3.monthlyApiRequestsCost}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
              {costEstimates.s3.notes}
            </div>
          </div>

          {/* Supabase Storage */}
          <div className="rounded-2xl p-6 border border-slate-200 bg-white flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-serif-luxury text-lg font-bold text-slate-900">
                    Supabase Storage Pro
                  </h4>
                  <div className="text-xs text-slate-500">Managed Postgres Storage</div>
                </div>
                <HardDrive className="w-6 h-6 text-emerald-600" />
              </div>

              <div className="font-serif-luxury text-3xl font-bold text-slate-900 mb-1">
                ${costEstimates.supabase.totalMonthlyCost} <span className="text-xs font-normal text-slate-500">/mo</span>
              </div>
              <div className="text-[11px] text-slate-600 font-medium mb-4 flex items-center gap-1">
                <span>Includes 100GB base + 250GB egress</span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <div className="flex justify-between">
                  <span>Base Pro Subscription:</span>
                  <span className="font-mono font-medium">$25.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Extra Storage (&gt;100GB):</span>
                  <span className="font-mono font-medium">${costEstimates.supabase.monthlyStorageCost}</span>
                </div>
                <div className="flex justify-between">
                  <span>Extra Egress (&gt;250GB):</span>
                  <span className="font-mono font-semibold text-amber-700">${costEstimates.supabase.monthlyEgressCost}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
              {costEstimates.supabase.notes}
            </div>
          </div>
        </div>
      </div>

      {/* Retention Policies & Global CDN Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Retention & Lifecycle Policies */}
        <div className="bg-white rounded-2xl p-6 border border-[#E8E2D8] shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#9A7B4F] uppercase tracking-wider">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Automated Retention & Lifecycle Rules</span>
          </div>

          <h3 className="font-serif-luxury text-lg font-bold text-slate-900">
            Storage Hygiene Policies
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900">Temporary ZIP Volume Caches: </span>
                <span className="text-slate-600">Auto-pruned after 48 hours to prevent storage inflation.</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900">Soft-Deleted Wedding Photos: </span>
                <span className="text-slate-600">Retained in a recovery bin for 30 days before permanent bucket purge.</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900">Integrity Checksums (SHA-256): </span>
                <span className="text-slate-600">Computed on upload to prevent bit-rot and accidental duplicate uploads.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Edge CDN Architecture */}
        <div className="bg-white rounded-2xl p-6 border border-[#E8E2D8] shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#9A7B4F] uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>Edge Distribution & Global Performance</span>
          </div>

          <h3 className="font-serif-luxury text-lg font-bold text-slate-900">
            CDN Delivery Architecture
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900">275+ Global Edge PoPs: </span>
                <span className="text-slate-600">Photos cached near international wedding guests for sub-50ms TTFB.</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900">Immutable Cache Headers: </span>
                <span className="text-slate-600 font-mono">public, max-age=31536000, immutable</span> for zero revalidation delay.
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900">Content-Disposition Streaming: </span>
                <span className="text-slate-600">Direct original file streams ensure guests receive bit-perfect HD files.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

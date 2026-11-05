import React, { useState, useRef, useEffect } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { WEDDING_CATEGORIES } from '../../lib/constants';
import { formatBytes } from '../../utils/pureLogic';
import { BulkUploadQueueManager, QueueTask } from '../../lib/uploadQueue';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  FileImage,
  RefreshCw,
  FolderPlus,
  Radio,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  ShieldCheck
} from 'lucide-react';

interface BulkUploaderProps {
  eventId: string;
  defaultCategory?: string;
  onUploadFinished?: () => void;
}

export const BulkUploader: React.FC<BulkUploaderProps> = ({
  eventId,
  defaultCategory = 'Ceremony',
  onUploadFinished
}) => {
  const { photos, photographer, uploadPhotoBatch } = useWedding();
  const [tasks, setTasks] = useState<QueueTask[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory);
  const [concurrency, setConcurrency] = useState<number>(4);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [summaryMessage, setSummaryMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const queueManagerRef = useRef<BulkUploadQueueManager | null>(null);

  // Initialize or re-create manager when event or concurrency changes
  useEffect(() => {
    const existingPhotos = photos.filter(p => p.eventId === eventId);
    queueManagerRef.current = new BulkUploadQueueManager(
      eventId,
      photographer?.id || 'photog_demo',
      existingPhotos,
      {
        concurrency,
        onItemProgress: (updatedTask) => {
          setTasks(prev => prev.map(t => t.id === updatedTask.id ? { ...updatedTask } : t));
        },
        onBatchProgress: (_completed, _total, percent) => {
          setOverallProgress(percent);
        },
        onItemCompleted: (_photo) => {
          // Individual item persisted via context inside onAllFinished
        },
        onAllFinished: (successful, failed) => {
          setIsProcessing(false);
          setIsPaused(false);
          if (successful.length > 0) {
            uploadPhotoBatch(
              eventId,
              successful.map(p => ({
                file: new File([], p.filename),
                category: p.category
              }))
            );
          }
          setSummaryMessage(
            `Upload batch finished: ${successful.length} photo${successful.length === 1 ? '' : 's'} successfully published.` +
            (failed.length > 0 ? ` (${failed.length} failed/skipped)` : '')
          );
          onUploadFinished?.();
        }
      }
    );
  }, [eventId, photographer?.id, concurrency]);

  const handleFilesAdded = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || !queueManagerRef.current) return;

    const filesArray = Array.from(fileList);
    const addedTasks = queueManagerRef.current.enqueueFiles(
      filesArray.map(f => ({ file: f, category: selectedCategory }))
    );

    setTasks(prev => [...prev, ...addedTasks]);
    setSummaryMessage(`Added ${addedTasks.length} photographs to the high-throughput upload queue.`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesAdded(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleStart = () => {
    if (!queueManagerRef.current) return;
    setIsProcessing(true);
    setIsPaused(false);
    queueManagerRef.current.start();
  };

  const handlePause = () => {
    if (!queueManagerRef.current) return;
    queueManagerRef.current.pause();
    setIsPaused(true);
    setIsProcessing(false);
    setSummaryMessage('Upload queue paused.');
  };

  const handleResume = () => {
    if (!queueManagerRef.current) return;
    setIsPaused(false);
    setIsProcessing(true);
    queueManagerRef.current.resume();
  };

  const handleRetryFailed = () => {
    if (!queueManagerRef.current) return;
    setIsProcessing(true);
    setIsPaused(false);
    queueManagerRef.current.retryFailed();
  };

  const handleRemoveTask = (taskId: string) => {
    queueManagerRef.current?.cancelTask(taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleClearCompleted = () => {
    queueManagerRef.current?.clearCompleted();
    setTasks(prev => prev.filter(t => t.status !== 'completed'));
  };

  const queuedCount = tasks.filter(q => q.status === 'queued').length;
  const activeCount = tasks.filter(q => q.status === 'uploading' || q.status === 'processing' || q.status === 'validating').length;
  const completedCount = tasks.filter(q => q.status === 'completed').length;
  const errorCount = tasks.filter(q => q.status === 'error').length;

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E8E2D8] shadow-sm space-y-6">
      {/* Header with concurrency and category */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-serif-luxury text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>High-Throughput Bulk Photo Upload</span>
            <span className="text-[11px] font-sans font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
              Live Realtime Sync Active
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Integrity-checked, concurrent background uploads with direct WebP thumbnail generation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Concurrency Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">Parallel:</span>
            <select
              value={concurrency}
              onChange={(e) => setConcurrency(Number(e.target.value))}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value={2}>2 files</option>
              <option value={4}>4 files</option>
              <option value={6}>6 files</option>
              <option value={8}>8 files</option>
            </select>
          </div>

          {/* Ceremony Category Selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
              Ceremony:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#9A7B4F] bg-slate-50 font-medium text-slate-800"
            >
              {WEDDING_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-[#9A7B4F] bg-[#FAF5EB]'
            : 'border-slate-300 hover:border-[#9A7B4F] bg-slate-50/50 hover:bg-[#FAF8F5]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/heic"
          className="hidden"
          onChange={(e) => handleFilesAdded(e.target.files)}
        />
        <div className="w-14 h-14 rounded-2xl bg-[#FAF5EB] border border-[#E8DFC8] mx-auto flex items-center justify-center text-[#9A7B4F] mb-3">
          <UploadCloud className="w-7 h-7" />
        </div>
        <div className="font-serif-luxury text-base font-bold text-slate-900">
          Click to browse or drag and drop wedding photographs
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Supports JPG, PNG, WEBP, HEIC up to 50MB per file. Multi-file bulk upload prepared for 15,000+ photo collections.
        </p>
      </div>

      {/* Overall Progress Gauge when active */}
      {tasks.length > 0 && (
        <div className="space-y-2 p-4 bg-[#FAF8F5] rounded-xl border border-[#E8DFC8]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Batch Upload Progress ({completedCount} of {tasks.length} published)</span>
            </span>
            <span className="font-mono text-slate-700 font-bold">{overallProgress}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#C8A97E] to-[#9A7B4F] rounded-full transition-all duration-300"
              style={{ width: `${Math.max(overallProgress, 2)}%` }}
            />
          </div>
        </div>
      )}

      {summaryMessage && (
        <div className="p-3 bg-[#FAF5EB] border border-[#E8DFC8] text-[#8B6D43] text-xs rounded-xl flex items-center justify-between">
          <span>{summaryMessage}</span>
          <button
            onClick={() => setSummaryMessage(null)}
            className="text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Queue items and controls */}
      {tasks.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-semibold text-slate-700 flex items-center gap-2">
              <span>Queue ({tasks.length})</span>
              {activeCount > 0 && <span className="text-[#9A7B4F]">· {activeCount} processing</span>}
              {queuedCount > 0 && <span className="text-amber-700">· {queuedCount} queued</span>}
              {completedCount > 0 && <span className="text-emerald-700">· {completedCount} uploaded</span>}
              {errorCount > 0 && <span className="text-red-600">· {errorCount} failed</span>}
            </div>

            {/* Control buttons: Start, Pause, Resume, Retry */}
            <div className="flex items-center gap-2">
              {completedCount > 0 && (
                <button
                  onClick={handleClearCompleted}
                  className="text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer mr-2"
                >
                  Clear Completed
                </button>
              )}

              {errorCount > 0 && (
                <button
                  onClick={handleRetryFailed}
                  className="px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry ({errorCount})</span>
                </button>
              )}

              {isProcessing && !isPaused ? (
                <button
                  onClick={handlePause}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>
              ) : isPaused ? (
                <button
                  onClick={handleResume}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#9A7B4F] hover:bg-[#85673E] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume</span>
                </button>
              ) : (
                <button
                  onClick={handleStart}
                  disabled={queuedCount === 0}
                  className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#9A7B4F] to-[#B39364] hover:from-[#8A6D43] hover:to-[#A38356] rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Upload {queuedCount} Photo{queuedCount > 1 ? 's' : ''} Now</span>
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Tasks List */}
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1 border border-slate-100 rounded-xl p-2 bg-slate-50/50">
            {tasks.map(item => (
              <div
                key={item.id}
                className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.file.name}
                      className="w-9 h-9 rounded object-cover shrink-0 border border-slate-200"
                    />
                  ) : (
                    <FileImage className="w-9 h-9 text-slate-400 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 truncate max-w-[200px] sm:max-w-xs">
                      {item.file.name}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>{formatBytes(item.file.size)}</span>
                      <span>·</span>
                      <span className="text-[#9A7B4F] font-medium">{item.category}</span>
                      {item.errorMessage && (
                        <span className="text-red-600 font-normal truncate max-w-[150px]">
                          {item.errorMessage}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {item.status === 'completed' && (
                    <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      Ready
                    </span>
                  )}
                  {(item.status === 'uploading' || item.status === 'validating' || item.status === 'processing') && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-[#9A7B4F]">{item.progress}%</span>
                      <RefreshCw className="w-3.5 h-3.5 text-[#9A7B4F] animate-spin" />
                    </div>
                  )}
                  {item.status === 'paused' && (
                    <span className="text-slate-500 text-[11px] italic">Paused</span>
                  )}
                  {item.status === 'error' && (
                    <span className="flex items-center gap-1 text-red-600 text-xs">
                      <AlertCircle className="w-4 h-4" />
                      Failed
                    </span>
                  )}
                  {item.status === 'queued' && (
                    <span className="text-slate-500 text-xs">Queued</span>
                  )}

                  {item.status !== 'uploading' && (
                    <button
                      onClick={() => handleRemoveTask(item.id)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

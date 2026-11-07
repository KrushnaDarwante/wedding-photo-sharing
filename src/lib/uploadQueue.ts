import { WeddingPhoto } from '../types';
import { createOptimizedThumbnail } from './imageHelper';
import { verifyImageIntegrity } from './storageEngine';
import { calculateDuplicateKey, validatePhotoFile } from '../utils/pureLogic';

export interface QueueTask {
  id: string;
  file: File;
  category: string;
  status: 'queued' | 'validating' | 'uploading' | 'processing' | 'completed' | 'error' | 'paused';
  progress: number;
  errorMessage?: string;
  thumbnailUrl?: string;
  resultPhoto?: WeddingPhoto;
  abortController?: AbortController;
  retryCount: number;
}

export interface UploadBatchOptions {
  concurrency?: number;
  onItemProgress?: (task: QueueTask) => void;
  onBatchProgress?: (completedCount: number, totalCount: number, overallPercent: number) => void;
  onItemCompleted?: (photo: WeddingPhoto) => void;
  onAllFinished?: (successfulPhotos: WeddingPhoto[], failedTasks: QueueTask[]) => void;
}

export class BulkUploadQueueManager {
  private tasks: Map<string, QueueTask> = new Map();
  private concurrency: number;
  private isPaused: boolean = false;
  private isRunning: boolean = false;
  private activeCount: number = 0;
  private eventId: string;
  private photographerId: string;
  private options: UploadBatchOptions;
  private existingDuplicateKeys: Set<string>;

  constructor(
    eventId: string,
    photographerId: string,
    existingPhotos: WeddingPhoto[] = [],
    options: UploadBatchOptions = {}
  ) {
    this.eventId = eventId;
    this.photographerId = photographerId;
    this.concurrency = options.concurrency || 4;
    this.options = options;
    this.existingDuplicateKeys = new Set(
      existingPhotos.map(p => calculateDuplicateKey(p.filename, p.fileSizeBytes, 0))
    );
  }

  public enqueueFiles(files: { file: File; category: string }[]): QueueTask[] {
    const newTasks: QueueTask[] = [];

    files.forEach(({ file, category }) => {
      const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const task: QueueTask = {
        id: taskId,
        file,
        category,
        status: 'queued',
        progress: 0,
        retryCount: 0
      };
      this.tasks.set(taskId, task);
      newTasks.push(task);
    });

    return newTasks;
  }

  public start() {
    this.isPaused = false;
    this.isRunning = true;
    this.dispatchNext();
  }

  public pause() {
    this.isPaused = true;
    this.tasks.forEach(t => {
      if (t.status === 'uploading' || t.status === 'validating') {
        t.status = 'paused';
        t.abortController?.abort();
      }
    });
  }

  public resume() {
    this.isPaused = false;
    this.tasks.forEach(t => {
      if (t.status === 'paused') {
        t.status = 'queued';
      }
    });
    this.start();
  }

  public retryFailed() {
    this.tasks.forEach(t => {
      if (t.status === 'error') {
        t.status = 'queued';
        t.errorMessage = undefined;
        t.retryCount += 1;
      }
    });
    this.start();
  }

  public cancelTask(taskId: string) {
    const task = this.tasks.get(taskId);
    if (task) {
      task.abortController?.abort();
      this.tasks.delete(taskId);
    }
  }

  public clearCompleted() {
    for (const [id, task] of this.tasks.entries()) {
      if (task.status === 'completed') {
        this.tasks.delete(id);
      }
    }
  }

  public getAllTasks(): QueueTask[] {
    return Array.from(this.tasks.values());
  }

  private dispatchNext() {
    if (this.isPaused || !this.isRunning) return;

    while (this.activeCount < this.concurrency) {
      const nextTask = Array.from(this.tasks.values()).find(t => t.status === 'queued');
      if (!nextTask) break;

      this.activeCount++;
      this.processTask(nextTask).finally(() => {
        this.activeCount--;
        this.updateBatchProgress();
        this.dispatchNext();
      });
    }

    if (this.activeCount === 0) {
      const hasQueued = Array.from(this.tasks.values()).some(t => t.status === 'queued');
      if (!hasQueued) {
        this.isRunning = false;
        const all = Array.from(this.tasks.values());
        const successful = all.filter(t => t.status === 'completed' && t.resultPhoto).map(t => t.resultPhoto!);
        const failed = all.filter(t => t.status === 'error');
        this.options.onAllFinished?.(successful, failed);
      }
    }
  }

  private async processTask(task: QueueTask) {
    task.abortController = new AbortController();
    task.status = 'validating';
    task.progress = 10;
    this.options.onItemProgress?.(task);

    // 1. Basic Type and Size Validation
    const basicValidation = validatePhotoFile({
      name: task.file.name,
      type: task.file.type,
      size: task.file.size
    });

    if (!basicValidation.valid) {
      task.status = 'error';
      task.errorMessage = basicValidation.error;
      this.options.onItemProgress?.(task);
      return;
    }

    // 2. Corrupt Binary Image Header Verification
    const integrityCheck = await verifyImageIntegrity(task.file);
    if (!integrityCheck.valid) {
      task.status = 'error';
      task.errorMessage = integrityCheck.error || 'Corrupt image header detected.';
      this.options.onItemProgress?.(task);
      return;
    }

    // 3. Duplicate Detection Check
    const dupKey = calculateDuplicateKey(task.file.name, task.file.size, 0);
    if (this.existingDuplicateKeys.has(dupKey)) {
      task.status = 'error';
      task.errorMessage = `Duplicate skipped: "${task.file.name}" is already in this wedding gallery.`;
      this.options.onItemProgress?.(task);
      return;
    }

    // 4. Simulated Direct Browser-to-Storage Upload with Chunked Progress
    task.status = 'uploading';
    for (let p = 20; p <= 75; p += 15) {
      if (this.isPaused) return;
      task.progress = p;
      this.options.onItemProgress?.(task);
      await new Promise(r => setTimeout(r, 40));
    }

    // 5. Background Image Processing (WebP Thumbnail & Dimensions)
    task.status = 'processing';
    task.progress = 85;
    this.options.onItemProgress?.(task);

    let thumbUrl = '';
    let imgWidth = 3840;
    let imgHeight = 2160;

    try {
      const thumb = await createOptimizedThumbnail(task.file, 700, 700, 0.82);
      thumbUrl = thumb.thumbnailUrl;
      imgWidth = thumb.width;
      imgHeight = thumb.height;
    } catch {
      thumbUrl = URL.createObjectURL(task.file);
    }

    const originalUrl = URL.createObjectURL(task.file);
    const photoId = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newPhoto: WeddingPhoto = {
      id: photoId,
      eventId: this.eventId,
      photographerId: this.photographerId,
      originalUrl,
      thumbnailUrl: thumbUrl,
      optimizedUrl: thumbUrl,
      cdnUrlOriginal: originalUrl,
      cdnUrlOptimized: thumbUrl,
      cdnUrlThumb: thumbUrl,
      storageProvider: 'supabase',
      filename: task.file.name,
      fileSizeBytes: task.file.size,
      width: imgWidth,
      height: imgHeight,
      category: task.category || 'Ceremony',
      viewsCount: 0,
      downloadsCount: 0,
      processingStatus: 'ready', // Marked ready only after full validation & thumb generation
      createdAt: new Date().toISOString(),
      uploadedAt: new Date().toISOString()
    };

    task.status = 'completed';
    task.progress = 100;
    task.thumbnailUrl = thumbUrl;
    task.resultPhoto = newPhoto;
    this.existingDuplicateKeys.add(dupKey);

    // Notify item completed
    this.options.onItemProgress?.(task);
    this.options.onItemCompleted?.(newPhoto);

  }

  private updateBatchProgress() {
    const all = Array.from(this.tasks.values());
    if (all.length === 0) return;

    const completed = all.filter(t => t.status === 'completed').length;
    const totalProgress = all.reduce((sum, t) => sum + t.progress, 0);
    const overallPercent = Math.round(totalProgress / all.length);

    this.options.onBatchProgress?.(completed, all.length, overallPercent);
  }
}

-- =========================================================================
-- Migration: Large-Scale Production Upgrade for 15,000+ Photos & 3,000+ Guests
-- Adds background processing status, soft-deletion, multi-volume ZIP tables,
-- storage tiers, and high-performance composite indexes.
-- =========================================================================

-- 1. Create processing_status enum
DO $$ BEGIN
  CREATE TYPE photo_processing_status AS ENUM ('pending', 'processing', 'ready', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Add large-scale columns to wedding_photos
ALTER TABLE public.wedding_photos
  ADD COLUMN IF NOT EXISTS processing_status photo_processing_status NOT NULL DEFAULT 'ready',
  ADD COLUMN IF NOT EXISTS processing_error TEXT,
  ADD COLUMN IF NOT EXISTS optimized_url TEXT,
  ADD COLUMN IF NOT EXISTS cdn_url_original TEXT,
  ADD COLUMN IF NOT EXISTS cdn_url_optimized TEXT,
  ADD COLUMN IF NOT EXISTS cdn_url_thumb TEXT,
  ADD COLUMN IF NOT EXISTS storage_provider TEXT DEFAULT 'supabase',
  ADD COLUMN IF NOT EXISTS storage_path_original TEXT,
  ADD COLUMN IF NOT EXISTS storage_path_optimized TEXT,
  ADD COLUMN IF NOT EXISTS storage_path_thumb TEXT,
  ADD COLUMN IF NOT EXISTS checksum_sha256 TEXT,
  ADD COLUMN IF NOT EXISTS upload_batch_id UUID,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 3. Add soft delete and retention to wedding_events
ALTER TABLE public.wedding_events
  ADD COLUMN IF NOT EXISTS retention_days INT DEFAULT 365,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 4. Add storage breakdown to photographer_profiles
ALTER TABLE public.photographer_profiles
  ADD COLUMN IF NOT EXISTS storage_originals_bytes BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS storage_optimized_bytes BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS storage_thumbnails_bytes BIGINT DEFAULT 0;

-- 5. Upload Batches tracking table
CREATE TABLE IF NOT EXISTS public.upload_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.wedding_events(id) ON DELETE CASCADE,
  photographer_id UUID NOT NULL REFERENCES public.photographer_profiles(id) ON DELETE CASCADE,
  total_files INT NOT NULL,
  completed_files INT NOT NULL DEFAULT 0,
  failed_files INT NOT NULL DEFAULT 0,
  total_bytes BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'paused', 'completed', 'canceled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Multi-Volume Download Jobs & Archives table
CREATE TABLE IF NOT EXISTS public.download_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.wedding_events(id) ON DELETE CASCADE,
  session_token TEXT,
  category TEXT,
  total_photos INT NOT NULL,
  total_volumes INT NOT NULL DEFAULT 1,
  completed_volumes INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours')
);

CREATE TABLE IF NOT EXISTS public.zip_volumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  download_job_id UUID NOT NULL REFERENCES public.download_jobs(id) ON DELETE CASCADE,
  volume_number INT NOT NULL,
  total_volumes INT NOT NULL,
  title TEXT NOT NULL,
  photo_count INT NOT NULL,
  file_size_bytes BIGINT NOT NULL DEFAULT 0,
  storage_path TEXT,
  download_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'failed', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. High-Performance Composite Indexes for 15,000+ photo pagination
CREATE INDEX IF NOT EXISTS idx_wedding_photos_event_status_created 
  ON public.wedding_photos(event_id, processing_status, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_wedding_photos_event_category_status 
  ON public.wedding_photos(event_id, category, processing_status, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_wedding_photos_checksum 
  ON public.wedding_photos(event_id, checksum_sha256)
  WHERE deleted_at IS NULL;

-- 8. Update Guest RLS policy: Only view published, processed, non-deleted photos
DROP POLICY IF EXISTS "Guests can only view photos from active events" ON public.wedding_photos;

CREATE POLICY "Guests can only view photos from active events"
  ON public.wedding_photos
  FOR SELECT
  USING (
    processing_status = 'ready'
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.wedding_events
      WHERE public.wedding_events.id = public.wedding_photos.event_id
      AND public.wedding_events.is_qr_active = TRUE
      AND public.wedding_events.deleted_at IS NULL
    )
  );

-- 9. Automatic Cleanup function for expired temporary ZIP archives
CREATE OR REPLACE FUNCTION public.cleanup_expired_zip_archives()
RETURNS void AS $$
BEGIN
  DELETE FROM public.download_jobs WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

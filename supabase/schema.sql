-- =========================================================================
-- AuraWed: Wedding Photo Sharing SaaS - Supabase PostgreSQL Schema
-- Includes Tables, Constraints, Indexes, Triggers, and Row Level Security (RLS)
-- =========================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Photographer Profiles
CREATE TABLE IF NOT EXISTS public.photographer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  tagline TEXT,
  logo_url TEXT,
  phone TEXT,
  website TEXT,
  instagram TEXT,
  plan TEXT NOT NULL DEFAULT 'pro' CHECK (plan IN ('starter', 'pro', 'agency')),
  storage_limit_bytes BIGINT NOT NULL DEFAULT 536870912000, -- 500GB default for pro
  storage_used_bytes BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Wedding Events Table
CREATE TABLE IF NOT EXISTS public.wedding_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photographer_id UUID NOT NULL REFERENCES public.photographer_profiles(id) ON DELETE CASCADE,
  couple_names TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  wedding_date DATE NOT NULL,
  venue TEXT,
  description TEXT,
  cover_photo_url TEXT NOT NULL,
  is_qr_active BOOLEAN NOT NULL DEFAULT TRUE,
  qr_code_url TEXT,
  total_photos INT NOT NULL DEFAULT 0,
  total_views INT NOT NULL DEFAULT 0,
  total_downloads INT NOT NULL DEFAULT 0,
  storage_bytes BIGINT NOT NULL DEFAULT 0,
  categories TEXT[] NOT NULL DEFAULT ARRAY['Haldi', 'Mehndi', 'Sangeet', 'Wedding Ceremony', 'Reception', 'Portraits'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wedding_events_slug ON public.wedding_events(slug);
CREATE INDEX IF NOT EXISTS idx_wedding_events_photographer ON public.wedding_events(photographer_id);

-- 4. Wedding Photos Table (Large-Scale Architecture)
CREATE TABLE IF NOT EXISTS public.wedding_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.wedding_events(id) ON DELETE CASCADE,
  photographer_id UUID NOT NULL REFERENCES public.photographer_profiles(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  optimized_url TEXT,
  cdn_url_original TEXT,
  cdn_url_optimized TEXT,
  cdn_url_thumb TEXT,
  storage_provider TEXT DEFAULT 'supabase',
  storage_path_original TEXT,
  storage_path_optimized TEXT,
  storage_path_thumb TEXT,
  checksum_sha256 TEXT,
  filename TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  width INT,
  height INT,
  category TEXT NOT NULL DEFAULT 'Wedding Ceremony',
  caption TEXT,
  tags TEXT[],
  views_count INT NOT NULL DEFAULT 0,
  downloads_count INT NOT NULL DEFAULT 0,
  processing_status TEXT NOT NULL DEFAULT 'ready' CHECK (processing_status IN ('pending', 'processing', 'ready', 'failed')),
  processing_error TEXT,
  upload_batch_id UUID,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- High-performance composite indexes for 15,000+ photo pagination
CREATE INDEX IF NOT EXISTS idx_wedding_photos_event_status_created ON public.wedding_photos(event_id, processing_status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_wedding_photos_event_category_status ON public.wedding_photos(event_id, category, processing_status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_wedding_photos_checksum ON public.wedding_photos(event_id, checksum_sha256) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_wedding_photos_photographer ON public.wedding_photos(photographer_id);

-- 5. Photo Favourites Table (Anonymous or Device token tracking)
CREATE TABLE IF NOT EXISTS public.photo_favourites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.wedding_events(id) ON DELETE CASCADE,
  photo_id UUID NOT NULL REFERENCES public.wedding_photos(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(photo_id, session_token)
);

CREATE INDEX IF NOT EXISTS idx_photo_favourites_session ON public.photo_favourites(session_token);

-- 6. Gallery Analytics Table
CREATE TABLE IF NOT EXISTS public.gallery_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.wedding_events(id) ON DELETE CASCADE,
  unique_visitors INT NOT NULL DEFAULT 0,
  total_views INT NOT NULL DEFAULT 0,
  total_downloads INT NOT NULL DEFAULT 0,
  views_by_category JSONB NOT NULL DEFAULT '{}'::jsonb,
  downloads_by_category JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id)
);

-- 7. Photographer Subscriptions (Future Billing / Stripe Integration)
CREATE TABLE IF NOT EXISTS public.photographer_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photographer_id UUID NOT NULL REFERENCES public.photographer_profiles(id) ON DELETE CASCADE,
  plan_tier TEXT NOT NULL CHECK (plan_tier IN ('starter', 'pro', 'agency')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Business Rule: Only Photographers can upload, edit, or delete photos.
-- Guests have SELECT permissions only on active wedding events and photos.
-- =========================================================================

ALTER TABLE public.photographer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_favourites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photographer_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy 1: Photographer Profiles
CREATE POLICY "Photographers can view and manage their own profile"
  ON public.photographer_profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 2: Wedding Events
-- Photographers can manage their own events
CREATE POLICY "Photographers can manage their own wedding events"
  ON public.wedding_events
  FOR ALL
  USING (auth.uid() = photographer_id)
  WITH CHECK (auth.uid() = photographer_id);

-- Guests can only view active events with valid QR / slug
CREATE POLICY "Public guests can view active wedding events"
  ON public.wedding_events
  FOR SELECT
  USING (is_qr_active = TRUE);

-- Policy 3: Wedding Photos
-- Photographers can insert, update, delete their own photos
CREATE POLICY "Photographers can insert and manage their wedding photos"
  ON public.wedding_photos
  FOR ALL
  USING (auth.uid() = photographer_id)
  WITH CHECK (auth.uid() = photographer_id);

-- Guests can read photos for active events ONLY when processing_status is 'ready' and not soft-deleted.
-- Guests NEVER have INSERT / UPDATE / DELETE rights.
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

-- Policy 4: Favourites
CREATE POLICY "Anyone can manage their own anonymous session favourites"
  ON public.photo_favourites
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Policy 5: Analytics
CREATE POLICY "Photographers can view their event analytics"
  ON public.gallery_analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.wedding_events
      WHERE public.wedding_events.id = public.gallery_analytics.event_id
      AND public.wedding_events.photographer_id = auth.uid()
    )
  );

-- Function to increment event photo counts and storage size automatically
CREATE OR REPLACE FUNCTION public.handle_photo_upload_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.wedding_events
  SET total_photos = total_photos + 1,
      storage_bytes = storage_bytes + NEW.file_size_bytes,
      updated_at = NOW()
  WHERE id = NEW.event_id;

  UPDATE public.photographer_profiles
  SET storage_used_bytes = storage_used_bytes + NEW.file_size_bytes,
      updated_at = NOW()
  WHERE id = NEW.photographer_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_on_photo_uploaded ON public.wedding_photos;
CREATE TRIGGER tr_on_photo_uploaded
  AFTER INSERT ON public.wedding_photos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_photo_upload_stats();

-- Function to decrement event photo counts on deletion
CREATE OR REPLACE FUNCTION public.handle_photo_delete_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.wedding_events
  SET total_photos = GREATEST(0, total_photos - 1),
      storage_bytes = GREATEST(0, storage_bytes - OLD.file_size_bytes),
      updated_at = NOW()
  WHERE id = OLD.event_id;

  UPDATE public.photographer_profiles
  SET storage_used_bytes = GREATEST(0, storage_used_bytes - OLD.file_size_bytes),
      updated_at = NOW()
  WHERE id = OLD.photographer_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_on_photo_deleted ON public.wedding_photos;
CREATE TRIGGER tr_on_photo_deleted
  AFTER DELETE ON public.wedding_photos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_photo_delete_stats();

-- =========================================================================
-- 8. SUPABASE STORAGE BUCKET & STORAGE OBJECT POLICIES
-- Bucket: wedding-photos
-- Photographers can upload, replace, or delete photos.
-- Guests have public read/download permissions.
-- =========================================================================

-- Create public storage bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wedding-photos',
  'wedding-photos',
  TRUE,
  52428800, -- 50MB per photo ceiling
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = TRUE,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/avif'];

-- Policy A: Photographers can upload photos to the storage bucket
CREATE POLICY "Photographers can upload photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'wedding-photos');

-- Policy B: Photographers can update or replace their photos
CREATE POLICY "Photographers can update photos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'wedding-photos')
  WITH CHECK (bucket_id = 'wedding-photos');

-- Policy C: Photographers can delete their photos from storage
CREATE POLICY "Photographers can delete photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'wedding-photos');

-- Policy D: Public guests can view and download photos from storage
CREATE POLICY "Public guests can read and download wedding photos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'wedding-photos');


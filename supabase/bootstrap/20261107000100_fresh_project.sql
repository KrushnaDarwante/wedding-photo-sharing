-- AuraWed fresh Supabase bootstrap
-- Apply once in Supabase SQL Editor on a NEW/empty project.
-- Safe to re-run: tables/indexes/triggers/bucket are idempotent and named
-- policies are dropped before recreation. This script does not create users
-- or grant anonymous write access.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
  storage_limit_bytes BIGINT NOT NULL DEFAULT 536870912000,
  storage_used_bytes BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  qr_code_url TEXT,
  total_photos INT NOT NULL DEFAULT 0,
  total_views INT NOT NULL DEFAULT 0,
  total_downloads INT NOT NULL DEFAULT 0,
  storage_bytes BIGINT NOT NULL DEFAULT 0,
  categories TEXT[] NOT NULL DEFAULT ARRAY['Haldi', 'Mehndi', 'Sangeet', 'Wedding Ceremony', 'Reception', 'Portraits'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
  processing_status TEXT NOT NULL DEFAULT 'ready'
    CHECK (processing_status IN ('pending', 'processing', 'ready', 'failed')),
  processing_error TEXT,
  upload_batch_id UUID,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.photo_favourites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.wedding_events(id) ON DELETE CASCADE,
  photo_id UUID NOT NULL REFERENCES public.wedding_photos(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(photo_id, session_token)
);

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

CREATE INDEX IF NOT EXISTS idx_wedding_events_slug ON public.wedding_events(slug);
CREATE INDEX IF NOT EXISTS idx_wedding_events_photographer ON public.wedding_events(photographer_id);
CREATE INDEX IF NOT EXISTS idx_wedding_photos_event_status_created
  ON public.wedding_photos(event_id, processing_status, created_at DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_wedding_photos_event_category_status
  ON public.wedding_photos(event_id, category, processing_status, created_at DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_wedding_photos_checksum
  ON public.wedding_photos(event_id, checksum_sha256)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_wedding_photos_photographer ON public.wedding_photos(photographer_id);
CREATE INDEX IF NOT EXISTS idx_photo_favourites_session ON public.photo_favourites(session_token);

ALTER TABLE public.photographer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_favourites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_analytics ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.photographer_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wedding_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wedding_photos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.photo_favourites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_analytics TO authenticated;
GRANT SELECT ON public.wedding_events TO anon, authenticated;
GRANT SELECT ON public.wedding_photos TO anon, authenticated;

DROP POLICY IF EXISTS "Photographers can view and manage their own profile" ON public.photographer_profiles;
CREATE POLICY "Photographers can view and manage their own profile"
  ON public.photographer_profiles FOR ALL TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Photographers can manage their own wedding events" ON public.wedding_events;
CREATE POLICY "Photographers can manage their own wedding events"
  ON public.wedding_events FOR ALL TO authenticated
  USING (auth.uid() = photographer_id) WITH CHECK (auth.uid() = photographer_id);
DROP POLICY IF EXISTS "Public guests can view active wedding events" ON public.wedding_events;
CREATE POLICY "Public guests can view active wedding events"
  ON public.wedding_events FOR SELECT TO anon, authenticated
  USING (is_qr_active = TRUE AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Photographers can insert and manage their wedding photos" ON public.wedding_photos;
CREATE POLICY "Photographers can insert and manage their wedding photos"
  ON public.wedding_photos FOR ALL TO authenticated
  USING (auth.uid() = photographer_id) WITH CHECK (auth.uid() = photographer_id);
DROP POLICY IF EXISTS "Guests can only view photos from active events" ON public.wedding_photos;
CREATE POLICY "Guests can only view photos from active events"
  ON public.wedding_photos FOR SELECT TO anon, authenticated
  USING (
    processing_status = 'ready'
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.wedding_events e
      WHERE e.id = wedding_photos.event_id
        AND e.is_qr_active = TRUE
        AND e.deleted_at IS NULL
    )
  );

-- No public write policy for favourites: device/session-token writes need a
-- server-validated design before being exposed to anonymous clients.
DROP POLICY IF EXISTS "Anyone can manage their own anonymous session favourites" ON public.photo_favourites;

DROP POLICY IF EXISTS "Photographers can view their event analytics" ON public.gallery_analytics;
CREATE POLICY "Photographers can view their event analytics"
  ON public.gallery_analytics FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.wedding_events e
      WHERE e.id = gallery_analytics.event_id AND e.photographer_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION public.handle_photo_upload_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.handle_photo_delete_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

DROP TRIGGER IF EXISTS tr_on_photo_uploaded ON public.wedding_photos;
CREATE TRIGGER tr_on_photo_uploaded
  AFTER INSERT ON public.wedding_photos
  FOR EACH ROW EXECUTE FUNCTION public.handle_photo_upload_stats();
DROP TRIGGER IF EXISTS tr_on_photo_deleted ON public.wedding_photos;
CREATE TRIGGER tr_on_photo_deleted
  AFTER DELETE ON public.wedding_photos
  FOR EACH ROW EXECUTE FUNCTION public.handle_photo_delete_stats();

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wedding-photos',
  'wedding-photos',
  TRUE,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Photographers can upload photos" ON storage.objects;
CREATE POLICY "Photographers can upload photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'wedding-photos'
    AND EXISTS (
      SELECT 1 FROM public.wedding_events e
      WHERE e.id::text = (storage.foldername(name))[1]
        AND e.photographer_id = auth.uid()
        AND e.deleted_at IS NULL
    )
  );

DROP POLICY IF EXISTS "Photographers can update photos" ON storage.objects;
CREATE POLICY "Photographers can update photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'wedding-photos'
    AND EXISTS (
      SELECT 1 FROM public.wedding_events e
      WHERE e.id::text = (storage.foldername(name))[1]
        AND e.photographer_id = auth.uid()
        AND e.deleted_at IS NULL
    )
  )
  WITH CHECK (
    bucket_id = 'wedding-photos'
    AND EXISTS (
      SELECT 1 FROM public.wedding_events e
      WHERE e.id::text = (storage.foldername(name))[1]
        AND e.photographer_id = auth.uid()
        AND e.deleted_at IS NULL
    )
  );

DROP POLICY IF EXISTS "Photographers can delete photos" ON storage.objects;
CREATE POLICY "Photographers can delete photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'wedding-photos'
    AND EXISTS (
      SELECT 1 FROM public.wedding_events e
      WHERE e.id::text = (storage.foldername(name))[1]
        AND e.photographer_id = auth.uid()
        AND e.deleted_at IS NULL
    )
  );

DROP POLICY IF EXISTS "Public guests can read wedding photos" ON storage.objects;
CREATE POLICY "Public guests can read wedding photos"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'wedding-photos');

-- IMPORTANT:
-- This creates the database structure and public guest read access only.
-- Owner event/photo writes require real Supabase Auth; the current frontend's
-- local/demo owner profile is not an authenticated Supabase identity.
-- Do not add anon INSERT/UPDATE/DELETE policies or expose a service-role key.

-- AuraWed security hardening migration.
-- Safe to apply to an existing project: additive column + replacement of
-- overly broad Storage write policies. Does not delete user data.

ALTER TABLE public.wedding_events
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

DROP POLICY IF EXISTS "Photographers can upload photos" ON storage.objects;
CREATE POLICY "Photographers can upload photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'wedding-photos'
    AND EXISTS (
      SELECT 1
      FROM public.wedding_events e
      WHERE e.id::text = (storage.foldername(name))[1]
        AND e.photographer_id = auth.uid()
        AND e.deleted_at IS NULL
    )
  );

DROP POLICY IF EXISTS "Photographers can update photos" ON storage.objects;
CREATE POLICY "Photographers can update photos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'wedding-photos'
    AND EXISTS (
      SELECT 1
      FROM public.wedding_events e
      WHERE e.id::text = (storage.foldername(name))[1]
        AND e.photographer_id = auth.uid()
        AND e.deleted_at IS NULL
    )
  )
  WITH CHECK (
    bucket_id = 'wedding-photos'
    AND EXISTS (
      SELECT 1
      FROM public.wedding_events e
      WHERE e.id::text = (storage.foldername(name))[1]
        AND e.photographer_id = auth.uid()
        AND e.deleted_at IS NULL
    )
  );

DROP POLICY IF EXISTS "Photographers can delete photos" ON storage.objects;
CREATE POLICY "Photographers can delete photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'wedding-photos'
    AND EXISTS (
      SELECT 1
      FROM public.wedding_events e
      WHERE e.id::text = (storage.foldername(name))[1]
        AND e.photographer_id = auth.uid()
        AND e.deleted_at IS NULL
    )
  );

-- Public read is intentionally unchanged for the current QR gallery implementation.
-- Move to private buckets + signed URLs only after the frontend is migrated.

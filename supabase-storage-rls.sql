-- Migration: Add storage RLS policies for image uploads
-- Run this in Supabase SQL Editor
-- Fixes: anon key can't upload images (403 error)

-- 1. Allow anyone to upload files to product-images bucket
CREATE POLICY "Public Upload product-images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

-- 2. Allow anyone to upload files to brand-logos bucket
CREATE POLICY "Public Upload brand-logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'brand-logos');

-- 3. Allow anyone to update files (e.g. overwrite)
CREATE POLICY "Public Update storage"
  ON storage.objects FOR UPDATE
  USING (true) WITH CHECK (bucket_id IN ('product-images', 'brand-logos'));

-- 4. Allow anyone to delete files
CREATE POLICY "Public Delete storage"
  ON storage.objects FOR DELETE
  USING (bucket_id IN ('product-images', 'brand-logos'));

-- 5. Read is already public via bucket setting, but ensure it works
CREATE POLICY "Public Select storage"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('product-images', 'brand-logos'));

-- Migration: Add Brands + multiple images support
-- Run this in Supabase SQL Editor after the initial schema

-- 1. BRANDS table
CREATE TABLE IF NOT EXISTS brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_th TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add brand_id to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);

-- 3. Create storage bucket for brand logos
INSERT INTO storage.buckets (id, name, public) 
SELECT 'brand-logos', 'brand-logos', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'brand-logos');

-- Note: product images already use TEXT[] so multiple images work natively.
-- No schema change needed for multiple images.

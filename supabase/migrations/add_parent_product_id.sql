-- Add parent_product_id and variant_label columns for product variant support
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/banyqzspcnpgqikpfkne/sql/new

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS parent_product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS variant_label text;

-- Index for fast variant lookups
CREATE INDEX IF NOT EXISTS idx_products_parent ON products(parent_product_id);

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'products' AND column_name IN ('parent_product_id', 'variant_label');

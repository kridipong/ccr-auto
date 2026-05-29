-- Run this in Supabase SQL Editor: https://banyqzspcnpgqikpfkne.supabase.co
-- Adds parent-child product support for variants (e.g., Front/Rear shock pairs)

ALTER TABLE products ADD COLUMN IF NOT EXISTS parent_product_id UUID REFERENCES products(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS variant_label TEXT; -- e.g. "คู่หน้า", "Front Pair"

CREATE INDEX IF NOT EXISTS idx_products_parent ON products(parent_product_id);

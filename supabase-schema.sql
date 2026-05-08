-- Database schema SQL for Supabase
-- Run this in Supabase SQL Editor

-- MAKES
CREATE TABLE makes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_th TEXT NOT NULL,
  name_en TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MODELS (fitment)
CREATE TABLE models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  make_id UUID REFERENCES makes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  year_start INTEGER NOT NULL,
  year_end INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CATEGORIES
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_th TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name_th TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_th TEXT DEFAULT '',
  description_en TEXT DEFAULT '',
  price DECIMAL(10,2) NOT NULL,
  compare_price DECIMAL(10,2),
  stock INTEGER DEFAULT 0,
  category_id UUID REFERENCES categories(id),
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCT VEHICLE FITMENT
CREATE TABLE product_fitments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  make_id UUID REFERENCES makes(id) ON DELETE CASCADE,
  model_id UUID REFERENCES models(id) ON DELETE CASCADE,
  year_start INTEGER NOT NULL,
  year_end INTEGER,
  engine TEXT,
  notes TEXT
);

-- ORDERS
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  items JSONB NOT NULL DEFAULT '[]',
  total DECIMAL(10,2) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_address TEXT NOT NULL,
  payment_method TEXT DEFAULT 'bank_transfer',
  payment_slip_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','shipped','completed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_fitments_make ON product_fitments(make_id);
CREATE INDEX idx_fitments_model ON product_fitments(model_id);
CREATE INDEX idx_fitments_product ON product_fitments(product_id);
CREATE INDEX idx_models_make ON models(make_id);
CREATE INDEX idx_orders_status ON orders(status);

-- STORAGE BUCKET for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

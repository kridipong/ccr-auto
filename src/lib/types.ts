// Database types
export interface Make {
  id: string
  name_th: string
  name_en: string
  created_at: string
}

export interface Model {
  id: string
  make_id: string
  name: string
  year_start: number
  year_end: number | null
  created_at: string
}

export interface Brand {
  id: string
  name_th: string
  name_en: string
  slug: string
  logo_url: string | null
  description: string | null
  created_at: string
}

export interface Category {
  id: string
  name_th: string
  name_en: string
  slug: string
  parent_id: string | null
  created_at: string
}

export interface Product {
  id: string
  sku: string
  name_th: string
  name_en: string
  description_th: string
  description_en: string
  price: number
  compare_price: number | null
  stock: number
  category_id: string
  brand_id: string | null
  images: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductFitment {
  id: string
  product_id: string
  make_id: string
  model_id: string
  year_start: number
  year_end: number | null
  engine: string | null
  notes: string | null
}

export interface Order {
  id: string
  items: OrderItem[]
  total: number
  customer_name: string
  customer_phone: string
  customer_email: string | null
  customer_address: string
  payment_method: string
  payment_slip_url: string | null
  status: 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled'
  created_at: string
}

export interface OrderItem {
  product_id: string
  product_name: string
  sku: string
  price: number
  quantity: number
}

export interface CartItem {
  product_id: string
  name: string
  sku: string
  price: number
  image: string
  quantity: number
}

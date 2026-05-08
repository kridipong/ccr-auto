'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import type { Product } from '@/lib/types'
import { ShoppingCart } from 'lucide-react'

export default function ProductCard({ product, locale }: { product: Product; locale: string }) {
  const { addItem } = useCart()
  const name = locale === 'th' ? product.name_th : product.name_en
  const img = product.images?.[0]

  return (
    <div className="glass-card rounded-xl overflow-hidden group transition-all duration-300">
      <Link href={`/${locale}/products/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden relative">
          {img ? (
            <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          )}
          {/* Overlay on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }} />

          {product.compare_price && (
            <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded"
              style={{ background: '#ff3366', color: 'white', boxShadow: '0 0 10px rgba(255,51,102,0.4)' }}>
              -{Math.round((1 - Number(product.price) / Number(product.compare_price)) * 100)}%
            </span>
          )}
        </div>
      </Link>
      <div className="p-3">
        <p className="text-[10px] font-mono text-glass-muted mb-1">{product.sku}</p>
        <Link href={`/${locale}/products/${product.id}`}>
          <h3 className="font-medium text-sm leading-snug mb-2 line-clamp-2 text-glass hover:glow-text transition-all">
            {name}
          </h3>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-base font-bold" style={{ color: '#ff3366', textShadow: '0 0 10px rgba(255,51,102,0.3)' }}>
              ฿{Number(product.price).toLocaleString()}
            </span>
            {product.compare_price && (
              <span className="text-[10px] line-through ml-1.5 text-glass-muted">
                ฿{Number(product.compare_price).toLocaleString()}
              </span>
            )}
          </div>
          {product.stock > 0 && (
            <button
              onClick={() => addItem({
                product_id: product.id,
                name,
                sku: product.sku,
                price: Number(product.price),
                image: img || '',
                quantity: 1,
              })}
              className="p-2 rounded-lg transition-all"
              style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff' }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0,212,255,0.2)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(0,212,255,0.3)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(0,212,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <ShoppingCart size={15} />
            </button>
          )}
        </div>
        {product.stock === 0 && (
          <p className="text-[11px] mt-1" style={{ color: '#ff3366' }}>
            {locale === 'th' ? 'สินค้าหมด' : 'Out of stock'}
          </p>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-[10px] mt-1" style={{ color: '#ff3366' }}>
            {locale === 'th' ? `เหลือ ${product.stock} ชิ้น` : `Only ${product.stock} left`}
          </p>
        )}
      </div>
    </div>
  )
}

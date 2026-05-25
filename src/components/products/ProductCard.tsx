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
    <div className="bg-white rounded-xl overflow-hidden group border border-silver-200 shadow-sm hover:shadow-lg hover:border-racing-400/30 transition-all duration-200">
      <Link href={`/${locale}/products/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden relative bg-silver-50">
          {img ? (
            <img src={img} alt={name} className="w-full h-full object-contain p-4 group-hover:scale-110 transition duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-silver-300">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          )}
          {product.compare_price && (
            <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-racing-600 text-white shadow-sm">
              -{Math.round((1 - Number(product.price) / Number(product.compare_price)) * 100)}%
            </span>
          )}
        </div>
      </Link>
      <div className="p-3">
        <p className="text-[10px] text-silver-500 mb-1 font-mono">{product.sku}</p>
        <Link href={`/${locale}/products/${product.id}`}>
          <h3 className="font-medium text-sm leading-snug mb-2 line-clamp-2 text-graphite-900 hover:text-racing-600 transition-colors">
            {name}
          </h3>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-base font-bold text-racing-600">
              ฿{Number(product.price).toLocaleString()}
            </span>
            {product.compare_price && (
              <span className="text-[10px] line-through ml-1.5 text-silver-400">
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
              className="p-2 rounded-lg bg-graphite-50 text-graphite-600 hover:bg-racing-600 hover:text-white transition-all"
            >
              <ShoppingCart size={15} />
            </button>
          )}
        </div>
        {product.stock === 0 && (
          <p className="text-[11px] mt-1 text-racing-600 font-medium">
            {locale === 'th' ? 'สินค้าหมด' : 'Out of stock'}
          </p>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-[10px] mt-1 text-racing-500">
            {locale === 'th' ? `เหลือ ${product.stock} ชิ้น` : `Only ${product.stock} left`}
          </p>
        )}
      </div>
    </div>
  )
}

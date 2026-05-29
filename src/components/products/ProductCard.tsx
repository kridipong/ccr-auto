'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import type { Product } from '@/lib/types'
import { ShoppingCart, Layers } from 'lucide-react'

export default function ProductCard({ product, locale, variants }: {
  product: Product
  locale: string
  variants: Product[]
}) {
  const { addItem } = useCart()
  const name = locale === 'th' ? product.name_th : product.name_en
  const img = product.images?.[0]
  const hasVariants = variants.length > 0
  const isStandalone = !hasVariants && !product.parent_product_id

  const variantNames = hasVariants
    ? variants.map(v => v.variant_label || (locale === 'th' ? v.name_th : v.name_en)).filter(Boolean)
    : []

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
          {hasVariants && (
            <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-white shadow-sm flex items-center gap-1">
              <Layers size={10} /> {variants.length}
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

        {/* Variant marquee */}
        {hasVariants && variantNames.length > 0 && (
          <div className="mb-2 overflow-hidden rounded bg-silver-50 px-2 py-1">
            <div className="animate-marquee whitespace-nowrap text-[10px] text-silver-500">
              <span className="font-medium text-silver-600 mr-1">
                {locale === 'th' ? 'ตัวเลือก:' : 'Options:'}
              </span>
              {variantNames.join(' • ')}
              {' • '}
              {variantNames.join(' • ')}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            {hasVariants ? (
              <span className="text-sm font-bold text-racing-600">
                {(() => {
                  const prices = variants.map(v => Number(v.price) || 0)
                  const minP = Math.min(...prices)
                  const maxP = Math.max(...prices)
                  return minP === maxP
                    ? `฿${minP.toLocaleString()}`
                    : `฿${minP.toLocaleString()} - ฿${maxP.toLocaleString()}`
                })()}
              </span>
            ) : (
              <>
                <span className="text-base font-bold text-racing-600">
                  ฿{Number(product.price).toLocaleString()}
                </span>
                {product.compare_price && (
                  <span className="text-[10px] line-through ml-1.5 text-silver-400">
                    ฿{Number(product.compare_price).toLocaleString()}
                  </span>
                )}
              </>
            )}
          </div>
          {isStandalone && product.stock > 0 && (
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
        {(() => {
          const totalStock = hasVariants ? variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) : Number(product.stock) || 0
          if (hasVariants && totalStock > 0) return (
            <p className="text-[10px] mt-1 text-racing-500">
              {locale === 'th' ? `รวมสต็อก ${totalStock} ชิ้น` : `Total stock: ${totalStock}`}
            </p>
          )
          if (totalStock === 0) return (
            <p className="text-[11px] mt-1 text-racing-600 font-medium">
              {locale === 'th' ? 'สินค้าหมด' : 'Out of stock'}
            </p>
          )
          if (totalStock <= 5) return (
            <p className="text-[10px] mt-1 text-racing-500">
              {locale === 'th' ? `เหลือ ${totalStock} ชิ้น` : `Only ${totalStock} left`}
            </p>
          )
          return null
        })()}
      </div>
    </div>
  )
}

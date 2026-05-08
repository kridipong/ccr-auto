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
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition group">
      <Link href={`/${locale}/products/${product.id}`} className="block">
        <div className="aspect-square bg-gray-100 rounded-t-xl overflow-hidden">
          {img ? (
            <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
              {locale === 'th' ? 'ไม่มีรูป' : 'No image'}
            </div>
          )}
        </div>
      </Link>
      <div className="p-3">
        <p className="text-xs text-gray-400 mb-1">{product.sku}</p>
        <Link href={`/${locale}/products/${product.id}`}>
          <h3 className="font-medium text-gray-800 text-sm line-clamp-2 hover:text-blue-600">{name}</h3>
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="text-lg font-bold text-red-600">฿{product.price.toLocaleString()}</span>
            {product.compare_price && (
              <span className="text-xs text-gray-400 line-through ml-2">฿{product.compare_price.toLocaleString()}</span>
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
              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
            >
              <ShoppingCart size={16} />
            </button>
          )}
        </div>
        {product.stock === 0 && (
          <p className="text-xs text-red-500 mt-1">
            {locale === 'th' ? 'สินค้าหมด' : 'Out of stock'}
          </p>
        )}
      </div>
    </div>
  )
}

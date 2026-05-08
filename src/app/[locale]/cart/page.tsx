'use client'

import Link from 'next/link'
import { useLocale } from '@/lib/i18n/locale-provider'
import { t } from '@/lib/i18n'
import { useCart } from '@/lib/cart-context'
import { Trash2, ShoppingBag, ArrowLeft, Plus, Minus } from 'lucide-react'

export default function CartPage() {
  const { locale } = useLocale()
  const { items, removeItem, updateQty, total } = useCart()

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-600 mb-2">{t('cart.title', locale)}</h1>
        <p className="text-gray-400 mb-6">{t('cart.empty', locale)}</p>
        <Link
          href={`/${locale}/products`}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          {t('products.all', locale)}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('cart.title', locale)}</h1>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.product_id} className="bg-white rounded-xl p-4 shadow-sm border flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-100" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400">{item.sku}</p>
              <h3 className="font-medium text-gray-800 truncate">{item.name}</h3>
              <p className="text-red-600 font-semibold">฿{item.price.toLocaleString()}</p>
            </div>
            <div className="flex items-center border rounded-lg">
              <button onClick={() => updateQty(item.product_id, item.quantity - 1)} className="p-2 text-gray-500 hover:text-gray-700">
                <Minus size={16} />
              </button>
              <span className="px-3 font-medium">{item.quantity}</span>
              <button onClick={() => updateQty(item.product_id, item.quantity + 1)} className="p-2 text-gray-500 hover:text-gray-700">
                <Plus size={16} />
              </button>
            </div>
            <button onClick={() => removeItem(item.product_id)} className="p-2 text-red-400 hover:text-red-600">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold text-gray-800">{t('cart.total', locale)}</span>
          <span className="text-2xl font-bold text-red-600">฿{total.toLocaleString()}</span>
        </div>
        <div className="flex gap-3">
          <Link href={`/${locale}/products`} className="flex-1 text-center py-3 border rounded-lg text-gray-600 hover:bg-gray-50">
            {t('nav.products', locale)}
          </Link>
          <Link
            href={`/${locale}/checkout`}
            className="flex-1 text-center py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            {t('cart.checkout', locale)}
          </Link>
        </div>
      </div>
    </div>
  )
}

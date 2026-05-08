'use client'

import Link from 'next/link'
import { useLocale } from '@/lib/i18n/locale-provider'
import { t } from '@/lib/i18n'
import { useCart } from '@/lib/cart-context'
import { Trash2, ShoppingBag, Plus, Minus } from 'lucide-react'

export default function CartPage() {
  const { locale } = useLocale()
  const { items, removeItem, updateQty, total } = useCart()

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <ShoppingBag size={64} className="mx-auto text-glass-muted mb-4" />
        <h1 className="text-2xl font-bold text-glass mb-2">{t('cart.title', locale)}</h1>
        <p className="text-glass-muted mb-6">{t('cart.empty', locale)}</p>
        <Link href={`/${locale}/products`} className="btn-glass inline-flex items-center gap-2">
          {t('products.all', locale)}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-glass mb-6">{t('cart.title', locale)}</h1>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.product_id} className="glass-card rounded-xl p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 glass">
              {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-glass-muted font-mono">{item.sku}</p>
              <h3 className="font-medium text-glass truncate">{item.name}</h3>
              <p className="font-semibold" style={{ color: '#ff3366' }}>฿{item.price.toLocaleString()}</p>
            </div>
            <div className="flex items-center glass rounded-lg">
              <button onClick={() => updateQty(item.product_id, item.quantity - 1)} className="p-2 text-glass-muted hover:text-white">
                <Minus size={16} />
              </button>
              <span className="px-3 font-medium text-glass">{item.quantity}</span>
              <button onClick={() => updateQty(item.product_id, item.quantity + 1)} className="p-2 text-glass-muted hover:text-white">
                <Plus size={16} />
              </button>
            </div>
            <button onClick={() => removeItem(item.product_id)} className="p-2 transition" style={{ color: 'rgba(255,51,102,0.5)' }}
              onMouseOver={(e) => e.currentTarget.style.color = '#ff3366'}
              onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,51,102,0.5)'}>
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 glass-card rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold text-glass">{t('cart.total', locale)}</span>
          <span className="text-2xl font-bold" style={{ color: '#ff3366', textShadow: '0 0 15px rgba(255,51,102,0.3)' }}>
            ฿{total.toLocaleString()}
          </span>
        </div>
        <div className="flex gap-3">
          <Link href={`/${locale}/products`}
            className="flex-1 text-center py-3 rounded-xl text-glass-secondary border transition hover:text-white"
            style={{ borderColor: 'rgba(255,255,255,0.15)' }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}>
            {t('nav.products', locale)}
          </Link>
          <Link href={`/${locale}/checkout`}
            className="flex-1 text-center py-3 rounded-xl font-semibold transition-all btn-accent-glass">
            {t('cart.checkout', locale)}
          </Link>
        </div>
      </div>
    </div>
  )
}

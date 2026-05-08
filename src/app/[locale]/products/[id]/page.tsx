'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n/locale-provider'
import { t } from '@/lib/i18n'
import { useCart } from '@/lib/cart-context'
import { createClient } from '@/lib/supabase/client'
import type { Product, ProductFitment, Category } from '@/lib/types'
import { ShoppingCart, ArrowLeft, Check, ChevronLeft, ChevronRight } from 'lucide-react'

const supabase = createClient()

export default function ProductDetailPage() {
  const { locale } = useLocale()
  const params = useParams()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [fitments, setFitments] = useState<(ProductFitment & { make_name?: string; model_name?: string })[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [currentImage, setCurrentImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    supabase.from('products').select('*').eq('id', params.id).single().then(({ data }) => {
      if (data) {
        setProduct(data)
        if (data.category_id) {
          supabase.from('categories').select('*').eq('id', data.category_id).single().then(({ data: cat }) => {
            if (cat) setCategory(cat)
          })
        }
        supabase.from('product_fitments').select('*').eq('product_id', data.id).then(async ({ data: fits }) => {
          if (fits && fits.length > 0) {
            const enriched = await Promise.all(fits.map(async (f) => {
              const [makeRes, modelRes] = await Promise.all([
                supabase.from('makes').select('*').eq('id', f.make_id).single(),
                supabase.from('models').select('*').eq('id', f.model_id).single(),
              ])
              return { ...f, make_name: makeRes.data?.name_en || '', model_name: modelRes.data?.name || '' }
            }))
            setFitments(enriched)
          }
        })
      }
    })
  }, [params.id])

  if (!product) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-glass-muted">{t('common.loading', locale)}</div>
  }

  const name = locale === 'th' ? product.name_th : product.name_en
  const desc = locale === 'th' ? product.description_th : product.description_en
  const images = product.images?.length ? product.images : ['/logo.png']

  const handleAdd = () => {
    addItem({ product_id: product.id, name, sku: product.sku, price: Number(product.price), image: images[0], quantity })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href={`/${locale}/products`} className="inline-flex items-center gap-1 text-glass-muted hover:text-white mb-6 transition">
        <ArrowLeft size={16} /> {t('common.back', locale)}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="glass-card rounded-xl overflow-hidden mb-3">
            <img src={images[currentImage]} alt={name} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button key={i} onClick={() => setCurrentImage(i)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                    i === currentImage ? 'glow-border' : 'opacity-60 hover:opacity-100'
                  }`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card rounded-xl p-6">
          <p className="text-xs text-glass-muted mb-1 font-mono">{product.sku}</p>
          {category && (
            <Link href={`/${locale}/products?category=${category.id}`}
              className="text-xs transition" style={{ color: '#00d4ff' }}>
              {locale === 'th' ? category.name_th : category.name_en}
            </Link>
          )}
          <h1 className="text-2xl font-bold text-glass mt-2 mb-4">{name}</h1>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold" style={{ color: '#ff3366', textShadow: '0 0 15px rgba(255,51,102,0.3)' }}>
              ฿{Number(product.price).toLocaleString()}
            </span>
            {product.compare_price && (
              <span className="text-lg text-glass-muted line-through">฿{Number(product.compare_price).toLocaleString()}</span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-6">
            {product.stock > 0 ? (
              <span className="flex items-center gap-1 text-sm" style={{ color: '#00d4ff' }}>
                <Check size={16} /> {t('products.in_stock', locale)}
              </span>
            ) : (
              <span className="text-sm" style={{ color: '#ff3366' }}>{t('products.out_of_stock', locale)}</span>
            )}
          </div>

          {desc && (
            <div className="mb-6">
              <h3 className="font-semibold text-glass mb-2 text-sm">
                {locale === 'th' ? 'รายละเอียด' : 'Description'}
              </h3>
              <p className="text-glass-secondary text-sm whitespace-pre-wrap">{desc}</p>
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center glass rounded-lg">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-glass-muted hover:text-white">
                <ChevronLeft size={18} />
              </button>
              <span className="px-4 py-2 font-medium text-glass">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 text-glass-muted hover:text-white">
                <ChevronRight size={18} />
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={product.stock === 0}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                added ? 'bg-green-500 text-white' : product.stock > 0 ? 'btn-accent-glass' : 'opacity-30 cursor-not-allowed'
              }`}
            >
              <ShoppingCart size={20} />
              {added ? (locale === 'th' ? 'เพิ่มแล้ว!' : 'Added!') : t('products.add_to_cart', locale)}
            </button>
          </div>

          {fitments.length > 0 && (
            <div className="pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="font-semibold text-glass mb-3 text-sm">{t('admin.fitment', locale)}</h3>
              <div className="flex flex-wrap gap-2">
                {fitments.map((f) => (
                  <span key={f.id} className="glass px-3 py-1.5 rounded-full text-xs text-glass-secondary">
                    {f.make_name} {f.model_name} ({f.year_start}{f.year_end ? `-${f.year_end}` : '+'})
                    {f.engine && ` • ${f.engine}`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

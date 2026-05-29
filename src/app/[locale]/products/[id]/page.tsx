'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n/locale-provider'
import { t } from '@/lib/i18n'
import { useCart } from '@/lib/cart-context'
import { createClient } from '@/lib/supabase/client'
import type { Product, ProductFitment, Category, Brand } from '@/lib/types'
import { ShoppingCart, ArrowLeft, Check, ChevronLeft, ChevronRight, Award, Layers, Package } from 'lucide-react'

const supabase = createClient()

export default function ProductDetailPage() {
  const { locale } = useLocale()
  const params = useParams()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [variants, setVariants] = useState<Product[]>([])
  const [selectedVariant, setSelectedVariant] = useState<Product | null>(null)
  const [brand, setBrand] = useState<Brand | null>(null)
  const [fitments, setFitments] = useState<(ProductFitment & { make_name?: string; model_name?: string })[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [currentImage, setCurrentImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    supabase.from('products').select('*').eq('id', params.id).single().then(({ data }) => {
      if (data) {
        setProduct(data)
        if (data.brand_id) {
          supabase.from('brands').select('*').eq('id', data.brand_id).single().then(({ data: brandData }) => {
            if (brandData) setBrand(brandData)
          })
        }
        if (data.category_id) {
          supabase.from('categories').select('*').eq('id', data.category_id).single().then(({ data: cat }) => {
            if (cat) setCategory(cat)
          })
        }
        // Fetch variants if this is a parent product
        supabase.from('products').select('*').eq('parent_product_id', data.id).eq('is_active', true).order('price').then(({ data: vars, error }) => {
          if (error) console.error('Variant fetch error:', error)
          if (vars && vars.length > 0) {
            setVariants(vars)
          }
        })
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
  const hasVariants = variants.length > 0
  const activeProduct = selectedVariant || (hasVariants ? null : product)
  const canAddToCart = !hasVariants || selectedVariant

  const variantNames = hasVariants
    ? variants.map(v => v.variant_label || (locale === 'th' ? v.name_th : v.name_en)).filter(Boolean)
    : []

  const priceDisplay: string = hasVariants && !selectedVariant
    ? (() => {
        const prices = variants.map(v => Number(v.price) || 0)
        const minP = Math.min(...prices)
        const maxP = Math.max(...prices)
        return minP === maxP ? '฿' + minP.toLocaleString() : '฿' + minP.toLocaleString() + ' - ฿' + maxP.toLocaleString()
      })()
    : '฿' + ((activeProduct ? Number(activeProduct.price) : 0)).toLocaleString()

  const handleAdd = () => {
    if (!activeProduct) return
    const pName = locale === 'th' ? activeProduct.name_th : activeProduct.name_en
    addItem({ product_id: activeProduct.id, name: pName, sku: activeProduct.sku, price: Number(activeProduct.price), image: activeProduct.images?.[0] || images[0], quantity })
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
          <div className="flex items-center gap-3 mb-2">
            {brand && (
              <Link href={`/${locale}/products?brand=${brand.id}`}
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-all"
                style={{
                  background: 'rgba(0,212,255,0.1)',
                  color: '#00d4ff',
                  border: '1px solid rgba(0,212,255,0.2)',
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0,212,255,0.2)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(0,212,255,0.3)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(0,212,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {brand.logo_url ? (
                  <img src={brand.logo_url} alt={brand.name_en} className="h-4 w-auto" />
                ) : (
                  <Award size={14} />
                )}
                <span>{locale === 'th' ? (brand.name_th || brand.name_en) : brand.name_en}</span>
              </Link>
            )}
            {category && (
              <Link href={`/${locale}/products?category=${category.id}`}
                className="text-xs transition" style={{ color: '#00d4ff' }}>
                {locale === 'th' ? category.name_th : category.name_en}
              </Link>
            )}
            {hasVariants && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,193,7,0.15)', color: '#ffc107' }}>
                <Layers size={12} /> {variants.length} {locale === 'th' ? 'ตัวเลือก' : 'options'}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-glass mt-1 mb-4">{name}</h1>

          {/* Variant names ticker */}
          {hasVariants && variantNames.length > 0 && (
            <div className="mb-4 overflow-hidden rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="animate-marquee whitespace-nowrap text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <span className="font-medium mr-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <Package size={12} className="inline mr-1" />
                  {locale === 'th' ? 'ตัวเลือก:' : 'Options:'}
                </span>
                {variantNames.join('  •  ')}
                {'  •  '}
                {variantNames.join('  •  ')}
              </div>
            </div>
          )}

          {/* Variant selector */}
          {hasVariants && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-glass mb-3">
                {locale === 'th' ? 'เลือกตัวเลือกสินค้า' : 'Select option'}
              </h3>
              <div className="space-y-2">
                {variants.map((v) => {
                  const vName = v.variant_label || (locale === 'th' ? v.name_th : v.name_en)
                  const isSelected = selectedVariant?.id === v.id
                  return (
                    <button
                      key={v.id}
                      onClick={() => { setSelectedVariant(v); setQuantity(1) }}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-start ${
                        isSelected
                          ? 'border-racing-500 bg-racing-500/10 text-white'
                          : 'border-white/10 hover:border-white/20 text-glass-secondary'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium block">{vName}</span>
                        <div className="flex items-center gap-3 text-xs text-glass-muted mt-0.5">
                          <span>{v.sku}</span>
                          {v.stock > 0 ? (
                            <span style={{ color: '#00d4ff' }}>
                              {locale === 'th' ? `สต็อก: ${v.stock} ชิ้น` : `Stock: ${v.stock}`}
                            </span>
                          ) : (
                            <span style={{ color: '#ff3366' }}>
                              {locale === 'th' ? 'สินค้าหมด' : 'Out of stock'}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`text-base font-bold shrink-0 ml-3 ${isSelected ? 'text-racing-400' : 'text-glass'}`}>
                        ฿{Number(v.price).toLocaleString()}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold" style={{ color: '#ff3366', textShadow: '0 0 15px rgba(255,51,102,0.3)' }}>
              {priceDisplay}
            </span>
            {activeProduct?.compare_price && (
              <span className="text-lg text-glass-muted line-through">฿{Number(activeProduct.compare_price).toLocaleString()}</span>
            )}
          </div>

          {/* Stock status */}
          <div className="flex items-center gap-2 mb-6">
            {hasVariants && !selectedVariant ? (
              <span className="text-sm" style={{ color: '#ffc107' }}>
                {locale === 'th' ? 'กรุณาเลือกตัวเลือกสินค้า' : 'Please select an option'}
              </span>
            ) : activeProduct?.stock && activeProduct.stock > 0 ? (
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

          {/* Add to cart */}
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
              disabled={!canAddToCart || (activeProduct ? activeProduct.stock === 0 : true)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                added ? 'bg-green-500 text-white' : canAddToCart && activeProduct && activeProduct.stock > 0 ? 'btn-accent-glass' : 'opacity-30 cursor-not-allowed'
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

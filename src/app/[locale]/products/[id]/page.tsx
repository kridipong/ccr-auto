'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n/locale-provider'
import { t } from '@/lib/i18n'
import { useCart } from '@/lib/cart-context'
import { createClient } from '@/lib/supabase/client'
import type { Product, ProductFitment, Category, Make, Model } from '@/lib/types'
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
        // Fetch fitments
        supabase.from('product_fitments').select('*').eq('product_id', data.id).then(async ({ data: fits }) => {
          if (fits && fits.length > 0) {
            const enriched = await Promise.all(fits.map(async (f) => {
              const [makeRes, modelRes] = await Promise.all([
                supabase.from('makes').select('*').eq('id', f.make_id).single(),
                supabase.from('models').select('*').eq('id', f.model_id).single(),
              ])
              return {
                ...f,
                make_name: makeRes.data?.name_en || '',
                model_name: modelRes.data?.name || '',
              }
            }))
            setFitments(enriched)
          }
        })
      }
    })
  }, [params.id])

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">
        {t('common.loading', locale)}
      </div>
    )
  }

  const name = locale === 'th' ? product.name_th : product.name_en
  const desc = locale === 'th' ? product.description_th : product.description_en
  const images = product.images?.length ? product.images : ['/placeholder.png']

  const handleAdd = () => {
    addItem({
      product_id: product.id,
      name,
      sku: product.sku,
      price: Number(product.price),
      image: images[0],
      quantity,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href={`/${locale}/products`} className="inline-flex items-center gap-1 text-gray-500 hover:text-blue-600 mb-6">
        <ArrowLeft size={16} /> {t('common.back', locale)}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-3">
            <img src={images[currentImage]} alt={name} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    i === currentImage ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-gray-400 mb-1">{product.sku}</p>
          {category && (
            <Link href={`/${locale}/products?category=${category.id}`} className="text-sm text-blue-600 hover:underline">
              {locale === 'th' ? category.name_th : category.name_en}
            </Link>
          )}
          <h1 className="text-2xl font-bold text-gray-800 mt-2 mb-4">{name}</h1>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-red-600">฿{Number(product.price).toLocaleString()}</span>
            {product.compare_price && (
              <span className="text-lg text-gray-400 line-through">฿{Number(product.compare_price).toLocaleString()}</span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-6">
            {product.stock > 0 ? (
              <span className="flex items-center gap-1 text-green-600 text-sm"><Check size={16} /> {t('products.in_stock', locale)}</span>
            ) : (
              <span className="text-red-500 text-sm">{t('products.out_of_stock', locale)}</span>
            )}
          </div>

          {desc && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">{locale === 'th' ? 'รายละเอียด' : 'Description'}</h3>
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{desc}</p>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-gray-500 hover:text-gray-700"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="px-4 py-2 font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 text-gray-500 hover:text-gray-700"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={product.stock === 0}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition ${
                added
                  ? 'bg-green-500 text-white'
                  : product.stock > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCart size={20} />
              {added ? (locale === 'th' ? 'เพิ่มแล้ว!' : 'Added!') : t('products.add_to_cart', locale)}
            </button>
          </div>

          {/* Fitments */}
          {fitments.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-700 mb-3">{t('admin.fitment', locale)}</h3>
              <div className="flex flex-wrap gap-2">
                {fitments.map((f) => (
                  <span key={f.id} className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-600">
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

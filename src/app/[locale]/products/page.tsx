'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLocale } from '@/lib/i18n/locale-provider'
import { t } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import type { Make, Model, Category, Product } from '@/lib/types'
import ProductCard from '@/components/products/ProductCard'
import { Search, SlidersHorizontal, X } from 'lucide-react'

const supabase = createClient()

export default function ProductsPage() {
  const { locale } = useLocale()
  const searchParams = useSearchParams()

  const [makes, setMakes] = useState<Make[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Filters
  const [selectedMake, setSelectedMake] = useState(searchParams.get('make') || '')
  const [selectedModel, setSelectedModel] = useState(searchParams.get('model') || '')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    Promise.all([
      supabase.from('makes').select('*').order('name_en'),
      supabase.from('categories').select('*').order('name_en'),
    ]).then(([makesRes, catsRes]) => {
      if (makesRes.data) setMakes(makesRes.data)
      if (catsRes.data) setCategories(catsRes.data)
    })
  }, [])

  useEffect(() => {
    if (selectedMake) {
      supabase.from('models').select('*').eq('make_id', selectedMake).order('name').then(({ data }) => {
        if (data) setModels(data)
      })
    } else {
      setModels([])
    }
  }, [selectedMake])

  useEffect(() => {
    setLoading(true)
    let query = supabase.from('products').select('*').eq('is_active', true)

    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory)
    }
    if (search) {
      query = query.or(`name_th.ilike.%${search}%,name_en.ilike.%${search}%,sku.ilike.%${search}%`)
    }
    if (selectedMake || selectedModel) {
      // Products with fitment filtering
      let fitQuery = supabase.from('product_fitments').select('product_id')
      if (selectedMake) fitQuery = fitQuery.eq('make_id', selectedMake)
      if (selectedModel) fitQuery = fitQuery.eq('model_id', selectedModel)

      fitQuery.then(({ data: fitData }) => {
        if (fitData && fitData.length > 0) {
          const ids = fitData.map(f => f.product_id)
          query.in('id', ids).then(({ data }) => {
            if (data) setProducts(data)
            setLoading(false)
          })
        } else {
          setProducts([])
          setLoading(false)
        }
      })
      return
    }

    query.order('created_at', { ascending: false }).limit(50).then(({ data }) => {
      if (data) setProducts(data)
      setLoading(false)
    })
  }, [selectedMake, selectedModel, selectedCategory, search])

  const clearFilters = () => {
    setSelectedMake('')
    setSelectedModel('')
    setSelectedCategory('')
    setSearch('')
  }

  const hasFilters = selectedMake || selectedModel || selectedCategory || search

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('products.all', locale)}</h1>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('products.search', locale)}
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition ${
            showFilters || hasFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'text-gray-600'
          }`}
        >
          <SlidersHorizontal size={18} />
          {t('vehicle.select', locale)}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white border rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">{t('vehicle.make', locale)}</label>
              <select
                value={selectedMake}
                onChange={(e) => { setSelectedMake(e.target.value); setSelectedModel('') }}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">-- {t('vehicle.make', locale)} --</option>
                {makes.map((m) => (
                  <option key={m.id} value={m.id}>{locale === 'th' ? (m.name_th || m.name_en) : m.name_en}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">{t('vehicle.model', locale)}</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={!selectedMake}
              >
                <option value="">-- {t('vehicle.model', locale)} --</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.year_start}{m.year_end ? `-${m.year_end}` : '+'})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">{t('products.category', locale)}</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">{locale === 'th' ? 'ทั้งหมด' : 'All'}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{locale === 'th' ? c.name_th : c.name_en}</option>
                ))}
              </select>
            </div>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-3 text-sm text-red-500 hover:underline flex items-center gap-1">
              <X size={14} /> {t('vehicle.clear', locale)}
            </button>
          )}
        </div>
      )}

      {/* Products grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">{t('common.loading', locale)}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-400">{t('products.no_results', locale)}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      )}
    </div>
  )
}

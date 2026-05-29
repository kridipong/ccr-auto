'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLocale } from '@/lib/i18n/locale-provider'
import { t } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import type { Make, Model, Category, Brand, Product } from '@/lib/types'
import ProductCard from '@/components/products/ProductCard'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { applySearch } from '@/lib/search-dictionary'

const supabase = createClient()

export default function ProductsPage() {
  const { locale } = useLocale()
  const searchParams = useSearchParams()

  const [makes, setMakes] = useState<Make[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [variantMap, setVariantMap] = useState<Record<string, Product[]>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const [selectedMake, setSelectedMake] = useState(searchParams.get('make') || '')
  const [selectedModel, setSelectedModel] = useState(searchParams.get('model') || '')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '')

  useEffect(() => {
    Promise.all([
      supabase.from('makes').select('*').order('name_en'),
      supabase.from('categories').select('*').order('name_en'),
      supabase.from('brands').select('*').order('name_en'),
    ]).then(([makesRes, catsRes, brandsRes]) => {
      if (makesRes.data) setMakes(makesRes.data)
      if (catsRes.data) setCategories(catsRes.data)
      if (brandsRes.data) setBrands(brandsRes.data)
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
    let query = supabase.from('products').select('*').eq('is_active', true).is('parent_product_id', null)

    if (selectedCategory) query = query.eq('category_id', selectedCategory)
    if (selectedBrand) query = query.eq('brand_id', selectedBrand)
    if (search) {
      applySearch(query, search)
    }

    const processResults = (data: Product[]) => {
      // Filter to only parent/standalone products (parent_product_id column not yet in DB)
      const filtered = data.filter(p => !p.parent_product_id)
      setProducts(filtered)
      setLoading(false)
    }

    if (selectedMake || selectedModel) {
      let fitQuery = supabase.from('product_fitments').select('product_id')
      if (selectedMake) fitQuery = fitQuery.eq('make_id', selectedMake)
      if (selectedModel) fitQuery = fitQuery.eq('model_id', selectedModel)
      fitQuery.then(({ data: fitData }) => {
        if (fitData && fitData.length > 0) {
          const ids = [...new Set(fitData.map(f => f.product_id))]
          query.in('id', ids).then(({ data }) => {
            if (data) processResults(data)
            else setLoading(false)
          })
        } else if (selectedMake && !selectedModel) {
          // Fallback: search product names for the make name
          const makeName = makes.find(m => m.id === selectedMake)?.name_en || ''
          query.or(`name_en.ilike.%${makeName}%,name_th.ilike.%${makeName}%`).order('created_at', { ascending: false }).limit(50).then(({ data }) => {
            if (data) processResults(data)
            else setLoading(false)
          })
        } else {
          setProducts([])
          setLoading(false)
        }
      })
      return
    }

    query.order('created_at', { ascending: false }).limit(50).then(({ data }) => {
      if (data) processResults(data)
      else setLoading(false)
    })
  }, [selectedMake, selectedModel, selectedCategory, selectedBrand, search])

  // Fetch variants for parent products
  useEffect(() => {
    const parentIds = products.filter(p => !p.parent_product_id).map(p => p.id)
    if (parentIds.length === 0) { setVariantMap({}); return }
    supabase.from('products').select('*').in('parent_product_id', parentIds).eq('is_active', true).then(({ data: vars }) => {
      if (vars) {
        const map: Record<string, Product[]> = {}
        vars.forEach(v => {
          if (v.parent_product_id) {
            if (!map[v.parent_product_id]) map[v.parent_product_id] = []
            map[v.parent_product_id].push(v)
          }
        })
        setVariantMap(map)
      }
    })
  }, [products])

  const clearFilters = () => {
    setSelectedMake(''); setSelectedModel(''); setSelectedCategory(''); setSelectedBrand(''); setSearch('')
  }
  const hasFilters = selectedMake || selectedModel || selectedCategory || selectedBrand || search

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-glass mb-6">{t('products.all', locale)}</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-glass-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('products.search', locale)}
            className="glass-input w-full pl-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="glass-card px-4 py-2.5 rounded-xl text-sm transition-all"
          style={showFilters || hasFilters ? {
            background: 'rgba(0,212,255,0.15)',
            borderColor: '#00d4ff',
            color: '#00d4ff',
          } : { color: 'rgba(255,255,255,0.7)' }}
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} />
            {t('vehicle.select', locale)}
          </div>
        </button>
      </div>

      {showFilters && (
        <div className="glass rounded-xl p-4 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-glass-secondary mb-1 block">{t('vehicle.make', locale)}</label>
              <select value={selectedMake}
                onChange={(e) => { setSelectedMake(e.target.value); setSelectedModel('') }}
                className="glass-input w-full">
                <option value="">-- {t('vehicle.make', locale)} --</option>
                {makes.map((m) => (
                  <option key={m.id} value={m.id}>{locale === 'th' ? (m.name_th || m.name_en) : m.name_en}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-glass-secondary mb-1 block">{t('vehicle.model', locale)} <span className="opacity-50">({locale === 'th' ? 'ไม่จำเป็น' : 'optional'})</span></label>
              <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}
                className="glass-input w-full" disabled={!selectedMake}>
                <option value="">-- {locale === 'th' ? 'ทั้งหมด' : 'All Models'} --</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.year_start}{m.year_end ? `-${m.year_end}` : '+'})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-glass-secondary mb-1 block">{locale === 'th' ? 'แบรนด์' : 'Brand'}</label>
              <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}
                className="glass-input w-full">
                <option value="">{locale === 'th' ? 'ทั้งหมด' : 'All'}</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{locale === 'th' ? (b.name_th || b.name_en) : b.name_en}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-glass-secondary mb-1 block">{t('products.category', locale)}</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                className="glass-input w-full">
                <option value="">{locale === 'th' ? 'ทั้งหมด' : 'All'}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{locale === 'th' ? c.name_th : c.name_en}</option>
                ))}
              </select>
            </div>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-3 text-xs text-glass-muted hover:text-white flex items-center gap-1 transition">
              <X size={14} /> {t('vehicle.clear', locale)}
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-glass-muted">{t('common.loading', locale)}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-glass-muted">{t('products.no_results', locale)}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} variants={variantMap[product.id] || []} />
          ))}
        </div>
      )}
    </div>
  )
}

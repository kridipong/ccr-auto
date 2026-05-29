'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n/locale-provider'
import { t } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/types'
import { Plus, Edit, Trash2, Search, Upload, Download, X, Square, CheckSquare } from 'lucide-react'
import * as XLSX from 'xlsx'
import { applySearch } from '@/lib/search-dictionary'

const supabase = createClient()

export default function AdminProducts() {
  const { locale } = useLocale()
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadProducts()
  }, [search])

  const loadProducts = async () => {
    setLoading(true)
    let query = supabase.from('products').select('*').order('created_at', { ascending: false })
    if (search) {
      query = applySearch(query, search)
    }
    const { data } = await query
    if (data) {
      setProducts(data)
      // Clear selection when search/filter changes
      setSelected(new Set())
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.confirm_delete', locale))) return
    // Clean up fitments first
    await supabase.from('product_fitments').delete().eq('product_id', id)
    await supabase.from('products').delete().eq('id', id)
    loadProducts()
  }

  const handleBatchDelete = async () => {
    const count = selected.size
    const msg = locale === 'th'
      ? `คุณแน่ใจหรือไม่ที่จะลบ ${count} รายการ? การกระทำนี้ไม่สามารถยกเลิกได้`
      : `Are you sure you want to delete ${count} items? This cannot be undone.`
    if (!confirm(msg)) return

    const ids = Array.from(selected)
    // Clean up fitments first
    await supabase.from('product_fitments').delete().in('product_id', ids)
    await supabase.from('products').delete().in('id', ids)
    setSelected(new Set())
    loadProducts()
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === products.length && products.length > 0) {
      setSelected(new Set())
    } else {
      setSelected(new Set(products.map(p => p.id)))
    }
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('products').update({ is_active: !current }).eq('id', id)
    loadProducts()
  }

  const exportToExcel = async () => {
    let query = supabase.from('products').select('*').order('created_at', { ascending: false })
    if (search) {
      query = query.or(`name_th.ilike.%${search}%,name_en.ilike.%${search}%,sku.ilike.%${search}%`)
    }
    const { data: allProducts } = await query
    if (!allProducts || allProducts.length === 0) {
      alert(locale === 'th' ? 'ไม่มีสินค้าให้ส่งออก' : 'No products to export')
      return
    }

    const productIds = allProducts.map(p => p.id)
    const [cats, brands, fits, makes, models] = await Promise.all([
      supabase.from('categories').select('id, slug'),
      supabase.from('brands').select('id, slug'),
      supabase.from('product_fitments').select('*').in('product_id', productIds),
      supabase.from('makes').select('id, name_en'),
      supabase.from('models').select('id, name'),
    ])

    const catMap = new Map((cats.data || []).map(c => [c.id, c.slug]))
    const brandMap = new Map((brands.data || []).map(b => [b.id, b.slug]))
    const makeMap = new Map((makes.data || []).map(m => [m.id, m.name_en]))
    const modelMap = new Map((models.data || []).map(m => [m.id, m.name]))
    const fitMap = new Map<string, any[]>()
    ;(fits.data || []).forEach(f => {
      if (!fitMap.has(f.product_id)) fitMap.set(f.product_id, [])
      fitMap.get(f.product_id)!.push(f)
    })

    const rows = allProducts.map(p => {
      const fit = fitMap.get(p.id)?.[0]
      return {
        sku: p.sku,
        name_th: p.name_th,
        name_en: p.name_en,
        description_th: p.description_th || '',
        description_en: p.description_en || '',
        price: p.price,
        compare_price: p.compare_price || '',
        stock: p.stock,
        category_slug: catMap.get(p.category_id) || '',
        brand_slug: brandMap.get(p.brand_id) || '',
        make_name: makeMap.get(fit?.make_id) || '',
        model_name: modelMap.get(fit?.model_id) || fit?.model_name || '',
        year_start: fit?.year_start || '',
        year_end: fit?.year_end || '',
        engine: fit?.engine || '',
        image_urls: (p.images || []).join('|'),
      }
    })

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Products')
    XLSX.writeFile(wb, `ccrauto-products-export${search ? '-' + search.replace(/\s+/g, '-') : ''}.xlsx`)
  }

  const name = (p: Product) => locale === 'th' ? p.name_th : p.name_en
  const isAllSelected = products.length > 0 && selected.size === products.length

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('products.search', locale)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/admin/products/new`}
            className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            <Plus size={16} /> {t('admin.product_add', locale)}
          </Link>
          <Link
            href={`/${locale}/admin/products/import`}
            className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
          >
            <Upload size={16} /> {locale === 'th' ? 'นำเข้า' : 'Import'}
          </Link>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700"
          >
            <Download size={16} /> {locale === 'th' ? 'ส่งออก' : 'Export'}
          </button>
        </div>
      </div>

      {/* Batch action bar — only shown when items selected */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between bg-blue-600 text-white px-4 py-2.5 rounded-xl mb-3 shadow-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelected(new Set())}
              className="p-1 hover:bg-blue-500 rounded"
            >
              <X size={18} />
            </button>
            <span className="text-sm font-medium">
              {locale === 'th'
                ? `เลือก ${selected.size} รายการ`
                : `${selected.size} selected`}
            </span>
          </div>
          <button
            onClick={handleBatchDelete}
            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Trash2 size={15} />
            {locale === 'th' ? `ลบ ${selected.size} รายการ` : `Delete ${selected.size}`}
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="w-10 p-3">
                <button
                  onClick={toggleSelectAll}
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {isAllSelected ? (
                    <CheckSquare size={16} className="text-blue-600" />
                  ) : (
                    <Square size={16} />
                  )}
                </button>
              </th>
              <th className="text-left p-3">{t('products.sku', locale)}</th>
              <th className="text-left p-3">{locale === 'th' ? 'ชื่อสินค้า' : 'Name'}</th>
              <th className="text-right p-3">{t('products.price', locale)}</th>
              <th className="text-center p-3">{t('products.stock', locale)}</th>
              <th className="text-center p-3">{locale === 'th' ? 'แสดง' : 'Active'}</th>
              <th className="text-center p-3">{t('admin.edit', locale)}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-6 text-center text-gray-400">{t('common.loading', locale)}</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-gray-400">{t('products.no_results', locale)}</td></tr>
            ) : products.map((product) => (
              <tr
                key={product.id}
                className={`border-t transition-colors ${
                  selected.has(product.id)
                    ? 'bg-blue-50 hover:bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                {/* Checkbox */}
                <td className="p-3">
                  <button
                    onClick={() => toggleSelect(product.id)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    {selected.has(product.id) ? (
                      <CheckSquare size={16} className="text-blue-600" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </td>
                <td className="p-3 text-gray-500">{product.sku}</td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {product.images?.[0] && (
                      <img src={product.images[0]} alt="" className="w-10 h-10 rounded object-cover bg-gray-100" />
                    )}
                    <span className="font-medium text-gray-800 truncate max-w-[200px]">{name(product)}</span>
                  </div>
                </td>
                <td className="p-3 text-right font-medium">฿{Number(product.price).toLocaleString()}</td>
                <td className="p-3 text-center">{product.stock}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => toggleActive(product.id, product.is_active)}
                    className={`px-2 py-0.5 rounded text-xs ${
                      product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {product.is_active ? 'ON' : 'OFF'}
                  </button>
                </td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/${locale}/admin/products/${product.id}`}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"
                    >
                      <Edit size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-1.5 text-red-400 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

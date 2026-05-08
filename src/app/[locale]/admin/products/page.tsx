'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n/locale-provider'
import { t } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/types'
import { Plus, Edit, Trash2, Search } from 'lucide-react'

const supabase = createClient()

export default function AdminProducts() {
  const { locale } = useLocale()
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    let query = supabase.from('products').select('*').order('created_at', { ascending: false })
    if (search) {
      query = query.or(`name_th.ilike.%${search}%,name_en.ilike.%${search}%,sku.ilike.%${search}%`)
    }
    const { data } = await query
    if (data) setProducts(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.confirm_delete', locale))) return
    await supabase.from('products').delete().eq('id', id)
    loadProducts()
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('products').update({ is_active: !current }).eq('id', id)
    loadProducts()
  }

  const name = (p: Product) => locale === 'th' ? p.name_th : p.name_en

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
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
        <Link
          href={`/${locale}/admin/products/new`}
          className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          <Plus size={16} /> {t('admin.product_add', locale)}
        </Link>
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
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
              <tr><td colSpan={6} className="p-6 text-center text-gray-400">{t('common.loading', locale)}</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-400">{t('products.no_results', locale)}</td></tr>
            ) : products.map((product) => (
              <tr key={product.id} className="border-t hover:bg-gray-50">
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

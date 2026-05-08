'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLocale } from '@/lib/i18n/locale-provider'
import { t } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import type { Make, Model, Category, Product } from '@/lib/types'
import { Upload, Plus, X } from 'lucide-react'

const supabase = createClient()

interface FitmentRow {
  make_id: string
  model_id: string
  year_start: number
  year_end: number | null
  engine: string
}

export default function ProductForm() {
  const { locale } = useLocale()
  const params = useParams()
  const router = useRouter()
  const isNew = params.id === 'new'

  const [makes, setMakes] = useState<Make[]>([])
  const [models, setModels] = useState<{ [key: string]: Model[] }>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    sku: '', name_th: '', name_en: '',
    description_th: '', description_en: '',
    price: '', compare_price: '', stock: '0',
    category_id: '', is_active: true,
  })
  const [fitments, setFitments] = useState<FitmentRow[]>([])
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    Promise.all([
      supabase.from('makes').select('*').order('name_en'),
      supabase.from('categories').select('*').order('name_en'),
    ]).then(([m, c]) => {
      if (m.data) setMakes(m.data)
      if (c.data) setCategories(c.data)
    })

    if (!isNew) {
      supabase.from('products').select('*').eq('id', params.id).single().then(({ data }) => {
        if (data) {
          setForm({
            sku: data.sku,
            name_th: data.name_th,
            name_en: data.name_en,
            description_th: data.description_th || '',
            description_en: data.description_en || '',
            price: String(data.price),
            compare_price: data.compare_price ? String(data.compare_price) : '',
            stock: String(data.stock),
            category_id: data.category_id || '',
            is_active: data.is_active,
          })
          setImages(data.images || [])
        }
      })
      supabase.from('product_fitments').select('*').eq('product_id', params.id).then(({ data }) => {
        if (data) setFitments(data.map(f => ({
          make_id: f.make_id,
          model_id: f.model_id,
          year_start: f.year_start,
          year_end: f.year_end,
          engine: f.engine || '',
        })))
      })
    }
  }, [params.id])

  const loadModels = async (makeId: string) => {
    if (!models[makeId]) {
      const { data } = await supabase.from('models').select('*').eq('make_id', makeId).order('name')
      if (data) setModels(prev => ({ ...prev, [makeId]: data }))
    }
  }

  const addFitment = () => {
    setFitments([...fitments, { make_id: '', model_id: '', year_start: 2020, year_end: null, engine: '' }])
  }

  const updateFitment = (index: number, field: string, value: any) => {
    const updated = [...fitments]
    updated[index] = { ...updated[index], [field]: value }
    if (field === 'make_id') {
      updated[index].model_id = ''
      loadModels(value)
    }
    setFitments(updated)
  }

  const removeFitment = (index: number) => {
    setFitments(fitments.filter((_, i) => i !== index))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    for (const file of Array.from(files)) {
      const { data } = await supabase.storage.from('product-images').upload(
        `products/${Date.now()}-${file.name}`, file
      )
      if (data) {
        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${data.path}`
        setImages(prev => [...prev, url])
      }
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const productData = {
      sku: form.sku,
      name_th: form.name_th,
      name_en: form.name_en,
      description_th: form.description_th,
      description_en: form.description_en,
      price: parseFloat(form.price),
      compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
      stock: parseInt(form.stock),
      category_id: form.category_id || null,
      images,
      is_active: form.is_active,
    }

    if (isNew) {
      const { data, error } = await supabase.from('products').insert(productData).select().single()
      if (error) { alert(error.message); setSaving(false); return }
      // Save fitments
      if (data && fitments.length > 0) {
        await supabase.from('product_fitments').insert(
          fitments.map(f => ({ ...f, product_id: data.id }))
        )
      }
      router.push(`/${locale}/admin/products`)
    } else {
      const { error } = await supabase.from('products').update(productData).eq('id', params.id)
      if (error) { alert(error.message); setSaving(false); return }
      // Update fitments
      await supabase.from('product_fitments').delete().eq('product_id', params.id)
      if (fitments.length > 0) {
        await supabase.from('product_fitments').insert(
          fitments.map(f => ({ ...f, product_id: params.id }))
        )
      }
      router.push(`/${locale}/admin/products`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm text-gray-500 mb-1 block">SKU *</label>
          <input
            type="text" value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <div>
          <label className="text-sm text-gray-500 mb-1 block">{locale === 'th' ? 'หมวดหมู่' : 'Category'}</label>
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">--</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{locale === 'th' ? c.name_th : c.name_en}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-500 mb-1 block">{t('admin.name_th', locale)} *</label>
          <input
            type="text" value={form.name_th}
            onChange={(e) => setForm({ ...form, name_th: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <div>
          <label className="text-sm text-gray-500 mb-1 block">{t('admin.name_en', locale)} *</label>
          <input
            type="text" value={form.name_en}
            onChange={(e) => setForm({ ...form, name_en: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <div>
          <label className="text-sm text-gray-500 mb-1 block">{t('admin.desc_th', locale)}</label>
          <textarea
            value={form.description_th}
            onChange={(e) => setForm({ ...form, description_th: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20"
          />
        </div>
        <div>
          <label className="text-sm text-gray-500 mb-1 block">{t('admin.desc_en', locale)}</label>
          <textarea
            value={form.description_en}
            onChange={(e) => setForm({ ...form, description_en: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20"
          />
        </div>
        <div>
          <label className="text-sm text-gray-500 mb-1 block">{t('products.price', locale)} *</label>
          <input
            type="number" step="0.01" value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <div>
          <label className="text-sm text-gray-500 mb-1 block">{t('products.compare_price', locale)}</label>
          <input
            type="number" step="0.01" value={form.compare_price}
            onChange={(e) => setForm({ ...form, compare_price: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-gray-500 mb-1 block">{t('products.stock', locale)}</label>
          <input
            type="number" value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Images */}
      <div className="mb-6">
        <label className="text-sm text-gray-500 mb-2 block">{t('admin.images', locale)}</label>
        <div className="flex gap-3 flex-wrap mb-3">
          {images.map((img, i) => (
            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeImage(i)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <label className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer text-sm text-gray-600 hover:bg-gray-50">
          <Upload size={16} /> {locale === 'th' ? 'อัปโหลดรูป' : 'Upload Images'}
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
        </label>
      </div>

      {/* Fitments */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-gray-500">{t('admin.fitment', locale)}</label>
          <button type="button" onClick={addFitment} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            <Plus size={14} /> {t('admin.add_fitment', locale)}
          </button>
        </div>
        {fitments.map((fit, i) => (
          <div key={i} className="flex gap-2 mb-2 items-start">
            <select
              value={fit.make_id}
              onChange={(e) => updateFitment(i, 'make_id', e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">{t('vehicle.make', locale)}</option>
              {makes.map(m => (
                <option key={m.id} value={m.id}>{m.name_en}</option>
              ))}
            </select>
            <select
              value={fit.model_id}
              onChange={(e) => updateFitment(i, 'model_id', e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">{t('vehicle.model', locale)}</option>
              {(models[fit.make_id] || []).map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <input
              type="number" placeholder={locale === 'th' ? 'ปีเริ่ม' : 'Year from'}
              value={fit.year_start}
              onChange={(e) => updateFitment(i, 'year_start', parseInt(e.target.value))}
              className="w-20 px-2 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="text" placeholder={locale === 'th' ? 'เครื่อง' : 'Engine'}
              value={fit.engine}
              onChange={(e) => updateFitment(i, 'engine', e.target.value)}
              className="w-24 px-2 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button type="button" onClick={() => removeFitment(i)} className="p-2 text-red-400 hover:text-red-600">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300">
          {saving ? t('common.loading', locale) : t('admin.save', locale)}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-6 py-2.5 border rounded-lg text-gray-600 hover:bg-gray-50">
          {t('admin.cancel', locale)}
        </button>
      </div>
    </form>
  )
}

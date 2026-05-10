'use client'

import { useEffect, useState, useRef } from 'react'
import { useLocale } from '@/lib/i18n/locale-provider'
import { t } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import type { Brand } from '@/lib/types'
import { Plus, Trash2, Edit3, Upload, X, Loader } from 'lucide-react'
import { uploadImage } from '@/lib/cloudinary'

const supabase = createClient()

export default function AdminBrands() {
  const { locale } = useLocale()
  const [brands, setBrands] = useState<Brand[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name_th: '', name_en: '', slug: '', description: '' })
  const [logo, setLogo] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadBrands() }, [])

  const loadBrands = async () => {
    const { data } = await supabase.from('brands').select('*').order('name_en')
    if (data) setBrands(data)
  }

  const openNew = () => {
    setEditingId(null)
    setForm({ name_th: '', name_en: '', slug: '', description: '' })
    setLogo(null)
    setLogoFile(null)
    setShowForm(true)
  }

  const openEdit = (brand: Brand) => {
    setEditingId(brand.id)
    setForm({ name_th: brand.name_th, name_en: brand.name_en, slug: brand.slug, description: brand.description || '' })
    setLogo(brand.logo_url)
    setLogoFile(null)
    setShowForm(true)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogo(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!form.name_en || !form.slug) return
    setSaving(true)

    let logo_url = logo

    // Upload new logo if changed
    if (logoFile) {
      setUploadingLogo(true)
      const result = await uploadImage(logoFile)
      if (result) {
        logo_url = result.url
      }
      setUploadingLogo(false)
    }

    const brandData = { ...form, logo_url }

    if (editingId) {
      await supabase.from('brands').update(brandData).eq('id', editingId)
    } else {
      await supabase.from('brands').insert(brandData)
    }

    setSaving(false)
    setShowForm(false)
    loadBrands()
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.confirm_delete', locale))) return
    await supabase.from('brands').delete().eq('id', id)
    loadBrands()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {locale === 'th' ? 'แบรนด์สินค้า' : 'Product Brands'}
        </h2>
        <button
          onClick={openNew}
          className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          <Plus size={16} /> {t('admin.brand_add', locale)}
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">
                {editingId ? t('admin.brand_edit', locale) : t('admin.brand_add', locale)}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">{t('admin.name_en', locale)} *</label>
                <input type="text" value={form.name_en}
                  onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">{t('admin.name_th', locale)}</label>
                <input type="text" value={form.name_th}
                  onChange={(e) => setForm({ ...form, name_th: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">{locale === 'th' ? 'Slug' : 'Slug'} *</label>
                <input type="text" value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">{locale === 'th' ? 'คำอธิบาย' : 'Description'}</label>
                <textarea value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none h-20" />
              </div>

              {/* Logo */}
              <div>
                <label className="text-sm text-gray-500 mb-2 block">{t('admin.brand_logo', locale)}</label>
                {logo && (
                  <div className="mb-2">
                    <img src={logo} alt="logo preview" className="h-16 w-auto object-contain border rounded-lg p-2" />
                  </div>
                )}
                <label className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer text-sm text-gray-600 hover:bg-gray-50 ${uploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}>
                  {uploadingLogo ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />}
                  {locale === 'th' ? 'อัปโหลดโลโก้' : 'Upload Logo'}
                  <input type="file" ref={fileRef} accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploadingLogo} />
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300">
                  {saving ? t('common.loading', locale) : t('admin.save', locale)}
                </button>
                <button onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 border rounded-lg text-gray-600 hover:bg-gray-50">
                  {t('admin.cancel', locale)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Brands List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {brands.map((brand) => (
          <div key={brand.id} className="bg-white border rounded-xl p-4 flex items-center gap-4">
            {brand.logo_url ? (
              <img src={brand.logo_url} alt={brand.name_en} className="w-14 h-14 object-contain rounded-lg border p-1.5" />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold">
                {brand.name_en?.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">{locale === 'th' ? (brand.name_th || brand.name_en) : brand.name_en}</p>
              <p className="text-xs text-gray-400 truncate">/{brand.slug}</p>
              {brand.description && (
                <p className="text-xs text-gray-500 truncate mt-0.5">{brand.description}</p>
              )}
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => openEdit(brand)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Edit3 size={15} /></button>
              <button onClick={() => handleDelete(brand.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
        {brands.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400 text-sm">
            {locale === 'th' ? 'ยังไม่มีแบรนด์' : 'No brands yet'}
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useLocale } from '@/lib/i18n/locale-provider'
import { createClient } from '@/lib/supabase/client'
import type { Make, Model } from '@/lib/types'
import { Plus, Trash2, ChevronDown, ChevronRight, Upload } from 'lucide-react'
import Link from 'next/link'

const supabase = createClient()

export default function AdminVehicles() {
  const { locale } = useLocale()
  const [makes, setMakes] = useState<(Make & { models: Model[] })[]>([])
  const [newMake, setNewMake] = useState({ name_th: '', name_en: '' })
  const [newModel, setNewModel] = useState({ make_id: '', name: '', year_start: 2020, year_end: '' })
  const [expandedMakes, setExpandedMakes] = useState<Set<string>>(new Set())

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const { data: makesData } = await supabase.from('makes').select('*').order('name_en')
    const { data: modelsData } = await supabase.from('models').select('*').order('name')
    if (makesData && modelsData) {
      setMakes(makesData.map(m => ({
        ...m,
        models: modelsData.filter(mod => mod.make_id === m.id),
      })))
    }
  }

  const addMake = async () => {
    if (!newMake.name_en) return
    await supabase.from('makes').insert(newMake)
    setNewMake({ name_th: '', name_en: '' })
    loadData()
  }

  const deleteMake = async (id: string) => {
    if (!confirm(locale === 'th' ? 'ลบยี่ห้อนี้?' : 'Delete this make?')) return
    await supabase.from('makes').delete().eq('id', id)
    loadData()
  }

  const addModel = async () => {
    if (!newModel.make_id || !newModel.name) return
    await supabase.from('models').insert({
      make_id: newModel.make_id,
      name: newModel.name,
      year_start: newModel.year_start,
      year_end: newModel.year_end ? parseInt(newModel.year_end) : null,
    })
    setNewModel({ make_id: '', name: '', year_start: 2020, year_end: '' })
    loadData()
  }

  const deleteModel = async (id: string) => {
    await supabase.from('models').delete().eq('id', id)
    loadData()
  }

  const toggleExpand = (id: string) => {
    const next = new Set(expandedMakes)
    next.has(id) ? next.delete(id) : next.add(id)
    setExpandedMakes(next)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Makes */}
      <div>
        <h2 className="font-semibold text-gray-700 mb-3">{locale === 'th' ? 'ยี่ห้อรถ' : 'Makes'}</h2>
        <div className="flex items-center gap-2 mb-4">
          <Link href={`/${locale}/admin/vehicles/import`} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
            <Upload size={12} /> {locale === 'th' ? 'นำเข้า Excel' : 'Import Excel'}
          </Link>
        </div>
        <div className="flex gap-2 mb-4">
          <input type="text" placeholder={locale === 'th' ? 'ชื่อไทย' : 'Thai name'} value={newMake.name_th}
            onChange={(e) => setNewMake({ ...newMake, name_th: e.target.value })}
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          <input type="text" placeholder={locale === 'th' ? 'ชื่ออังกฤษ' : 'English name'} value={newMake.name_en}
            onChange={(e) => setNewMake({ ...newMake, name_en: e.target.value })}
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          <button onClick={addMake} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus size={18} /></button>
        </div>

        <div className="space-y-1">
          {makes.map((m) => (
            <div key={m.id} className="bg-white border rounded-lg">
              <button onClick={() => toggleExpand(m.id)} className="w-full flex items-center justify-between p-3 text-sm hover:bg-gray-50">
                <span className="font-medium">{locale === 'th' ? (m.name_th || m.name_en) : m.name_en}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs">{m.models.length} models</span>
                  {expandedMakes.has(m.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
              </button>
              {expandedMakes.has(m.id) && (
                <div className="px-3 pb-3">
                  <div className="flex gap-2 mb-2">
                    <input type="text" placeholder={locale === 'th' ? 'รุ่น' : 'Model name'}
                      value={newModel.make_id === m.id ? newModel.name : ''}
                      onChange={(e) => setNewModel({ ...newModel, make_id: m.id, name: e.target.value })}
                      className="flex-1 px-2 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    <input type="number" placeholder={locale === 'th' ? 'ปีเริ่ม' : 'Year'} value={newModel.make_id === m.id ? newModel.year_start : 2020}
                      onChange={(e) => setNewModel({ ...newModel, make_id: m.id, year_start: parseInt(e.target.value) })}
                      className="w-16 px-2 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    <button onClick={addModel} className="px-2 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"><Plus size={14} /></button>
                  </div>
                  {m.models.length === 0 ? (
                    <p className="text-xs text-gray-400">{locale === 'th' ? 'ยังไม่มีรุ่นรถ' : 'No models yet'}</p>
                  ) : m.models.map((mod) => (
                    <div key={mod.id} className="flex items-center justify-between py-1.5 text-sm border-b last:border-0">
                      <span>{mod.name} ({mod.year_start}{mod.year_end ? `-${mod.year_end}` : '+'})</span>
                      <button onClick={() => deleteModel(mod.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="font-semibold text-gray-700 mb-3">{locale === 'th' ? 'หมวดหมู่' : 'Categories'}</h2>
        <div className="flex items-center gap-2 mb-4">
          <Link href={`/${locale}/admin/categories/import`} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
            <Upload size={12} /> {locale === 'th' ? 'นำเข้า Excel' : 'Import Excel'}
          </Link>
        </div>
        <CategoriesManager />
      </div>
    </div>
  )
}

function CategoriesManager() {
  const { locale } = useLocale()
  const [categories, setCategories] = useState<any[]>([])
  const [newCat, setNewCat] = useState({ name_th: '', name_en: '', slug: '' })

  useEffect(() => {
    supabase.from('categories').select('*').order('name_en').then(({ data }) => {
      if (data) setCategories(data)
    })
  }, [])

  const addCat = async () => {
    if (!newCat.name_en || !newCat.slug) return
    await supabase.from('categories').insert(newCat)
    setNewCat({ name_th: '', name_en: '', slug: '' })
    const { data } = await supabase.from('categories').select('*').order('name_en')
    if (data) setCategories(data)
  }

  const deleteCat = async (id: string) => {
    await supabase.from('categories').delete().eq('id', id)
    const { data } = await supabase.from('categories').select('*').order('name_en')
    if (data) setCategories(data)
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input type="text" placeholder={locale === 'th' ? 'ชื่อไทย' : 'Thai name'} value={newCat.name_th}
          onChange={(e) => setNewCat({ ...newCat, name_th: e.target.value })}
          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        <input type="text" placeholder="English name" value={newCat.name_en}
          onChange={(e) => setNewCat({ ...newCat, name_en: e.target.value })}
          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        <input type="text" placeholder="slug" value={newCat.slug}
          onChange={(e) => setNewCat({ ...newCat, slug: e.target.value })}
          className="w-24 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        <button onClick={addCat} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus size={18} /></button>
      </div>
      <div className="space-y-1">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between bg-white border rounded-lg p-3">
            <div>
              <span className="font-medium">{locale === 'th' ? c.name_th : c.name_en}</span>
              <span className="text-gray-400 text-xs ml-2">/{c.slug}</span>
            </div>
            <button onClick={() => deleteCat(c.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  )
}

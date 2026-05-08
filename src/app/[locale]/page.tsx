'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n/locale-provider'
import { t } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import type { Make, Model, Product } from '@/lib/types'
import { Search, Car, ArrowRight, Star, Truck, Shield, RotateCcw } from 'lucide-react'
import ProductCard from '@/components/products/ProductCard'

const supabase = createClient()

export default function HomePage() {
  const { locale } = useLocale()
  const [makes, setMakes] = useState<Make[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [selectedMake, setSelectedMake] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])

  useEffect(() => {
    supabase.from('makes').select('*').order('name_en').then(({ data }) => {
      if (data) setMakes(data)
    })
    supabase.from('products').select('*').eq('is_active', true).limit(8).then(({ data }) => {
      if (data) setFeaturedProducts(data)
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

  const makeName = (m: Make) => locale === 'th' ? (m.name_th || m.name_en) : m.name_en

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {locale === 'th' ? 'CCRAUTO อะไหล่แท้ ราคาโดนใจ' : 'CCRAUTO - Quality Auto Parts'}
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              {locale === 'th'
                ? 'ค้นหาอะไหล่รถยนต์ที่ใช่สำหรับคุณ เลือกตามยี่ห้อ รุ่น และปีรถของคุณ'
                : 'Find the right parts for your vehicle. Search by make, model, and year.'}
            </p>
          </div>

          {/* Vehicle Selector */}
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl mx-auto">
            <h2 className="text-gray-800 font-semibold mb-4 flex items-center gap-2">
              <Car size={20} className="text-blue-600" />
              {t('vehicle.select', locale)}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={selectedMake}
                onChange={(e) => { setSelectedMake(e.target.value); setSelectedModel('') }}
                className="w-full px-4 py-3 border rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">-- {t('vehicle.make', locale)} --</option>
                {makes.map((m) => (
                  <option key={m.id} value={m.id}>{makeName(m)}</option>
                ))}
              </select>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={!selectedMake}
              >
                <option value="">-- {t('vehicle.model', locale)} --</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.year_start}{m.year_end ? `-${m.year_end}` : '+'})
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 flex gap-3">
              <Link
                href={
                  selectedMake && selectedModel
                    ? `/${locale}/products?make=${selectedMake}&model=${selectedModel}`
                    : selectedMake
                    ? `/${locale}/products?make=${selectedMake}`
                    : `/${locale}/products`
                }
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-center"
              >
                {t('vehicle.search', locale)} <ArrowRight size={18} className="inline ml-1" />
              </Link>
              <Link
                href={`/${locale}/products`}
                className="px-6 py-3 border-2 border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition text-center"
              >
                {t('vehicle.browse', locale)}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Truck, title_th: 'จัดส่งทั่วประเทศ', title_en: 'Delivery Nationwide', desc_th: 'จัดส่งไว บรรจุอย่างดี', desc_en: 'Fast & secure shipping' },
            { icon: Shield, title_th: 'อะไหล่คุณภาพ', title_en: 'Quality Parts', desc_th: 'ได้มาตรฐาน รับประกันสินค้า', desc_en: 'Certified & guaranteed' },
            { icon: RotateCcw, title_th: 'เปลี่ยนคืนได้', title_en: 'Easy Returns', desc_th: 'ไม่ถูกใจเปลี่ยนคืนภายใน 7 วัน', desc_en: '7-day return policy' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <item.icon size={24} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">
                {locale === 'th' ? item.title_th : item.title_en}
              </h3>
              <p className="text-sm text-gray-500">{locale === 'th' ? item.desc_th : item.desc_en}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {locale === 'th' ? 'สินค้าแนะนำ' : 'Featured Products'}
            </h2>
            <Link href={`/${locale}/products`} className="text-blue-600 hover:underline flex items-center gap-1">
              {locale === 'th' ? 'ดูทั้งหมด' : 'View All'} <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* Brands */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
          {locale === 'th' ? 'ยี่ห้อรถยนต์ที่เราให้บริการ' : 'Vehicle Makes We Serve'}
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {makes.map((m) => (
            <Link
              key={m.id}
              href={`/${locale}/products?make=${m.id}`}
              className="bg-white border rounded-xl px-6 py-3 text-gray-700 hover:border-blue-300 hover:text-blue-600 transition shadow-sm"
            >
              {makeName(m)}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

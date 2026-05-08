'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n/locale-provider'
import { t } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import type { Make, Model, Product } from '@/lib/types'
import { Search, Car, ArrowRight, Truck, Shield, RotateCcw, ChevronDown } from 'lucide-react'
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
      {/* Hero Section */}
      <section className="hero-gradient text-white overflow-hidden relative">
        {/* Decorative circles */}
        <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full opacity-10" style={{ background: '#e63946' }} />
        <div className="absolute bottom-[-50px] left-[-50px] w-[300px] h-[300px] rounded-full opacity-10" style={{ background: '#457b9d' }} />

        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20 relative z-10">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src="/logo.png" alt="CCRAUTO" className="h-14 w-14 md:h-20 md:w-20 object-contain rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <div className="text-left">
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                  CCR<span style={{ color: '#e63946' }}>AUTO</span>
                </h1>
                <p className="text-sm md:text-base opacity-80 mt-1">
                  {locale === 'th' ? 'อะไหล่แท้ ราคาโดนใจ ส่งไวทั่วประเทศ' : 'Quality Auto Parts, Delivered Fast'}
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle Selector */}
          <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/20">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Car size={20} />
              {t('vehicle.select', locale)}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={selectedMake}
                onChange={(e) => { setSelectedMake(e.target.value); setSelectedModel('') }}
                className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none cursor-pointer"
                style={{ backgroundColor: 'rgba(255,255,255,0.95)', color: '#1a1a2e' }}
              >
                <option value="">-- {t('vehicle.make', locale)} --</option>
                {makes.map((m) => (
                  <option key={m.id} value={m.id}>{makeName(m)}</option>
                ))}
              </select>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none cursor-pointer"
                style={{ backgroundColor: 'rgba(255,255,255,0.95)', color: '#1a1a2e' }}
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
                className="flex-1 py-3 rounded-xl font-semibold text-white text-center flex items-center justify-center gap-2 transition hover:translate-y-[-1px]"
                style={{ background: 'linear-gradient(135deg, #e63946, #c1121f)' }}
              >
                <Search size={18} />
                {t('vehicle.search', locale)}
              </Link>
              <Link
                href={`/${locale}/products`}
                className="px-6 py-3 rounded-xl font-medium text-center transition border border-white/30 hover:bg-white/10"
              >
                {t('vehicle.browse', locale)}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Truck, title_th: 'จัดส่งทั่วประเทศ', title_en: 'Delivery Nationwide', desc_th: 'จัดส่งไว บรรจุอย่างดี', desc_en: 'Fast & secure shipping everywhere', color: '#457b9d' },
            { icon: Shield, title_th: 'อะไหล่คุณภาพสูง', title_en: 'Premium Quality', desc_th: 'ได้มาตรฐาน รับประกันสินค้า', desc_en: 'Certified parts with warranty', color: '#2d6a4f' },
            { icon: RotateCcw, title_th: 'เปลี่ยนคืนได้', title_en: 'Easy Returns', desc_th: 'ไม่ถูกใจเปลี่ยนคืนภายใน 7 วัน', desc_en: '7-day hassle-free return policy', color: '#e63946' },
          ].map((item, i) => (
            <div key={i} className="card card-shadow flex items-center gap-4 p-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: item.color + '15' }}>
                <item.icon size={22} style={{ color: item.color }} />
              </div>
              <div>
                <h3 className="font-semibold text-sm" style={{ color: '#1a1a2e' }}>
                  {locale === 'th' ? item.title_th : item.title_en}
                </h3>
                <p className="text-xs" style={{ color: '#6c757d' }}>{locale === 'th' ? item.desc_th : item.desc_en}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold" style={{ color: '#1a1a2e' }}>
                {locale === 'th' ? 'สินค้าแนะนำ' : 'Featured Products'}
              </h2>
              <p className="text-sm mt-1" style={{ color: '#6c757d' }}>
                {locale === 'th' ? 'สินค้าขายดีและมาแรง' : 'Top selling and trending parts'}
              </p>
            </div>
            <Link
              href={`/${locale}/products`}
              className="flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-lg transition hover:translate-x-1"
              style={{ color: '#e63946', backgroundColor: '#fff5f5' }}
            >
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
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold" style={{ color: '#1a1a2e' }}>
            {locale === 'th' ? 'ยี่ห้อรถยนต์ที่เราให้บริการ' : 'Vehicle Makes We Serve'}
          </h2>
          <p className="text-sm mt-1" style={{ color: '#6c757d' }}>
            {locale === 'th' ? 'เลือกตามยี่ห้อที่คุณใช้' : 'Select your vehicle make'}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {makes.map((m) => (
            <Link
              key={m.id}
              href={`/${locale}/products?make=${m.id}`}
              className="px-6 py-3 rounded-xl font-medium text-sm border transition hover:translate-y-[-2px]"
              style={{
                color: '#1a1a2e',
                borderColor: '#dee2e6',
                backgroundColor: 'white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = '#e63946'; e.currentTarget.style.color = '#e63946'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = '#dee2e6'; e.currentTarget.style.color = '#1a1a2e'; }}
            >
              {makeName(m)}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

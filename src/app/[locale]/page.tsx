'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n/locale-provider'
import { t } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import type { Make, Model, Brand, Product } from '@/lib/types'
import { Search, Car, ArrowRight, Truck, Shield, RotateCcw, Award } from 'lucide-react'
import ProductCard from '@/components/products/ProductCard'

const supabase = createClient()

export default function HomePage() {
  const { locale } = useLocale()
  const [makes, setMakes] = useState<Make[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [selectedMake, setSelectedMake] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [brands, setBrands] = useState<Brand[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])

  useEffect(() => {
    supabase.from('makes').select('*').order('name_en').then(({ data }) => {
      if (data) setMakes(data)
    })
    supabase.from('brands').select('*').order('name_en').then(({ data }) => {
      if (data) setBrands(data)
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
      {/* ════════════════════════════════════════════════
          HERO — Automotive Industrial
          ════════════════════════════════════════════════ */}
      <section className="relative bg-graphite-900 pt-16 pb-6 md:pt-24 md:pb-8 overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Red accent bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-racing-600" />

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          {/* Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-racing-600/30 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-racing-500" />
              <span className="text-racing-400 text-xs tracking-[0.15em] uppercase font-medium">
                {locale === 'th' ? 'อะไหล่แท้ ราคาโดนใจ ส่งไวทั่วประเทศ' : 'Quality Auto Parts · Delivered Fast'}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tight mb-1">
              CCR
            </h1>
            <p className="text-racing-400 text-xl md:text-2xl font-black tracking-[0.15em] mb-2">
              AUTO
            </p>
            <p className="text-silver-500 text-base max-w-lg mx-auto">
              {locale === 'th'
                ? 'อะไหล่รถยนต์คุณภาพ ครบทุกยี่ห้อ ส่งไวทั่วประเทศ'
                : 'Quality auto parts for every make. Fast delivery nationwide.'}
            </p>
          </div>

          {/* Vehicle Selector */}
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-xl mx-auto shadow-lg border border-silver-200">
            <h2 className="text-graphite-900 font-bold mb-4 flex items-center gap-2">
              <Car size={20} className="text-racing-500" />
              {t('vehicle.select', locale)}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={selectedMake}
                onChange={(e) => { setSelectedMake(e.target.value); setSelectedModel('') }}
                className="w-full rounded-xl border border-silver-200 bg-white px-4 py-3 text-sm text-graphite-900 focus:border-racing-500 focus:ring-2 focus:ring-racing-500/20 outline-none transition-all cursor-pointer"
              >
                <option value="">-- {t('vehicle.make', locale)} --</option>
                {makes.map((m) => (
                  <option key={m.id} value={m.id}>{makeName(m)}</option>
                ))}
              </select>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full rounded-xl border border-silver-200 bg-white px-4 py-3 text-sm text-graphite-900 focus:border-racing-500 focus:ring-2 focus:ring-racing-500/20 outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedMake}
              >
                <option value="">-- {t('vehicle.model', locale)} --</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.year_start}{m.year_end ? `-${m.year_end}` : '+'})</option>
                ))}
              </select>
            </div>
            <div className="mt-4 flex gap-3">
              <Link
                href={selectedMake && selectedModel
                  ? `/${locale}/products?make=${selectedMake}&model=${selectedModel}`
                  : selectedMake
                    ? `/${locale}/products?make=${selectedMake}`
                    : `/${locale}/products`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-racing-600 hover:bg-racing-500 text-white font-bold text-sm rounded-full transition-all shadow-lg shadow-racing-600/20"
              >
                <Search size={16} /> {t('vehicle.search', locale)}
              </Link>
              <Link
                href={`/${locale}/products`}
                className="px-6 py-3 rounded-full font-medium text-sm text-graphite-600 border border-silver-300 hover:border-racing-400 hover:text-racing-600 transition-all text-center"
              >
                {t('vehicle.browse', locale)}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          FEATURES
          ════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 -mt-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Truck, title_th: 'จัดส่งทั่วประเทศ', title_en: 'Delivery', desc_th: 'จัดส่งไว บรรจุอย่างดี', desc_en: 'Fast & secure shipping' },
            { icon: Shield, title_th: 'อะไหล่คุณภาพสูง', title_en: 'Quality', desc_th: 'ได้มาตรฐาน รับประกันสินค้า', desc_en: 'Certified parts with warranty' },
            { icon: RotateCcw, title_th: 'เปลี่ยนคืนได้', title_en: 'Returns', desc_th: 'ไม่ถูกใจเปลี่ยนคืนภายใน 7 วัน', desc_en: '7-day hassle-free returns' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl flex items-center gap-4 p-5 shadow-sm border border-silver-200 hover:border-racing-400/30 hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-racing-50">
                <item.icon size={22} className="text-racing-500" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-graphite-900">{locale === 'th' ? item.title_th : item.title_en}</h3>
                <p className="text-xs text-silver-600">{locale === 'th' ? item.desc_th : item.desc_en}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          FEATURED PRODUCTS
          ════════════════════════════════════════════════ */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-graphite-900">
                {locale === 'th' ? 'สินค้าแนะนำ' : 'Featured Products'}
              </h2>
              <p className="text-sm mt-1 text-silver-600">{locale === 'th' ? 'สินค้าขายดีและมาแรง' : 'Top selling and trending parts'}</p>
            </div>
            <Link href={`/${locale}/products`} className="inline-flex items-center gap-1.5 text-sm font-bold px-5 py-2.5 bg-racing-600 hover:bg-racing-500 text-white rounded-full transition-all shadow-sm">
              {locale === 'th' ? 'ดูทั้งหมด' : 'View All'} <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════
          TRUSTED BRANDS
          ════════════════════════════════════════════════ */}
      {brands.length > 0 && (
        <section className="bg-graphite-50 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award size={20} className="text-racing-500" />
                <h2 className="text-xl md:text-2xl font-bold text-graphite-900">
                  {locale === 'th' ? 'แบรนด์ชั้นนำ' : 'Trusted Brands'}
                </h2>
              </div>
              <p className="text-sm text-silver-600">
                {locale === 'th' ? 'อะไหล่แท้จากแบรนด์คุณภาพ' : 'Quality parts from top brands'}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {brands.map((b) => (
                <Link
                  key={b.id}
                  href={`/${locale}/products?brand=${b.id}`}
                  className="bg-white rounded-xl px-6 py-5 border border-silver-200 transition-all hover:border-racing-400/40 hover:-translate-y-1 hover:shadow-md flex flex-col items-center gap-3 min-w-[120px] group"
                >
                  {b.logo_url ? (
                    <img
                      src={b.logo_url}
                      alt={b.name_en}
                      className="h-12 w-auto object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold bg-racing-50 text-racing-600">
                      {b.name_en?.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs text-silver-600 font-medium group-hover:text-graphite-900 transition-colors">
                    {locale === 'th' ? (b.name_th || b.name_en) : b.name_en}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════
          VEHICLE MAKES
          ════════════════════════════════════════════════ */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-graphite-900">
              {locale === 'th' ? 'ยี่ห้อรถยนต์' : 'Vehicle Makes'}
            </h2>
            <p className="text-sm mt-1 text-silver-600">{locale === 'th' ? 'เลือกรถของคุณ' : 'Select your vehicle'}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {makes.map((m) => (
              <Link
                key={m.id}
                href={`/${locale}/products?make=${m.id}`}
                className="bg-white rounded-xl px-5 py-4 border border-silver-200 transition-all hover:border-racing-400/40 hover:-translate-y-1 hover:shadow-md flex flex-col items-center gap-2 min-w-[100px]"
              >
                <img
                  src={`/brands/${m.name_en?.toLowerCase()}.png`}
                  alt={m.name_en}
                  className="h-10 w-20 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
                <span className="text-[10px] text-silver-600 font-medium tracking-wider">{m.name_en}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

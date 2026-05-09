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
  const makeId = (m: Make) => m.name_en?.toLowerCase()

  return (
    <div>
      {/* Hero */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          {/* Sci-fi Brand - no logo image, just text */}
          <div className="text-center mb-12">
            <div className="inline-block relative">
              <div className="corner-decoration corner-tl" />
              <div className="corner-decoration corner-tr" />
              <div className="corner-decoration corner-bl" />
              <div className="corner-decoration corner-br" />
              <div className="px-12 py-8">
                <h1 className="sci-fi-title text-5xl md:text-7xl font-bold tracking-[0.15em] glow-text" style={{ color: '#00d4ff' }}>
                  CCR<span className="ml-2 tracking-[0.3em]" style={{ color: '#ff3366', textShadow: '0 0 20px rgba(255,51,102,0.6)' }}>AUTO</span>
                </h1>
                <div className="h-0.5 w-3/4 mx-auto mt-4 rounded" style={{
                  background: 'linear-gradient(90deg, transparent, #00d4ff, #ff3366, #00d4ff, transparent)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer-gradient 3s ease infinite',
                }} />
                <p className="text-sm md:text-base mt-4 text-glass-secondary tracking-widest uppercase">
                  {locale === 'th' ? 'อะไหล่แท้ ราคาโดนใจ ส่งไวทั่วประเทศ' : 'Quality Auto Parts · Delivered Fast'}
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle Selector */}
          <div className="glass-card rounded-2xl p-6 md:p-8 max-w-xl mx-auto">
            <h2 className="text-glass font-semibold mb-4 flex items-center gap-2 sci-fi-title" style={{ letterSpacing: '0.05em' }}>
              <Car size={20} style={{ color: '#00d4ff' }} />
              {t('vehicle.select', locale)}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select value={selectedMake} onChange={(e) => { setSelectedMake(e.target.value); setSelectedModel('') }} className="glass-input cursor-pointer">
                <option value="">-- {t('vehicle.make', locale)} --</option>
                {makes.map((m) => (
                  <option key={m.id} value={m.id}>{makeName(m)}</option>
                ))}
              </select>
              <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="glass-input cursor-pointer" disabled={!selectedMake}>
                <option value="">-- {t('vehicle.model', locale)} --</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.year_start}{m.year_end ? `-${m.year_end}` : '+'})</option>
                ))}
              </select>
            </div>
            <div className="mt-4 flex gap-3">
              <Link href={selectedMake && selectedModel ? `/${locale}/products?make=${selectedMake}&model=${selectedModel}` : selectedMake ? `/${locale}/products?make=${selectedMake}` : `/${locale}/products`}
                className="flex-1 py-3 rounded-xl font-semibold text-white text-center flex items-center justify-center gap-2 transition-all hover:translate-y-[-1px] sci-fi-title text-sm tracking-wider"
                style={{ background: 'linear-gradient(135deg, rgba(255,51,102,0.3), rgba(255,51,102,0.15))', border: '1px solid #ff3366', boxShadow: '0 0 20px rgba(255,51,102,0.2)' }}
                onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 0 40px rgba(255,51,102,0.4)'}
                onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(255,51,102,0.2)'}
              >
                <Search size={18} /> {t('vehicle.search', locale)}
              </Link>
              <Link href={`/${locale}/products`} className="px-6 py-3 rounded-xl font-medium text-center transition-all border text-glass-secondary hover:text-white"
                style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#00d4ff'; e.currentTarget.style.background = 'rgba(0,212,255,0.1)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'transparent'; }}
              >
                {t('vehicle.browse', locale)}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 -mt-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Truck, title_th: 'จัดส่งทั่วประเทศ', title_en: 'DELIVERY', desc_th: 'จัดส่งไว บรรจุอย่างดี', desc_en: 'Fast & secure shipping', color: '#00d4ff' },
            { icon: Shield, title_th: 'อะไหล่คุณภาพสูง', title_en: 'QUALITY', desc_th: 'ได้มาตรฐาน รับประกันสินค้า', desc_en: 'Certified parts with warranty', color: '#00d4ff' },
            { icon: RotateCcw, title_th: 'เปลี่ยนคืนได้', title_en: 'RETURNS', desc_th: 'ไม่ถูกใจเปลี่ยนคืนภายใน 7 วัน', desc_en: '7-day hassle-free returns', color: '#ff3366' },
          ].map((item, i) => (
            <div key={i} className="glass-card rounded-xl flex items-center gap-4 p-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `rgba(${item.color === '#00d4ff' ? '0,212,255' : '255,51,102'},0.1)` }}>
                <item.icon size={22} style={{ color: item.color }} />
              </div>
              <div>
                <h3 className="sci-fi-title font-semibold text-sm tracking-wider text-glass">{locale === 'th' ? item.title_th : item.title_en}</h3>
                <p className="text-xs text-glass-muted">{locale === 'th' ? item.desc_th : item.desc_en}</p>
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
              <h2 className="text-xl md:text-2xl font-bold text-glass sci-fi-title tracking-wider">
                {locale === 'th' ? 'สินค้าแนะนำ' : 'FEATURED'}
              </h2>
              <p className="text-sm mt-1 text-glass-muted">{locale === 'th' ? 'สินค้าขายดีและมาแรง' : 'Top selling and trending parts'}</p>
            </div>
            <Link href={`/${locale}/products`} className="flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-lg transition-all btn-glass text-xs sci-fi-title">
              {locale === 'th' ? 'ดูทั้งหมด' : 'VIEW ALL'} <ArrowRight size={15} />
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
      {brands.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Award size={20} style={{ color: '#ff3366' }} />
              <h2 className="text-xl md:text-2xl font-bold text-glass sci-fi-title tracking-wider">
                {locale === 'th' ? 'แบรนด์ชั้นนำ' : 'TRUSTED BRANDS'}
              </h2>
            </div>
            <p className="text-sm text-glass-muted">
              {locale === 'th' ? 'อะไหล่แท้จากแบรนด์คุณภาพ' : 'Quality parts from top brands'}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {brands.map((b) => (
              <Link
                key={b.id}
                href={`/${locale}/products?brand=${b.id}`}
                className="glass-card px-6 py-5 rounded-xl transition-all hover:translate-y-[-3px] flex flex-col items-center gap-3 min-w-[130px] group"
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#00d4ff'; e.currentTarget.style.boxShadow = '0 0 25px rgba(0,212,255,0.2)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {b.logo_url ? (
                  <img
                    src={b.logo_url}
                    alt={b.name_en}
                    className="h-14 w-auto object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full flex items-center justify-center text-lg font-bold"
                    style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff' }}>
                    {b.name_en?.charAt(0)}
                  </div>
                )}
                <span className="text-xs text-glass-muted sci-fi-title tracking-wider uppercase group-hover:text-white transition-colors">
                  {locale === 'th' ? (b.name_th || b.name_en) : b.name_en}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Brands with Logos */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-glass sci-fi-title tracking-wider">
            {locale === 'th' ? 'ยี่ห้อรถยนต์' : 'VEHICLE MAKES'}
          </h2>
          <p className="text-sm mt-1 text-glass-muted">{locale === 'th' ? 'เลือกรถของคุณ' : 'Select your vehicle'}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {makes.map((m) => (
            <Link
              key={m.id}
              href={`/${locale}/products?make=${m.id}`}
              className="glass-card px-5 py-4 rounded-xl transition-all hover:translate-y-[-3px] flex flex-col items-center gap-2 min-w-[100px]"
            >
              <img
                src={`/brands/${m.name_en?.toLowerCase()}.png`}
                alt={m.name_en}
                className="h-10 w-20 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              <span className="text-[10px] text-glass-muted sci-fi-title tracking-wider">{m.name_en}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

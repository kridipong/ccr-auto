'use client'

import { useLocale } from '@/lib/i18n/locale-provider'
import { t } from '@/lib/i18n'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  const { locale } = useLocale()

  return (
    <footer className="glass mt-16" style={{ borderTop: '1px solid rgba(0, 212, 255, 0.15)' }}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href={`/${locale}`} className="flex items-center gap-2 mb-4">
              <span className="sci-fi-title text-lg tracking-[0.1em] glow-text" style={{ color: '#00d4ff' }}>CCR</span>
              <span className="sci-fi-title text-xs tracking-[0.25em]" style={{ color: '#ff3366', textShadow: '0 0 10px rgba(255,51,102,0.4)' }}>AUTO</span>
            </Link>
            <p className="text-sm text-glass-muted leading-relaxed">
              {locale === 'th' ? 'ศูนย์รวมอะไหล่รถยนต์คุณภาพสูง ราคายุติธรรม จัดส่งทั่วประเทศ' : 'Your trusted source for quality auto parts. Fast delivery nationwide.'}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-widest mb-3" style={{ color: '#00d4ff' }}>
              {locale === 'th' ? 'เมนู' : 'Quick Links'}
            </h4>
            <div className="space-y-2 text-sm">
              {[{ href: `/${locale}`, label: t('nav.home', locale) }, { href: `/${locale}/products`, label: t('nav.products', locale) }, { href: `/${locale}/cart`, label: t('nav.cart', locale) }].map((link) => (
                <Link key={link.href} href={link.href} className="block text-glass-secondary hover:text-white transition-all hover:translate-x-1">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-widest mb-3" style={{ color: '#00d4ff' }}>
              {t('footer.contact', locale)}
            </h4>
            <div className="space-y-3 text-sm">
              {[{ icon: Phone, label: '055-009-204', color: '#00d4ff' }, { icon: Mail, label: 'info@ccrauto.com', color: '#ff3366' }].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `rgba(${item.color === '#00d4ff' ? '0,212,255' : '255,51,102'},0.1)` }}>
                    <item.icon size={14} style={{ color: item.color }} />
                  </div>
                  <span className="text-glass-secondary">{item.label}</span>
                </div>
              ))}
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(0,212,255,0.1)' }}>
                  <MapPin size={14} style={{ color: '#00d4ff' }} />
                </div>
                <span className="text-glass-muted text-xs leading-relaxed">
                  {locale === 'th' ? '111/12 หมู่5 ต.บ้านคลอง อ.เมือง จ.พิษณุโลก 65000' : '111/12 Moo 5, Ban Klong, Muang, Phitsanulok 65000'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-widest mb-3" style={{ color: '#00d4ff' }}>
              {locale === 'th' ? 'เวลาทำการ' : 'Business Hours'}
            </h4>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,51,102,0.1)' }}>
                <Clock size={14} style={{ color: '#ff3366' }} />
              </div>
              <span className="text-glass-secondary">{t('footer.hours', locale)}</span>
            </div>
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs text-glass-muted">LINE: @ccrauto</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 text-center text-xs text-glass-muted" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          &copy; {new Date().getFullYear()} CCRAUTO.
          <span className="mx-2 opacity-30">|</span>
          {locale === 'th' ? 'บริษัท ซีซีอาร์ออโต้ จำกัด' : 'CCRAUTO CO., LTD.'}
        </div>
      </div>
    </footer>
  )
}

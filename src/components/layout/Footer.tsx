'use client'

import { useLocale } from '@/lib/i18n/locale-provider'
import { t } from '@/lib/i18n'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  const { locale } = useLocale()

  return (
    <footer className="footer-gradient text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href={`/${locale}`} className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="CCRAUTO" className="h-10 w-10 object-contain rounded-lg" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <div>
                <span className="text-lg font-bold text-white">CCR</span>
                <span className="text-sm font-semibold" style={{ color: '#e63946' }}>AUTO</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              {locale === 'th'
                ? 'ศูนย์รวมอะไหล่รถยนต์คุณภาพสูง ราคายุติธรรม จัดส่งทั่วประเทศ'
                : 'Your trusted source for quality auto parts. Fast delivery nationwide.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">
              {locale === 'th' ? 'เมนู' : 'Quick Links'}
            </h4>
            <div className="space-y-2 text-sm">
              <Link href={`/${locale}`} className="block text-gray-400 hover:text-white transition">{t('nav.home', locale)}</Link>
              <Link href={`/${locale}/products`} className="block text-gray-400 hover:text-white transition">{t('nav.products', locale)}</Link>
              <Link href={`/${locale}/products`} className="block text-gray-400 hover:text-white transition">{t('vehicle.select', locale)}</Link>
              <Link href={`/${locale}/cart`} className="block text-gray-400 hover:text-white transition">{t('nav.cart', locale)}</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">{t('footer.contact', locale)}</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(230,57,70,0.2)' }}>
                  <Phone size={14} style={{ color: '#e63946' }} />
                </div>
                <span className="text-gray-300">055-009-204</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(69,123,157,0.2)' }}>
                  <Mail size={14} style={{ color: '#457b9d' }} />
                </div>
                <span className="text-gray-300">info@ccrauto.com</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: 'rgba(45,106,79,0.2)' }}>
                  <MapPin size={14} style={{ color: '#2d6a4f' }} />
                </div>
                <span className="text-gray-300 text-xs leading-relaxed">
                  {locale === 'th'
                    ? '111/12 หมู่5 ต.บ้านคลอง อ.เมือง จ.พิษณุโลก 65000'
                    : '111/12 Moo 5, Ban Klong, Muang, Phitsanulok 65000'}
                </span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">{locale === 'th' ? 'เวลาทำการ' : 'Business Hours'}</h4>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,183,3,0.2)' }}>
                <Clock size={14} style={{ color: '#ffb703' }} />
              </div>
              <span className="text-gray-300">{t('footer.hours', locale)}</span>
            </div>
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-xs text-gray-500">
                {locale === 'th' ? 'LINE: @ccrauto' : 'LINE: @ccrauto'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 text-center text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', color: '#6c757d' }}>
          &copy; {new Date().getFullYear()} CCRAUTO. All rights reserved.
          <span className="mx-2">|</span>
          {locale === 'th' ? 'บริษัท ซีซีอาร์ออโต้ จำกัด' : 'CCRAUTO CO., LTD.'}
        </div>
      </div>
    </footer>
  )
}

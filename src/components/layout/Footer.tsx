'use client'

import { useLocale } from '@/lib/i18n/locale-provider'
import { t } from '@/lib/i18n'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  const { locale } = useLocale()

  return (
    <footer className="bg-graphite-900 border-t border-graphite-700 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href={`/${locale}`} className="flex items-center gap-1.5 mb-4">
              <span className="font-black text-xl tracking-tight text-white">CCR</span>
              <span className="font-black text-sm tracking-[0.15em] text-racing-500">AUTO</span>
            </Link>
            <p className="text-sm text-silver-500 leading-relaxed">
              {locale === 'th'
                ? 'ศูนย์รวมอะไหล่รถยนต์คุณภาพสูง ราคายุติธรรม จัดส่งทั่วประเทศ'
                : 'Your trusted source for quality auto parts. Fast delivery nationwide.'}
            </p>
          </div>

          {/* Menu */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-3 text-racing-400">
              {locale === 'th' ? 'เมนู' : 'Quick Links'}
            </h4>
            <div className="space-y-2 text-sm">
              {[
                { href: `/${locale}`, label: t('nav.home', locale) },
                { href: `/${locale}/products`, label: t('nav.products', locale) },
                { href: `/${locale}/cart`, label: t('nav.cart', locale) },
              ].map((link) => (
                <Link key={link.href} href={link.href}
                  className="block text-silver-400 hover:text-white transition-all hover:translate-x-1"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-3 text-racing-400">
              {t('footer.contact', locale)}
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-racing-900/30">
                  <Phone size={14} className="text-racing-400" />
                </div>
                <span className="text-silver-400">055-009-204</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-racing-900/30">
                  <Mail size={14} className="text-racing-400" />
                </div>
                <span className="text-silver-400">info@ccrauto.com</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-silver-900/20">
                  <MapPin size={14} className="text-silver-400" />
                </div>
                <span className="text-silver-500 text-xs leading-relaxed">
                  {locale === 'th'
                    ? '111/12 หมู่5 ต.บ้านคลอง อ.เมือง จ.พิษณุโลก 65000'
                    : '111/12 Moo 5, Ban Klong, Muang, Phitsanulok 65000'}
                </span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-3 text-racing-400">
              {locale === 'th' ? 'เวลาทำการ' : 'Business Hours'}
            </h4>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-racing-900/30">
                <Clock size={14} className="text-racing-400" />
              </div>
              <span className="text-silver-400">{t('footer.hours', locale)}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-graphite-700">
              <p className="text-xs text-silver-500">LINE: @ccrauto</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 text-center text-xs text-silver-600 border-t border-graphite-800">
          &copy; {new Date().getFullYear()} CCRAUTO.
          <span className="mx-2 opacity-30">|</span>
          {locale === 'th' ? 'บริษัท ซีซีอาร์ออโต้ จำกัด' : 'CCRAUTO CO., LTD.'}
        </div>
      </div>
    </footer>
  )
}

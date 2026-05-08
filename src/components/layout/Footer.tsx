'use client'

import { useLocale } from '@/lib/i18n/locale-provider'
import { t } from '@/lib/i18n'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'

export default function Footer() {
  const { locale } = useLocale()

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">
              <span className="text-blue-400">CCR</span>AUTO
            </h3>
            <p className="text-sm text-gray-400">
              {locale === 'th'
                ? 'ศูนย์รวมอะไหล่รถยนต์คุณภาพสูง ราคายุติธรรม'
                : 'Your trusted source for quality auto parts'}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">{t('footer.contact', locale)}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone size={14} />
                <span>055-009-204</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} />
                <span>info@ccrauto.com</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="mt-1 shrink-0" />
                <span>
                  {locale === 'th'
                    ? '111/12 หมู่5 ต.บ้านคลอง อ.เมือง จ.พิษณุโลก 65000'
                    : '111/12 Moo 5, Ban Klong, Muang, Phitsanulok 65000'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">{t('footer.hours', locale)}</h4>
            <div className="flex items-center gap-2 text-sm">
              <Clock size={14} />
              <span>{t('footer.hours', locale)}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} CCRAUTO. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

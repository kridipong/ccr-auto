'use client'

import { useLocale } from '@/lib/i18n/locale-provider'
import { t } from '@/lib/i18n'
import { Phone, MapPin, MessageSquare } from 'lucide-react'
import Link from 'next/link'

const branches = [
  {
    name: 'เจริญยนต์เชียงราย',
    sub: 'สาขาฝั่งหมิ่น — ถ.พหลโยธิน',
    address_th: '227/1 ถ.พหลโยธิน, เชียงราย',
    address_en: '227/1 Phaholyothin Rd, Chiang Rai',
    phone: '053 166 989',
    maps: 'https://maps.google.com/?q=227/1+ถ.พหลโยธิน+เชียงราย',
  },
  {
    name: 'เจริญยนต์ 2002 / ซีซีอาร์ ออโต้',
    sub: 'สาขาป่าก่อ — ถ.พหลโยธิน',
    address_th: '209/2-4 ถ.พหลโยธิน, เชียงราย',
    address_en: '209/2-4 Phaholyothin Rd, Chiang Rai',
    phone: '053 719 531',
    maps: 'https://maps.app.goo.gl/zC3TiTvqYXZNQKPc8',
  },
  {
    name: 'เจริญยนต์แม่สาย',
    sub: 'สาขาแม่สาย — เวียงพางคำ',
    address_th: 'เวียงพางคำ อ.แม่สาย, เชียงราย',
    address_en: 'Wiang Phang Kham, Mae Sai, Chiang Rai',
    phone: '053 646 465',
    maps: 'https://maps.app.goo.gl/XUBKunb1EPC9B27X7',
  },
]

export default function Footer() {
  const { locale } = useLocale()

  return (
    <footer className="bg-graphite-900 border-t border-graphite-700 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href={`/${locale}`} className="flex items-center gap-1.5 mb-4">
              <span className="font-black text-xl tracking-tight text-white">เจริญยนต์</span>
              <span className="font-black text-[11px] tracking-[0.1em] text-racing-500 mt-0.5">เชียงราย</span>
            </Link>
            <p className="text-sm text-silver-500 leading-relaxed">
              {locale === 'th'
                ? 'ผู้เชี่ยวชาญอะไหล่รถยนต์ มากว่า 50 ปี 3 สาขาทั่วเชียงราย อะไหล่แท้และเทียบคุณภาพสูง ราคายุติธรรม'
                : 'Auto parts expert with 50+ years of experience. 3 branches across Chiang Rai. Quality parts, fair prices.'}
            </p>
            <div className="mt-4">
              <a
                href="https://line.me/R/ti/p/@ccrauto2009"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06c755]/10 hover:bg-[#06c755]/20 border border-[#06c755]/30 transition-all text-sm"
              >
                <MessageSquare size={16} className="text-[#06c755]" />
                <span className="text-[#06c755] font-bold">LINE: @ccrauto2009</span>
              </a>
            </div>
          </div>

          {/* Branches - takes 3 columns on desktop */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            {branches.map((b, i) => (
              <div key={i} className="bg-graphite-800 rounded-xl p-5 border border-graphite-700 hover:border-racing-600/30 transition-all">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-7 h-7 rounded-full bg-racing-600 flex items-center justify-center text-white font-bold text-xs">
                    {i + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-white">{b.name}</h4>
                    <p className="text-[10px] text-silver-500">{locale === 'th' ? b.sub : `Branch ${i + 1}`}</p>
                  </div>
                </div>
                <div className="space-y-2 text-silver-400 text-xs">
                  <a
                    href={b.maps}
                    target="_blank"
                    rel="noopener"
                    className="flex items-start gap-1.5 hover:text-white transition-colors group"
                  >
                    <MapPin size={13} className="mt-0.5 shrink-0 text-racing-400" />
                    <span className="group-hover:text-white transition-colors">
                      {locale === 'th' ? b.address_th : b.address_en}
                    </span>
                  </a>
                  <a
                    href={`tel:${b.phone.replace(/\s/g, '')}`}
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <Phone size={13} className="shrink-0 text-racing-400" />
                    <span>{b.phone}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Separator */}
        <div className="mt-8 pt-6 border-t border-graphite-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-silver-600">
            <p>
              &copy; {new Date().getFullYear()} เจริญยนต์ เชียงราย.
              <span className="mx-2 opacity-30">|</span>
              {locale === 'th' ? 'ร้านอะไหล่รถยนต์ครบวงจร' : 'Full-service auto parts retailer'}
            </p>
            <p className="text-center">
              {locale === 'th'
                ? 'มากว่า 50 ปี • 3 สาขาทั่วเชียงราย'
                : '50+ years • 3 branches across Chiang Rai'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

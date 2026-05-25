'use client'

import Link from 'next/link'
import { useLocale } from '@/lib/i18n/locale-provider'
import { t } from '@/lib/i18n'
import { Package, Tags, Car, ShoppingBag, LayoutDashboard, ArrowLeft, Upload, Award } from 'lucide-react'

const adminLinks = (locale: string) => [
  { href: `/${locale}/admin`, icon: LayoutDashboard, label_en: 'Dashboard', label_th: 'ภาพรวม' },
  { href: `/${locale}/admin/products`, icon: Package, label_en: 'Products', label_th: 'สินค้า' },
  { href: `/${locale}/admin/products/import`, icon: Upload, label_en: 'Import', label_th: 'นำเข้า' },
  { href: `/${locale}/admin/brands`, icon: Award, label_en: 'Brands', label_th: 'แบรนด์' },
  { href: `/${locale}/admin/categories`, icon: Tags, label_en: 'Categories', label_th: 'หมวดหมู่' },
  { href: `/${locale}/admin/vehicles`, icon: Car, label_en: 'Vehicles', label_th: 'รถยนต์' },
  { href: `/${locale}/admin/orders`, icon: ShoppingBag, label_en: 'Orders', label_th: 'คำสั่งซื้อ' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href={`/${locale}`} className="text-silver-500 hover:text-graphite-900 transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-graphite-900">{t('admin.title', locale)}</h1>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {adminLinks(locale).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-silver-200 text-sm text-silver-600 hover:text-graphite-900 hover:border-racing-400/30 transition-all shrink-0"
          >
            <link.icon size={16} className="text-racing-500" />
            {locale === 'th' ? link.label_th : link.label_en}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-silver-200 p-6 shadow-sm">
        {children}
      </div>
    </div>
  )
}

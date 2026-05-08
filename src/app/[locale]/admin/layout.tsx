'use client'

import Link from 'next/link'
import { useLocale } from '@/lib/i18n/locale-provider'
import { t } from '@/lib/i18n'
import { Package, Tags, Car, ShoppingBag, LayoutDashboard, ArrowLeft } from 'lucide-react'

const adminLinks = (locale: string) => [
  { href: `/${locale}/admin`, icon: LayoutDashboard, label_en: 'Dashboard', label_th: 'ภาพรวม' },
  { href: `/${locale}/admin/products`, icon: Package, label_en: 'Products', label_th: 'สินค้า' },
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
          <Link href={`/${locale}`} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">{t('admin.title', locale)}</h1>
        </div>
      </div>

      {/* Admin nav */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {adminLinks(locale).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm text-gray-600 hover:border-blue-300 hover:text-blue-600 transition shrink-0"
          >
            <link.icon size={16} />
            {locale === 'th' ? link.label_th : link.label_en}
          </Link>
        ))}
      </div>

      {children}
    </div>
  )
}

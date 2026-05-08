'use client'

import Link from 'next/link'
import { useLocale } from '@/lib/i18n/locale-provider'
import { useCart } from '@/lib/cart-context'
import { t, localeNames, locales } from '@/lib/i18n'
import { ShoppingCart, Globe, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const { locale, setLocale } = useLocale()
  const { count } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">CCR</span>
            <span className="text-sm text-gray-500 hidden sm:inline">AUTO</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href={`/${locale}`} className="text-gray-600 hover:text-blue-600 transition">
              {t('nav.home', locale)}
            </Link>
            <Link href={`/${locale}/products`} className="text-gray-600 hover:text-blue-600 transition">
              {t('nav.products', locale)}
            </Link>
            <Link href={`/${locale}/products`} className="text-gray-600 hover:text-blue-600 transition">
              {t('vehicle.select', locale)}
            </Link>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 border-l pl-4">
              <Globe size={16} className="text-gray-400" />
              {locales.map((l) => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  className={`text-sm px-2 py-1 rounded ${
                    locale === l ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {localeNames[l]}
                </button>
              ))}
            </div>

            {/* Cart */}
            <Link href={`/${locale}/cart`} className="relative text-gray-600 hover:text-blue-600">
              <ShoppingCart size={22} />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-3">
            <Link href={`/${locale}/cart`} className="relative text-gray-600">
              <ShoppingCart size={22} />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-600">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t pt-2">
            <Link href={`/${locale}`} className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>
              {t('nav.home', locale)}
            </Link>
            <Link href={`/${locale}/products`} className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>
              {t('nav.products', locale)}
            </Link>
            <div className="flex items-center gap-2 pt-2 border-t mt-2">
              <Globe size={16} className="text-gray-400" />
              {locales.map((l) => (
                <button
                  key={l}
                  onClick={() => { setLocale(l); setMenuOpen(false) }}
                  className={`text-sm px-2 py-1 rounded ${
                    locale === l ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500'
                  }`}
                >
                  {localeNames[l]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

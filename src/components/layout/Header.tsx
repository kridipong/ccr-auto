'use client'

import Link from 'next/link'
import { useLocale } from '@/lib/i18n/locale-provider'
import { useCart } from '@/lib/cart-context'
import { t, localeNames, locales } from '@/lib/i18n'
import { ShoppingCart, Globe, Menu, X, Search } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const { locale, setLocale } = useLocale()
  const { count } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50" style={{ borderBottom: '2px solid #e63946' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-3 shrink-0">
            <img
              src="/logo.png"
              alt="CCRAUTO"
              className="h-10 w-10 object-contain"
            />
            <div>
              <span className="text-xl font-bold" style={{ color: '#1a1a2e' }}>CCR</span>
              <span className="text-xs font-semibold ml-1" style={{ color: '#e63946' }}>AUTO</span>
            </div>
          </Link>

          {/* Search bar - desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder={t('products.search', locale)}
                className="w-full pl-10 pr-4 py-2 rounded-full border text-sm"
                style={{ borderColor: '#dee2e6', backgroundColor: '#f8f9fa' }}
                onFocus={(e) => { e.target.style.borderColor = '#457b9d'; e.target.style.backgroundColor = 'white'; }}
                onBlur={(e) => { e.target.style.borderColor = '#dee2e6'; e.target.style.backgroundColor = '#f8f9fa'; }}
              />
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#6c757d' }} />
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-5">
            <Link href={`/${locale}`} className="text-sm font-medium transition" style={{ color: '#1a1a2e' }}
              onMouseOver={(e) => e.currentTarget.style.color = '#e63946'}
              onMouseOut={(e) => e.currentTarget.style.color = '#1a1a2e'}
            >
              {t('nav.home', locale)}
            </Link>
            <Link href={`/${locale}/products`} className="text-sm font-medium transition" style={{ color: '#1a1a2e' }}
              onMouseOver={(e) => e.currentTarget.style.color = '#e63946'}
              onMouseOut={(e) => e.currentTarget.style.color = '#1a1a2e'}
            >
              {t('nav.products', locale)}
            </Link>
            <Link href={`/${locale}/products`} className="text-sm font-medium transition" style={{ color: '#1a1a2e' }}
              onMouseOver={(e) => e.currentTarget.style.color = '#e63946'}
              onMouseOut={(e) => e.currentTarget.style.color = '#1a1a2e'}
            >
              {t('vehicle.select', locale)}
            </Link>

            {/* Language Switcher */}
            <div className="flex items-center gap-0.5" style={{ borderLeft: '1px solid #dee2e6', paddingLeft: '1rem' }}>
              <Globe size={14} style={{ color: '#6c757d' }} />
              {locales.map((l) => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                    locale === l ? 'text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  style={locale === l ? { backgroundColor: '#e63946' } : {}}
                >
                  {localeNames[l]}
                </button>
              ))}
            </div>

            {/* Cart */}
            <Link href={`/${locale}/cart`} className="relative p-2 rounded-lg transition" style={{ color: '#1a1a2e' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fff5f5'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <ShoppingCart size={20} />
              {count > 0 && (
                <span
                  className="cart-badge absolute -top-1 -right-1 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  style={{ backgroundColor: '#e63946' }}
                >
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile buttons */}
          <div className="flex md:hidden items-center gap-2">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2" style={{ color: '#1a1a2e' }}>
              <Search size={20} />
            </button>
            <Link href={`/${locale}/cart`} className="relative p-2" style={{ color: '#1a1a2e' }}>
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center" style={{ backgroundColor: '#e63946' }}>
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2" style={{ color: '#1a1a2e' }}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        {searchOpen && (
          <div className="md:hidden pb-3">
            <input
              type="text"
              placeholder={t('products.search', locale)}
              className="w-full px-4 py-2.5 rounded-full border text-sm"
              style={{ borderColor: '#dee2e6', backgroundColor: '#f8f9fa' }}
            />
          </div>
        )}

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4" style={{ borderTop: '1px solid #dee2e6' }}>
            <Link href={`/${locale}`} className="block py-2.5 text-sm font-medium" style={{ color: '#1a1a2e' }} onClick={() => setMenuOpen(false)}>
              {t('nav.home', locale)}
            </Link>
            <Link href={`/${locale}/products`} className="block py-2.5 text-sm font-medium" style={{ color: '#1a1a2e' }} onClick={() => setMenuOpen(false)}>
              {t('nav.products', locale)}
            </Link>
            <div className="flex items-center gap-2 pt-3 mt-2" style={{ borderTop: '1px solid #dee2e6' }}>
              <Globe size={14} style={{ color: '#6c757d' }} />
              {locales.map((l) => (
                <button
                  key={l}
                  onClick={() => { setLocale(l); setMenuOpen(false) }}
                  className={`text-xs px-2 py-1 rounded font-medium ${
                    locale === l ? 'text-white' : 'text-gray-500'
                  }`}
                  style={locale === l ? { backgroundColor: '#e63946' } : {}}
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

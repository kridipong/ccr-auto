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
    <header className="bg-graphite-900 sticky top-0 z-50 border-b border-graphite-700">
      <div className="h-0.5 bg-racing-600" />
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link href={`/${locale}`} className="flex items-center gap-1.5 shrink-0 group">
            <span className="font-black text-xl tracking-tight text-white">
              เจริญยนต์
            </span>
            <span className="font-black text-[11px] tracking-[0.1em] text-racing-500 mt-0.5">
              เชียงราย
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: `/${locale}`, label: t('nav.home', locale) },
              { href: `/${locale}/products`, label: t('nav.products', locale) },
              { href: `/${locale}/products`, label: t('vehicle.select', locale) },
            ].map((link) => (
              <Link key={link.href} href={link.href}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-silver-400 hover:text-white hover:bg-graphite-800 transition-all"
              >{link.label}</Link>
            ))}

            <div className="flex items-center gap-1 ml-3 pl-3 border-l border-graphite-700">
              <Globe size={13} className="text-silver-600" />
              {locales.map((l) => (
                <button key={l} onClick={() => setLocale(l)}
                  className="text-[11px] px-1.5 py-0.5 rounded font-medium transition-all"
                  style={{
                    color: locale === l ? '#dc2626' : 'rgba(255,255,255,0.4)',
                    background: locale === l ? 'rgba(220,38,38,0.15)' : 'transparent',
                  }}
                >{localeNames[l]}</button>
              ))}
            </div>

            <Link href={`/${locale}/cart`} className="relative ml-2 p-2 rounded-lg hover:bg-graphite-800 transition-all">
              <ShoppingCart size={19} className="text-silver-400" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center bg-racing-600 text-white shadow-lg shadow-racing-600/40">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2">
              <Search size={19} className="text-silver-400" />
            </button>
            <Link href={`/${locale}/cart`} className="relative p-2">
              <ShoppingCart size={19} className="text-silver-400" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center bg-racing-600 text-white shadow-lg shadow-racing-600/40">
                  {count}
                </span>
              )}
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2">
              {menuOpen ? <X size={20} className="text-silver-400" /> : <Menu size={20} className="text-silver-400" />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="md:hidden pb-3">
            <input type="text" placeholder={t('products.search', locale)}
              className="w-full rounded-xl border border-graphite-700 bg-graphite-800 text-white px-4 py-2.5 text-sm outline-none focus:border-racing-600 placeholder:text-silver-600"
            />
          </div>
        )}

        {menuOpen && (
          <div className="md:hidden pb-4 bg-graphite-800 rounded-xl p-3 mb-3 border border-graphite-700">
            {[{ href: `/${locale}`, label: t('nav.home', locale) }, { href: `/${locale}/products`, label: t('nav.products', locale) }].map((link) => (
              <Link key={link.href} href={link.href}
                className="block py-2.5 text-sm font-medium text-silver-400 hover:text-white"
                onClick={() => setMenuOpen(false)}
              >{link.label}</Link>
            ))}
            <div className="flex items-center gap-2 pt-2 mt-2 border-t border-graphite-700">
              <Globe size={13} className="text-silver-600" />
              {locales.map((l) => (
                <button key={l} onClick={() => { setLocale(l); setMenuOpen(false) }}
                  className="text-xs px-2 py-1 rounded font-medium"
                  style={{
                    color: locale === l ? '#dc2626' : 'rgba(255,255,255,0.4)',
                    background: locale === l ? 'rgba(220,38,38,0.15)' : 'transparent',
                  }}
                >{localeNames[l]}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

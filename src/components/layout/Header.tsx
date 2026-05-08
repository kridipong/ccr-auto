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
    <header className="glass sticky top-0 z-50" style={{ borderBottom: '1px solid rgba(0, 212, 255, 0.2)' }}>
      <div className="accent-line" />
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Sci-fi Brand Name - no logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 shrink-0 group">
            <span className="sci-fi-title text-xl font-bold tracking-[0.1em] glow-text" style={{ color: '#00d4ff' }}>
              CCR
            </span>
            <span className="sci-fi-title text-sm tracking-[0.25em] font-bold" style={{ color: '#ff3366', textShadow: '0 0 15px rgba(255,51,102,0.6)' }}>
              AUTO
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
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 text-glass-secondary hover:text-white"
                style={{ textShadow: '0 0 5px rgba(0,212,255,0)' }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0,212,255,0.1)'; e.currentTarget.style.textShadow = '0 0 10px rgba(0,212,255,0.4)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.textShadow = '0 0 5px rgba(0,212,255,0)'; }}
              >{link.label}</Link>
            ))}

            <div className="flex items-center gap-1 ml-3 px-3" style={{ borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
              <Globe size={13} className="text-glass-muted" />
              {locales.map((l) => (
                <button key={l} onClick={() => setLocale(l)}
                  className="text-[11px] px-1.5 py-0.5 rounded font-medium transition-all"
                  style={{ color: locale === l ? '#00d4ff' : 'rgba(255,255,255,0.5)', background: locale === l ? 'rgba(0,212,255,0.15)' : 'transparent', textShadow: locale === l ? '0 0 8px rgba(0,212,255,0.4)' : 'none' }}
                >{localeNames[l]}</button>
              ))}
            </div>

            <Link href={`/${locale}/cart`} className="relative ml-2 p-2 rounded-lg transition-all"
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,212,255,0.1)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <ShoppingCart size={19} className="text-glass-secondary" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  style={{ background: '#ff3366', color: 'white', boxShadow: '0 0 10px rgba(255,51,102,0.6)' }}
                >{count > 99 ? '99+' : count}</span>
              )}
            </Link>
          </nav>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2">
              <Search size={19} className="text-glass-secondary" />
            </button>
            <Link href={`/${locale}/cart`} className="relative p-2">
              <ShoppingCart size={19} className="text-glass-secondary" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  style={{ background: '#ff3366', color: 'white', boxShadow: '0 0 10px rgba(255,51,102,0.6)' }}
                >{count}</span>
              )}
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2">
              {menuOpen ? <X size={20} className="text-glass-secondary" /> : <Menu size={20} className="text-glass-secondary" />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="md:hidden pb-3">
            <input type="text" placeholder={t('products.search', locale)} className="glass-input w-full" />
          </div>
        )}

        {menuOpen && (
          <div className="md:hidden pb-4 glass rounded-xl p-3 mb-3">
            {[{ href: `/${locale}`, label: t('nav.home', locale) }, { href: `/${locale}/products`, label: t('nav.products', locale) }].map((link) => (
              <Link key={link.href} href={link.href}
                className="block py-2.5 text-sm font-medium text-glass-secondary hover:text-white"
                onClick={() => setMenuOpen(false)}
              >{link.label}</Link>
            ))}
            <div className="flex items-center gap-2 pt-2 mt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <Globe size={13} className="text-glass-muted" />
              {locales.map((l) => (
                <button key={l} onClick={() => { setLocale(l); setMenuOpen(false) }}
                  className="text-xs px-2 py-1 rounded font-medium"
                  style={{ color: locale === l ? '#00d4ff' : 'rgba(255,255,255,0.5)', background: locale === l ? 'rgba(0,212,255,0.15)' : 'transparent' }}
                >{localeNames[l]}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

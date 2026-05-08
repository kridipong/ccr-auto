'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Locale } from '@/lib/i18n'
import { locales, defaultLocale } from '@/lib/i18n'

interface LocaleContextType {
  locale: Locale
  setLocale: (l: Locale) => void
}

const LocaleContext = createContext<LocaleContextType>({
  locale: defaultLocale,
  setLocale: () => {},
})

export function useLocale() {
  return useContext(LocaleContext)
}

export function LocaleProvider({ children, initialLocale }: { children: ReactNode; initialLocale: string }) {
  const [locale, setLocaleState] = useState<Locale>(
    locales.includes(initialLocale as Locale) ? (initialLocale as Locale) : defaultLocale
  )

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    const pathParts = window.location.pathname.split('/')
    pathParts[1] = l
    window.history.replaceState(null, '', pathParts.join('/'))
  }, [])

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

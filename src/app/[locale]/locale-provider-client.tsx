'use client'

import { LocaleProvider } from '@/lib/i18n/locale-provider'

export function LocaleProviderClient({ children, initialLocale }: { children: React.ReactNode; initialLocale: string }) {
  return <LocaleProvider initialLocale={initialLocale}>{children}</LocaleProvider>
}

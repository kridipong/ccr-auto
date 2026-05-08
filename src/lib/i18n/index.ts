import { en, th, type TranslationKey, type Locale } from './translations'

const dictionaries: Record<Locale, Record<TranslationKey, string>> = { en, th }

export function t(key: TranslationKey, locale: Locale): string {
  return dictionaries[locale]?.[key] ?? dictionaries.en[key] ?? key
}

export { type Locale, locales, defaultLocale, localeNames } from './translations'

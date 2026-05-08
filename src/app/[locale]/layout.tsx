import { LocaleProviderClient } from './locale-provider-client'
import { CartProvider } from '@/lib/cart-context'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <LocaleProviderClient initialLocale={locale}>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </CartProvider>
    </LocaleProviderClient>
  )
}

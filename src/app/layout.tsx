import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'เจริญยนต์ เชียงราย - ร้านอะไหล่รถยนต์',
  description: 'Auto parts e-commerce',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        {children}
      </body>
    </html>
  )
}

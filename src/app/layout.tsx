import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CCRAUTO - Auto Parts',
  description: 'Auto parts e-commerce',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <div className="fixed inset-0 -z-10">
          <img
            src="/bg.jpg"
            alt=""
            className="bg-fixed-image"
            style={{ filter: 'brightness(0.7) saturate(0.9) contrast(0.95)' }}
          />
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%)',
          }} />
        </div>
        {children}
      </body>
    </html>
  )
}

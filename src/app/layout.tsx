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
        {/* Fixed background image - brighter now */}
        <div className="fixed inset-0 -z-10">
          <img
            src="/bg.jpg"
            alt=""
            className="bg-fixed-image"
            style={{ filter: 'brightness(0.75) saturate(1.1) contrast(1.05)' }}
          />
          {/* Subtle dark overlay */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.2) 100%)',
          }} />
        </div>
        {children}
      </body>
    </html>
  )
}

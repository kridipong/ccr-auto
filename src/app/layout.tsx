import type { Metadata } from 'next'
import './globals.css'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'CCRAUTO - Auto Parts',
  description: 'Auto parts e-commerce',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        {/* Fixed background image */}
        <div className="fixed inset-0 -z-10">
          <img
            src="/bg.jpg"
            alt=""
            className="bg-fixed-image"
            style={{ filter: 'brightness(0.6) saturate(1.2)' }}
          />
          {/* Dark overlay for readability */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
          }} />
        </div>
        {children}
      </body>
    </html>
  )
}

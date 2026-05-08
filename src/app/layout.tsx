import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CCRAUTO - Auto Parts',
  description: 'Auto parts e-commerce',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}

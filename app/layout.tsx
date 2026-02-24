import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'SoCart Admin', description: 'SoCart Admin Panel' }
export const viewport: Viewport  = { width:'device-width', initialScale:1, maximumScale:1, userScalable:false, themeColor:'#080c18' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" />
      </head>
      <body>{children}</body>
    </html>
  )
}

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SoCart Admin',
  description: 'SoCart Admin Panel',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Telegram WebApp SDK — auth এর জন্য লাগবে */}
        <script src="https://telegram.org/js/telegram-web-app.js" />
      </head>
      <body>{children}</body>
    </html>
  )
}

import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from './components/ToastContainer'

export const metadata: Metadata = {
  title: 'RankFlow Studio – SEO Content Generator',
  description: 'Genereer SEO-geoptimaliseerde content met RankFlow Studio',
  icons: {
    icon: '/rankflow-icoon.png',
    shortcut: '/rankflow-icoon.png',
    apple: '/rankflow-icoon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}


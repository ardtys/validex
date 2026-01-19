import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: 'VALIDEX - stop getting rugged',
  description: 'scan any solana token before you ape in. check mint authority, liquidity locks, holder distribution. built by someone who cares.',
  keywords: ['Solana', 'Token', 'Security', 'Audit', 'Crypto', 'Blockchain', 'Rug Pull', 'VALIDEX'],
  authors: [{ name: 'VALIDEX' }],
  creator: 'VALIDEX',
  publisher: 'VALIDEX',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/validex.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
  openGraph: {
    title: 'VALIDEX - stop getting rugged',
    description: 'scan any solana token before you ape in',
    url: 'https://validex.app',
    siteName: 'VALIDEX',
    images: [
      {
        url: '/validex.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VALIDEX - stop getting rugged',
    description: 'scan any solana token before you ape in',
    images: ['/validex.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/validex.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}

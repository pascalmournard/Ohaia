import type { Metadata } from 'next'
import { DM_Serif_Display, DM_Sans } from 'next/font/google'
import SessionProvider from '@/components/providers/SessionProvider'
import './globals.css'

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-serif',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Ohaia — Acheter, troquer, donner',
    template: '%s — Ohaia',
  },
  description:
    "Ohaia est la marketplace française de l'économie circulaire. Achetez, troquez ou donnez des objets près de chez vous.",
  keywords: ['marketplace', 'occasion', 'troc', 'don', 'vente', 'économie circulaire'],
  authors: [{ name: 'Ohaia' }],
  creator: 'Ohaia',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://ohaia.fr',
    title: 'Ohaia — Acheter, troquer, donner',
    description: "La marketplace française de l'économie circulaire.",
    siteName: 'Ohaia',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ohaia — Acheter, troquer, donner',
    description: "La marketplace française de l'économie circulaire.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${dmSerifDisplay.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}

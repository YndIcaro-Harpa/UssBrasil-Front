import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ToastWrapper from '@/components/toast-wrapper'
import { Providers } from '@/components/providers'
import LayoutWrapper from './LayoutWrapper'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'USS Brasil - Produtos Premium & Tecnologia de Ponta',
  description: 'Descubra os melhores produtos Apple, JBL, DJI, Xiaomi e Geonav. Tecnologia premium com entrega expressa e garantia oficial.',
  metadataBase: new URL('https://ussbrasil.netlify.app'),
  keywords: [
    'USS Brasil',
    'Apple',
    'iPhone',
    'MacBook',
    'JBL',
    'DJI',
    'Xiaomi',
    'Geonav',
    'produtos importados',
    'tecnologia premium',
    'loja online',
    'eletrônicos'
  ],
  openGraph: {
    title: 'USS Brasil - Produtos Premium & Tecnologia de Ponta',
    description: 'Descubra os melhores produtos Apple, JBL, DJI, Xiaomi e Geonav. Tecnologia premium com entrega expressa e garantia oficial.',
    type: 'website',
    locale: 'pt_BR',
    url: 'https://ussbrasil.netlify.app',
    siteName: 'USS Brasil',
    images: [
      {
        url: '/public/Empresa/02.png',
        width: 800,
        height: 600,
        alt: 'USS Brasil - Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'USS Brasil - Produtos Premium & Tecnologia de Ponta',
    description: 'Descubra os melhores produtos Apple, JBL, DJI, Xiaomi e Geonav. Tecnologia premium com entrega expressa e garantia oficial.',
    images: ['/public/Empresa/02.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/Empresa/02.png',
    shortcut: '/Empresa/02.png',
    apple: '/Empresa/02.png',
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className={`${inter.className} bg-white text-gray-900 antialiased transition-colors duration-300`}>
        <Providers>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </Providers>
        <ToastWrapper />
      </body>
    </html>
  )
}


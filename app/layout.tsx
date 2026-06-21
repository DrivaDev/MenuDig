import type { Metadata } from 'next'
import { Fira_Sans } from 'next/font/google'
import './globals.css'

const firaSans = Fira_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-fira-sans',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://menudig.com.ar'),
  title: {
    default: 'Menú Digital con QR para Restaurantes | MenuDig',
    template: '%s | MenuDig',
  },
  description: 'Creá el menú digital de tu restaurante con QR en minutos. Tus clientes lo ven desde el celular, sin descargar nada. 14 días gratis sin tarjeta. Argentina.',
  alternates: {
    canonical: 'https://menudig.com.ar',
    languages: { 'es-AR': 'https://menudig.com.ar' },
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://menudig.com.ar',
    siteName: 'MenuDig',
    title: 'Menú Digital con QR para Restaurantes | MenuDig',
    description: 'Creá el menú digital de tu restaurante con QR en minutos. Tus clientes lo ven desde el celular, sin descargar nada. 14 días gratis sin tarjeta.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Menú Digital con QR para Restaurantes | MenuDig',
    description: 'Creá el menú digital de tu restaurante con QR en minutos. Tus clientes lo ven desde el celular, sin descargar nada. 14 días gratis sin tarjeta.',
  },
  icons: {
    icon: '/logo.svg',
    // apple-touch-icon served by app/apple-icon.tsx (180×180 PNG via ImageResponse)
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={firaSans.variable}>
      <body className="bg-brand-fondo font-sans">
        {children}
      </body>
    </html>
  )
}

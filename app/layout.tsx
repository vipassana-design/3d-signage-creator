import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  title: 'BAWERK STUDIO - Cotizador 3D de Carteleria Corporea',
  description: 'Configurador profesional de carteleria corporea 3D con materiales PBR, visualizacion en tiempo real y cotizacion automatica.',
}

export const viewport: Viewport = {
  themeColor: '#020a1e',
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased overflow-hidden`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

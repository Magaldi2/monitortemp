import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dashboard de Temperatura IoT',
  description: 'Monitoramento de temperatura com ESP32',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className} style={{ backgroundColor:'rgba(230, 244, 226, 0.68)' }}>
        {children}
      </body>
    </html>
  )
}

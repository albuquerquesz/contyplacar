import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Placar — Contyplacar',
  description: 'Placar de disputa para dois participantes acompanharem pontos e histórico',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} min-h-screen bg-gray-50`}>{children}</body>
    </html>
  )
}

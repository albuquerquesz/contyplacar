'use client'

import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'

interface InviteModalProps {
  open: boolean
  link: string
  onClose: () => void
}

export default function InviteModal({ open, link, onClose }: InviteModalProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) {
      setCopied(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#60a5fa', '#93c5fd', '#f59e0b', '#10b981'],
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h3 className="text-xl font-bold text-gray-900 mb-1">Link de convite</h3>
        <p className="text-sm text-gray-500 mb-6">
          Compartilhe este link com seu amigo para começar a disputar!
        </p>

        <div className="flex items-center gap-2 mb-6">
          <input
            type="text"
            value={link}
            readOnly
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-600 font-mono"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            {copied ? '✓ Copiado!' : 'Copiar link'}
          </button>
        </div>
      </div>
    </div>
  )
}

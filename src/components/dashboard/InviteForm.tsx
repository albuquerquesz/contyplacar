'use client'

import { useState } from 'react'

export default function InviteForm({ userId }: { userId: string }) {
  const [linkCode, setLinkCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function generateLink() {
    setLoading(true)
    const code = Math.random().toString(36).substring(2, 10)
    const response = await fetch('/api/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkCode: code }),
    })

    if (response.ok) {
      setLinkCode(code)
      setCopied(false)
    }

    setLoading(false)
  }

  async function copyLink() {
    if (!linkCode) return
    const url = `${window.location.origin}/invite/${linkCode}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Convidar Amigo</h2>
      {!linkCode ? (
        <button
          onClick={generateLink}
          disabled={loading}
          className="rounded-2xl bg-blue-600 px-6 py-2 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Gerando...' : 'Gerar Link de Convite'}
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <code className="flex-1 bg-gray-100 rounded-xl px-4 py-2 text-sm text-gray-700 break-all">
            {`${window.location.origin}/invite/${linkCode}`}
          </code>
          <button
            onClick={copyLink}
            className="rounded-2xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors whitespace-nowrap"
          >
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      )}
    </div>
  )
}

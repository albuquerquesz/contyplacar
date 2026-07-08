'use client'

import { useState, useEffect } from 'react'
import { Save, RefreshCw } from 'lucide-react'

const EDIT_WINDOW_MS = 60 * 1000

export default function ScoreSection({
  matchId,
  currentScore,
  updatedAt,
  onSaved,
}: {
  matchId: string
  currentScore: number | null
  updatedAt: string | null
  onSaved?: (score: number) => void
}) {
  const [score, setScore] = useState(currentScore?.toString() ?? '')
  const [savedAt, setSavedAt] = useState(updatedAt)
  const [hasSubmitted, setHasSubmitted] = useState(currentScore !== null)
  const [loading, setLoading] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  const elapsed = savedAt ? now - new Date(savedAt).getTime() : null
  const remaining = elapsed === null ? null : EDIT_WINDOW_MS - elapsed
  const isWithinEditWindow = remaining !== null && remaining > 0
  const hasWindowExpired = hasSubmitted && !isWithinEditWindow
  const timeLeft = remaining !== null && remaining > 0 ? `${Math.floor(remaining / 1000)}s` : ''

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  async function handleSubmit() {
    const num = parseInt(score)
    if (isNaN(num) || num < 0 || num > 999) return

    setLoading(true)
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, score: num }),
    })
    setLoading(false)

    if (res.ok) {
      setSavedAt(new Date().toISOString())
      setHasSubmitted(true)
      onSaved?.(num)
    }
  }

  if (hasWindowExpired) {
    return (
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
            ✓
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900">Pontuação registrada</p>
            <p className="text-sm text-gray-500">Volte amanhã para registrar outra pontuação.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-gray-200 pt-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold tracking-tight text-gray-900">
          {hasSubmitted ? 'Pontuação salva' : 'Registrar pontuação'}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {hasSubmitted
            ? 'Você pode corrigir a pontuação por até 1 minuto após salvar.'
            : 'Registre a pontuação de hoje. Se errar, você pode corrigir por até 1 minuto.'}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="number"
          min={0}
          max={999}
          value={score}
          onChange={e => setScore(e.target.value)}
          className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-lg text-gray-900 outline-none transition-shadow focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:flex-1"
          placeholder="0-999"
        />
        <button
          onClick={handleSubmit}
          disabled={loading || score === ''}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              Salvando...
            </>
          ) : hasSubmitted ? (
            <>
              <RefreshCw className="h-5 w-5" />
              Atualizar pontuação
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Salvar pontuação
            </>
          )}
        </button>
      </div>
      {timeLeft && (
        <p className="mt-3 text-sm font-medium text-orange-600">
          <span className="font-mono">⏱ {timeLeft}</span> para corrigir
        </p>
      )}
    </div>
  )
}

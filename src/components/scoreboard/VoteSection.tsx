'use client'

import { useState, useEffect } from 'react'

const EDIT_WINDOW_MS = 60 * 1000

export default function VoteSection({
  matchId,
  currentScore,
  updatedAt,
}: {
  matchId: string
  currentScore: number | null
  updatedAt: string | null
}) {
  const [score, setScore] = useState(currentScore?.toString() ?? '')
  const [timeLeft, setTimeLeft] = useState('')
  const [savedAt, setSavedAt] = useState(updatedAt)
  const [hasSubmitted, setHasSubmitted] = useState(currentScore !== null)
  const [loading, setLoading] = useState(false)
  const canEdit = hasSubmitted
  const hasWindowExpired = hasSubmitted && !timeLeft

  useEffect(() => {
    setSavedAt(updatedAt)
    setHasSubmitted(currentScore !== null)
  }, [currentScore, updatedAt])

  useEffect(() => {
    if (!savedAt) return

    const interval = setInterval(() => {
      const elapsed = Date.now() - new Date(savedAt).getTime()
      const remaining = EDIT_WINDOW_MS - elapsed
      if (remaining <= 0) {
        clearInterval(interval)
        setTimeLeft('')
      } else {
        const secs = Math.floor(remaining / 1000)
        setTimeLeft(`${secs}s`)
      }
    }, 1000)

    const elapsed = Date.now() - new Date(savedAt).getTime()
    const remaining = EDIT_WINDOW_MS - elapsed
    if (remaining <= 0) {
      setTimeLeft('')
    } else {
      const secs = Math.floor(remaining / 1000)
      setTimeLeft(`${secs}s`)
    }

    return () => clearInterval(interval)
  }, [savedAt])

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
    }
  }

  if (hasWindowExpired) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
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
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          {canEdit ? 'Editar pontuação' : 'Registrar pontuação'}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {canEdit
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
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-6 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Salvando...' : canEdit ? 'Atualizar pontuação' : 'Salvar pontuação'}
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

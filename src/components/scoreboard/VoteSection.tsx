'use client'

import { useState, useEffect } from 'react'

const EDIT_WINDOW_MS = 5 * 60 * 1000 // 5 minutes

export default function VoteSection({
  matchId,
  currentScore,
  votedAt,
}: {
  matchId: string
  currentScore: number | null
  votedAt: string | null
}) {
  const [score, setScore] = useState(currentScore?.toString() ?? '')
  const [timeLeft, setTimeLeft] = useState('')
  const [hasVoted, setHasVoted] = useState(currentScore !== null)
  const [loading, setLoading] = useState(false)
  const isEditing = currentScore !== null

  useEffect(() => {
    if (!votedAt) return
    const interval = setInterval(() => {
      const elapsed = Date.now() - new Date(votedAt).getTime()
      const remaining = EDIT_WINDOW_MS - elapsed
      if (remaining <= 0) {
        clearInterval(interval)
        setTimeLeft('')
        setHasVoted(true)
      } else {
        const mins = Math.floor(remaining / 60000)
        const secs = Math.floor((remaining % 60000) / 1000)
        setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [votedAt])

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
      setHasVoted(true)
    }
  }

  if (hasVoted && !timeLeft) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
            ✓
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900">Voto registrado</p>
            <p className="text-sm text-gray-500">Volte amanhã para votar novamente.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          {isEditing ? 'Editar voto' : 'Seu voto'}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {isEditing ? 'Você pode ajustar sua pontuação dentro da janela de edição.' : 'Digite sua pontuação de hoje.'}
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
          {loading ? 'Salvando...' : isEditing ? 'Salvar' : 'Votar'}
        </button>
      </div>
      {timeLeft && (
        <p className="mt-3 text-sm font-medium text-orange-600">
          <span className="font-mono">⏱ {timeLeft}</span> para editar
        </p>
      )}
    </div>
  )
}

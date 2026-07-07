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
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-700">
          ✓ Votou
        </div>
        <p className="text-sm text-gray-500 mt-3">Volte amanhã para votar novamente!</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-4">
        {currentScore !== null ? 'Editar Voto' : 'Seu Voto'}
      </h3>
      <div className="flex gap-3">
        <input
          type="number"
          min={0}
          max={999}
          value={score}
          onChange={e => setScore(e.target.value)}
          className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0-999"
        />
        <button
          onClick={handleSubmit}
          disabled={loading || score === ''}
          className="rounded-2xl bg-blue-600 px-6 py-2 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Salvando...' : currentScore !== null ? 'Salvar' : 'Votar'}
        </button>
      </div>
      {timeLeft && (
        <p className="text-sm text-orange-500 mt-3 font-mono">
          ⏱ {timeLeft} para editar
        </p>
      )}
    </div>
  )
}

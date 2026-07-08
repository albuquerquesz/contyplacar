'use client'

import { useState, useCallback } from 'react'
import ScoreSection from '@/components/scoreboard/ScoreSection'
import HistoryList from '@/components/scoreboard/HistoryList'

type Player = { id: string; name: string; email: string; avatar_url: string | null }

export default function ScoreboardClient({
  matchId,
  player1,
  player2,
  initialPlayer1Total,
  initialPlayer2Total,
  userScore,
  userUpdatedAt,
  history,
}: {
  matchId: string
  player1: Player
  player2: Player
  initialPlayer1Total: number
  initialPlayer2Total: number
  userScore: number | null
  userUpdatedAt: string | null
  history: Array<{ date: string; player1Score: number; player2Score: number }>
}) {
  const [player1Total, setPlayer1Total] = useState(initialPlayer1Total)
  const [player2Total, setPlayer2Total] = useState(initialPlayer2Total)

  const handleScoreSaved = useCallback(async () => {
    try {
      const res = await fetch(`/api/scores?matchId=${matchId}`)
      if (!res.ok) return
      const data = await res.json()
      const newTotals: Record<string, number> = {}
      data.forEach((s: { player_id: string; score: number }) => {
        newTotals[s.player_id] = (newTotals[s.player_id] || 0) + s.score
      })
      setPlayer1Total(newTotals[player1.id] ?? 0)
      setPlayer2Total(newTotals[player2.id] ?? 0)
    } catch {
      // Keep current totals on error
    }
  }, [matchId, player1.id, player2.id])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-gray-500">
            Placar do dia
          </p>
          <div className="mt-4 grid grid-cols-2 gap-6 border-t border-gray-200 pt-6 sm:gap-8">
            <div className="pr-4">
              <p className="text-sm text-gray-500">{player1.name}</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-gray-900">{player1Total}</p>
            </div>
            <div className="border-l border-gray-200 pl-4">
              <p className="text-sm text-gray-500">{player2.name}</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-gray-900">{player2Total}</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <ScoreSection
            matchId={matchId}
            currentScore={userScore}
            updatedAt={userUpdatedAt}
            onSaved={handleScoreSaved}
          />
        </div>

        <div className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-[0.16em] text-gray-500">
            Histórico
          </h2>
          <HistoryList
            history={history.slice(0, 10)}
            player1Name={player1.name}
            player2Name={player2.name}
          />
        </div>
      </div>
    </div>
  )
}

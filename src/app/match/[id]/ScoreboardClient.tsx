'use client'

import { useState, useCallback } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import ScoreSection from '@/components/scoreboard/ScoreSection'
import HistoryList from '@/components/scoreboard/HistoryList'
import type { HistoryEntry } from '@/components/scoreboard/types'

type Player = { id: string; name: string; email: string; avatar_url: string | null }

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
}

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
  history: HistoryEntry[]
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
          <div className="mt-4 grid grid-cols-2 gap-6 border-t border-gray-200 pt-8 sm:gap-8">
            <div className="flex flex-col items-center text-center">
              <Avatar className="size-14">
                <AvatarImage src={player1.avatar_url ?? undefined} alt={player1.name} />
                <AvatarFallback>{getInitials(player1.name)}</AvatarFallback>
              </Avatar>
              <p className="mt-4 text-5xl font-semibold tracking-tight text-gray-900">
                {player1Total}
              </p>
            </div>
            <div className="flex flex-col items-center text-center border-l border-gray-200 pl-4">
              <Avatar className="size-14">
                <AvatarImage src={player2.avatar_url ?? undefined} alt={player2.name} />
                <AvatarFallback>{getInitials(player2.name)}</AvatarFallback>
              </Avatar>
              <p className="mt-4 text-5xl font-semibold tracking-tight text-gray-900">
                {player2Total}
              </p>
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
          <HistoryList history={history} />
        </div>
      </div>
    </div>
  )
}

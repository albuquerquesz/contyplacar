'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import ScoreSection from '@/components/scoreboard/ScoreSection'
import HistoryList from '@/components/scoreboard/HistoryList'
import type { HistoryEntry } from '@/components/scoreboard/types'
import { Button } from '@/components/ui/Button'
import { LogOut } from 'lucide-react'

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

function ConfirmLeaveModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  useEffect(() => {
    if (!open) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Sair da partida?</h3>
        <p className="text-sm text-gray-500 mb-6">
          Ao sair, você não poderá mais registrar pontuação nesta disputa.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            className="bg-red-600 hover:bg-red-700 focus:ring-red-100"
            onClick={onConfirm}
          >
            Sair
          </Button>
        </div>
      </div>
    </div>
  )
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
  const router = useRouter()
  const [player1Total, setPlayer1Total] = useState(initialPlayer1Total)
  const [player2Total, setPlayer2Total] = useState(initialPlayer2Total)
  const [showLeaveModal, setShowLeaveModal] = useState(false)

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

  const handleLeave = async () => {
    try {
      await fetch('/api/matches/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId }),
      })
      router.push('/dashboard')
    } catch {
      setShowLeaveModal(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 pt-4 pb-8 sm:pb-10">
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLeaveModal(true)}
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors rounded-full p-2"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        <div>
          <div className="mt-4 grid grid-cols-2 gap-6 border-t border-gray-200 pt-8 sm:gap-8">
            <div className="flex flex-col items-center text-center">
              <Avatar className="size-18">
                <AvatarImage src={player1.avatar_url ?? undefined} alt={player1.name} />
                <AvatarFallback>{getInitials(player1.name)}</AvatarFallback>
              </Avatar>
              <p className="mt-4 text-5xl font-semibold tracking-tight text-gray-900">
                {player1Total}
              </p>
            </div>
            <div className="flex flex-col items-center text-center border-l border-gray-200 pl-4">
              <Avatar className="size-18">
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

      <ConfirmLeaveModal
        open={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onConfirm={handleLeave}
      />
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Save, Undo2, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'

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
  const [hasSubmitted, setHasSubmitted] = useState(currentScore !== null)
  const [savedAt, setSavedAt] = useState(updatedAt)
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

  async function handleToggle() {
    const score = hasSubmitted && isWithinEditWindow ? 0 : 1
    setLoading(true)
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, score }),
    })
    setLoading(false)

    if (res.ok) {
      setSavedAt(new Date().toISOString())
      setHasSubmitted(true)
      onSaved?.(score)
    }
  }

  if (hasWindowExpired) {
    return (
      <div className="border-t border-gray-200 pt-6">
        <div className="flex justify-center">
          <Button
            variant="primary"
            className="min-w-[200px] bg-green-600 hover:bg-green-700"
            disabled
          >
            <Check className="h-5 w-5" />
            Pontuação registrada
          </Button>
        </div>
      </div>
    )
  }

  const isUndo = hasSubmitted && isWithinEditWindow

  return (
    <div className="border-t border-gray-200 pt-6">
      <div className="flex justify-center">
        <Button
          variant={isUndo ? 'outline' : 'primary'}
          className="min-w-[200px]"
          onClick={handleToggle}
          disabled={loading}
        >
          {isUndo ? (
            <>
              <Undo2 className="h-5 w-5" />
              Desfazer
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Pontuar
            </>
          )}
        </Button>
      </div>
      {timeLeft && (
        <p className="mt-3 text-center text-sm font-medium text-orange-600">
          <span className="font-mono">⏱ {timeLeft}</span> para desfazer
        </p>
      )}
    </div>
  )
}

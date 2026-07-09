'use client'

import { useState } from 'react'
import { Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function ScoreSection({
  matchId,
  currentScore,
  onSaved,
}: {
  matchId: string
  currentScore: number | null
  onSaved?: (score: number) => void
}) {
  const [hasSubmitted, setHasSubmitted] = useState(currentScore !== null)
  const [loading, setLoading] = useState(false)

  async function handleScore() {
    setLoading(true)
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, score: 1 }),
    })
    setLoading(false)

    if (res.ok) {
      setHasSubmitted(true)
      onSaved?.(1)
    }
  }

  if (hasSubmitted) {
    return (
      <div className="border-t border-gray-200 pt-6">
        <div className="flex justify-center">
          <Button
            variant="primary"
            className="w-[340px] bg-green-600 hover:bg-green-700"
            disabled
          >
            <Check className="h-5 w-5" />
            Pontuou
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-gray-200 pt-6">
      <div className="flex justify-center">
        <Button
          variant="primary"
          className="w-[340px]"
          onClick={handleScore}
          disabled={loading}
        >
          <Plus className="h-5 w-5" />
          Pontuar
        </Button>
      </div>
    </div>
  )
}

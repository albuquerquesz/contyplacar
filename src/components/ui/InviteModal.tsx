'use client'

import { useCallback, useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { Copy, Check } from 'lucide-react'
import { Button } from './Button'
import { Tabs, TabsList, TabsTrigger } from './tabs'

interface InviteModalProps {
  open: boolean
  onCopy: (values: { senderInitialScore?: number; opponentInitialScore?: number; gameMode: 'first_arrival' | 'last_departure' }) => Promise<void>
  onClose: () => void
}

const MIN_SCORE = 0
const MAX_SCORE = 999

function sanitizeScoreInput(value: string) {
  if (value === '') {
    return ''
  }

  const parsed = Number.parseInt(value, 10)

  if (Number.isNaN(parsed)) {
    return ''
  }

  return String(Math.min(MAX_SCORE, Math.max(MIN_SCORE, parsed)))
}

function parseScore(value: string) {
  if (value === '') {
    return undefined
  }

  const parsed = Number.parseInt(value, 10)

  if (Number.isNaN(parsed)) {
    return undefined
  }

  return Math.min(MAX_SCORE, Math.max(MIN_SCORE, parsed))
}

export default function InviteModal({ open, onCopy, onClose }: InviteModalProps) {
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [senderInitialScore, setSenderInitialScore] = useState('')
  const [opponentInitialScore, setOpponentInitialScore] = useState('')
  const [gameMode, setGameMode] = useState<'first_arrival' | 'last_departure'>('first_arrival')

  const handleClose = useCallback(() => {
    setCopied(false)
    setLoading(false)
    setSenderInitialScore('')
    setOpponentInitialScore('')
    setGameMode('first_arrival')
    onClose()
  }, [onClose])

  useEffect(() => {
    if (open) {
      setCopied(false)
      setLoading(false)
      setSenderInitialScore('')
      setOpponentInitialScore('')
      setGameMode('first_arrival')
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [open, handleClose])

  const handleCopy = async () => {
    try {
      setLoading(true)
      await onCopy({
        senderInitialScore: parseScore(senderInitialScore),
        opponentInitialScore: parseScore(opponentInitialScore),
        gameMode,
      })
      setCopied(true)
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#60a5fa', '#93c5fd', '#f59e0b', '#10b981'],
      })
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h3 className="text-xl font-bold text-gray-900 mb-1">Convide um amigo</h3>
        <p className="text-sm text-gray-500 mb-6">
          Defina os valores iniciais e envie o convite para começar a disputa com um amigo.
        </p>

        <div className="space-y-4 mb-6">
          <label htmlFor="game-mode" className="mb-2 block text-sm font-medium text-gray-700">
            Modo de jogo
          </label>
          <Tabs value={gameMode} onValueChange={(v) => setGameMode(v as 'first_arrival' | 'last_departure')}>
            <TabsList className="w-full">
              <TabsTrigger value="first_arrival" className="flex-1">Quem chega primeiro</TabsTrigger>
              <TabsTrigger value="last_departure" className="flex-1">Quem sai por último</TabsTrigger>
            </TabsList>
          </Tabs>

          <div>
            <label htmlFor="sender-initial-score" className="mb-2 block text-sm font-medium text-gray-700">
              Seu valor inicial
            </label>
            <input
              id="sender-initial-score"
              type="number"
              min={MIN_SCORE}
              max={MAX_SCORE}
              value={senderInitialScore}
              placeholder="0"
              onChange={(event) => setSenderInitialScore(sanitizeScoreInput(event.target.value))}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>

          <div>
            <label htmlFor="opponent-initial-score" className="mb-2 block text-sm font-medium text-gray-700">
              Valor inicial do oponente
            </label>
            <input
              id="opponent-initial-score"
              type="number"
              min={MIN_SCORE}
              max={MAX_SCORE}
              value={opponentInitialScore}
              placeholder="0"
              onChange={(event) => setOpponentInitialScore(sanitizeScoreInput(event.target.value))}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
        </div>

        <Button variant="primary" fullWidth onClick={handleCopy} disabled={loading}>
          {copied ? (
            <>
              <Check className="h-5 w-5" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              {loading ? 'Gerando...' : 'Copiar'}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

'use client'

import { useCallback, useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { Copy, Check } from 'lucide-react'
import { Button } from './Button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog'
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

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (!nextOpen) {
        handleClose()
      }
    }}>
      <DialogContent className="gap-0 p-6 sm:max-w-lg">
        <DialogHeader className="mb-5">
          <DialogTitle className="text-xl leading-none tracking-tight">Convide um amigo</DialogTitle>
          <DialogDescription className="text-sm leading-5">
            Defina os valores iniciais e envie o convite para começar a disputa com um amigo.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-5 space-y-3.5">
          <p className="mb-1.5 block text-sm font-medium text-gray-700">
            Modo de jogo
          </p>
          <Tabs value={gameMode} onValueChange={(v) => setGameMode(v as 'first_arrival' | 'last_departure')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="first_arrival" className="w-full">Quem chega primeiro</TabsTrigger>
              <TabsTrigger value="last_departure" className="w-full">Quem sai por último</TabsTrigger>
            </TabsList>
          </Tabs>

          <div>
            <label htmlFor="sender-initial-score" className="mb-1.5 block text-sm font-medium text-gray-700">
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
              className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none transition-colors focus:border-blue-300 focus:bg-white [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>

          <div>
            <label htmlFor="opponent-initial-score" className="mb-1.5 block text-sm font-medium text-gray-700">
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
              className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none transition-colors focus:border-blue-300 focus:bg-white [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
      </DialogContent>
    </Dialog>
  )
}

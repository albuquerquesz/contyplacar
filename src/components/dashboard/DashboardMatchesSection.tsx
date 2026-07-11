'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import MatchList from '@/components/dashboard/MatchList'
import { type Match, readPlayerIds } from '@/components/dashboard/match-types'
import { Button } from '@/components/ui/Button'

type DashboardMatchesSectionProps = {
  userId: string
  onInvite: () => void
  inviteDisabled?: boolean
}

export default function DashboardMatchesSection({
  userId,
  onInvite,
  inviteDisabled = false,
}: DashboardMatchesSectionProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const prevMatchIdsRef = useRef<Set<string>>(new Set())
  const [newMatchIds, setNewMatchIds] = useState<Set<string>>(new Set())
  const isMountedRef = useRef(true)

  const loadMatches = useCallback(async (options?: { retry?: boolean; silent?: boolean }) => {
    const isRetry = options?.retry === true
    const isSilent = options?.silent === true

    if (isRetry) {
      setRetrying(true)
    }

    if (!isSilent && !isRetry) {
      setLoading(true)
    }

    if (!isSilent) {
      setError(null)
    }

    if (!userId) {
      return
    }

    const supabase = createClient()

    if (!isMountedRef.current) {
      return
    }

    const { data, error: fetchError } = await supabase
      .from('matches')
      .select('*, player1:player1_id(id, name, avatar_url), player2:player2_id(id, name, avatar_url)')
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
      .neq('status', 'completed')
      .order('created_at', { ascending: false })

    if (!isMountedRef.current) {
      return
    }

    if (fetchError) {
      console.error('Failed to load matches:', fetchError)

      if (!isSilent) {
        setError('Houve um problema ao buscar suas disputas. Tente novamente.')
      }

      if (isRetry) {
        setRetrying(false)
      }

      if (!isSilent && !isRetry) {
        setLoading(false)
      }
      return
    }

    setMatches(data ?? [])

    if (isRetry) {
      setRetrying(false)
      return
    }

    if (!isSilent) {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    isMountedRef.current = true

    if (userId) {
      void loadMatches()
    }

    return () => {
      isMountedRef.current = false
    }
  }, [loadMatches, userId])

  useEffect(() => {
    if (!userId) {
      return
    }

    const supabase = createClient()
    const shouldRefetchMatches = (payload: RealtimePostgresChangesPayload<{ [key: string]: unknown }>) => {
      const { nextPlayer1Id, nextPlayer2Id, previousPlayer1Id, previousPlayer2Id } = readPlayerIds(payload)

      if (nextPlayer1Id === userId || nextPlayer2Id === userId) {
        return true
      }

      if (previousPlayer1Id === userId || previousPlayer2Id === userId) {
        return true
      }

      return false
    }

    const channel = supabase
      .channel(`dashboard-matches-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        (payload) => {
          if (!shouldRefetchMatches(payload)) {
            return
          }

          void loadMatches({ silent: true })
        },
      )
      .subscribe()

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        return
      }

      void loadMatches({ silent: true })
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      void supabase.removeChannel(channel)
    }
  }, [loadMatches, userId])

  useEffect(() => {
    const currentIds = new Set(matches.map((match) => match.id))
    const added = new Set([...currentIds].filter((id) => !prevMatchIdsRef.current.has(id)))

    if (added.size > 0) {
      setNewMatchIds(added)
      setTimeout(() => setNewMatchIds(new Set()), 1200)
    }

    prevMatchIdsRef.current = currentIds
  }, [matches])

  const handleRetry = async () => {
    await loadMatches({ retry: true })
  }

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold leading-none text-gray-900">Suas Disputas</h2>
        <Button variant="primary" onClick={onInvite} disabled={inviteDisabled}>
          <Plus className="h-5 w-5" />
          Convidar
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <svg className="h-8 w-8 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : error ? (
        <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto max-w-md text-center">
            <div className="flex justify-center">
              <div className="relative h-32 w-32">
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  <defs>
                    <linearGradient id="errorTrophyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#fecaca" />
                      <stop offset="100%" stopColor="#fca5a5" />
                    </linearGradient>
                  </defs>
                  <ellipse cx="50" cy="55" rx="40" ry="25" fill="#fef2f2" />
                  <path d="M35 30 L35 20 Q50 15 65 20 L65 30 L70 30 L70 40 Q70 50 60 50 L55 50 L55 65 L45 65 L45 50 L40 50 Q30 50 30 40 L30 30 L35 30 Z" fill="url(#errorTrophyGrad)" />
                  <path d="M35 32 Q25 32 25 40 Q25 46 35 44" fill="none" stroke="#fca5a5" strokeWidth="3" strokeLinecap="round" />
                  <path d="M65 32 Q75 32 75 40 Q75 46 65 44" fill="none" stroke="#fca5a5" strokeWidth="3" strokeLinecap="round" />
                  <path d="M46 35 H54 V47 H46 Z" fill="#ef4444" rx="2" />
                  <circle cx="50" cy="53" r="2.5" fill="#ef4444" />
                </svg>
              </div>
            </div>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900">
              Não foi possível carregar suas disputas
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">{error}</p>
            <Button className="mt-6" variant="outline" onClick={handleRetry} loading={retrying}>
              Tentar novamente
            </Button>
          </div>
        </section>
      ) : matches.length === 0 ? (
        <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto max-w-md text-center">
            <div className="flex justify-center">
              <div className="relative h-32 w-32">
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  <defs>
                    <linearGradient id="trophyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#bfdbfe" />
                      <stop offset="100%" stopColor="#93c5fd" />
                    </linearGradient>
                  </defs>
                  <ellipse cx="50" cy="55" rx="40" ry="25" fill="#eff6ff" />
                  <path d="M35 30 L35 20 Q50 15 65 20 L65 30 L70 30 L70 40 Q70 50 60 50 L55 50 L55 65 L45 65 L45 50 L40 50 Q30 50 30 40 L30 30 L35 30 Z" fill="url(#trophyGrad)" />
                  <path d="M35 32 Q25 32 25 40 Q25 46 35 44" fill="none" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round" />
                  <path d="M65 32 Q75 32 75 40 Q75 46 65 44" fill="none" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round" />
                  <path d="M50 33 L52 38 L57 38 L53 41 L54 46 L50 43 L46 46 L47 41 L43 38 L48 38 Z" fill="#60a5fa" />
                  <rect x="42" y="65" width="16" height="4" rx="2" fill="#93c5fd" />
                  <rect x="38" y="69" width="24" height="4" rx="2" fill="#bfdbfe" />
                  <circle cx="20" cy="25" r="2" fill="#93c5fd" opacity="0.6" />
                  <circle cx="80" cy="28" r="1.5" fill="#93c5fd" opacity="0.4" />
                  <circle cx="75" cy="50" r="1" fill="#93c5fd" opacity="0.5" />
                  <circle cx="25" cy="52" r="1.5" fill="#93c5fd" opacity="0.3" />
                  <path d="M15 75 L15 68 L13 65" fill="none" stroke="#bfdbfe" strokeWidth="2" strokeLinecap="round" />
                  <path d="M85 75 L85 68 L87 65" fill="none" stroke="#bfdbfe" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900">Nenhuma disputa ainda</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Parece que você ainda não tem disputas. Convide um amigo e comece a primeira.
            </p>
            <Button className="mt-6" variant="outline" onClick={onInvite} disabled={inviteDisabled}>
              <Plus className="h-5 w-5" />
              Convidar
            </Button>
          </div>
        </section>
      ) : (
        <div className="pt-6">
          <MatchList matches={matches} currentUserId={userId} newMatchIds={newMatchIds} />
        </div>
      )}
    </section>
  )
}

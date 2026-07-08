import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { HistoryEntry } from '@/components/scoreboard/types'
import ScoreboardClient from './ScoreboardClient'

type ScoreEvent = {
  id: string
  action: 'scored' | 'undid'
  created_at: string
  player: { id: string; name: string; avatar_url: string | null }
}

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Fetch match
  const { data: match } = await supabase
    .from('matches')
    .select(`
      *,
      player1:player1_id(id, name, email, avatar_url),
      player2:player2_id(id, name, email, avatar_url)
    `)
    .eq('id', id)
    .single()

  if (!match) {
    return redirect('/dashboard')
  }

  // Check user is part of this match
  const isPlayer = match.player1.id === user.id || match.player2.id === user.id
  if (!isPlayer) {
    return redirect('/dashboard')
  }

  // Check if user has left
  const isPlayer1 = match.player1.id === user.id
  const userLeft = isPlayer1 ? match.player1_left : match.player2_left
  if (userLeft) {
    return redirect('/dashboard')
  }

  const today = new Date().toISOString().split('T')[0]

  // Fetch today's scores
  const { data: todayScores } = await supabase
    .from('scores')
    .select('player_id, score, updated_at')
    .eq('match_id', id)
    .eq('date', today)

  const userScore = todayScores?.find(s => s.player_id === user.id)

  const { data: totalScores } = await supabase
    .from('scores')
    .select('player_id, score')
    .eq('match_id', id)

  const totals: Record<string, number> = {}
  totalScores?.forEach(s => {
    totals[s.player_id] = (totals[s.player_id] || 0) + s.score
  })

  const { data: allScores } = await supabase
    .from('scores')
    .select('player_id, score, updated_at, date')
    .eq('match_id', id)
    .order('updated_at', { ascending: false })

  const playerById = {
    [match.player1.id]: {
      name: match.player1.name,
      avatarUrl: match.player1.avatar_url,
    },
    [match.player2.id]: {
      name: match.player2.name,
      avatarUrl: match.player2.avatar_url,
    },
  }

  const history: HistoryEntry[] = (allScores ?? [])
    .filter(score => Boolean(score.updated_at) && score.player_id in playerById)
    .map(score => ({
      id: `${score.date}-${score.player_id}-${score.updated_at}`,
      playerName: playerById[score.player_id].name,
      playerAvatarUrl: playerById[score.player_id].avatarUrl,
      score: score.score,
      recordedAt: score.updated_at ?? '',
    }))

  // Fetch score events for timeline
  const { data: events } = await supabase
    .from('score_events')
    .select(`
      id,
      action,
      created_at,
      player:player_id(id, name, email, avatar_url)
    `)
    .eq('match_id', id)
    .order('created_at', { ascending: true })

  const scoreEvents: ScoreEvent[] = (events ?? [])
    .filter(e => Array.isArray(e.player) && e.player.length > 0)
    .map(e => ({
      id: e.id,
      action: e.action as 'scored' | 'undid',
      created_at: e.created_at,
      player: e.player[0] as { id: string; name: string; avatar_url: string | null },
    }))

  const player1Total = totals[match.player1.id] || 0
  const player2Total = totals[match.player2.id] || 0

  return (
    <ScoreboardClient
      matchId={id}
      player1={match.player1}
      player2={match.player2}
      initialPlayer1Total={player1Total}
      initialPlayer2Total={player2Total}
      userScore={userScore?.score ?? null}
      userUpdatedAt={userScore?.updated_at ?? null}
      history={history}
      scoreEvents={scoreEvents}
    />
  )
}

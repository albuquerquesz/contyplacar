import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ScoreboardClient from './ScoreboardClient'

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
    .select('player_id, score, date')
    .eq('match_id', id)
    .order('date', { ascending: false })

  const history: Array<{
    date: string
    player1Score: number
    player2Score: number
  }> = []

  const scoresByDate: Record<string, Record<string, number>> = {}
  allScores?.forEach(s => {
    if (!scoresByDate[s.date]) scoresByDate[s.date] = {}
    scoresByDate[s.date][s.player_id] = s.score
  })

  for (const [date, players] of Object.entries(scoresByDate)) {
    if (match.player1.id in players && match.player2.id in players) {
      history.push({
        date,
        player1Score: players[match.player1.id],
        player2Score: players[match.player2.id],
      })
    }
  }

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
    />
  )
}

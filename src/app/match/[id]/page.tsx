import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import VoteSection from '@/components/scoreboard/VoteSection'
import HistoryList from '@/components/scoreboard/HistoryList'

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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-2xl border border-gray-200 bg-white h-50 p-4 text-center shadow-sm">
              <p className="mb-1 text-sm text-gray-500">{match.player1.name}</p>
              <p className="text-3xl font-bold text-blue-600">{player1Total}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm">
              <p className="mb-1 text-sm text-gray-500">{match.player2.name}</p>
              <p className="text-3xl font-bold text-blue-600">{player2Total}</p>
            </div>
          </div>
        </div>

        <div className='mt-8'>
          <VoteSection
            matchId={id}
            currentScore={userScore?.score ?? null}
            updatedAt={userScore?.updated_at ?? null}
          />
        </div>


        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Histórico</h2>
          <HistoryList
            history={history.slice(0, 10)}
            player1Name={match.player1.name}
            player2Name={match.player2.name}
          />
        </div>
      </div>
    </div>
  )
}

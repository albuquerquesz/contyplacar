import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type ScoreEventRow = {
  id: string
  action: 'scored' | 'undid'
  created_at: string
  player:
    | { id: string; name: string; avatar_url: string | null }
    | { id: string; name: string; avatar_url: string | null }[]
    | null
}

function normalizeScoreEventPlayer(player: ScoreEventRow['player']) {
  if (Array.isArray(player)) {
    return player[0] ?? null
  }

  return player
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const matchId = searchParams.get('matchId')

  if (!matchId) {
    return NextResponse.json({ error: 'Missing matchId' }, { status: 400 })
  }

  const { data: events } = await supabase
    .from('score_events')
    .select(`
      id,
      action,
      created_at,
      player:player_id(id, name, email, avatar_url)
    `)
    .eq('match_id', matchId)
    .order('created_at', { ascending: true })

  const normalizedEvents = ((events ?? []) as ScoreEventRow[])
    .map((event) => ({
      ...event,
      player: normalizeScoreEventPlayer(event.player),
    }))
    .filter((event) => Boolean(event.player?.id && event.player?.name))
    .map((event) => ({
      id: event.id,
      action: event.action,
      created_at: event.created_at,
      player: event.player,
    }))

  return NextResponse.json(normalizedEvents)
}

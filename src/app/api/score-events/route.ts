import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

  return NextResponse.json(events ?? [])
}

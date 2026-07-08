import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { matchId } = await request.json()
  if (!matchId) {
    return NextResponse.json({ error: 'Missing matchId' }, { status: 400 })
  }

  const { data: match } = await supabase
    .from('matches')
    .select('player1_id, player2_id, player1_left, player2_left')
    .eq('id', matchId)
    .single()

  if (!match) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 })
  }

  const isPlayer1 = match.player1_id === user.id
  const isPlayer2 = match.player2_id === user.id

  if (!isPlayer1 && !isPlayer2) {
    return NextResponse.json({ error: 'Not a player in this match' }, { status: 403 })
  }

  const updates: Record<string, unknown> = {}
  if (isPlayer1) {
    updates.player1_left = true
  } else {
    updates.player2_left = true
  }

  // If both players left, mark as completed
  if (isPlayer1 && match.player2_left) {
    updates.status = 'completed'
  } else if (isPlayer2 && match.player1_left) {
    updates.status = 'completed'
  }

  const { error } = await supabase
    .from('matches')
    .update(updates)
    .eq('id', matchId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

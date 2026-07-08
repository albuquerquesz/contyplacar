import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const EDIT_WINDOW_MS = 60 * 1000

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

  // Check if user is part of the match
  const { data: match } = await supabase
    .from('matches')
    .select('player1_id, player2_id')
    .eq('id', matchId)
    .single()

  if (!match || (match.player1_id !== user.id && match.player2_id !== user.id)) {
    return NextResponse.json({ error: 'Not a participant' }, { status: 403 })
  }

  const { data: scores } = await supabase
    .from('scores')
    .select('player_id, score')
    .eq('match_id', matchId)

  return NextResponse.json(scores ?? [])
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { matchId, score } = await request.json()

  if (!matchId || score === undefined) {
    return NextResponse.json({ error: 'Missing matchId or score' }, { status: 400 })
  }

  const today = new Date().toISOString().split('T')[0]

  // Check if user is part of the match
  const { data: match } = await supabase
    .from('matches')
    .select('player1_id, player2_id')
    .eq('id', matchId)
    .single()

  if (!match || (match.player1_id !== user.id && match.player2_id !== user.id)) {
    return NextResponse.json({ error: 'Not a participant' }, { status: 403 })
  }

  // Check if already submitted today and still within the correction window.
  const { data: existing } = await supabase
    .from('scores')
    .select('id, updated_at')
    .eq('match_id', matchId)
    .eq('player_id', user.id)
    .eq('date', today)
    .single()

  if (existing) {
    const elapsed = Date.now() - new Date(existing.updated_at).getTime()
    if (elapsed >= EDIT_WINDOW_MS) {
      return NextResponse.json({ error: 'Edit window expired' }, { status: 403 })
    }
  }

  if (score === 0) {
    if (!existing) {
      return NextResponse.json({ ok: true })
    }

    const { error } = await supabase
      .from('scores')
      .delete()
      .eq('id', existing.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await supabase.from('score_events').insert({
      match_id: matchId,
      player_id: user.id,
      action: 'undid',
    })

    return NextResponse.json({ ok: true })
  }

  // Upsert score
  const { error } = await supabase
    .from('scores')
    .upsert(
      {
        match_id: matchId,
        player_id: user.id,
        score,
        date: today,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'match_id,player_id,date',
      }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Record event
  await supabase.from('score_events').insert({
    match_id: matchId,
    player_id: user.id,
    action: 'scored',
  })

  return NextResponse.json({ ok: true })
}

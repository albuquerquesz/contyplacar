import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function isValidInitialScore(value: unknown) {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 999
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { linkCode, senderInitialScore, opponentInitialScore, gameMode } = await request.json()
  const normalizedSenderInitialScore = senderInitialScore ?? 0
  const normalizedOpponentInitialScore = opponentInitialScore ?? 0
  const normalizedGameMode = gameMode ?? 'first_arrival'

  if (!linkCode) {
    return NextResponse.json({ error: 'Missing linkCode' }, { status: 400 })
  }

  if (!isValidInitialScore(normalizedSenderInitialScore) || !isValidInitialScore(normalizedOpponentInitialScore)) {
    return NextResponse.json({ error: 'Invalid initial scores' }, { status: 400 })
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  // Ensure profile exists (trigger may not have run for existing users)
  await supabase.from('profiles').upsert({
    id: user.id,
    name: user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'User',
    email: user.email ?? '',
    avatar_url: user.user_metadata?.avatar_url ?? null,
  }, { onConflict: 'id' })

  const { error } = await supabase.from('invitations').insert({
    sender_id: user.id,
    link_code: linkCode,
    sender_initial_score: normalizedSenderInitialScore,
    opponent_initial_score: normalizedOpponentInitialScore,
    game_mode: normalizedGameMode,
    status: 'pending',
    expires_at: expiresAt,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ code: linkCode })
}

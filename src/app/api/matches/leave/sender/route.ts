import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getMatchForLeave, getPlayerRole, buildSenderLeaveUpdates, applyLeaveUpdate } from '@/lib/match-leave'

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

  const match = await getMatchForLeave(supabase, matchId)
  if (!match) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 })
  }

  const role = getPlayerRole(match, user.id)
  if (role !== 'sender') {
    return NextResponse.json({ error: 'Not the sender of this match' }, { status: 403 })
  }

  const updates = buildSenderLeaveUpdates(match)

  const error = await applyLeaveUpdate(supabase, matchId, updates)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

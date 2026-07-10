import type { SupabaseClient } from '@supabase/supabase-js'

type MatchRow = {
  id: string
  player1_id: string
  player2_id: string
  player1_left: boolean
  player2_left: boolean
}

export async function getMatchForLeave(supabase: SupabaseClient, matchId: string) {
  const { data } = await supabase
    .from('matches')
    .select('player1_id, player2_id, player1_left, player2_left')
    .eq('id', matchId)
    .single()

  return data as MatchRow | null
}

export function getPlayerRole(match: MatchRow, userId: string): 'sender' | 'opponent' | null {
  if (match.player1_id === userId) return 'sender'
  if (match.player2_id === userId) return 'opponent'
  return null
}

export function buildSenderLeaveUpdates(match: MatchRow): Record<string, unknown> {
  const updates: Record<string, unknown> = { player1_left: true }
  if (match.player2_left) {
    updates.status = 'completed'
  }
  return updates
}

export function buildOpponentLeaveUpdates(match: MatchRow): Record<string, unknown> {
  const updates: Record<string, unknown> = { player2_left: true }
  if (match.player1_left) {
    updates.status = 'completed'
  }
  return updates
}

export async function applyLeaveUpdate(
  supabase: SupabaseClient,
  matchId: string,
  updates: Record<string, unknown>
): Promise<Error | null> {
  const { error } = await supabase.from('matches').update(updates).eq('id', matchId)
  return error ?? null
}

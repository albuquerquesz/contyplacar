import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

export type Player = {
  id: string
  name: string
  avatar_url: string | null
}

export type Match = {
  id: string
  player1_id: string
  player2_id: string
  status: string
  player1_left: boolean
  player2_left: boolean
  game_mode: 'first_arrival' | 'last_departure'
  player1: Player
  player2: Player
}

export function readPlayerIds(payload: RealtimePostgresChangesPayload<{ [key: string]: unknown }>) {
  const next = payload.new as Record<string, unknown>
  const previous = payload.old as Record<string, unknown>

  return {
    nextPlayer1Id: typeof next.player1_id === 'string' ? next.player1_id : null,
    nextPlayer2Id: typeof next.player2_id === 'string' ? next.player2_id : null,
    previousPlayer1Id: typeof previous.player1_id === 'string' ? previous.player1_id : null,
    previousPlayer2Id: typeof previous.player2_id === 'string' ? previous.player2_id : null,
  }
}

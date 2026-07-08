import Link from 'next/link'

type Player = {
  id: string
  name: string
  avatar_url: string | null
}

type Match = {
  id: string
  player1_id: string
  player2_id: string
  status: string
  player1_left: boolean
  player2_left: boolean
  player1: Player
  player2: Player
}

export default function MatchList({ matches, currentUserId }: { matches: Match[]; currentUserId: string }) {
  if (matches.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-base font-medium text-gray-700">Nenhum placar de disputa ainda.</p>
        <p className="mt-1 text-sm text-gray-500">Convide um amigo para começar.</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {matches.map((match) => {
        const isPlayer1 = match.player1_id === currentUserId
        const userLeft = isPlayer1 ? match.player1_left : match.player2_left
        const statusLabel = userLeft ? 'Você saiu' : match.status === 'active' ? 'Ativa' : match.status

        return (
          <Link
            key={match.id}
            href={`/match/${match.id}`}
            className="group flex items-center justify-between gap-4 py-4 transition-colors hover:bg-gray-50/80"
          >
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-gray-900">
                {match.player1.name} vs {match.player2.name}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {statusLabel}
              </p>
            </div>
            <span className="shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500">
              →
            </span>
          </Link>
        )
      })}
    </div>
  )
}

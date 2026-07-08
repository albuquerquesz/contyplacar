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
  player1: Player
  player2: Player
}

export default function MatchList({ matches }: { matches: Match[] }) {
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
      {matches.map((match) => (
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
              {match.status === 'active' ? 'Ativa' : match.status}
            </p>
          </div>
          <span className="shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500">
            →
          </span>
        </Link>
      ))}
    </div>
  )
}

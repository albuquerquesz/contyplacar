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
      <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
        <p className="text-gray-500">Nenhum placar de disputa ainda.</p>
        <p className="text-sm text-gray-400 mt-1">Convide um amigo para começar!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {matches.map((match) => (
        <Link
          key={match.id}
          href={`/match/${match.id}`}
          className="block bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:border-blue-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">
                {match.player1.name} vs {match.player2.name}
              </p>
              <p className="text-sm text-gray-500">
                {match.status === 'active' ? 'Ativa' : match.status}
              </p>
            </div>
            <span className="text-gray-400">→</span>
          </div>
        </Link>
      ))}
    </div>
  )
}

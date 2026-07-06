export default function Scoreboard({
  player1,
  player2,
  player1Score,
  player2Score,
  currentUser,
}: {
  player1: { id: string; name: string; avatar_url: string | null }
  player2: { id: string; name: string; avatar_url: string | null }
  player1Score: number | null
  player2Score: number | null
  currentUser: string
}) {
  return (
    <div className="grid grid-cols-3 gap-4 items-center">
      <PlayerCard
        player={player1}
        score={player1Score}
        isActive={currentUser === player1.id}
      />
      <div className="text-center text-gray-400 font-semibold">VS</div>
      <PlayerCard
        player={player2}
        score={player2Score}
        isActive={currentUser === player2.id}
      />
    </div>
  )
}

function PlayerCard({
  player,
  score,
  isActive,
}: {
  player: { id: string; name: string; avatar_url: string | null }
  score: number | null
  isActive: boolean
}) {
  return (
    <div
      className={`bg-white rounded-2xl border p-6 shadow-sm text-center transition-colors ${
        isActive ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200'
      }`}
    >
      <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
        {player.avatar_url ? (
          <img
            src={player.avatar_url}
            alt={player.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 font-semibold text-lg">
            {player.name[0]}
          </div>
        )}
      </div>
      <p className="font-semibold text-gray-900 mb-2">{player.name}</p>
      <p className="text-4xl font-bold text-gray-900">
        {score !== null ? score : '--'}
      </p>
    </div>
  )
}

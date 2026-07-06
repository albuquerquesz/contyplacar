export default function HistoryList({
  history,
  player1Name,
  player2Name,
}: {
  history: Array<{ date: string; player1Score: number; player2Score: number }>
  player1Name: string
  player2Name: string
}) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-2xl border border-gray-200 shadow-sm">
        <p className="text-gray-500">Nenhum resultado ainda.</p>
        <p className="text-sm text-gray-400 mt-1">Ambos precisam votar para registrar uma rodada.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {history.map((entry) => {
        const winner =
          entry.player1Score > entry.player2Score
            ? player1Name
            : entry.player2Score > entry.player1Score
              ? player2Name
              : 'Empate'

        const winnerColor =
          winner === player1Name
            ? 'bg-blue-100 text-blue-700'
            : winner === player2Name
              ? 'bg-purple-100 text-purple-700'
              : 'bg-gray-100 text-gray-700'

        const date = new Date(entry.date + 'T12:00:00')
        const dateStr = date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })

        return (
          <div
            key={entry.date}
            className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center justify-between"
          >
            <span className="text-sm text-gray-500">{dateStr}</span>
            <span className="font-semibold text-gray-900">
              {entry.player1Score} — {entry.player2Score}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${winnerColor}`}>
              {winner}
            </span>
          </div>
        )
      })}
    </div>
  )
}

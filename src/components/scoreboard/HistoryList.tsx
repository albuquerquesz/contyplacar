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
      <div className="border-t border-gray-200 pt-6 text-center">
        <p className="font-medium text-gray-700">Nenhum resultado ainda.</p>
        <p className="mt-1 text-sm text-gray-500">
          Os dois participantes precisam registrar a pontuação para fechar uma rodada.
        </p>
      </div>
    )
  }

  return (
    <div className="border-t border-gray-200">
      {history.map((entry) => {
        const winner =
          entry.player1Score > entry.player2Score
            ? player1Name
            : entry.player2Score > entry.player1Score
              ? player2Name
              : 'Empate'

        const winnerStyles =
          winner === player1Name
            ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
            : winner === player2Name
              ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-100'
              : 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'

        const date = new Date(entry.date + 'T12:00:00')
        const dateStr = date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })

        return (
          <div
            key={entry.date}
            className="flex items-center justify-between gap-4 border-b border-gray-200 py-4 last:border-b-0"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-500">{dateStr}</p>
              <p className="mt-1 text-lg font-semibold tracking-tight text-gray-900">
                {entry.player1Score} <span className="text-gray-300">—</span> {entry.player2Score}
              </p>
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${winnerStyles}`}>
              {winner}
            </span>
          </div>
        )
      })}
    </div>
  )
}

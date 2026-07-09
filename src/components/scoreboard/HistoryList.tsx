'use client'

import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Check, Undo2 } from 'lucide-react'

dayjs.extend(relativeTime)
dayjs.locale('pt-br')

type ScoreEvent = {
  id: string
  action: 'scored' | 'undid'
  created_at: string
  player: { id: string; name: string; avatar_url: string | null }
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
}

function formatTime(created_at: string) {
  const d = dayjs(created_at)
  const today = dayjs().startOf('day')
  const isToday = d.isSame(today, 'day')
  const isYesterday = d.isSame(today.subtract(1, 'day'), 'day')

  if (isToday) return `Hoje às ${d.format('HH[h]mm')}`
  if (isYesterday) return `Ontem às ${d.format('HH[h]mm')}`
  return d.format('DD/MM/YYYY')
}

export default function HistoryList({
  scoreEvents,
}: {
  scoreEvents: ScoreEvent[]
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden min-h-[320px]">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <p className="text-sm font-semibold text-gray-700">Acontecimentos</p>
      </div>

      {scoreEvents.length === 0 ? (
        <div className="flex items-center justify-center min-h-[240px]">
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">Nenhum resultado ainda.</p>
            <p className="mt-1 text-base text-gray-500">
              Os dois participantes precisam registrar a pontuação para fechar uma rodada.
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {scoreEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-3 px-4 py-3"
            >
              <Avatar className="size-8">
                <AvatarImage src={event.player.avatar_url ?? undefined} alt={event.player.name} />
                <AvatarFallback>{getInitials(event.player.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {event.action === 'scored' ? (
                    <Check className="h-4 w-4 text-green-600 shrink-0" />
                  ) : (
                    <Undo2 className="h-4 w-4 text-orange-500 shrink-0" />
                  )}
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {event.player.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {event.action === 'scored' ? 'pontuou' : 'desfez'}
                  </span>
                </div>
              </div>
              <span className="text-sm text-gray-400 shrink-0">
                {formatTime(event.created_at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Check, Undo2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
    <div className="min-h-[420px]">
      {scoreEvents.length === 0 ? (
        <div className="flex h-[420px] items-center justify-center rounded-lg border border-gray-200 bg-white">
          <div className="max-w-sm text-center">
            <p className="text-lg font-medium text-foreground">Nenhum resultado ainda.</p>
            <p className="mt-1 text-base text-gray-500">
              Os dois participantes precisam registrar a pontuação para fechar uma rodada.
            </p>
          </div>
        </div>
      ) : (
        <div className="h-[420px] overflow-hidden rounded-lg border border-gray-200 bg-white">
          <Table className="overflow-hidden">
            <TableHeader className="bg-white">
            <TableRow className="hover:bg-white">
              <TableHead>Participante</TableHead>
              <TableHead className="w-24 text-center">Evento</TableHead>
              <TableHead className="text-right">Registrado em</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
              {scoreEvents.map((event) => (
                <TableRow key={event.id} className="hover:bg-white">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarImage src={event.player.avatar_url ?? undefined} alt={event.player.name} />
                        <AvatarFallback>{getInitials(event.player.name)}</AvatarFallback>
                      </Avatar>
                      <span className="truncate text-sm font-medium text-gray-900">
                        {event.player.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {event.action === 'scored' ? (
                      <span className="inline-flex size-8 items-center justify-center text-green-600">
                        <Check className="h-4 w-4" />
                      </span>
                    ) : (
                      <span className="inline-flex size-8 items-center justify-center text-orange-500">
                        <Undo2 className="h-4 w-4" />
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm text-gray-400">
                    {formatTime(event.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

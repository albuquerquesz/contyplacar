'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/Button'
import type { HistoryEntry } from '@/components/scoreboard/types'

function formatRecordedAt(recordedAt: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(recordedAt))
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  return parts
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
}

export const historyColumns: ColumnDef<HistoryEntry>[] = [
  {
    accessorKey: 'playerName',
    sortingFn: 'text',
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 px-3 text-muted-foreground hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Participante
        <ArrowUpDown className="h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="size-9">
          <AvatarImage
            src={row.original.playerAvatarUrl ?? undefined}
            alt={row.original.playerName}
          />
          <AvatarFallback>{getInitials(row.original.playerName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{row.original.playerName}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'score',
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 text-muted-foreground hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Pontuação
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <p className="text-center text-base font-semibold text-foreground">{row.original.score}</p>
    ),
  },
  {
    accessorKey: 'recordedAt',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 text-muted-foreground hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Registrado em
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <p className="text-right text-sm text-muted-foreground">
        {formatRecordedAt(row.original.recordedAt)}
      </p>
    ),
  },
]

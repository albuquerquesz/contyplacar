'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/Button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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

const PAGE_SIZE = 10

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export default function MatchList({ matches, currentUserId, newMatchIds }: { matches: Match[]; currentUserId: string; newMatchIds: Set<string> }) {
  const router = useRouter()
  const [pageIndex, setPageIndex] = useState(0)

  const totalPages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE))

  useEffect(() => {
    setPageIndex((current) => Math.min(current, totalPages - 1))
  }, [totalPages])

  const paginatedMatches = useMemo(() => {
    const start = pageIndex * PAGE_SIZE
    return matches.slice(start, start + PAGE_SIZE)
  }, [matches, pageIndex])

  const rangeStart = matches.length === 0 ? 0 : pageIndex * PAGE_SIZE + 1
  const rangeEnd = Math.min((pageIndex + 1) * PAGE_SIZE, matches.length)

  const openMatch = (matchId: string) => {
    router.push(`/match/${matchId}`)
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <Table>
          <TableHeader className="bg-white">
            <TableRow className="hover:bg-white">
              <TableHead>Oponente</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMatches.map((match) => {
              const isPlayer1 = match.player1_id === currentUserId
              const opponent = isPlayer1 ? match.player2 : match.player1
              const userLeft = isPlayer1 ? match.player1_left : match.player2_left
              const statusLabel = userLeft ? 'Você saiu' : match.status === 'active' ? 'Ativa' : match.status
              const isNew = newMatchIds.has(match.id)

              const rowContent = (
                <>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 ring-1 ring-gray-200">
                        <AvatarImage src={opponent.avatar_url ?? undefined} alt={opponent.name} />
                        <AvatarFallback>{getInitials(opponent.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">{opponent.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                      {statusLabel}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center text-gray-300 transition-colors group-hover:text-gray-500">
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </TableCell>
                </>
              )

              const commonProps = {
                role: 'link' as const,
                tabIndex: 0,
                onClick: () => openMatch(match.id),
                onKeyDown: (event: React.KeyboardEvent) => {
                  if (event.key !== 'Enter' && event.key !== ' ') {
                    return
                  }
                  event.preventDefault()
                  openMatch(match.id)
                },
                className: 'group cursor-pointer border-gray-200 transition-colors hover:bg-blue-50/70 focus-visible:bg-blue-50/70',
              }

              if (isNew) {
                return (
                  <motion.tr
                    key={match.id}
                    {...commonProps}
                    layout
                    initial={{ opacity: 0, y: -24, backgroundColor: '#eff6ff' }}
                    animate={{ opacity: 1, y: 0, backgroundColor: '#ffffff' }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  >
                    {rowContent}
                  </motion.tr>
                )
              }

              return <TableRow key={match.id} {...commonProps}>{rowContent}</TableRow>
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between pl-4 pr-3 py-3">
        <p className="text-sm text-gray-500">
          {rangeStart}-{rangeEnd} de {matches.length}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
            disabled={pageIndex === 0}
            aria-label="Página anterior"
            className="size-8 rounded-full p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPageIndex((current) => Math.min(totalPages - 1, current + 1))}
            disabled={pageIndex >= totalPages - 1}
            aria-label="Próxima página"
            className="size-8 rounded-full p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  )
}

'use client'

import { useState } from 'react'
import {
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { historyColumns } from '@/components/scoreboard/history-columns'
import type { HistoryEntry } from '@/components/scoreboard/types'

export default function HistoryList({ history }: { history: HistoryEntry[] }) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'recordedAt', desc: true },
  ])

  const table = useReactTable({
    data: history,
    columns: historyColumns,
    getRowId: row => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  return (
    <Table className="border border-gray-200 rounded-lg overflow-hidden min-h-[320px]">
      <TableHeader>
        {table.getHeaderGroups().map(headerGroup => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <TableHead
                key={header.id}
                className={cn(
                  header.column.id === 'score' && 'text-center',
                  header.column.id === 'recordedAt' && 'text-right',
                )}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="py-20 text-center">
              <p className="text-lg font-medium text-foreground">Nenhum resultado ainda.</p>
              <p className="mt-1 text-base text-gray-500">
                Os dois participantes precisam registrar a pontuação para fechar uma rodada.
              </p>
            </TableCell>
          </TableRow>
        ) : (
          table.getRowModel().rows.map(row => (
            <TableRow key={row.id} className="border-b border-gray-100">
              {row.getVisibleCells().map(cell => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    cell.column.id === 'score' && 'text-center',
                    cell.column.id === 'recordedAt' && 'text-right',
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

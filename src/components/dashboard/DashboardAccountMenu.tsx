'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'

type DashboardAccountMenuProps = {
  userName: string
  userEmail: string
  avatarUrl: string | null
  onSignOut: () => void
}

export default function DashboardAccountMenu({
  userName,
  userEmail,
  avatarUrl,
  onSignOut,
}: DashboardAccountMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full outline-none ring-offset-white transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-blue-200"
          aria-label="Abrir menu da conta"
        >
          <Avatar className="h-12 w-12 ring-1 ring-gray-300">
            <AvatarImage src={avatarUrl ?? undefined} alt={userName} />
            <AvatarFallback className="bg-gray-100 text-sm font-semibold text-gray-600">
              {userName.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={12}
        className="w-[17rem]"
      >
        <div className="px-5 py-4">
          <p className="text-lg font-semibold text-gray-900">{userName}</p>
          <p className="text-base text-gray-500">{userEmail}</p>
        </div>
        <Separator className="bg-gray-200" />
        <DropdownMenuItem
          onSelect={() => {
            setOpen(false)
            onSignOut()
          }}
          className="cursor-pointer capitalize"
        >
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import DashboardAccountMenu from '@/components/dashboard/DashboardAccountMenu'
import { createClient } from '@/lib/supabase/client'

type DashboardHeaderProps = {
  userName: string
  userEmail: string
  avatarUrl: string | null
}

export default function DashboardHeader({
  userName,
  userEmail,
  avatarUrl,
}: DashboardHeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-6 pb-5">
        <div />

        <div className="flex items-center">
          <DashboardAccountMenu
            userName={userName}
            userEmail={userEmail}
            avatarUrl={avatarUrl}
            onSignOut={() => {
              void handleSignOut()
            }}
          />
        </div>
      </div>
    </header>
  )
}

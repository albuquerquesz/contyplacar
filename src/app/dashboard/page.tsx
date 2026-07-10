'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import DashboardMatchesSection from '@/components/dashboard/DashboardMatchesSection'
import InviteModal from '@/components/ui/InviteModal'

export default function DashboardPage() {
  const router = useRouter()
  const [generating, setGenerating] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState('Usuário')
  const [userEmail, setUserEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
        return
      }

      const metadata = user.user_metadata ?? {}
      setUserId(user.id)
      setUserName(metadata.name ?? user.email?.split('@')[0] ?? 'Usuário')
      setUserEmail(user.email ?? '')
      setAvatarUrl(metadata.avatar_url ?? null)
    }

    void loadUser()
  }, [router])

  const openInviteModal = () => {
    setInviteLink(null)
    setInviteModalOpen(true)
  }

  const handleInviteCopy = async ({
    senderInitialScore,
    opponentInitialScore,
    gameMode,
  }: {
    senderInitialScore?: number
    opponentInitialScore?: number
    gameMode: 'first_arrival' | 'last_departure'
  }) => {
    let nextLink = inviteLink

    const score = (value?: number) => (typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : 0)
    const senderScore = score(senderInitialScore)
    const opponentScore = score(opponentInitialScore)

    if (!nextLink) {
      setGenerating(true)
      const linkCode = crypto.randomUUID()
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? window.location.origin

      try {
        const res = await fetch('/api/invitations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ linkCode, senderInitialScore: senderScore, opponentInitialScore: opponentScore, gameMode }),
        })

        if (!res.ok) {
          throw new Error('Failed to create invitation')
        }

        nextLink = `${baseUrl}/invite/${linkCode}`
        setInviteLink(nextLink)
      } catch (err) {
        console.error('Failed to generate invite link:', err)
        throw err
      } finally {
        setGenerating(false)
      }
    }

    await navigator.clipboard.writeText(nextLink)
  }

  return (
    <div className="min-h-screen bg-[#F8F7F5]">
      <DashboardHeader userName={userName} userEmail={userEmail} avatarUrl={avatarUrl} />

      <div className="mx-auto max-w-4xl px-4 py-8">
        <DashboardMatchesSection userId={userId} onInvite={openInviteModal} inviteDisabled={generating} />
      </div>

      <InviteModal
        open={inviteModalOpen}
        onCopy={handleInviteCopy}
        onClose={() => setInviteModalOpen(false)}
      />
    </div>
  )
}

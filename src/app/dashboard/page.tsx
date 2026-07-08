'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import MatchList from '@/components/dashboard/MatchList'
import InviteModal from '@/components/ui/InviteModal'
import { Button } from '@/components/ui/Button'
import { LogOut, Plus } from 'lucide-react'

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

export default function DashboardPage() {
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [userName, setUserName] = useState('Usuário')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    let active = true

    const loadMatches = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user || !active) {
        if (active) {
          setLoading(false)
        }
        return
      }

      const metadata = user.user_metadata ?? {}
      setUserId(user.id)
      setUserName(metadata.name ?? user.email?.split('@')[0] ?? 'Usuário')
      setAvatarUrl(metadata.avatar_url ?? null)

      const { data, error } = await supabase
        .from('matches')
        .select('*, player1:profiles(player1_id, name, avatar_url), player2:profiles(player2_id, name, avatar_url)')
        .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
        .neq('status', 'completed')
        .order('created_at', { ascending: false })

      if (!active) return

      if (!error && data) {
        setMatches(data)
      }
      setLoading(false)
    }

    void loadMatches()

    return () => {
      active = false
    }
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/login')
  }

  const generateInviteLink = async () => {
    setGenerating(true)
    const linkCode = crypto.randomUUID()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? window.location.origin

    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkCode }),
      })

      if (res.ok) {
        setInviteLink(`${baseUrl}/invite/${linkCode}`)
        setInviteModalOpen(true)
      }
    } catch (err) {
      console.error('Failed to generate invite link:', err)
    }
    setGenerating(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="w-8 h-8 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-6 pb-5">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gray-200 ring-1 ring-gray-300">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={userName}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm font-semibold text-gray-600">
                  {userName.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <Button variant="ghost" onClick={handleSignOut} aria-label="Sair">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Suas Disputas</h2>
            <p className="mt-1 text-sm text-gray-500">
              Veja suas disputas ativas e convide alguém quando quiser começar outra.
            </p>
          </div>
          <Button variant="primary" onClick={generateInviteLink} disabled={generating}>
            <Plus className="h-5 w-5" />
            Convidar
          </Button>
        </div>

        {matches.length === 0 ? (
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center mt-4">
            <div className="mx-auto max-w-md text-center">
              <div className="flex justify-center">
                <div className="relative h-32 w-32">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <defs>
                      <linearGradient id="trophyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#bfdbfe" />
                        <stop offset="100%" stopColor="#93c5fd" />
                      </linearGradient>
                    </defs>
                    <ellipse cx="50" cy="55" rx="40" ry="25" fill="#eff6ff" />
                    <path d="M35 30 L35 20 Q50 15 65 20 L65 30 L70 30 L70 40 Q70 50 60 50 L55 50 L55 65 L45 65 L45 50 L40 50 Q30 50 30 40 L30 30 L35 30 Z" fill="url(#trophyGrad)" />
                    <path d="M35 32 Q25 32 25 40 Q25 46 35 44" fill="none" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round" />
                    <path d="M65 32 Q75 32 75 40 Q75 46 65 44" fill="none" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round" />
                    <path d="M50 33 L52 38 L57 38 L53 41 L54 46 L50 43 L46 46 L47 41 L43 38 L48 38 Z" fill="#60a5fa" />
                    <rect x="42" y="65" width="16" height="4" rx="2" fill="#93c5fd" />
                    <rect x="38" y="69" width="24" height="4" rx="2" fill="#bfdbfe" />
                    <circle cx="20" cy="25" r="2" fill="#93c5fd" opacity="0.6" />
                    <circle cx="80" cy="28" r="1.5" fill="#93c5fd" opacity="0.4" />
                    <circle cx="75" cy="50" r="1" fill="#93c5fd" opacity="0.5" />
                    <circle cx="25" cy="52" r="1.5" fill="#93c5fd" opacity="0.3" />
                    <path d="M15 75 L15 68 L13 65" fill="none" stroke="#bfdbfe" strokeWidth="2" strokeLinecap="round" />
                    <path d="M85 75 L85 68 L87 65" fill="none" stroke="#bfdbfe" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900">
                Nenhuma disputa ainda
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Parece que você ainda não tem disputas. Convide um amigo e comece a primeira.
              </p>
              <Button className="mt-6" variant="outline" onClick={generateInviteLink} disabled={generating}>
                <Plus className="h-5 w-5" />
                Convidar
              </Button>
            </div>
          </section>
        ) : (
          <div className="border-t border-gray-200 pt-6">
            <MatchList matches={matches} currentUserId={userId} />
          </div>
        )}
      </div>

      {inviteLink && (
        <InviteModal
          open={inviteModalOpen}
          link={inviteLink}
          onClose={() => setInviteModalOpen(false)}
        />
      )}
    </div>
  )
}

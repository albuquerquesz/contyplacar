import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MatchList from '@/components/dashboard/MatchList'
import InviteForm from '@/components/dashboard/InviteForm'
import UserBar from '@/components/auth/UserBar'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Fetch matches
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      player1:player1_id(id, name, email, avatar_url),
      player2:player2_id(id, name, email, avatar_url)
    `)
    .in('matches!player1_id,player2_id', [user.id])

  // Fetch sent invitations
  const { data: sentInvitations } = await supabase
    .from('invitations')
    .select('*, sender:sender_id(id, name, email)')
    .eq('sender_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <UserBar userId={user.id} />
        </div>

        <InviteForm userId={user.id} />

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Suas Disputas</h2>
          <MatchList matches={matches || []} />
        </div>

        {sentInvitations && sentInvitations.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Convites Enviados</h2>
            <div className="space-y-2">
              {sentInvitations.map((inv: any) => (
                <div key={inv.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                  <p className="text-sm text-gray-600">
                    Link: <code className="text-blue-600">{inv.link_code}</code>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Expira em {new Date(inv.expires_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

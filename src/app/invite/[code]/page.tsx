import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Find invitation
  const { data: invitation } = await supabase
    .from('invitations')
    .select('*, sender:sender_id(id, name, email)')
    .eq('link_code', code)
    .eq('status', 'pending')
    .single()

  if (!invitation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Convite Inválido</h1>
          <p className="text-gray-500">Este convite não existe ou já expirou.</p>
        </div>
      </div>
    )
  }

  // Check expiration
  if (new Date(invitation.expires_at) < new Date()) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Convite Expirado</h1>
          <p className="text-gray-500">Este convite já expirou.</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Entre para Aceitar</h1>
          <p className="text-gray-500 mb-8">
            {invitation.sender?.name} te convidou para uma disputa!
          </p>
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-8 py-3 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Entrar com Google
          </a>
        </div>
      </div>
    )
  }

  // User is logged in — accept invitation
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <form
        action={async () => {
          'use server'
          const supabase = await createClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return redirect('/login')

          // Create match
          const { data: match } = await supabase
            .from('matches')
            .insert({
              player1_id: invitation.sender_id,
              player2_id: user.id,
              status: 'active',
            })
            .select()
            .single()

          // Update invitation
          await supabase
            .from('invitations')
            .update({ status: 'accepted', match_id: match?.id })
            .eq('id', invitation.id)

          return redirect(`/match/${match?.id}`)
        }}
      >
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Aceitar Convite</h1>
          <p className="text-gray-500 mb-8">
            Você vai criar uma disputa com {invitation.sender?.name}.
          </p>
          <button
            type="submit"
            className="w-full rounded-2xl bg-blue-600 px-8 py-3 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Aceitar Disputa
          </button>
        </div>
      </form>
    </div>
  )
}

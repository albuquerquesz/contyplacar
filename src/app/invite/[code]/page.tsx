import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { AcceptButton } from '@/components/invite/AcceptButton'

function getPreviousDateString() {
  const previousDate = new Date()
  previousDate.setDate(previousDate.getDate() - 1)
  return previousDate.toISOString().split('T')[0]
}

async function acceptInvitationAction(formData: FormData) {
  'use server'

  const code = String(formData.get('code') ?? '')
  if (!code) {
    return redirect('/dashboard')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect(`/login?next=${encodeURIComponent(`/invite/${code}`)}`)
  }

  const admin = createAdminClient()
  const { data: invitation, error: invitationError } = await admin
    .from('invitations')
    .select('id, sender_id, expires_at, status, sender_initial_score, opponent_initial_score, game_mode')
    .eq('link_code', code)
    .eq('status', 'pending')
    .single()

  if (invitationError || !invitation) {
    return redirect(`/invite/${code}`)
  }

  if (new Date(invitation.expires_at) < new Date()) {
    await admin.from('invitations').update({ status: 'expired' }).eq('id', invitation.id)
    return redirect(`/invite/${code}`)
  }

  const { data: match, error: matchError } = await admin
    .from('matches')
    .insert({
      player1_id: invitation.sender_id,
      player2_id: user.id,
      status: 'active',
      game_mode: invitation.game_mode,
    })
    .select('id')
    .single()

  if (matchError || !match) {
    return redirect(`/invite/${code}`)
  }

  const initialScoreDate = getPreviousDateString()
  const { error: scoresError } = await admin
    .from('scores')
    .insert([
      {
        match_id: match.id,
        player_id: invitation.sender_id,
        score: invitation.sender_initial_score,
        date: initialScoreDate,
      },
      {
        match_id: match.id,
        player_id: user.id,
        score: invitation.opponent_initial_score,
        date: initialScoreDate,
      },
    ])

  if (scoresError) {
    await admin.from('matches').delete().eq('id', match.id)
    return redirect(`/invite/${code}`)
  }

  const { error: updateError } = await admin
    .from('invitations')
    .update({ status: 'accepted', match_id: match.id })
    .eq('id', invitation.id)

  if (updateError) {
    return redirect(`/invite/${code}`)
  }

  return redirect(`/match/${match.id}`)
}

export default async function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect(`/login?next=${encodeURIComponent(`/invite/${code}`)}`)
  }

  const admin = createAdminClient()
  const { data: invitation } = await admin
    .from('invitations')
    .select('id, sender_id, expires_at, sender_initial_score, opponent_initial_score, game_mode, sender:sender_id(id, name, email)')
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

  if (new Date(invitation.expires_at) < new Date()) {
    await admin.from('invitations').update({ status: 'expired' }).eq('id', invitation.id)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Convite Expirado</h1>
          <p className="text-gray-500">Este convite já expirou.</p>
        </div>
      </div>
    )
  }

  // User is logged in — accept invitation
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <form action={acceptInvitationAction}>
        <input type="hidden" name="code" value={code} />
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Aceitar Convite</h1>
          <p className="text-gray-500 mb-8">
            Você vai criar uma disputa de <span className="font-medium text-gray-700">{invitation.game_mode === 'first_arrival' ? 'Quem chega primeiro' : 'Quem sai por último'}</span> com {(invitation.sender as { name?: string } | null)?.name ?? 'este amigo'}.
          </p>
          <AcceptButton />
        </div>
      </form>
    </div>
  )
}

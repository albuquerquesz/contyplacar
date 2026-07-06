import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { linkCode } = await request.json()

  if (!linkCode) {
    return NextResponse.json({ error: 'Missing linkCode' }, { status: 400 })
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase.from('invitations').insert({
    sender_id: user.id,
    link_code: linkCode,
    status: 'pending',
    expires_at: expiresAt,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ code: linkCode })
}

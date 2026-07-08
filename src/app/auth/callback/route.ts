import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { env } from '@/lib/env'
import { getSafeInternalPath } from '@/lib/redirect'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = getSafeInternalPath(requestUrl.searchParams.get('next'))

  console.log('[auth/callback]', {
    href: requestUrl.href,
    origin: requestUrl.origin,
    next,
    hasCode: !!code,
  })

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin))
  }

  const cookieStore = await cookies()
  const response = NextResponse.redirect(new URL(next, requestUrl.origin))

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin))
  }

  return response
}

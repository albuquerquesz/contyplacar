import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { env } from '@/lib/env'

export async function middleware(request: Request) {
  const requestUrl = new URL(request.url)
  const response = NextResponse.next()

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          const cookieHeader = request.headers.get('cookie')
          if (!cookieHeader) return []
          const cookies: { name: string; value: string }[] = []
          for (const pair of cookieHeader.split('; ')) {
            const [name, ...rest] = pair.split('=')
            cookies.push({ name: name.trim(), value: rest.join('=') })
          }
          return cookies
        },
        setAll(cookiesToSet) {
          for (const cookie of cookiesToSet) {
            response.cookies.set(cookie.name, cookie.value, {
              path: '/',
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              httpOnly: true,
              maxAge: 60 * 60 * 24 * 30,
            })
          }
        },
      },
    }
  )

  const { data } = await supabase.auth.getUser()
  const user = data?.user

  const protectedPaths = ['/dashboard', '/match']
  const isProtected = protectedPaths.some(p => requestUrl.pathname === p || requestUrl.pathname.startsWith(p + '/'))

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/match/:path*'],
}

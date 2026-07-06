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
          const cookies = Object.fromEntries(
            request.headers.get('cookie')?.split('; ').map(c => {
              const [name, ...rest] = c.split('=')
              return [name.trim(), rest.join('=')]
            }) ?? []
          )
          return Object.entries(cookies).map(([name, value]) => ({ name, value }))
        },
        setAll(cookiesToSet) {
          for (const cookie of cookiesToSet) {
            response.cookies.set(cookie.name, cookie.value, {
              path: '/',
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
  matcher: ['/dashboard/:path*', '/match/:path*', '/invite/:path*'],
}

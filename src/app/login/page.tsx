'use client'

import { createClient } from '@/lib/supabase/client'
import { getSafeInternalPath } from '@/lib/redirect'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import GoogleIcon from '@/components/ui/GoogleIcon'
import { Button } from '@/components/ui/Button'

function LoginPageInner() {
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const next = getSafeInternalPath(searchParams.get('next'))
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const redirectUrl = `${baseUrl}/auth/callback?next=${encodeURIComponent(next)}`

  async function signIn() {
    setLoading(true)
    const supabase = createClient()
    console.log('[auth] login redirect:', { baseUrl, redirectUrl, next })
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    })

    if (error) {
      console.error('Login error:', error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Seja bem vindo!</h1>
        <p className="text-lg text-gray-500 mb-12">
          Registre a pontuação da disputa, acompanhe o placar e veja o histórico em um só lugar.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-xs text-gray-600">
            <p className="font-semibold text-gray-700">Auth debug</p>
            <p className="mt-1 break-all">baseUrl: {baseUrl || 'n/a'}</p>
            <p className="mt-1 break-all">redirectUrl: {redirectUrl || 'n/a'}</p>
          </div>
        )}
        <Button onClick={signIn} disabled={loading} fullWidth loading={loading}>
          {loading ? 'Conectando...' : (
            <>
              <GoogleIcon />
              Entrar com Google
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <svg className="w-8 h-8 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    }>
      <LoginPageInner />
    </Suspense>
  )
}

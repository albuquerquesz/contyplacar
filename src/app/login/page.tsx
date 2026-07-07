'use client'

import { createClient } from '@/lib/supabase/client'
import { getSafeInternalPath } from '@/lib/redirect'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import GoogleIcon from '@/components/ui/GoogleIcon'

function LoginPageInner() {
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const next = getSafeInternalPath(searchParams.get('next'))

  async function signIn() {
    setLoading(true)
    const supabase = createClient()
    const callbackUrl = new URL('/auth/callback', window.location.origin)
    callbackUrl.searchParams.set('next', next)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl.toString(),
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
        <button
          onClick={signIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 rounded-2xl bg-blue-600 px-8 py-3 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? (
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <GoogleIcon />
          )}
          {loading ? 'Conectando...' : 'Entrar com Google'}
        </button>
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

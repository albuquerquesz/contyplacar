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

  async function signIn() {
    setLoading(true)
    const supabase = createClient()
    const baseUrl = window.location.origin
    const redirectUrl = `${baseUrl}/auth/callback?next=${encodeURIComponent(next)}`
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

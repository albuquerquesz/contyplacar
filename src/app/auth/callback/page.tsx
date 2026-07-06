'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function CallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.onAuthStateChange((_event) => {
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session) {
          router.push('/dashboard')
          router.refresh()
        }
      })
    })
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <svg className="w-8 h-8 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="mt-4 text-gray-500">Entrando...</p>
    </div>
  )
}

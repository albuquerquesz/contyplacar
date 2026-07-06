'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function UserBar({ userId }: { userId: string }) {
  const router = useRouter()

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <button
      onClick={logout}
      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
    >
      Sair
    </button>
  )
}

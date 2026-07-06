import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Placar</h1>
        <p className="text-lg text-gray-500 mb-8">Desafie um amigo e disputem pontos todos os dias</p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-8 py-3 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          Entrar com Google
        </Link>
      </div>
    </div>
  )
}

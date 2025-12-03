'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function CategoriasRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar para /produtos/categoria
    router.push('/produtos/categoria')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-uss-primary mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Redirecionando para categorias...</p>
      </div>
    </div>
  )
}


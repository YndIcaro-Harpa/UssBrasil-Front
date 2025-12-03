'use client'

export const runtime = 'edge'

import { useParams } from 'next/navigation'

export default function ProdutosCategoriaPage() {
  const params = useParams()
  const id = params.id as string

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Categoria {id}</h1>
      <p>Página da categoria em construção.</p>
    </div>
  )
}

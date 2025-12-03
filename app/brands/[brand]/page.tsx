'use client'

export const runtime = 'edge'

import { useParams } from 'next/navigation'

export default function BrandPage() {
  const params = useParams()
  const brand = params.brand as string

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 capitalize">{brand}</h1>
      <p>Página da marca em construção.</p>
    </div>
  )
}

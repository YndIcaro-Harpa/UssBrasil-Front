import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit } from '@/lib/rate-limiter'

export const runtime = 'edge'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  // Rate limiting - 20 uploads por hora por IP
  const rateLimitResponse = applyRateLimit(request, 'upload')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const formData = await request.formData()
    
    // Get authorization from headers
    const authHeader = request.headers.get('Authorization')
    
    const headers: HeadersInit = {}
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    // Forward the formData to backend
    const response = await fetch(`${API_URL}/upload/product-image`, {
      method: 'POST',
      headers,
      body: formData
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro no upload' }))
      return NextResponse.json(
        { error: error.message || 'Erro no upload' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error: any) {
    console.error('Erro no upload:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno no upload' },
      { status: 500 }
    )
  }
}

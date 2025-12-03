import { NextRequest, NextResponse } from 'next/server'
import { BACKEND_URL } from '@/lib/config'

/**
 * GET /api/brands - Lista todas as marcas
 * Faz proxy para o backend NestJS
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Construir query string para repassar ao backend
    const queryString = searchParams.toString()
    const url = `${BACKEND_URL}/brands${queryString ? `?${queryString}` : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }, // Cache por 60 segundos
    })

    if (!response.ok) {
      // Se o backend falhar, retornar dados de fallback
      console.warn('[API Brands] Backend não disponível, retornando fallback')
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        message: 'Dados do fallback - backend indisponível'
      })
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      data: data.data || data,
      total: data.total || (Array.isArray(data) ? data.length : 0)
    })
  } catch (error) {
    console.error('[API Brands] Erro:', error)
    return NextResponse.json(
      { success: false, error: 'Falha ao buscar marcas' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/brands - Criar nova marca (admin)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get('Authorization')
    
    const response = await fetch(`${BACKEND_URL}/brands`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao criar marca' }))
      return NextResponse.json(
        { success: false, error: error.message },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[API Brands POST] Erro:', error)
    return NextResponse.json(
      { success: false, error: 'Falha ao criar marca' },
      { status: 500 }
    )
  }
}

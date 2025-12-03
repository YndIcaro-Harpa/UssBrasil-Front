import { NextRequest, NextResponse } from 'next/server'
import { BACKEND_URL } from '@/lib/config'

export const runtime = 'edge'

/**
 * GET /api/products - Lista produtos com filtros e paginação
 * Faz proxy para o backend NestJS
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Construir query string para repassar ao backend
    const queryString = searchParams.toString()
    const url = `${BACKEND_URL}/products${queryString ? `?${queryString}` : ''}`
    
    console.log('[API Products] Buscando de:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 30 }, // Cache por 30 segundos
    })

    if (!response.ok) {
      console.warn('[API Products] Backend não disponível:', response.status)
      // Retornar resposta vazia em caso de erro
      return NextResponse.json({
        success: true,
        data: {
          products: [],
          pagination: {
            page: 1,
            limit: 12,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false
          }
        },
        message: 'Backend indisponível'
      })
    }

    const data = await response.json()
    
    // Formatar resposta consistente
    const products = data.data || data.products || data || []
    const total = data.total || (Array.isArray(products) ? products.length : 0)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    
    return NextResponse.json({
      success: true,
      data: {
        products: Array.isArray(products) ? products : [],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    })
  } catch (error) {
    console.error('[API Products] Erro:', error)
    return NextResponse.json(
      { success: false, error: 'Falha ao buscar produtos' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/products - Criar novo produto (admin)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get('Authorization')
    
    const response = await fetch(`${BACKEND_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao criar produto' }))
      return NextResponse.json(
        { success: false, error: error.message },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[API Products POST] Erro:', error)
    return NextResponse.json(
      { success: false, error: 'Falha ao criar produto' },
      { status: 500 }
    )
  }
}

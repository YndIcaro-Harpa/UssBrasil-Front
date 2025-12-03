import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { error: 'Código do cupom é obrigatório' },
        { status: 400 }
      )
    }

    // Chamar o backend NestJS para validar o cupom
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const response = await fetch(`${backendUrl}/coupons/validate/${code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Cupom inválido ou expirado' },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      code: data.code,
      type: data.type,
      value: data.value,
      minAmount: data.minAmount,
      maxAmount: data.maxAmount,
      description: data.description,
    })
  } catch (error: any) {
    console.error('Erro ao validar cupom:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

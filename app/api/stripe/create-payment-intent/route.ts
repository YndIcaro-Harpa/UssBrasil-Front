import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, orderId, customerId, items, installments, userId, customerEmail, metadata } = body

    // Validações
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valor inválido para pagamento' },
        { status: 400 }
      )
    }

    if (installments && (installments < 1 || installments > 12)) {
      return NextResponse.json(
        { error: 'Número de parcelas deve ser entre 1 e 12' },
        { status: 400 }
      )
    }

    // Chamar o backend NestJS para criar o Payment Intent
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const response = await fetch(`${backendUrl}/stripe/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'brl',
        orderId,
        customerId,
        items,
        installments,
        userId,
        customerEmail,
        metadata,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.message || 'Erro ao criar Payment Intent' },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      clientSecret: data.clientSecret,
      paymentIntentId: data.paymentIntentId,
      amount: data.amount,
      originalAmount: data.originalAmount,
      currency: data.currency,
      installments: data.installments,
      installmentOptions: data.installmentOptions,
    })
  } catch (error: any) {
    console.error('Erro ao criar Payment Intent:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

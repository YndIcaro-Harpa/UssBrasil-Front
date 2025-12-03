import { NextRequest, NextResponse } from 'next/server'

// Taxas de juros por número de parcelas (padrão brasileiro)
const interestRates: Record<number, number> = {
  1: 0,
  2: 0,
  3: 0,
  4: 2.99,
  5: 3.99,
  6: 4.99,
  7: 5.99,
  8: 6.99,
  9: 7.99,
  10: 8.99,
  11: 9.99,
  12: 10.99,
}

interface InstallmentOption {
  installments: number
  installmentValue: number
  totalValue: number
  interestRate: number
  hasInterest: boolean
}

function calculateInstallmentOptions(amount: number): InstallmentOption[] {
  const options: InstallmentOption[] = []
  
  for (let i = 1; i <= 12; i++) {
    const interestRate = interestRates[i]
    const hasInterest = interestRate > 0
    const totalValue = hasInterest 
      ? amount * (1 + interestRate / 100) 
      : amount
    const installmentValue = totalValue / i
    
    // Parcela mínima de R$ 10
    if (installmentValue >= 10) {
      options.push({
        installments: i,
        installmentValue: Math.round(installmentValue * 100) / 100,
        totalValue: Math.round(totalValue * 100) / 100,
        interestRate,
        hasInterest,
      })
    }
  }
  
  return options
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const amount = parseFloat(searchParams.get('amount') || '0')

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valor inválido' },
        { status: 400 }
      )
    }

    const options = calculateInstallmentOptions(amount)

    return NextResponse.json({
      amount,
      options,
    })
  } catch (error: any) {
    console.error('Erro ao calcular parcelamento:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

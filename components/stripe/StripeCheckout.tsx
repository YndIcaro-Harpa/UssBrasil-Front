'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2, CreditCard, Check, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import StripeProvider from '@/components/stripe/StripeProvider'
import PaymentForm from '@/components/stripe/PaymentForm'
import { cn } from '@/lib/utils'

interface InstallmentOption {
  installments: number
  installmentValue: number
  totalValue: number
  interestRate: number
  hasInterest: boolean
}

interface CustomerData {
  name: string
  email: string
  cpf: string
  phone: string
  address: {
    cep: string
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
  }
}

interface StripeCheckoutProps {
  amount: number
  orderId?: string
  userId?: string
  customerEmail?: string
  items?: any[]
  metadata?: Record<string, string>
  disabled?: boolean
  compact?: boolean
  customerData?: CustomerData
  onSuccess?: (paymentIntentId: string) => void
  onError?: (error: string) => void
}

export default function StripeCheckout({
  amount,
  orderId,
  userId,
  customerEmail,
  items,
  metadata,
  disabled = false,
  compact = false,
  customerData,
  onSuccess,
  onError,
}: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [installmentOptions, setInstallmentOptions] = useState<InstallmentOption[]>([])
  const [selectedInstallment, setSelectedInstallment] = useState<number>(1)
  const [finalAmount, setFinalAmount] = useState(amount)

  useEffect(() => {
    loadInstallmentOptions()
  }, [amount])

  const loadInstallmentOptions = async () => {
    try {
      setLoadingOptions(true)
      const response = await fetch(`/api/stripe/installment-options?amount=${amount}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar opções de parcelamento')
      }

      const data = await response.json()
      setInstallmentOptions(data.options)
    } catch (err: any) {
      console.error('Erro ao carregar parcelamento:', err)
      const fallbackOptions: InstallmentOption[] = []
      for (let i = 1; i <= 12; i++) {
        const interestRate = i <= 3 ? 0 : (i - 3) * 1 + 2.99
        const hasInterest = interestRate > 0
        const totalValue = hasInterest ? amount * (1 + interestRate / 100) : amount
        const installmentValue = totalValue / i
        
        if (installmentValue >= 10) {
          fallbackOptions.push({
            installments: i,
            installmentValue: Math.round(installmentValue * 100) / 100,
            totalValue: Math.round(totalValue * 100) / 100,
            interestRate,
            hasInterest,
          })
        }
      }
      setInstallmentOptions(fallbackOptions)
    } finally {
      setLoadingOptions(false)
    }
  }

  const handleInstallmentSelect = (installments: number) => {
    setSelectedInstallment(installments)
    const option = installmentOptions.find(o => o.installments === installments)
    if (option) {
      setFinalAmount(option.totalValue)
    }
    setClientSecret(null)
  }

  const createPaymentIntent = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          orderId,
          userId,
          customerEmail,
          items,
          installments: selectedInstallment,
          metadata,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar pagamento')
      }

      const data = await response.json()
      setClientSecret(data.clientSecret)
      setFinalAmount(data.amount)
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao inicializar pagamento'
      setError(errorMessage)
      toast.error(errorMessage)
      
      if (onError) {
        onError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  if (loadingOptions) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "rounded-2xl p-6 text-center",
          compact ? "bg-zinc-800" : "bg-white shadow-md"
        )}
      >
        <Loader2 className={cn(
          "h-8 w-8 animate-spin mx-auto mb-3",
          compact ? "text-amber-500" : "text-blue-400"
        )} />
        <p className={compact ? "text-zinc-400" : "text-gray-600"}>
          Carregando opções de pagamento...
        </p>
      </motion.div>
    )
  }

  // Compact version for new checkout
  if (compact) {
    return (
      <div className="space-y-4">
        {/* Compact Installment Selection */}
        <div className="bg-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-white">Parcelamento</span>
          </div>

          {/* No Interest Options - Compact Grid */}
          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="h-3 w-3 text-green-500" />
              <span className="text-xs font-medium text-green-400">Sem juros</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
              {installmentOptions.filter(o => !o.hasInterest).map((option) => (
                <button
                  key={option.installments}
                  type="button"
                  onClick={() => handleInstallmentSelect(option.installments)}
                  className={cn(
                    "relative py-2 px-1 rounded-lg border transition-all text-center",
                    selectedInstallment === option.installments
                      ? "border-amber-500 bg-amber-500/10"
                      : "border-zinc-700 bg-zinc-700/50 hover:border-zinc-600"
                  )}
                >
                  {selectedInstallment === option.installments && (
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center">
                      <Check className="h-2 w-2 text-black" />
                    </div>
                  )}
                  <div className="text-sm font-bold text-white">{option.installments}x</div>
                  <div className="text-[10px] text-zinc-400">
                    R$ {option.installmentValue.toFixed(0)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* With Interest Options - Even More Compact */}
          {installmentOptions.filter(o => o.hasInterest).length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-xs text-zinc-500">Com juros</span>
                <div className="flex-1 h-px bg-zinc-700" />
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-9 gap-1">
                {installmentOptions.filter(o => o.hasInterest).map((option) => (
                  <button
                    key={option.installments}
                    type="button"
                    onClick={() => handleInstallmentSelect(option.installments)}
                    className={cn(
                      "relative py-1.5 px-1 rounded-lg border transition-all text-center",
                      selectedInstallment === option.installments
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-zinc-700 bg-zinc-700/50 hover:border-zinc-600"
                    )}
                  >
                    {selectedInstallment === option.installments && (
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center">
                        <Check className="h-2 w-2 text-black" />
                      </div>
                    )}
                    <div className="text-xs font-bold text-white">{option.installments}x</div>
                    <div className="text-[9px] text-zinc-500">
                      {option.interestRate.toFixed(1)}%
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Summary - Compact */}
          {selectedInstallment > 0 && (() => {
            const selected = installmentOptions.find(o => o.installments === selectedInstallment)
            if (!selected) return null
            return (
              <div className="mt-3 p-3 bg-zinc-700/50 rounded-lg flex justify-between items-center">
                <div>
                  <span className="text-white font-medium">
                    {selected.installments}x de R$ {selected.installmentValue.toFixed(2).replace('.', ',')}
                  </span>
                  {selected.hasInterest ? (
                    <span className="text-zinc-500 text-xs ml-2">
                      ({selected.interestRate.toFixed(2)}% a.m.)
                    </span>
                  ) : (
                    <span className="text-green-500 text-xs ml-2">sem juros</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-amber-500 font-bold">
                    R$ {selected.totalValue.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            )
          })()}
        </div>

        {/* Continue to Payment Button */}
        {!clientSecret && (
          <button
            onClick={createPaymentIntent}
            disabled={loading || selectedInstallment < 1 || disabled}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-600 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Preparando...
              </>
            ) : disabled ? (
              'Preencha todos os dados'
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                Pagar R$ {finalAmount.toFixed(2).replace('.', ',')}
              </>
            )}
          </button>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 text-center">
            <p className="text-red-400 text-sm mb-3">{error}</p>
            <button
              onClick={createPaymentIntent}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Stripe Payment Form */}
        {clientSecret && (
          <StripeProvider clientSecret={clientSecret}>
            <PaymentForm
              amount={finalAmount}
              orderId={orderId}
              installments={selectedInstallment}
              onSuccess={onSuccess}
              onError={onError}
              compact={true}
            />
          </StripeProvider>
        )}
      </div>
    )
  }

  // Original full version
  return (
    <div className="space-y-6">
      {/* Seleção de Parcelas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 p-8"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-400/30">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Parcelamento</h3>
            <p className="text-sm text-gray-500">Selecione a melhor opção para você</p>
          </div>
        </div>

        {/* Grid Premium de Parcelas */}
        <div className="space-y-3">
          {/* Parcelas sem juros - Destaque */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-green-500" />
              <span className="text-sm font-semibold text-green-600">Sem juros</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {installmentOptions.filter(o => !o.hasInterest).map((option, index) => (
                <motion.button
                  key={option.installments}
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleInstallmentSelect(option.installments)}
                  className={`relative overflow-hidden p-5 rounded-2xl border-2 transition-all duration-300 ${
                    selectedInstallment === option.installments
                      ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg shadow-blue-100'
                      : 'border-gray-100 hover:border-gray-200 bg-white hover:shadow-md'
                  }`}
                >
                  {selectedInstallment === option.installments && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center"
                    >
                      <Check className="h-3.5 w-3.5 text-white" />
                    </motion.div>
                  )}
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {option.installments}x
                  </div>
                  <div className="text-base font-semibold text-blue-400">
                    {formatCurrency(option.installmentValue)}
                  </div>
                  <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                    Sem juros
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Parcelas com juros */}
          {installmentOptions.filter(o => o.hasInterest).length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 mt-6">
                <span className="text-sm font-medium text-gray-500">Com juros</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {installmentOptions.filter(o => o.hasInterest).map((option, index) => (
                  <motion.button
                    key={option.installments}
                    type="button"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + index * 0.03 }}
                    onClick={() => handleInstallmentSelect(option.installments)}
                    className={`relative overflow-hidden p-4 rounded-xl border-2 transition-all duration-300 ${
                      selectedInstallment === option.installments
                        ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg shadow-blue-100'
                        : 'border-gray-100 hover:border-gray-200 bg-white hover:shadow-md'
                    }`}
                  >
                    {selectedInstallment === option.installments && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center"
                      >
                        <Check className="h-3 w-3 text-white" />
                      </motion.div>
                    )}
                    <div className="text-xl font-bold text-gray-900">
                      {option.installments}x
                    </div>
                    <div className="text-sm font-semibold text-blue-400">
                      {formatCurrency(option.installmentValue)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {option.interestRate.toFixed(2)}% a.m.
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Resumo do parcelamento selecionado */}
        {selectedInstallment > 0 && (() => {
          const selected = installmentOptions.find(o => o.installments === selectedInstallment)
          if (!selected) return null
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-5 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl border border-gray-100"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {selected.installments}x de {formatCurrency(selected.installmentValue)}
                  </p>
                  {selected.hasInterest ? (
                    <p className="text-sm text-gray-500 mt-0.5">
                      Juros de {selected.interestRate.toFixed(2)}% a.m.
                    </p>
                  ) : (
                    <p className="text-sm text-green-600 font-medium mt-0.5">
                      Sem acréscimo
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {formatCurrency(selected.totalValue)}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })()}
      </motion.div>

      {/* Botão para continuar para pagamento */}
      {!clientSecret && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={createPaymentIntent}
          disabled={loading || selectedInstallment < 1 || disabled}
          className="w-full py-5 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-400/30 hover:shadow-xl hover:shadow-blue-500/30 disabled:shadow-none"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Preparando pagamento...
            </>
          ) : disabled ? (
            <>
              Preencha todos os dados para continuar
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5" />
              Continuar para Pagamento
            </>
          )}
        </motion.button>
      )}

      {/* Erro */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center"
        >
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={createPaymentIntent}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Tentar Novamente
          </button>
        </motion.div>
      )}

      {/* Formulário de Pagamento Stripe */}
      {clientSecret && (
        <StripeProvider clientSecret={clientSecret}>
          <PaymentForm
            amount={finalAmount}
            orderId={orderId}
            installments={selectedInstallment}
            onSuccess={onSuccess}
            onError={onError}
          />
        </StripeProvider>
      )}
    </div>
  )
}

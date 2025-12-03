'use client'

import { useState, useEffect } from 'react'
import { 
  PaymentElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js'
import { motion } from 'framer-motion'
import { CreditCard, Lock, Loader2, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PaymentFormProps {
  amount: number
  orderId?: string
  installments?: number
  compact?: boolean
  onSuccess?: (paymentIntentId: string) => void
  onError?: (error: string) => void
}

export default function PaymentForm({ 
  amount, 
  orderId, 
  installments = 1,
  compact = false,
  onSuccess, 
  onError 
}: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (stripe && elements) {
      setIsReady(true)
    }
  }, [stripe, elements])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      toast.error('Stripe não está pronto. Aguarde...')
      return
    }

    setLoading(true)
    setErrorMessage(null)

    try {
      // Confirmar o pagamento
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/pedido-confirmado?orderId=${orderId}`,
        },
        redirect: 'if_required',
      })

      if (error) {
        // Erro no pagamento
        const errorMsg = error.message || 'Erro ao processar pagamento'
        setErrorMessage(errorMsg)
        toast.error(errorMsg)
        
        if (onError) {
          onError(errorMsg)
        }
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Pagamento bem-sucedido
        toast.success('Pagamento realizado com sucesso!')
        
        if (onSuccess) {
          onSuccess(paymentIntent.id)
        }
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Erro inesperado ao processar pagamento'
      setErrorMessage(errorMsg)
      toast.error(errorMsg)
      
      if (onError) {
        onError(errorMsg)
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

  const installmentValue = amount / installments

  // Compact version for dark theme checkout
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Element - Dark Theme */}
          <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-white">Dados do Cartão</span>
            </div>

            <PaymentElement 
              options={{
                layout: 'tabs',
                business: { name: 'USS Brasil' },
              }}
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-900/30 border border-red-800 rounded-lg p-3">
              <p className="text-red-400 text-sm">{errorMessage}</p>
            </div>
          )}

          {/* Security Info - Compact */}
          <div className="flex items-center gap-2 text-zinc-500 text-xs justify-center">
            <Shield className="h-3.5 w-3.5 text-green-500" />
            <span>Pagamento 100% seguro via Stripe</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!stripe || !isReady || loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-600 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Finalizar Compra - R$ {amount.toFixed(2).replace('.', ',')}
              </>
            )}
          </button>
        </form>
      </motion.div>
    )
  }

  // Original full version
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Element */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Dados do Cartão</h3>
              <p className="text-sm text-gray-500">Insira os dados do seu cartão de crédito</p>
            </div>
          </div>

          <PaymentElement 
            options={{
              layout: 'tabs',
              business: { name: 'USS Brasil' },
            }}
          />
        </div>

        {/* Resumo do Pagamento */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Valor a pagar:</p>
              <p className="text-2xl font-bold text-gray-900">
                {installments}x de {formatCurrency(installmentValue)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total:</p>
              <p className="text-lg font-semibold text-blue-400">
                {formatCurrency(amount)}
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4"
          >
            <p className="text-red-600 text-sm">{errorMessage}</p>
          </motion.div>
        )}

        {/* Security Info */}
        <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
          <Shield className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">Pagamento 100% seguro</p>
            <p className="text-xs text-gray-500 mt-1">
              Seus dados são criptografados e protegidos pelo Stripe, líder mundial em processamento de pagamentos.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!stripe || !isReady || loading}
          className="w-full h-14 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white text-lg font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Processando pagamento...
            </>
          ) : (
            <>
              <Lock className="h-5 w-5 mr-2" />
              Pagar {formatCurrency(amount)}
            </>
          )}
        </Button>

        {/* Stripe Badge */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Pagamento processado de forma segura por{' '}
            <span className="font-semibold text-gray-600">Stripe</span>
          </p>
        </div>
      </form>
    </motion.div>
  )
}

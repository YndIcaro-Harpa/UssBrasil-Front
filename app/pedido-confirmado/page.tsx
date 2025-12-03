'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Package, CreditCard, Smartphone, Barcode, Home } from 'lucide-react'
import { motion } from 'framer-motion'
import Confetti from 'react-confetti'

function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId') || 'XXXXXXXX'
  const paymentMethod = searchParams.get('method') || 'credit'

  const [showConfetti, setShowConfetti] = useState(true)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    const timer = setTimeout(() => setShowConfetti(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  const paymentIcons = {
    credit: <CreditCard className="w-6 h-6" />,
    pix: <Smartphone className="w-6 h-6" />,
    boleto: <Barcode className="w-6 h-6" />,
  }

  const paymentLabels = {
    credit: 'Cartão de Crédito',
    pix: 'PIX',
    boleto: 'Boleto Bancário',
  }

  return (
    <>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-20 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="text-center mb-8"
          >
            <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
              Pedido Confirmado!
            </h1>
            <p className="text-lg text-gray-600">
              Obrigado pela sua compra!
            </p>
          </motion.div>

          {/* Order Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-6"
          >
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
              <Package className="w-6 h-6 text-blue-400" />
              <div>
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                  Número do Pedido
                </h2>
                <p className="text-2xl font-black text-blue-400">#{orderId}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                {paymentIcons[paymentMethod as keyof typeof paymentIcons]}
                <div>
                  <h3 className="text-sm font-bold text-gray-500">Forma de Pagamento</h3>
                  <p className="text-lg font-bold text-gray-900">
                    {paymentLabels[paymentMethod as keyof typeof paymentLabels]}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Instructions */}
            {paymentMethod === 'pix' && (
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <h3 className="font-bold text-blue-400 mb-2">
                  Instruções para pagamento PIX
                </h3>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Abra o aplicativo do seu banco</li>
                  <li>Escolha a opção PIX</li>
                  <li>Escaneie o QR Code enviado no seu email</li>
                  <li>Confirme o pagamento</li>
                </ol>
                <p className="text-xs text-gray-500 mt-3">
                  O QR Code também foi enviado para o seu email
                </p>
              </div>
            )}

            {paymentMethod === 'boleto' && (
              <div className="bg-yellow-50 rounded-xl p-4 mb-6">
                <h3 className="font-bold text-yellow-900 mb-2">
                  Instruções para pagamento Boleto
                </h3>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>O boleto foi enviado para o seu email</li>
                  <li>Pague até a data de vencimento</li>
                  <li>O pedido será processado após a confirmação</li>
                </ol>
                <p className="text-xs text-gray-500 mt-3">
                  Prazo de vencimento: 3 dias úteis
                </p>
              </div>
            )}

            {/* Email Notice */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-700">
                <strong>Confirmação enviada!</strong> Enviamos um email com todos os detalhes
                do seu pedido e as instruções de pagamento.
              </p>
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-6"
          >
            <h2 className="text-xl font-black text-gray-900 mb-4">
              Próximos Passos
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-400 text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Confirmação de Pagamento</h3>
                  <p className="text-sm text-gray-600">
                    Aguardamos a confirmação do pagamento para processar seu pedido
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-400 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Separação e Embalagem</h3>
                  <p className="text-sm text-gray-600">
                    Nosso time separará seus produtos com todo cuidado
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-400 text-white flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Envio e Rastreamento</h3>
                  <p className="text-sm text-gray-600">
                    Você receberá o código de rastreamento por email e WhatsApp
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/"
              className="flex-1 bg-blue-400 text-white px-6 py-4 rounded-full font-bold hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Voltar ao Início
            </Link>
            <Link
              href="/produtos"
              className="flex-1 bg-white text-blue-400 border-2 border-blue-400 px-6 py-4 rounded-full font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              Continuar Comprando
            </Link>
          </motion.div>

          {/* WhatsApp Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-8"
          >
            <p className="text-sm text-gray-500">
              Dúvidas? Entre em contato pelo WhatsApp:{' '}
              <a
                href="https://wa.me/5548991832760"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 font-bold hover:underline"
              >
                (48) 99183-2760
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default function PedidoConfirmadoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  )
}


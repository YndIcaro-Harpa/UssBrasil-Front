'use client'

import { CheckCircle, Package, Truck, Mail, ArrowRight, Home } from 'lucide-react'
import Link from 'next/link'


export default function CheckoutSucessoPage() {
  const orderNumber = `#${Math.random().toString(36).substring(2, 10).toUpperCase()}`
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 animate-pulse">
            <CheckCircle className="w-14 h-14 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Pedido Confirmado!</h1>
          <p className="text-xl text-gray-600">Obrigado por comprar conosco</p>
          <p className="text-lg text-gray-500 mt-2">Número do pedido: <span className="font-semibold text-gray-800">{orderNumber}</span></p>
        </div>

        {/* Order Timeline */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Status do Pedido</h2>
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <span className="mt-2 text-sm font-medium text-green-600">Confirmado</span>
              </div>
              <div className="flex-1 h-1 bg-gray-200 mx-4">
                <div className="h-full w-1/3 bg-green-600 rounded"></div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
                <span className="mt-2 text-sm font-medium text-gray-400">Preparando</span>
              </div>
              <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 text-gray-400" />
                </div>
                <span className="mt-2 text-sm font-medium text-gray-400">Enviado</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Confirmação por E-mail</h3>
            </div>
            <p className="text-gray-600">
              Enviamos um e-mail com todos os detalhes do seu pedido e informações de rastreamento.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Truck className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Previsão de Entrega</h3>
            </div>
            <p className="text-gray-600">
              Seu pedido será entregue em até <span className="font-semibold">5-7 dias úteis</span>.
            </p>
          </div>
        </div>

        {/* Summary Card */}
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 text-white mb-12">
          <h3 className="text-xl font-semibold mb-4">Resumo do Pedido</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-blue-100">Subtotal</span>
              <span>R$ 299,90</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-100">Frete</span>
              <span className="text-green-300">Grátis</span>
            </div>
            <div className="border-t border-blue-400 pt-3 mt-3">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>R$ 299,90</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/minha-conta/pedidos"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Acompanhar Pedido
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-white text-gray-800 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-lg border border-gray-200"
          >
            <Home className="w-5 h-5" />
            Voltar à Loja
          </Link>
        </div>

        {/* Help Section */}
        <div className="max-w-3xl mx-auto mt-12 text-center">
          <p className="text-gray-500">
            Precisa de ajuda? Entre em contato conosco pelo{' '}
            <a href="mailto:suporte@ussbrasil.com" className="text-blue-600 hover:underline font-medium">
              suporte@ussbrasil.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

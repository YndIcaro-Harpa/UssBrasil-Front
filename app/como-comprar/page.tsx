'use client';

import { ShoppingCart, CreditCard, Truck, Package, CheckCircle, Search, Heart } from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    step: 1,
    icon: Search,
    title: 'Encontre seu produto',
    description: 'Navegue pelas categorias ou use a busca para encontrar o produto desejado.'
  },
  {
    step: 2,
    icon: Heart,
    title: 'Adicione aos favoritos ou carrinho',
    description: 'Salve para depois ou adicione diretamente ao carrinho de compras.'
  },
  {
    step: 3,
    icon: ShoppingCart,
    title: 'Revise seu carrinho',
    description: 'Confira os produtos, quantidades e valores antes de finalizar.'
  },
  {
    step: 4,
    icon: CreditCard,
    title: 'Escolha a forma de pagamento',
    description: 'PIX, cartão de crédito em até 12x, boleto ou débito.'
  },
  {
    step: 5,
    icon: Truck,
    title: 'Informe o endereço de entrega',
    description: 'Preencha seus dados e escolha a modalidade de frete.'
  },
  {
    step: 6,
    icon: Package,
    title: 'Acompanhe seu pedido',
    description: 'Receba atualizações por e-mail e rastreie sua entrega.'
  }
];

const paymentMethods = [
  { name: 'PIX', description: '5% de desconto', highlight: true },
  { name: 'Cartão de Crédito', description: 'Até 10x sem juros' },
  { name: 'Boleto Bancário', description: 'Vencimento em 3 dias' },
  { name: 'Cartão de Débito', description: 'Pagamento à vista' }
];

export default function ComoComprarPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-bold mb-4">
            <ShoppingCart className="h-4 w-4" />
            GUIA DE COMPRA
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Como Comprar</h1>
          <p className="text-xl text-gray-600">Passo a passo para fazer sua compra na USS Brasil</p>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="space-y-6">
            {steps.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="flex gap-6 items-start bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-blue-400 text-white rounded-full flex items-center justify-center">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-blue-400">Passo {item.step}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-3xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Formas de Pagamento</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {paymentMethods.map((method, index) => (
              <div key={index} className={`p-5 rounded-xl text-center ${method.highlight ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-50'}`}>
                <h3 className="font-bold text-gray-900 mb-1">{method.name}</h3>
                <p className={`text-sm ${method.highlight ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>{method.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/produtos">
            <button className="px-8 py-4 bg-blue-400 hover:bg-blue-500 text-white rounded-full font-semibold text-lg transition-colors">
              Começar a comprar
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

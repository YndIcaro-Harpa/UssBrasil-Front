'use client';

import { Crown, Star, Gift, Truck, Percent, Headphones, Sparkles, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const benefits = [
  { icon: Percent, title: 'Descontos Exclusivos', description: 'Até 20% de desconto em todos os produtos' },
  { icon: Truck, title: 'Frete Grátis', description: 'Em todas as compras, sem valor mínimo' },
  { icon: Gift, title: 'Presentes Especiais', description: 'Brindes exclusivos em datas comemorativas' },
  { icon: Sparkles, title: 'Acesso Antecipado', description: 'Seja o primeiro a ver os lançamentos' },
  { icon: Headphones, title: 'Suporte Prioritário', description: 'Atendimento VIP com linha exclusiva' },
  { icon: Star, title: 'Pontos em Dobro', description: 'Acumule pontos 2x mais rápido' }
];

const plans = [
  {
    name: 'VIP Silver',
    price: 'R$ 29,90/mês',
    features: ['10% de desconto', 'Frete grátis acima de R$ 100', 'Suporte prioritário'],
    color: 'gray'
  },
  {
    name: 'VIP Gold',
    price: 'R$ 49,90/mês',
    features: ['15% de desconto', 'Frete grátis sempre', 'Suporte prioritário', 'Acesso antecipado'],
    color: 'yellow',
    popular: true
  },
  {
    name: 'VIP Platinum',
    price: 'R$ 79,90/mês',
    features: ['20% de desconto', 'Frete grátis sempre', 'Suporte VIP 24/7', 'Acesso antecipado', 'Presentes exclusivos'],
    color: 'purple'
  }
];

export default function VipPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-600 rounded-full text-sm font-bold mb-4">
            <Crown className="h-4 w-4" />
            PROGRAMA VIP
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Clube VIP USS Brasil</h1>
          <p className="text-xl text-gray-600">Benefícios exclusivos para clientes especiais</p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="h-7 w-7 text-yellow-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            );
          })}
        </div>

        {/* Plans */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Escolha seu Plano</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, index) => {
              const colors: Record<string, string> = {
                gray: 'from-gray-600 to-gray-700',
                yellow: 'from-yellow-500 to-yellow-600',
                purple: 'from-purple-600 to-purple-700'
              };
              return (
                <div key={index} className={`rounded-3xl overflow-hidden ${plan.popular ? 'ring-4 ring-yellow-400' : ''}`}>
                  {plan.popular && (
                    <div className="bg-yellow-400 text-yellow-900 text-center py-2 font-bold text-sm">
                      MAIS POPULAR
                    </div>
                  )}
                  <div className={`bg-gradient-to-br ${colors[plan.color]} p-8 text-white`}>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-3xl font-bold mb-6">{plan.price}</p>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button className="w-full py-3 bg-white text-gray-900 rounded-full font-bold hover:bg-gray-100 transition-colors">
                      Assinar agora
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl p-8 text-white text-center">
          <Crown className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Torne-se VIP Hoje</h2>
          <p className="text-white/90 mb-6 max-w-lg mx-auto">
            Faça parte do clube mais exclusivo de tecnologia do Brasil e aproveite benefícios incríveis.
          </p>
          <Link href="/auth/registrar">
            <button className="px-8 py-4 bg-white text-orange-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors">
              Criar conta VIP
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

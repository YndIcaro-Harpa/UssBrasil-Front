'use client';

import { RefreshCw, Package, Clock, CheckCircle, AlertTriangle, Truck, CreditCard, MessageCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    step: 1,
    title: 'Solicite a troca',
    description: 'Entre em contato com nosso suporte em até 7 dias após receber o produto.',
    icon: MessageCircle
  },
  {
    step: 2,
    title: 'Prepare o produto',
    description: 'Embale o produto na embalagem original com todos os acessórios e nota fiscal.',
    icon: Package
  },
  {
    step: 3,
    title: 'Envie para análise',
    description: 'Envie o produto para nosso centro de distribuição com frete grátis.',
    icon: Truck
  },
  {
    step: 4,
    title: 'Receba a solução',
    description: 'Após análise, realizamos a troca ou reembolso em até 10 dias úteis.',
    icon: RefreshCw
  }
];

const policies = [
  {
    title: 'Prazo para Devolução',
    description: 'Você tem até 7 dias corridos após o recebimento para solicitar a devolução, conforme o Código de Defesa do Consumidor.',
    icon: Clock,
    highlight: '7 dias'
  },
  {
    title: 'Condições do Produto',
    description: 'O produto deve estar na embalagem original, sem uso, com todos os acessórios, manuais e nota fiscal.',
    icon: Package,
    highlight: 'Sem uso'
  },
  {
    title: 'Reembolso',
    description: 'O reembolso é feito na mesma forma de pagamento utilizada na compra, em até 10 dias úteis após aprovação.',
    icon: CreditCard,
    highlight: '10 dias úteis'
  },
  {
    title: 'Frete de Devolução',
    description: 'O frete de devolução é por nossa conta. Você receberá um código de postagem para envio gratuito.',
    icon: Truck,
    highlight: 'Grátis'
  }
];

const exchangeReasons = [
  { valid: true, reason: 'Produto com defeito de fabricação' },
  { valid: true, reason: 'Produto diferente do anunciado' },
  { valid: true, reason: 'Arrependimento da compra (até 7 dias)' },
  { valid: true, reason: 'Produto danificado no transporte' },
  { valid: false, reason: 'Produto usado ou com sinais de uso' },
  { valid: false, reason: 'Produto sem embalagem original' },
  { valid: false, reason: 'Danos causados pelo usuário' },
  { valid: false, reason: 'Produto fora do prazo de 7 dias' }
];

const faqs = [
  {
    question: 'Quanto tempo leva para receber o reembolso?',
    answer: 'Após a aprovação da devolução, o reembolso é processado em até 10 dias úteis. O prazo pode variar de acordo com a operadora do cartão.'
  },
  {
    question: 'Posso trocar por outro produto diferente?',
    answer: 'Sim! Você pode solicitar a troca por outro produto. Se houver diferença de valor, será feito o ajuste no pagamento.'
  },
  {
    question: 'E se o produto tiver defeito após 7 dias?',
    answer: 'Produtos com defeito após 7 dias são cobertos pela garantia do fabricante. Consulte nossa página de Garantia para mais informações.'
  },
  {
    question: 'Como faço para enviar o produto?',
    answer: 'Após abrir a solicitação de troca, você receberá um código de postagem. Basta levar o produto embalado em qualquer agência dos Correios.'
  }
];

export default function TrocasDevolucoes() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm font-bold mb-4">
            <RefreshCw className="h-4 w-4" />
            SATISFAÇÃO GARANTIDA
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Trocas e Devoluções</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sua satisfação é nossa prioridade. Conheça nossa política de trocas e devoluções.
          </p>
        </div>

        {/* Process Steps */}
        <div className="bg-white rounded-3xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Como funciona?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-400 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold md:hidden">
                      {item.step}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-gray-200" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Policy Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {policies.map((policy, index) => {
            const Icon = policy.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all text-center">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-7 w-7 text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-blue-400 mb-2">{policy.highlight}</div>
                <h3 className="font-bold text-gray-900 mb-2">{policy.title}</h3>
                <p className="text-gray-600 text-sm">{policy.description}</p>
              </div>
            );
          })}
        </div>

        {/* Exchange Reasons */}
        <div className="bg-white rounded-3xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quando posso trocar ou devolver?</h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {exchangeReasons.map((item, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-4 rounded-xl ${
                  item.valid ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                {item.valid ? (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                )}
                <span className={item.valid ? 'text-green-800' : 'text-red-800'}>
                  {item.reason}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-3xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Perguntas Frequentes</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 text-center text-white">
          <RefreshCw className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Precisa fazer uma troca ou devolução?</h2>
          <p className="text-white/80 mb-6 max-w-lg mx-auto">
            Entre em contato com nossa equipe de atendimento. Estamos prontos para ajudar!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/5511999999999?text=Olá! Preciso de ajuda com uma troca ou devolução."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-semibold transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              Falar no WhatsApp
            </a>
            <Link
              href="/meus-pedidos"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-full font-semibold transition-colors"
            >
              Ver meus pedidos
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Additional Links */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Consulte também nossa{' '}
            <Link href="/garantia" className="text-blue-600 hover:underline">Política de Garantia</Link>
            {' '}e{' '}
            <Link href="/faq" className="text-blue-600 hover:underline">FAQ</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { HelpCircle, Search, Phone, Mail, MessageCircle, Clock, ChevronRight, Headphones, Package, CreditCard, Truck, Shield, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

const categories = [
  {
    icon: Package,
    title: 'Pedidos',
    description: 'Acompanhe seus pedidos e status de entrega',
    links: [
      { text: 'Rastrear meu pedido', href: '/rastreamento' },
      { text: 'Meus pedidos', href: '/meus-pedidos' },
      { text: 'Como comprar', href: '/como-comprar' }
    ]
  },
  {
    icon: Truck,
    title: 'Entregas',
    description: 'Informações sobre frete e prazos',
    links: [
      { text: 'Métodos de envio', href: '/metodos-envio' },
      { text: 'Prazo de entrega', href: '/faq' },
      { text: 'Rastrear entrega', href: '/rastreamento' }
    ]
  },
  {
    icon: CreditCard,
    title: 'Pagamentos',
    description: 'Formas de pagamento e parcelamento',
    links: [
      { text: 'Formas de pagamento', href: '/faq' },
      { text: 'Segurança', href: '/seguranca-pagamentos' },
      { text: 'Parcelamento', href: '/faq' }
    ]
  },
  {
    icon: RefreshCw,
    title: 'Trocas e Devoluções',
    description: 'Política de trocas e reembolsos',
    links: [
      { text: 'Política de trocas', href: '/trocas-devolucoes' },
      { text: 'Solicitar troca', href: '/trocas-devolucoes' },
      { text: 'Prazo para devolução', href: '/politica-troca' }
    ]
  },
  {
    icon: Shield,
    title: 'Garantia',
    description: 'Cobertura e acionamento de garantia',
    links: [
      { text: 'Política de garantia', href: '/garantia' },
      { text: 'Acionar garantia', href: '/garantia' },
      { text: 'Prazo de garantia', href: '/garantia' }
    ]
  },
  {
    icon: Headphones,
    title: 'Suporte Técnico',
    description: 'Ajuda com produtos e configurações',
    links: [
      { text: 'FAQ', href: '/faq' },
      { text: 'Suporte', href: '/suporte' },
      { text: 'Contato', href: '/contato' }
    ]
  }
];

const popularQuestions = [
  { question: 'Como rastrear meu pedido?', answer: 'Acesse a página "Meus Pedidos" e clique em "Rastrear" no pedido desejado.', href: '/rastreamento' },
  { question: 'Qual o prazo de entrega?', answer: 'O prazo varia de 2 a 15 dias úteis dependendo da região e modalidade de frete.', href: '/metodos-envio' },
  { question: 'Posso trocar meu produto?', answer: 'Sim, você tem até 7 dias após o recebimento para solicitar a troca.', href: '/trocas-devolucoes' },
  { question: 'Quais formas de pagamento?', answer: 'Aceitamos cartões de crédito, débito, PIX e boleto bancário.', href: '/faq' }
];

export default function CentralAjudaPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-400 rounded-full text-sm font-bold mb-4">
            <HelpCircle className="h-4 w-4" />
            SUPORTE
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Central de Ajuda</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Encontre respostas para suas dúvidas ou entre em contato com nossa equipe
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar ajuda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
            />
          </div>
        </div>

        {/* Quick Access */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Link href="/faq" className="px-6 py-3 bg-white rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-400" />
            <span className="font-semibold">FAQ</span>
          </Link>
          <Link href="/rastreamento" className="px-6 py-3 bg-white rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-400" />
            <span className="font-semibold">Rastrear Pedido</span>
          </Link>
          <Link href="/contato" className="px-6 py-3 bg-white rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-400" />
            <span className="font-semibold">Contato</span>
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{category.title}</h3>
                    <p className="text-sm text-gray-500">{category.description}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {category.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <span className="text-gray-700 group-hover:text-blue-400">{link.text}</span>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-400" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Popular Questions */}
        <div className="bg-white rounded-3xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Perguntas Populares</h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {popularQuestions.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="p-5 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
              >
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-400">{item.question}</h3>
                <p className="text-gray-600 text-sm">{item.answer}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Contact Options */}
        <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-3xl p-8">
          <div className="text-center mb-8">
            <Headphones className="h-12 w-12 text-white mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Ainda precisa de ajuda?</h2>
            <p className="text-white/80">Nossa equipe está pronta para atendê-lo</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <a
              href="https://wa.me/5548991832760"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 rounded-2xl p-6 text-center transition-colors"
            >
              <MessageCircle className="h-8 w-8 text-white mx-auto mb-3" />
              <h3 className="font-bold text-white mb-1">WhatsApp</h3>
              <p className="text-white/70 text-sm">Atendimento rápido</p>
            </a>
            <a
              href="tel:+551140028922"
              className="bg-white/10 hover:bg-white/20 rounded-2xl p-6 text-center transition-colors"
            >
              <Phone className="h-8 w-8 text-white mx-auto mb-3" />
              <h3 className="font-bold text-white mb-1">Telefone</h3>
              <p className="text-white/70 text-sm">(11) 4002-8922</p>
            </a>
            <a
              href="mailto:suporte@ussbrasil.com.br"
              className="bg-white/10 hover:bg-white/20 rounded-2xl p-6 text-center transition-colors"
            >
              <Mail className="h-8 w-8 text-white mx-auto mb-3" />
              <h3 className="font-bold text-white mb-1">E-mail</h3>
              <p className="text-white/70 text-sm">suporte@ussbrasil.com.br</p>
            </a>
          </div>
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 text-white/70 text-sm">
              <Clock className="h-4 w-4" />
              Seg a Sex: 9h às 18h | Sáb: 9h às 13h
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

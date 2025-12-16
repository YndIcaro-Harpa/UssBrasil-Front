'use client';

import { Headphones, MessageCircle, Phone, Mail, Clock, FileText, Video, HelpCircle } from 'lucide-react';
import Link from 'next/link';

const supportChannels = [
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    description: 'Atendimento rápido e prático',
    action: 'Iniciar conversa',
    href: 'https://wa.me/5548991832760',
    highlight: true
  },
  {
    icon: Phone,
    title: 'Telefone',
    description: '(11) 4002-8922',
    action: 'Ligar agora',
    href: 'tel:+551140028922'
  },
  {
    icon: Mail,
    title: 'E-mail',
    description: 'suporte@ussbrasil.com.br',
    action: 'Enviar e-mail',
    href: 'mailto:suporte@ussbrasil.com.br'
  }
];

const supportTopics = [
  { icon: FileText, title: 'Pedidos', description: 'Dúvidas sobre seus pedidos', href: '/meus-pedidos' },
  { icon: HelpCircle, title: 'FAQ', description: 'Perguntas frequentes', href: '/faq' },
  { icon: Video, title: 'Garantia', description: 'Política de garantia', href: '/garantia' }
];

export default function SuportePage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-bold mb-4">
            <Headphones className="h-4 w-4" />
            SUPORTE
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Suporte ao Cliente</h1>
          <p className="text-xl text-gray-600">Estamos aqui para ajudar você</p>
        </div>

        {/* Support Channels */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {supportChannels.map((channel, index) => {
            const Icon = channel.icon;
            return (
              <a
                key={index}
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all text-center ${channel.highlight ? 'ring-2 ring-green-500' : ''}`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 ${channel.highlight ? 'bg-green-100' : 'bg-blue-100'}`}>
                  <Icon className={`h-7 w-7 ${channel.highlight ? 'text-green-600' : 'text-blue-400'}`} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{channel.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{channel.description}</p>
                <span className={`inline-block px-4 py-2 rounded-full font-semibold text-sm ${channel.highlight ? 'bg-green-500 text-white' : 'bg-blue-400 text-white'}`}>
                  {channel.action}
                </span>
              </a>
            );
          })}
        </div>

        {/* Quick Access */}
        <div className="bg-white rounded-3xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Acesso Rápido</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {supportTopics.map((topic, index) => {
              const Icon = topic.icon;
              return (
                <Link key={index} href={topic.href} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{topic.title}</h3>
                    <p className="text-sm text-gray-600">{topic.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-blue-400 rounded-3xl p-8 text-white text-center">
          <Clock className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Horário de Atendimento</h2>
          <div className="space-y-2 text-white/90">
            <p>Segunda a Sexta: 9h às 18h</p>
            <p>Sábado: 9h às 13h</p>
            <p className="text-white/70 text-sm mt-4">Exceto feriados nacionais</p>
          </div>
        </div>
      </div>
    </div>
  );
}

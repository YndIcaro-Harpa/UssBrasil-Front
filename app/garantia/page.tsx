'use client';

import { Shield, CheckCircle, Clock, Headphones, FileText, AlertTriangle, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

const warrantyTypes = [
  {
    icon: Shield,
    title: 'Garantia do Fabricante',
    description: 'Todos os produtos vendidos pela USS Brasil possuem garantia do fabricante, que varia de acordo com a categoria do produto.',
    duration: '12 a 24 meses',
    color: 'blue'
  },
  {
    icon: FileText,
    title: 'Garantia Estendida',
    description: 'Ofereça proteção extra ao seu produto com nossa garantia estendida opcional, disponível no momento da compra.',
    duration: '+ 12 meses',
    color: 'green'
  },
  {
    icon: CheckCircle,
    title: 'Garantia Contra Defeitos',
    description: 'Cobrimos defeitos de fabricação e problemas técnicos que não sejam causados por mau uso ou acidentes.',
    duration: 'Conforme fabricante',
    color: 'purple'
  }
];

const coverageItems = [
  { covered: true, text: 'Defeitos de fabricação' },
  { covered: true, text: 'Problemas técnicos de hardware' },
  { covered: true, text: 'Mau funcionamento de software original' },
  { covered: true, text: 'Peças e componentes defeituosos' },
  { covered: false, text: 'Danos causados por mau uso' },
  { covered: false, text: 'Quedas, impactos ou líquidos' },
  { covered: false, text: 'Modificações não autorizadas' },
  { covered: false, text: 'Desgaste natural do produto' }
];

const warrantyPeriods = [
  { category: 'iPhones', period: '12 meses', details: 'Garantia Apple oficial' },
  { category: 'Smartphones', period: '12 meses', details: 'Garantia do fabricante' },
  { category: 'Fones de Ouvido', period: '12 meses', details: 'JBL, Beats, AirPods' },
  { category: 'Smartwatches', period: '12 meses', details: 'Apple Watch, Mi Band' },
  { category: 'Acessórios', period: '3 a 6 meses', details: 'Conforme fabricante' },
  { category: 'Carregadores', period: '6 meses', details: 'Garantia contra defeitos' }
];

const steps = [
  {
    step: 1,
    title: 'Identifique o problema',
    description: 'Verifique se o defeito está coberto pela garantia e reúna documentos do produto.'
  },
  {
    step: 2,
    title: 'Entre em contato',
    description: 'Fale com nossa equipe de suporte através dos canais disponíveis.'
  },
  {
    step: 3,
    title: 'Envie o produto',
    description: 'Siga as instruções para enviar o produto para análise técnica.'
  },
  {
    step: 4,
    title: 'Receba a solução',
    description: 'Após análise, seu produto será reparado ou substituído.'
  }
];

export default function GarantiaPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-bold mb-4">
            <Shield className="h-4 w-4" />
            PROTEÇÃO GARANTIDA
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Garantia</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Todos os produtos vendidos pela USS Brasil contam com garantia contra defeitos de fabricação
          </p>
        </div>

        {/* Warranty Types */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {warrantyTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                  type.color === 'blue' ? 'bg-blue-100' :
                  type.color === 'green' ? 'bg-green-100' : 'bg-purple-100'
                }`}>
                  <Icon className={`h-7 w-7 ${
                    type.color === 'blue' ? 'text-blue-600' :
                    type.color === 'green' ? 'text-green-600' : 'text-purple-600'
                  }`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{type.title}</h3>
                <p className="text-gray-600 mb-4">{type.description}</p>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="font-semibold text-gray-700">{type.duration}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Coverage Section */}
        <div className="bg-white rounded-3xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">O que está coberto?</h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {coverageItems.map((item, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-4 rounded-xl ${
                  item.covered ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                {item.covered ? (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                )}
                <span className={item.covered ? 'text-green-800' : 'text-red-800'}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Warranty Periods Table */}
        <div className="bg-white rounded-3xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Prazos de Garantia por Categoria</h2>
          <div className="overflow-x-auto">
            <table className="w-full max-w-3xl mx-auto">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">Categoria</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">Período</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">Observações</th>
                </tr>
              </thead>
              <tbody>
                {warrantyPeriods.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium text-gray-900">{item.category}</td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                        {item.period}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{item.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* How to Claim */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Como acionar a garantia?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-blue-400 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-3xl p-8 text-center text-white">
          <Headphones className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Precisa de ajuda com a garantia?</h2>
          <p className="text-white/80 mb-6 max-w-lg mx-auto">
            Nossa equipe está pronta para ajudar você em todas as etapas do processo de garantia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-400 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              <Phone className="h-5 w-5" />
              WhatsApp
            </a>
            <a
              href="mailto:suporte@ussbrasil.com.br"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/20 text-white rounded-full font-semibold hover:bg-white/30 transition-colors"
            >
              <Mail className="h-5 w-5" />
              suporte@ussbrasil.com.br
            </a>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Para mais informações, consulte nosso{' '}
            <Link href="/faq" className="text-blue-600 hover:underline">FAQ</Link>
            {' '}ou acesse{' '}
            <Link href="/trocas-devolucoes" className="text-blue-600 hover:underline">Trocas e Devoluções</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

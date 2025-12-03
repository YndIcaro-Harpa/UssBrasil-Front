'use client';

import { Shield, Lock, CreditCard, Eye, CheckCircle, Server } from 'lucide-react';

const securityFeatures = [
  {
    icon: Lock,
    title: 'Criptografia SSL',
    description: 'Todas as transações são protegidas com criptografia SSL de 256 bits.'
  },
  {
    icon: CreditCard,
    title: 'Pagamento Seguro',
    description: 'Processamos pagamentos através de gateways certificados PCI-DSS.'
  },
  {
    icon: Eye,
    title: 'Privacidade de Dados',
    description: 'Seus dados pessoais nunca são compartilhados com terceiros.'
  },
  {
    icon: Server,
    title: 'Servidores Protegidos',
    description: 'Infraestrutura com firewall e monitoramento 24/7.'
  }
];

const paymentPartners = [
  { name: 'Stripe', description: 'Pagamentos internacionais' },
  { name: 'PIX', description: 'Banco Central do Brasil' },
  { name: 'Visa/Mastercard', description: 'Cartões de crédito e débito' },
  { name: 'Boleto', description: 'Pagamento bancário' }
];

const certifications = [
  'PCI-DSS Compliant',
  'SSL Certificate',
  'LGPD Compliant',
  'Site Blindado'
];

export default function SegurancaPagamentosPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-600 rounded-full text-sm font-bold mb-4">
            <Shield className="h-4 w-4" />
            SEGURANÇA
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Segurança e Pagamentos</h1>
          <p className="text-xl text-gray-600">Sua compra protegida do início ao fim</p>
        </div>

        {/* Security Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all text-center">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Payment Partners */}
        <div className="bg-white rounded-3xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Parceiros de Pagamento</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {paymentPartners.map((partner, index) => (
              <div key={index} className="p-5 bg-gray-50 rounded-xl text-center">
                <h3 className="font-bold text-gray-900 mb-1">{partner.name}</h3>
                <p className="text-sm text-gray-600">{partner.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-3xl p-8 text-white">
          <div className="text-center mb-8">
            <Shield className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Certificações de Segurança</h2>
            <p className="text-white/80">Somos certificados pelos principais órgãos de segurança digital</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {certifications.map((cert, index) => (
              <div key={index} className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full">
                <CheckCircle className="h-4 w-4" />
                <span className="font-semibold text-sm">{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

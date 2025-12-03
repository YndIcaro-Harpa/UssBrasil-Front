'use client';

import { Truck, Clock, MapPin, Package, Zap, Shield } from 'lucide-react';

const shippingMethods = [
  {
    icon: Zap,
    name: 'Entrega Expressa',
    time: '1-2 dias úteis',
    description: 'Para capitais e grandes cidades. Receba seu pedido rapidamente.',
    price: 'A partir de R$ 19,90',
    color: 'purple'
  },
  {
    icon: Truck,
    name: 'Frete Padrão',
    time: '3-7 dias úteis',
    description: 'Entrega econômica para todo o Brasil com rastreamento.',
    price: 'A partir de R$ 9,90',
    color: 'blue'
  },
  {
    icon: Package,
    name: 'Frete Grátis',
    time: '5-10 dias úteis',
    description: 'Para compras acima de R$ 299,00. Válido para todo o Brasil.',
    price: 'Grátis',
    color: 'green'
  },
  {
    icon: MapPin,
    name: 'Retirada na Loja',
    time: 'Mesmo dia',
    description: 'Retire seu pedido em nossa loja física em São Paulo.',
    price: 'Grátis',
    color: 'orange'
  }
];

const regions = [
  { region: 'Sudeste', express: '1-2 dias', standard: '3-5 dias' },
  { region: 'Sul', express: '2-3 dias', standard: '4-6 dias' },
  { region: 'Centro-Oeste', express: '2-3 dias', standard: '5-7 dias' },
  { region: 'Nordeste', express: '3-4 dias', standard: '6-9 dias' },
  { region: 'Norte', express: '4-5 dias', standard: '8-12 dias' }
];

export default function MetodosEnvioPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-bold mb-4">
            <Truck className="h-4 w-4" />
            ENTREGAS
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Métodos de Envio</h1>
          <p className="text-xl text-gray-600">Escolha a melhor opção de entrega para você</p>
        </div>

        {/* Shipping Methods */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {shippingMethods.map((method, index) => {
            const Icon = method.icon;
            const colors: Record<string, string> = {
              purple: 'bg-purple-100 text-purple-600',
              blue: 'bg-blue-100 text-blue-600',
              green: 'bg-green-100 text-green-600',
              orange: 'bg-orange-100 text-orange-600'
            };
            return (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${colors[method.color]}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{method.name}</h3>
                <p className="text-blue-600 font-semibold text-sm mb-2 flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {method.time}
                </p>
                <p className="text-gray-600 text-sm mb-4">{method.description}</p>
                <p className="text-lg font-bold text-gray-900">{method.price}</p>
              </div>
            );
          })}
        </div>

        {/* Delivery Times by Region */}
        <div className="bg-white rounded-3xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Prazo por Região</h2>
          <div className="overflow-x-auto">
            <table className="w-full max-w-2xl mx-auto">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">Região</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-600">Expresso</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-600">Padrão</th>
                </tr>
              </thead>
              <tbody>
                {regions.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium text-gray-900">{item.region}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-semibold">{item.express}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-3 py-1 bg-blue-100 text-blue-400 rounded-full text-sm font-semibold">{item.standard}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-400 rounded-3xl p-8 text-white text-center">
          <Shield className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Entrega Segura</h2>
          <p className="text-white/80 max-w-lg mx-auto">
            Todos os pedidos são embalados com cuidado e possuem seguro contra extravios e danos durante o transporte.
          </p>
        </div>
      </div>
    </div>
  );
}

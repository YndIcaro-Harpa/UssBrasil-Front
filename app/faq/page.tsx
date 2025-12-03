'use client';

import { useState } from 'react';
import { ChevronDown, Search, HelpCircle, Package, CreditCard, Truck, RotateCcw, Shield, MessageCircle } from 'lucide-react';
import Link from 'next/link';

const faqCategories = [
  {
    id: 'pedidos',
    name: 'Pedidos e Compras',
    icon: Package,
    questions: [
      {
        question: 'Como faço um pedido?',
        answer: 'Para fazer um pedido, navegue pelos produtos, adicione ao carrinho e finalize a compra informando seus dados de entrega e pagamento.'
      },
      {
        question: 'Posso alterar meu pedido após a confirmação?',
        answer: 'Alterações só são possíveis antes do envio. Entre em contato conosco pelo WhatsApp o mais rápido possível.'
      },
      {
        question: 'Como acompanho meu pedido?',
        answer: 'Acesse "Meus Pedidos" no menu ou use nosso sistema de rastreamento com o código enviado por e-mail.'
      }
    ]
  },
  {
    id: 'pagamento',
    name: 'Pagamento',
    icon: CreditCard,
    questions: [
      {
        question: 'Quais formas de pagamento são aceitas?',
        answer: 'Aceitamos cartões de crédito (Visa, Mastercard, Elo, American Express), PIX, boleto bancário e transferência.'
      },
      {
        question: 'Posso parcelar minhas compras?',
        answer: 'Sim! Oferecemos parcelamento em até 12x sem juros no cartão de crédito para compras acima de R$ 500.'
      },
      {
        question: 'O pagamento via PIX é seguro?',
        answer: 'Sim, o PIX é regulamentado pelo Banco Central e todas as transações são criptografadas e seguras.'
      }
    ]
  },
  {
    id: 'entrega',
    name: 'Entrega',
    icon: Truck,
    questions: [
      {
        question: 'Qual o prazo de entrega?',
        answer: 'O prazo varia de acordo com sua região. Geralmente, entregamos em 3-7 dias úteis para capitais e 5-12 dias úteis para outras regiões.'
      },
      {
        question: 'Vocês entregam em todo o Brasil?',
        answer: 'Sim! Entregamos em todo o território nacional através dos Correios e transportadoras parceiras.'
      },
      {
        question: 'O frete é grátis?',
        answer: 'Oferecemos frete grátis para compras acima de R$ 199 para todo o Brasil.'
      }
    ]
  },
  {
    id: 'trocas',
    name: 'Trocas e Devoluções',
    icon: RotateCcw,
    questions: [
      {
        question: 'Qual o prazo para troca ou devolução?',
        answer: 'Você tem até 7 dias após o recebimento para solicitar troca ou devolução, conforme o Código de Defesa do Consumidor.'
      },
      {
        question: 'Como solicito uma troca?',
        answer: 'Entre em contato conosco pelo WhatsApp ou e-mail informando o número do pedido e o motivo da troca.'
      },
      {
        question: 'Quem paga o frete da devolução?',
        answer: 'Em caso de defeito ou erro nosso, arcamos com o frete. Para arrependimento, o cliente é responsável pelo envio.'
      }
    ]
  },
  {
    id: 'garantia',
    name: 'Garantia',
    icon: Shield,
    questions: [
      {
        question: 'Qual a garantia dos produtos?',
        answer: 'Todos os produtos têm garantia mínima de 12 meses. Alguns produtos Apple têm garantia estendida de até 24 meses.'
      },
      {
        question: 'Como aciono a garantia?',
        answer: 'Entre em contato conosco com a nota fiscal e descrição do problema. Avaliaremos e indicaremos a melhor solução.'
      },
      {
        question: 'A garantia cobre danos por uso?',
        answer: 'Não, a garantia cobre apenas defeitos de fabricação. Danos por mau uso, quedas ou líquidos não são cobertos.'
      }
    ]
  }
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors px-4 -mx-4 rounded-lg"
      >
        <span className="font-medium text-gray-900 pr-4">{question}</span>
        <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="pb-5 text-gray-600 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <HelpCircle className="h-8 w-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Perguntas Frequentes
          </h1>
          <p className="text-xl text-gray-600">
            Encontre respostas para as dúvidas mais comuns
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar pergunta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>

        {/* Categories */}
        <div className="space-y-6">
          {filteredCategories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <div key={category.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setActiveCategory(isActive ? null : category.id)}
                  className="w-full p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h2 className="text-lg font-bold text-gray-900">{category.name}</h2>
                    <p className="text-sm text-gray-500">{category.questions.length} perguntas</p>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isActive ? 'rotate-180' : ''}`} />
                </button>
                
                {isActive && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="pt-4">
                      {category.questions.map((q, index) => (
                        <FAQItem key={index} question={q.question} answer={q.answer} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-8 text-center text-white">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-90" />
          <h3 className="text-2xl font-bold mb-2">Não encontrou sua resposta?</h3>
          <p className="text-blue-100 mb-6">
            Nossa equipe está pronta para ajudar você
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contato">
              <button className="px-8 py-3 bg-white text-blue-500 rounded-full font-semibold hover:bg-blue-50 transition-colors">
                Fale Conosco
              </button>
            </Link>
            <a href="https://wa.me/5548991832760" target="_blank" rel="noopener noreferrer">
              <button className="px-8 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-colors">
                WhatsApp
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


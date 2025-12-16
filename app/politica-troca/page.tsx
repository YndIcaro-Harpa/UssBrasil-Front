'use client'

import { useState } from 'react'

export default function PoliticaTrocaPage() {
  const [isRedirecting, setIsRedirecting] = useState(false)

  const handleWhatsAppRedirect = () => {
    setIsRedirecting(true)
    // Substitua pelo número do WhatsApp desejado (formato internacional sem +)
    const whatsappNumber = '5548991832760' // Número oficial USS Brasil
    const message = encodeURIComponent('Olá, gostaria de falar sobre troca de produto.')
    window.location.href = `https://wa.me/${whatsappNumber}?text=${message}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e5e8eb] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#034a6e] to-[#54c4cf] px-6 py-8">
          <h1 className="text-3xl font-bold text-white text-center">
            Política de Troca - Ecommerce UssBrasil
          </h1>
          <p className="text-[#d1d5db] text-center mt-2">
            Garantindo sua satisfação com nossos produtos
          </p>
        </div>

        <div className="px-6 py-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-[#1a1a1a] mb-4">
              Como Funciona Nossa Política de Troca
            </h2>
            <div className="space-y-4 text-[#6b7280]">
              <p>
                Na UssBrasil, valorizamos a satisfação dos nossos clientes. Nossa política de troca foi criada para oferecer flexibilidade e conveniência, garantindo que você tenha a melhor experiência possível com nossos produtos.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Prazo:</strong> Você tem até 30 dias após o recebimento do produto para solicitar a troca.</li>
                <li><strong>Condições:</strong> O produto deve estar em perfeito estado, sem uso, com embalagem original e todos os acessórios.</li>
                <li><strong>Motivos:</strong> Aceitamos trocas por defeito de fabricação, insatisfação com o produto ou arrependimento.</li>
                <li><strong>Frete:</strong> O custo do frete para devolução é por conta do cliente, exceto em casos de defeito.</li>
                <li><strong>Processo:</strong> Após análise, enviaremos o produto de troca ou processaremos o reembolso em até 7 dias úteis.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1a1a1a] mb-4">
              Como Realizar uma Troca
            </h2>
            <div className="space-y-4 text-[#6b7280]">
              <p>
                Realizar uma troca é simples e rápido. Siga os passos abaixo para garantir um atendimento eficiente:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Entre em contato conosco via WhatsApp para iniciar o processo.</li>
                <li>Forneça informações sobre o pedido, produto e motivo da troca.</li>
                <li>Aguarde a confirmação e instruções para envio do produto.</li>
                <li>Envie o produto conforme orientado.</li>
                <li>Após análise, receberá o produto de troca ou reembolso.</li>
              </ol>
            </div>
          </section>

          <section className="text-center">
            <h2 className="text-2xl font-semibold text-[#1a1a1a] mb-4">
              Fale com Nosso Consultor
            </h2>
            <p className="text-[#6b7280] mb-6">
              Nossa equipe está pronta para ajudar você com qualquer dúvida sobre trocas. Clique no botão abaixo para iniciar uma conversa no WhatsApp.
            </p>
            <button
              onClick={handleWhatsAppRedirect}
              disabled={isRedirecting}
              className="inline-flex items-center px-8 py-4 bg-[#28a745] hover:bg-[#218838] text-white font-semibold rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRedirecting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Redirecionando...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  Conversar no WhatsApp
                </>
              )}
            </button>
          </section>

          <section className="bg-[#f5f7fa] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2">
              Dúvidas Frequentes
            </h3>
            <div className="space-y-3 text-sm text-[#6b7280]">
              <details className="group">
                <summary className="cursor-pointer font-medium">Posso trocar um produto usado?</summary>
                <p className="mt-2">Não, aceitamos apenas produtos em perfeito estado, sem uso e com embalagem original.</p>
              </details>
              <details className="group">
                <summary className="cursor-pointer font-medium">Quanto tempo leva o processo de troca?</summary>
                <p className="mt-2">Após o envio, analisamos em até 3 dias úteis e processamos a troca em até 7 dias.</p>
              </details>
              <details className="group">
                <summary className="cursor-pointer font-medium">E se o produto estiver com defeito?</summary>
                <p className="mt-2">Em caso de defeito, o frete de devolução é por nossa conta e garantimos a troca imediata.</p>
              </details>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
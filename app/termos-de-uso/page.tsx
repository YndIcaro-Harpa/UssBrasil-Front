'use client'

import { 
  FileText, 
  Shield, 
  Scale, 
  AlertCircle, 
  CheckCircle,
  Mail
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export default function TermosDeUsoPage() {
  const sections = [
    {
      title: '1. Aceitação dos Termos',
      content: `Ao acessar e utilizar o site USS Brasil (ussbrasil.com.br), você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nosso site.

A USS Brasil reserva-se o direito de alterar estes termos a qualquer momento, sendo de responsabilidade do usuário verificar periodicamente as atualizações.`
    },
    {
      title: '2. Uso do Site',
      content: `O site USS Brasil destina-se exclusivamente à venda de produtos tecnológicos para consumidores finais. Ao utilizar nosso site, você concorda em:

• Fornecer informações precisas e completas durante o cadastro
• Manter suas credenciais de acesso em sigilo
• Não utilizar o site para fins ilegais ou não autorizados
• Não tentar acessar áreas restritas do sistema
• Não reproduzir, duplicar ou revender qualquer parte do site`
    },
    {
      title: '3. Produtos e Preços',
      content: `Todos os produtos comercializados pela USS Brasil são originais e acompanham nota fiscal. Os preços apresentados no site:

• Estão sujeitos a alterações sem aviso prévio
• São válidos exclusivamente para compras online
• Podem diferir dos preços praticados em nossa loja física
• Incluem tributos aplicáveis conforme legislação vigente

Em caso de divergência de preços, prevalecerá o valor informado no momento da finalização da compra.`
    },
    {
      title: '4. Pagamentos',
      content: `Aceitamos as seguintes formas de pagamento:

• Cartões de crédito (Visa, Mastercard, Elo, American Express)
• PIX
• Boleto bancário
• Transferência bancária

O processamento do pagamento é realizado por gateways de pagamento seguros e certificados. A USS Brasil não armazena dados de cartões de crédito.`
    },
    {
      title: '5. Entregas',
      content: `As entregas são realizadas para todo o território nacional através dos Correios e transportadoras parceiras. 

• O prazo de entrega é calculado a partir da confirmação do pagamento
• O rastreamento do pedido estará disponível na área do cliente
• A USS Brasil não se responsabiliza por atrasos causados por fatores externos
• Em caso de ausência do destinatário, serão realizadas até 3 tentativas de entrega`
    },
    {
      title: '6. Trocas e Devoluções',
      content: `Conforme o Código de Defesa do Consumidor, você tem até 7 dias corridos após o recebimento para solicitar a troca ou devolução de produtos comprados em nossa loja virtual.

• O produto deve estar em sua embalagem original, sem sinais de uso
• Acompanhado de nota fiscal
• Devoluções por arrependimento: frete por conta do cliente
• Produtos com defeito: frete por conta da USS Brasil

Para mais informações, consulte nossa página de Trocas e Devoluções.`
    },
    {
      title: '7. Garantia',
      content: `Todos os produtos comercializados pela USS Brasil possuem garantia legal de 90 dias, além da garantia oferecida pelo fabricante.

• A garantia cobre apenas defeitos de fabricação
• Danos causados por mau uso, quedas ou líquidos não são cobertos
• Para acionar a garantia, entre em contato com nosso suporte

Consulte a página de Garantia para mais informações.`
    },
    {
      title: '8. Propriedade Intelectual',
      content: `Todo o conteúdo do site USS Brasil, incluindo textos, imagens, logos, ícones, fotografias, vídeos e softwares, são de propriedade da USS Brasil ou de terceiros licenciadores, protegidos pelas leis de propriedade intelectual.

É expressamente proibida a reprodução, distribuição ou modificação de qualquer conteúdo sem autorização prévia por escrito.`
    },
    {
      title: '9. Limitação de Responsabilidade',
      content: `A USS Brasil não se responsabiliza por:

• Danos decorrentes de falhas de sistema, incluindo vírus e ataques cibernéticos
• Interrupções temporárias do serviço para manutenção
• Informações incorretas fornecidas pelo usuário
• Uso indevido dos produtos adquiridos
• Ações de terceiros que violem estes termos`
    },
    {
      title: '10. Foro e Legislação Aplicável',
      content: `Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da Comarca de Criciúma, Estado de Santa Catarina, para dirimir quaisquer controvérsias decorrentes destes termos, com renúncia expressa a qualquer outro, por mais privilegiado que seja.`
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-400 via-blue-950 to-gray-900 text-white overflow-hidden pt-24 sm:pt-28 pb-16 sm:pb-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-3 sm:px-4 lg:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 text-xs sm:text-sm font-bold px-4 sm:px-6 py-2 mb-6 shadow-2xl shadow-cyan-500/50">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2 inline" />
              Legal
            </Badge>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 leading-tight">
              Termos de
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300">
                Uso
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-4 leading-relaxed max-w-3xl mx-auto px-4">
              Última atualização: Janeiro de 2025
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="border border-gray-200 shadow-xl bg-white mb-8">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Importante</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Ao utilizar nosso site, você declara ter lido, compreendido e aceito integralmente estes Termos de Uso. 
                      Recomendamos a leitura atenta de todas as condições estabelecidas.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {sections.map((section, index) => (
                <Card key={index} className="border border-gray-200 shadow-lg bg-white">
                  <CardContent className="p-6 sm:p-8">
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      {section.title}
                    </h2>
                    <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                      {section.content}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contact Section */}
            <Card className="border border-gray-200 shadow-xl bg-white mt-8">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Dúvidas?</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Em caso de dúvidas sobre estes Termos de Uso, entre em contato conosco através do e-mail{' '}
                      <a href="mailto:contato@ussbrasil.com.br" className="text-blue-400 hover:text-blue-500 font-semibold">
                        contato@ussbrasil.com.br
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

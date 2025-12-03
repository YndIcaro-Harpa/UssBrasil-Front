'use client'

import { 
  Shield, 
  Lock, 
  Eye, 
  UserCheck, 
  Database,
  Mail,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export default function PoliticaPrivacidadePage() {
  const sections = [
    {
      title: '1. Coleta de Dados',
      icon: Database,
      content: `A USS Brasil coleta informações pessoais de forma transparente e apenas quando necessário para a prestação de nossos serviços. Os dados coletados incluem:

**Dados de Cadastro:**
• Nome completo
• CPF
• Endereço de e-mail
• Telefone de contato
• Endereço de entrega

**Dados de Navegação:**
• Endereço IP
• Tipo de navegador
• Páginas visitadas
• Tempo de permanência
• Cookies e tecnologias similares`
    },
    {
      title: '2. Uso dos Dados',
      icon: UserCheck,
      content: `Os dados coletados são utilizados para:

• Processar e entregar pedidos
• Enviar confirmações e atualizações sobre compras
• Prestar suporte ao cliente
• Melhorar nossos produtos e serviços
• Personalizar a experiência de navegação
• Enviar comunicações de marketing (com consentimento)
• Prevenir fraudes e garantir a segurança

Não compartilhamos seus dados pessoais com terceiros para fins comerciais sem seu consentimento expresso.`
    },
    {
      title: '3. Proteção dos Dados',
      icon: Lock,
      content: `A USS Brasil implementa medidas técnicas e organizacionais para proteger seus dados pessoais:

**Segurança Técnica:**
• Criptografia SSL 256-bit em todo o site
• Servidores seguros com certificação
• Monitoramento contínuo de ameaças
• Backups regulares

**Segurança Organizacional:**
• Acesso restrito a dados pessoais
• Treinamento de colaboradores
• Políticas internas de segurança
• Auditorias periódicas`
    },
    {
      title: '4. Cookies e Tecnologias Similares',
      icon: Eye,
      content: `Utilizamos cookies e tecnologias similares para melhorar sua experiência:

**Cookies Essenciais:**
Necessários para o funcionamento do site, como login e carrinho de compras.

**Cookies de Desempenho:**
Coletam informações anônimas sobre como você usa o site.

**Cookies de Funcionalidade:**
Permitem personalizar sua experiência, como idioma e região.

**Cookies de Marketing:**
Utilizados para apresentar anúncios relevantes (requer consentimento).

Você pode gerenciar suas preferências de cookies nas configurações do navegador.`
    },
    {
      title: '5. Compartilhamento de Dados',
      icon: Shield,
      content: `Seus dados podem ser compartilhados com:

**Parceiros de Pagamento:**
Para processamento seguro de transações financeiras.

**Transportadoras:**
Para realização de entregas.

**Autoridades Legais:**
Quando exigido por lei ou ordem judicial.

**Prestadores de Serviço:**
Empresas que nos auxiliam na operação (hospedagem, e-mail, etc.), sob acordo de confidencialidade.

Nunca vendemos ou alugamos seus dados pessoais.`
    },
    {
      title: '6. Seus Direitos (LGPD)',
      icon: UserCheck,
      content: `De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:

• **Confirmação:** Saber se tratamos seus dados pessoais
• **Acesso:** Solicitar cópia dos dados que possuímos
• **Correção:** Atualizar dados incompletos ou incorretos
• **Anonimização:** Solicitar anonimização de dados desnecessários
• **Portabilidade:** Transferir dados para outro fornecedor
• **Eliminação:** Solicitar exclusão de dados tratados com consentimento
• **Revogação:** Revogar consentimento a qualquer momento
• **Oposição:** Opor-se a tratamento ilegal de dados

Para exercer seus direitos, entre em contato pelo e-mail: privacidade@ussbrasil.com.br`
    },
    {
      title: '7. Retenção de Dados',
      icon: Database,
      content: `Mantemos seus dados pessoais pelo tempo necessário para:

• Cumprir obrigações legais (ex: documentos fiscais por 5 anos)
• Resolver disputas e fazer valer nossos acordos
• Prestar os serviços solicitados

Após esse período, os dados são anonimizados ou excluídos de forma segura.`
    },
    {
      title: '8. Transferência Internacional',
      icon: Shield,
      content: `Alguns de nossos prestadores de serviço podem estar localizados fora do Brasil. Nesses casos, garantimos que:

• A transferência é feita para países com nível adequado de proteção
• Ou mediante cláusulas contratuais específicas
• Ou com seu consentimento expresso

Sempre adotamos medidas para proteger seus dados, independentemente de onde sejam processados.`
    },
    {
      title: '9. Menores de Idade',
      icon: UserCheck,
      content: `Nossos serviços não são direcionados a menores de 18 anos. Não coletamos intencionalmente dados de menores.

Caso identifiquemos dados de menores coletados sem consentimento dos responsáveis, eles serão excluídos imediatamente.

Se você é pai ou responsável e acredita que coletamos dados de seu filho, entre em contato conosco.`
    },
    {
      title: '10. Alterações nesta Política',
      icon: Eye,
      content: `Esta Política de Privacidade pode ser atualizada periodicamente para refletir alterações em nossas práticas ou na legislação.

• Alterações significativas serão comunicadas por e-mail
• A data de última atualização será sempre indicada
• Recomendamos revisar esta página regularmente

Ao continuar utilizando nossos serviços após as alterações, você concorda com a política atualizada.`
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
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-2 inline" />
              LGPD
            </Badge>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 leading-tight">
              Política de
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300">
                Privacidade
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
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Compromisso com sua Privacidade</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      A USS Brasil está comprometida com a proteção de seus dados pessoais. Esta política descreve como 
                      coletamos, utilizamos, armazenamos e protegemos suas informações, em conformidade com a Lei Geral 
                      de Proteção de Dados (LGPD - Lei nº 13.709/2018).
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
                      <div className="w-10 h-10 bg-blue-400 rounded-xl flex items-center justify-center flex-shrink-0">
                        <section.icon className="h-5 w-5 text-white" />
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
                    <h3 className="font-bold text-gray-900 mb-2">Encarregado de Dados (DPO)</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Para questões relacionadas à privacidade e proteção de dados, entre em contato com nosso 
                      Encarregado de Dados através do e-mail:{' '}
                      <a href="mailto:privacidade@ussbrasil.com.br" className="text-blue-400 hover:text-blue-500 font-semibold">
                        privacidade@ussbrasil.com.br
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

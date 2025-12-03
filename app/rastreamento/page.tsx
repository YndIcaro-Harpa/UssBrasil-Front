'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  Package, 
  Truck, 
  MapPin, 
  CheckCircle, 
  Clock, 
  Search,
  ArrowLeft,
  Calendar,
  ChevronRight,
  Home,
  Building,
  Box,
  XCircle,
  AlertCircle,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

// Tipos
interface TrackingEvent {
  id: string
  status: string
  description: string
  location: string
  date: string
  time: string
}

interface TrackingInfo {
  code: string
  carrier: string
  status: 'PENDING' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'RETURNED' | 'EXCEPTION'
  estimatedDelivery?: string
  origin: {
    city: string
    state: string
  }
  destination: {
    city: string
    state: string
  }
  events: TrackingEvent[]
  order?: {
    id: string
    total: number
    items: number
  }
}

// Configuração de status
const statusConfig = {
  PENDING: { 
    label: 'Aguardando Coleta', 
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
    icon: Clock,
    progress: 10
  },
  IN_TRANSIT: { 
    label: 'Em Trânsito', 
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    icon: Truck,
    progress: 50
  },
  OUT_FOR_DELIVERY: { 
    label: 'Saiu para Entrega', 
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200',
    icon: MapPin,
    progress: 85
  },
  DELIVERED: { 
    label: 'Entregue', 
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    icon: CheckCircle,
    progress: 100
  },
  RETURNED: { 
    label: 'Devolvido', 
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-200',
    icon: RefreshCw,
    progress: 0
  },
  EXCEPTION: { 
    label: 'Exceção', 
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    icon: AlertCircle,
    progress: 0
  },
}

// Dados simulados para demonstração
const mockTrackingData: Record<string, TrackingInfo> = {
  'BR123456789BR': {
    code: 'BR123456789BR',
    carrier: 'Correios - SEDEX',
    status: 'OUT_FOR_DELIVERY',
    estimatedDelivery: '2025-11-27',
    origin: { city: 'São Paulo', state: 'SP' },
    destination: { city: 'Rio de Janeiro', state: 'RJ' },
    order: { id: 'ORD-12345', total: 2499.90, items: 2 },
    events: [
      {
        id: '1',
        status: 'OUT_FOR_DELIVERY',
        description: 'Objeto saiu para entrega ao destinatário',
        location: 'CDD Rio de Janeiro - RJ',
        date: '26/11/2025',
        time: '08:32'
      },
      {
        id: '2',
        status: 'IN_TRANSIT',
        description: 'Objeto em transferência - por favor aguarde',
        location: 'CTE Rio de Janeiro - RJ',
        date: '25/11/2025',
        time: '22:15'
      },
      {
        id: '3',
        status: 'IN_TRANSIT',
        description: 'Objeto em trânsito - de Unidade de Tratamento',
        location: 'CTE São Paulo - SP',
        date: '25/11/2025',
        time: '03:45'
      },
      {
        id: '4',
        status: 'IN_TRANSIT',
        description: 'Objeto postado',
        location: 'AGF São Paulo - SP',
        date: '24/11/2025',
        time: '14:20'
      },
      {
        id: '5',
        status: 'PENDING',
        description: 'Objeto recebido pelos Correios do Brasil',
        location: 'São Paulo - SP',
        date: '24/11/2025',
        time: '10:00'
      },
    ]
  },
  'USS987654321': {
    code: 'USS987654321',
    carrier: 'USS Express',
    status: 'DELIVERED',
    estimatedDelivery: '2025-11-25',
    origin: { city: 'Curitiba', state: 'PR' },
    destination: { city: 'Florianópolis', state: 'SC' },
    order: { id: 'ORD-67890', total: 1299.00, items: 1 },
    events: [
      {
        id: '1',
        status: 'DELIVERED',
        description: 'Objeto entregue ao destinatário',
        location: 'Florianópolis - SC',
        date: '25/11/2025',
        time: '15:42'
      },
      {
        id: '2',
        status: 'OUT_FOR_DELIVERY',
        description: 'Objeto saiu para entrega',
        location: 'Centro de Distribuição Florianópolis',
        date: '25/11/2025',
        time: '07:30'
      },
      {
        id: '3',
        status: 'IN_TRANSIT',
        description: 'Objeto em trânsito para cidade de destino',
        location: 'Curitiba - PR',
        date: '24/11/2025',
        time: '18:00'
      },
      {
        id: '4',
        status: 'PENDING',
        description: 'Pedido coletado',
        location: 'Curitiba - PR',
        date: '24/11/2025',
        time: '11:30'
      },
    ]
  }
}

export default function RastreamentoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    }>
      <RastreamentoContent />
    </Suspense>
  )
}

function RastreamentoContent() {
  const searchParams = useSearchParams()
  const codeFromUrl = searchParams.get('code')
  
  const [trackingCode, setTrackingCode] = useState(codeFromUrl || '')
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  // Buscar automaticamente se vier código na URL
  useEffect(() => {
    if (codeFromUrl) {
      handleSearch()
    }
  }, [codeFromUrl])

  const handleSearch = async () => {
    if (!trackingCode.trim()) {
      toast.error('Digite um código de rastreio')
      return
    }

    setLoading(true)
    setSearched(true)

    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Verificar se existe nos dados mock
    const upperCode = trackingCode.toUpperCase().trim()
    const data = mockTrackingData[upperCode]

    if (data) {
      setTrackingInfo(data)
      toast.success('Rastreamento encontrado!')
    } else {
      setTrackingInfo(null)
      toast.error('Código de rastreio não encontrado')
    }

    setLoading(false)
  }

  const getEventIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED': return CheckCircle
      case 'OUT_FOR_DELIVERY': return MapPin
      case 'IN_TRANSIT': return Truck
      case 'PENDING': return Box
      default: return Package
    }
  }

  const formatDate = (dateString: string) => {
    const [day, month, year] = dateString.split('/')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar ao início
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Truck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Rastrear Pedido</h1>
              <p className="text-gray-500">Acompanhe a entrega do seu pedido em tempo real</p>
            </div>
          </div>
        </div>

        {/* Busca */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Digite o código de rastreio..."
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-12 h-12 text-lg font-mono"
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 h-12 px-8"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Rastrear
                </>
              )}
            </Button>
          </div>

          <p className="text-sm text-gray-500 mt-3">
            💡 Códigos de exemplo para teste: <code className="bg-gray-100 px-2 py-0.5 rounded">BR123456789BR</code> ou <code className="bg-gray-100 px-2 py-0.5 rounded">USS987654321</code>
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <RefreshCw className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Buscando rastreamento...</h3>
            <p className="text-gray-500">Consultando informações do seu pedido</p>
          </div>
        )}

        {/* Resultado não encontrado */}
        {searched && !loading && !trackingInfo && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Código não encontrado</h3>
            <p className="text-gray-500 mb-6">
              Verifique se o código foi digitado corretamente ou tente novamente mais tarde.
            </p>
            <Link href="/meus-pedidos">
              <Button variant="outline">
                Ver meus pedidos
              </Button>
            </Link>
          </div>
        )}

        {/* Resultado do Rastreamento */}
        {trackingInfo && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Card Principal de Status */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header com Status */}
              <div className={`p-6 ${statusConfig[trackingInfo.status].bgColor}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center ${statusConfig[trackingInfo.status].color}`}>
                      {(() => {
                        const Icon = statusConfig[trackingInfo.status].icon
                        return <Icon className="w-6 h-6" />
                      })()}
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${statusConfig[trackingInfo.status].color}`}>
                        {statusConfig[trackingInfo.status].label}
                      </h2>
                      <p className="text-gray-600 text-sm">{trackingInfo.carrier}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Código</p>
                    <p className="font-mono font-bold text-gray-900">{trackingInfo.code}</p>
                  </div>
                </div>

                {/* Barra de Progresso */}
                <div className="mt-6">
                  <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span>Coletado</span>
                    <span>Em trânsito</span>
                    <span>Saiu para entrega</span>
                    <span>Entregue</span>
                  </div>
                  <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${statusConfig[trackingInfo.status].progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full ${statusConfig[trackingInfo.status].color.replace('text-', 'bg-')}`}
                    />
                  </div>
                </div>
              </div>

              {/* Informações de Rota */}
              <div className="p-6 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Origem */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Origem</p>
                      <p className="font-semibold text-gray-900">
                        {trackingInfo.origin.city} - {trackingInfo.origin.state}
                      </p>
                    </div>
                  </div>

                  {/* Destino */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Home className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Destino</p>
                      <p className="font-semibold text-gray-900">
                        {trackingInfo.destination.city} - {trackingInfo.destination.state}
                      </p>
                    </div>
                  </div>

                  {/* Previsão */}
                  {trackingInfo.estimatedDelivery && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Previsão de Entrega</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(trackingInfo.estimatedDelivery).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline de Eventos */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Histórico de Movimentação
              </h3>

              <div className="space-y-0">
                {trackingInfo.events.map((event, index) => {
                  const EventIcon = getEventIcon(event.status)
                  const isFirst = index === 0
                  const isLast = index === trackingInfo.events.length - 1

                  return (
                    <div key={event.id} className="relative flex gap-4">
                      {/* Linha vertical */}
                      {!isLast && (
                        <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-gray-200" />
                      )}

                      {/* Ícone */}
                      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                        isFirst ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <EventIcon className="w-5 h-5" />
                      </div>

                      {/* Conteúdo */}
                      <div className={`flex-1 pb-6 ${isFirst ? '' : 'opacity-75'}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className={`font-medium ${isFirst ? 'text-gray-900' : 'text-gray-700'}`}>
                              {event.description}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap">
                            <p className="text-gray-900 font-medium">{event.date}</p>
                            <p className="text-gray-500">{event.time}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Link para Pedido */}
            {trackingInfo.order && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pedido #{trackingInfo.order.id}</p>
                      <p className="font-semibold text-gray-900">
                        {trackingInfo.order.items} {trackingInfo.order.items === 1 ? 'item' : 'itens'} • R$ {trackingInfo.order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <Link href={`/meus-pedidos`}>
                    <Button variant="outline" size="sm">
                      Ver Pedido
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Dicas */}
        {!searched && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">💡 Dicas de Rastreamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p>O código de rastreio é enviado por email após o envio do pedido</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p>Atualizações podem levar algumas horas para aparecer</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p>Você também pode acompanhar pelo site dos Correios</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p>Em caso de dúvidas, entre em contato com nosso suporte</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

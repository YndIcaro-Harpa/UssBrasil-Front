'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  MapPin,
  CreditCard,
  Calendar,
  Phone,
  Mail,
  User,
  RotateCcw,
  Download,
  Eye,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/services/api'
import { toast } from 'sonner'

interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  selectedColor?: string | null
  selectedSize?: string | null
  selectedStorage?: string | null
  product: {
    name: string
    image: string
  }
}

interface Order {
  id: string
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  paymentMethod: string
  subtotal: number
  shipping: number
  discount: number
  total: number
  shippingAddress: {
    name: string
    cep: string
    rua: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
  }
  items: OrderItem[]
  trackingCode?: string | null
  estimatedDelivery?: string
  createdAt: string
  updatedAt: string
  installments?: number
  cardLastFour?: string
  cardBrand?: string
}

const statusConfig: Record<string, { label: string; color: string; icon: any; description: string }> = {
  PENDING: {
    label: 'Pendente',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    description: 'Aguardando confirmação do pagamento'
  },
  PROCESSING: {
    label: 'Processando',
    color: 'bg-blue-100 text-blue-800',
    icon: Package,
    description: 'Pedido confirmado, preparando para envio'
  },
  SHIPPED: {
    label: 'Enviado',
    color: 'bg-purple-100 text-purple-800',
    icon: Truck,
    description: 'Pedido enviado para entrega'
  },
  DELIVERED: {
    label: 'Entregue',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'Pedido entregue com sucesso'
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    description: 'Pedido foi cancelado'
  },
}

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Aguardando', color: 'text-yellow-600' },
  PAID: { label: 'Pago', color: 'text-green-600' },
  FAILED: { label: 'Falhou', color: 'text-red-600' },
  REFUNDED: { label: 'Reembolsado', color: 'text-gray-600' },
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const orderId = params.id as string

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setError('ID do pedido não encontrado')
        setLoading(false)
        return
      }

      try {
        // Primeiro tentar buscar da API
        let orderData: Order | null = null

        try {
          const apiOrder = await api.orders.getById(orderId)
          orderData = apiOrder
        } catch (apiError) {
          console.log('Pedido não encontrado na API, buscando localmente')
        }

        // Se não encontrou na API, buscar no localStorage
        if (!orderData) {
          const localOrders = JSON.parse(localStorage.getItem('uss_orders') || '[]')
          orderData = localOrders.find((o: Order) => o.id === orderId) || null
        }

        if (!orderData) {
          setError('Pedido não encontrado')
          return
        }

        // Verificar se o pedido pertence ao usuário logado
        if (isAuthenticated && user && orderData.userId !== user.id && orderData.userId !== 'guest') {
          setError('Você não tem permissão para visualizar este pedido')
          return
        }

        setOrder(orderData)
      } catch (error) {
        console.error('Erro ao carregar pedido:', error)
        setError('Erro ao carregar pedido')
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [orderId, user, isAuthenticated])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleCancelOrder = async () => {
    if (!order) return

    if (!confirm('Tem certeza que deseja cancelar este pedido?')) {
      return
    }

    try {
      // Tentar cancelar na API
      try {
        await api.orders.updateStatus(order.id, 'CANCELLED')
      } catch (apiError) {
        console.log('API não disponível, cancelando localmente')
      }

      // Atualizar localmente
      const localOrders = JSON.parse(localStorage.getItem('uss_orders') || '[]')
      const updatedOrders = localOrders.map((o: Order) =>
        o.id === order.id ? { ...o, status: 'CANCELLED' as const, updatedAt: new Date().toISOString() } : o
      )
      localStorage.setItem('uss_orders', JSON.stringify(updatedOrders))

      setOrder({ ...order, status: 'CANCELLED', updatedAt: new Date().toISOString() })
      toast.success('Pedido cancelado com sucesso')
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error)
      toast.error('Erro ao cancelar pedido')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando pedido...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pedido não encontrado</h1>
          <p className="text-gray-600 mb-6">{error || 'O pedido solicitado não existe ou foi removido.'}</p>
          <Link href="/meus-pedidos">
            <Button className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Meus Pedidos
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const StatusIcon = statusConfig[order.status].icon

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/meus-pedidos">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pedido #{order.id}</h1>
                <p className="text-gray-600">Realizado em {formatDate(order.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusConfig[order.status].color}`}>
                <StatusIcon className="h-4 w-4" />
                {statusConfig[order.status].label}
              </div>
              {order.status === 'PENDING' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelOrder}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Cancelar Pedido
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Status do Pedido</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusConfig[order.status].color.split(' ')[0]}`}>
                    <StatusIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{statusConfig[order.status].label}</p>
                    <p className="text-sm text-gray-600">{statusConfig[order.status].description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{formatDate(order.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Itens do Pedido</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4 border-b border-gray-100 last:border-b-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.product.image || '/placeholder.svg'}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 line-clamp-2">{item.product.name}</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.selectedColor && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            {item.selectedColor}
                          </span>
                        )}
                        {item.selectedSize && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            {item.selectedSize}
                          </span>
                        )}
                        {item.selectedStorage && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                            {item.selectedStorage}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-600">Quantidade: {item.quantity}</span>
                        <span className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Tracking */}
            {order.trackingCode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Rastreamento</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Código de Rastreamento</p>
                    <p className="text-sm text-gray-600">{order.trackingCode}</p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Eye className="h-4 w-4" />
                    Rastrear Pedido
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Pedido</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frete</span>
                  <span className="font-medium">{formatPrice(order.shipping)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Desconto</span>
                    <span className="font-medium text-green-600">-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-gray-900">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Payment Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pagamento</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{order.paymentMethod}</p>
                    <p className={`text-sm ${paymentStatusConfig[order.paymentStatus].color}`}>
                      {paymentStatusConfig[order.paymentStatus].label}
                    </p>
                  </div>
                </div>
                {order.installments && order.installments > 1 && (
                  <div className="text-sm text-gray-600">
                    {order.installments}x de {formatPrice(order.total / order.installments)}
                  </div>
                )}
                {order.cardLastFour && (
                  <div className="text-sm text-gray-600">
                    Cartão terminando em {order.cardLastFour}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Endereço de Entrega</h2>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
                    <p className="text-gray-600">
                      {order.shippingAddress.rua}, {order.shippingAddress.numero}
                      {order.shippingAddress.complemento && ` - ${order.shippingAddress.complemento}`}
                    </p>
                    <p className="text-gray-600">
                      {order.shippingAddress.bairro} - {order.shippingAddress.cidade}/{order.shippingAddress.estado}
                    </p>
                    <p className="text-gray-600">CEP: {order.shippingAddress.cep}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Estimated Delivery */}
            {order.estimatedDelivery && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Previsão de Entrega</h2>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <p className="text-gray-600">
                    {new Date(order.estimatedDelivery).toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
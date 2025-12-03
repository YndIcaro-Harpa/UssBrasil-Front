'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Package, 
  Calendar, 
  User, 
  DollarSign,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShoppingBag
} from 'lucide-react'
import Link from 'next/link'
import { api } from '@/services/api'

interface Order {
  id: string
  status: string
  paymentStatus: string
  total: number
  createdAt: string
  user?: {
    name: string
    email: string
  }
  items?: Array<{
    quantity: number
    price: number
  }>
}

interface ProductOrdersModalProps {
  isOpen: boolean
  onClose: () => void
  productId: string
  productName: string
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendente' },
  PROCESSING: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Processando' },
  SHIPPED: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Enviado' },
  DELIVERED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Entregue' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelado' }
}

const paymentStatusColors: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  PENDING: { icon: Clock, color: 'text-amber-500', label: 'Aguardando' },
  PAID: { icon: CheckCircle, color: 'text-green-500', label: 'Pago' },
  FAILED: { icon: AlertCircle, color: 'text-red-500', label: 'Falhou' },
  REFUNDED: { icon: DollarSign, color: 'text-gray-500', label: 'Reembolsado' }
}

export function ProductOrdersModal({ isOpen, onClose, productId, productName }: ProductOrdersModalProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalQuantity: 0,
    totalRevenue: 0
  })

  useEffect(() => {
    if (isOpen && productId) {
      fetchOrders()
    }
  }, [isOpen, productId])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      // Buscar todos os pedidos
      const response = await api.orders.getAll({ limit: 100 })
      const allOrders = response.data || response || []
      
      // Filtrar pedidos que contêm o produto
      const productOrders: Order[] = []
      let totalQty = 0
      let revenue = 0

      for (const order of allOrders) {
        const orderItems = order.items || order.orderItems || []
        const productItem = orderItems.find((item: any) => item.productId === productId)
        
        if (productItem) {
          productOrders.push({
            ...order,
            items: [productItem]
          })
          totalQty += productItem.quantity
          revenue += productItem.price * productItem.quantity
        }
      }

      setOrders(productOrders)
      setStats({
        totalOrders: productOrders.length,
        totalQuantity: totalQty,
        totalRevenue: revenue
      })
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Histórico de Pedidos</h3>
                    <p className="text-sm text-gray-500">{productName}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Stats */}
            {!loading && orders.length > 0 && (
              <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 border-b border-gray-200 flex-shrink-0">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                  <p className="text-sm text-gray-500">Pedidos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-indigo-600">{stats.totalQuantity}</p>
                  <p className="text-sm text-gray-500">Unidades Vendidas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
                  <p className="text-sm text-gray-500">Receita Total</p>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Nenhum pedido encontrado</h4>
                  <p className="text-gray-500">Este produto ainda não foi vendido em nenhum pedido.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const status = statusColors[order.status] || statusColors.PENDING
                    const paymentStatus = paymentStatusColors[order.paymentStatus] || paymentStatusColors.PENDING
                    const PaymentIcon = paymentStatus.icon
                    const item = order.items?.[0]

                    return (
                      <div
                        key={order.id}
                        className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-mono text-sm text-gray-500">
                                #{order.id.substring(0, 8)}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                                {status.label}
                              </span>
                              <div className={`flex items-center gap-1 ${paymentStatus.color}`}>
                                <PaymentIcon className="h-4 w-4" />
                                <span className="text-xs">{paymentStatus.label}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                {formatDate(order.createdAt)}
                              </div>
                              {order.user && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <User className="h-4 w-4 text-gray-400" />
                                  {order.user.name || order.user.email}
                                </div>
                              )}
                            </div>

                            {item && (
                              <div className="mt-3 flex items-center gap-4 text-sm bg-gray-50 rounded-lg p-2">
                                <span className="text-gray-600">
                                  Qtd: <span className="font-semibold text-gray-900">{item.quantity}</span>
                                </span>
                                <span className="text-gray-600">
                                  Preço unit.: <span className="font-semibold text-gray-900">{formatCurrency(item.price)}</span>
                                </span>
                                <span className="text-gray-600">
                                  Subtotal: <span className="font-semibold text-green-600">{formatCurrency(item.price * item.quantity)}</span>
                                </span>
                              </div>
                            )}
                          </div>

                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Ver pedido completo"
                          >
                            <ExternalLink className="h-5 w-5" />
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

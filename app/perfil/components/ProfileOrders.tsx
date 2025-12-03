'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle,
  ChevronRight,
  Eye,
  RefreshCw,
  Loader2,
  ShoppingBag,
  Search,
  Calendar,
  Filter,
  X,
  Bell
} from 'lucide-react'
import { api, Order } from '@/services/api'
import { Button } from '@/components/ui/button'

interface ProfileOrdersProps {
  userId: string
  initialOrders: Order[]
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  PROCESSING: { label: 'Processando', color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
  SHIPPED: { label: 'Enviado', color: 'bg-purple-100 text-purple-800', icon: Truck },
  DELIVERED: { label: 'Entregue', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle },
}

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Aguardando', color: 'text-yellow-600' },
  PAID: { label: 'Pago', color: 'text-green-600' },
  FAILED: { label: 'Falhou', color: 'text-red-600' },
  REFUNDED: { label: 'Reembolsado', color: 'text-gray-600' },
}

export default function ProfileOrders({ userId, initialOrders }: ProfileOrdersProps) {
  const [allOrders, setAllOrders] = useState<Order[]>(initialOrders)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [notifications, setNotifications] = useState<any[]>([])
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Carregar todos os pedidos (API + localStorage)
  useEffect(() => {
    const loadAllOrders = async () => {
      try {
        // Primeiro buscar do localStorage (pedidos feitos localmente)
        const localOrders = JSON.parse(localStorage.getItem('uss_orders') || '[]')
        
        // Tentar buscar da API também
        let apiOrders: Order[] = []
        try {
          const response = await api.orders.getByUser(userId, { limit: 100 })
          apiOrders = response.data || []
        } catch (error) {
          console.log('API não disponível, usando apenas pedidos locais')
        }
        
        // Combinar pedidos locais e da API (evitando duplicatas pelo ID)
        const allOrderIds = new Set(apiOrders.map(o => o.id))
        const combinedOrders = [
          ...apiOrders,
          ...localOrders.filter((o: Order) => !allOrderIds.has(o.id))
        ]
        
        // Ordenar por data de criação (mais recentes primeiro)
        combinedOrders.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        
        setAllOrders(combinedOrders)
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error)
        // Fallback para localStorage apenas
        const localOrders = JSON.parse(localStorage.getItem('uss_orders') || '[]')
        setAllOrders(localOrders)
      }
    }
    
    loadAllOrders()
  }, [userId])

  // Carregar notificações
  useEffect(() => {
    const storedNotifications = localStorage.getItem('uss_order_notifications')
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications))
    }
  }, [])

  // Aplicar filtros
  const filteredOrders = useMemo(() => {
    let filtered = [...allOrders]
    
    // Filtro por nome do produto
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.items?.some(item => 
          item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        ) || order.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Filtro por status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus)
    }
    
    // Filtro por data inicial
    if (dateFrom) {
      filtered = filtered.filter(order => 
        new Date(order.createdAt) >= new Date(dateFrom)
      )
    }
    
    // Filtro por data final
    if (dateTo) {
      filtered = filtered.filter(order => 
        new Date(order.createdAt) <= new Date(dateTo + 'T23:59:59')
      )
    }
    
    return filtered
  }, [allOrders, searchTerm, selectedStatus, dateFrom, dateTo])

  const loadMoreOrders = async () => {
    setLoading(true)
    try {
      const response = await api.orders.getByUser(userId, { page: page + 1, limit: 10 })
      if (response.data.length > 0) {
        setAllOrders([...allOrders, ...response.data])
        setPage(page + 1)
      }
      setHasMore(response.data.length === 10)
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setDateFrom('')
    setDateTo('')
    setSelectedStatus('all')
  }

  const hasActiveFilters = searchTerm || dateFrom || dateTo || selectedStatus !== 'all'

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
      year: 'numeric'
    })
  }

  // Marcar notificação como lida
  const markNotificationAsRead = (orderId: string) => {
    const updated = notifications.filter(n => n.orderId !== orderId)
    setNotifications(updated)
    localStorage.setItem('uss_order_notifications', JSON.stringify(updated))
  }

  // Verificar se pedido tem notificação não lida
  const hasUnreadNotification = (orderId: string) => {
    return notifications.some(n => n.orderId === orderId && !n.read)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Meus Pedidos</h2>
          <p className="text-sm text-gray-500 mt-1">
            {filteredOrders.length} pedido(s) encontrado(s)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              showFilters || hasActiveFilters
                ? 'bg-blue-400 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                {[searchTerm, dateFrom, dateTo, selectedStatus !== 'all'].filter(Boolean).length}
              </span>
            )}
          </button>
          <Link href="/meus-pedidos">
            <Button variant="outline" className="gap-2">
              Ver Todos
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              {/* Busca por produto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar por produto ou ID do pedido
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nome do produto ou #ID..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filtros por data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Data inicial
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Data final
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filtro por status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status do pedido
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedStatus('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedStatus === 'all'
                        ? 'bg-blue-400 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border'
                    }`}
                  >
                    Todos
                  </button>
                  {Object.entries(statusConfig).map(([status, config]) => {
                    const Icon = config.icon
                    return (
                      <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                          selectedStatus === status
                            ? config.color
                            : 'bg-white text-gray-600 hover:bg-gray-100 border'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {config.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Limpar filtros */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                  Limpar filtros
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notificações de pedidos */}
      {notifications.length > 0 && (
        <div className="mb-6 space-y-2">
          {notifications.slice(0, 3).map((notification, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3"
            >
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-blue-900">{notification.title}</p>
                  <p className="text-xs text-blue-700">{notification.message}</p>
                </div>
              </div>
              <button
                onClick={() => markNotificationAsRead(notification.orderId)}
                className="text-blue-500 hover:text-blue-700"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum pedido encontrado
          </h3>
          <p className="text-gray-500 mb-6">
            {hasActiveFilters 
              ? 'Tente ajustar os filtros de busca'
              : 'Você ainda não realizou nenhuma compra'
            }
          </p>
          {hasActiveFilters ? (
            <Button onClick={clearFilters} variant="outline">
              Limpar Filtros
            </Button>
          ) : (
            <Link href="/produtos">
              <Button>
                Começar a Comprar
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.PENDING
            const StatusIcon = status.icon
            const paymentStatus = paymentStatusConfig[order.paymentStatus] || paymentStatusConfig.PENDING
            const hasNotification = hasUnreadNotification(order.id)

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border rounded-xl p-4 hover:shadow-md transition-shadow ${
                  hasNotification ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200'
                }`}
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${status.color}`}>
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">
                          Pedido #{order.id.slice(-8).toUpperCase()}
                        </p>
                        {hasNotification && (
                          <span className="flex h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                    <span className={`text-sm font-medium ${paymentStatus.color}`}>
                      {paymentStatus.label}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex -space-x-2">
                    {order.items?.slice(0, 3).map((item, index) => (
                      <div
                        key={item.id || index}
                        className="w-12 h-12 rounded-lg bg-gray-100 border-2 border-white overflow-hidden"
                      >
                        {item.product?.images ? (
                          <Image
                            src={item.product.images.split(',')[0]}
                            alt={item.product.name || 'Produto'}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-full h-full p-2 text-gray-400" />
                        )}
                      </div>
                    ))}
                    {(order.items?.length || 0) > 3 && (
                      <div className="w-12 h-12 rounded-lg bg-gray-200 border-2 border-white flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-600">
                          +{(order.items?.length || 0) - 3}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      {order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'item' : 'itens'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {order.items?.map(i => i.product?.name).filter(Boolean).slice(0, 2).join(', ')}
                      {(order.items?.length || 0) > 2 && '...'}
                    </p>
                    {order.trackingCode && (
                      <p className="text-xs text-blue-500 mt-1">
                        Rastreio: {order.trackingCode}
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                  <Link href={`/meus-pedidos/${order.id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="h-4 w-4" />
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )
          })}

          {/* Load More */}
          {hasMore && filteredOrders.length >= 10 && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={loadMoreOrders}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Carregar Mais
              </Button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

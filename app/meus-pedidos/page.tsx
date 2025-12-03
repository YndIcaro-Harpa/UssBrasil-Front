'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Package, 
  ChevronRight, 
  ChevronDown,
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle,
  Search,
  Filter,
  Calendar,
  CreditCard,
  MapPin,
  Eye,
  RotateCcw,
  Download,
  ArrowLeft,
  ShoppingBag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// Tipos
interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    images: string[]
    slug: string
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
  trackingCode?: string
  estimatedDelivery?: string
  shippingAddress: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
  orderItems: OrderItem[]
  createdAt: string
  updatedAt: string
  deliveredAt?: string
}

interface OrdersResponse {
  orders: Order[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Status config
const statusConfig = {
  PENDING: { 
    label: 'Pendente', 
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Clock,
    description: 'Aguardando confirmação'
  },
  PROCESSING: { 
    label: 'Processando', 
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Package,
    description: 'Preparando seu pedido'
  },
  SHIPPED: { 
    label: 'Enviado', 
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: Truck,
    description: 'A caminho'
  },
  DELIVERED: { 
    label: 'Entregue', 
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle,
    description: 'Pedido entregue'
  },
  CANCELLED: { 
    label: 'Cancelado', 
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
    description: 'Pedido cancelado'
  },
}

const paymentStatusConfig = {
  PENDING: { label: 'Aguardando pagamento', color: 'text-yellow-600' },
  PAID: { label: 'Pago', color: 'text-green-600' },
  FAILED: { label: 'Falhou', color: 'text-red-600' },
  REFUNDED: { label: 'Reembolsado', color: 'text-blue-600' },
}

export default function MeusPedidosPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Verificar autenticação
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Faça login para ver seus pedidos')
      router.push('/')
    }
  }, [isAuthenticated, router])

  // Carregar pedidos
  useEffect(() => {
    if (!user?.id) return

    const fetchOrders = async () => {
      setLoading(true)
      try {
        const statusParam = filter !== 'all' ? `&status=${filter}` : ''
        const response = await fetch(
          `http://localhost:3001/orders/user/${user.id}?page=${currentPage}&limit=10${statusParam}`
        )
        
        if (!response.ok) throw new Error('Erro ao carregar pedidos')
        
        const data: OrdersResponse = await response.json()
        setOrders(data.orders)
        setTotalPages(data.pagination.pages)
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error)
        toast.error('Erro ao carregar pedidos')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user?.id, filter, currentPage])

  // Filtrar por busca
  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      order.id.toLowerCase().includes(searchLower) ||
      order.orderItems.some(item => 
        item.product.name.toLowerCase().includes(searchLower)
      ) ||
      order.trackingCode?.toLowerCase().includes(searchLower)
    )
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meus Pedidos</h1>
              <p className="text-gray-500">Acompanhe o status das suas compras</p>
            </div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por número do pedido, produto ou código de rastreio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro de Status */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'bg-blue-400 hover:bg-blue-500' : ''}
              >
                Todos
              </Button>
              <Button
                variant={filter === 'PENDING' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('PENDING')}
                className={filter === 'PENDING' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
              >
                Pendentes
              </Button>
              <Button
                variant={filter === 'PROCESSING' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('PROCESSING')}
                className={filter === 'PROCESSING' ? 'bg-blue-400 hover:bg-blue-500' : ''}
              >
                Processando
              </Button>
              <Button
                variant={filter === 'SHIPPED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('SHIPPED')}
                className={filter === 'SHIPPED' ? 'bg-purple-500 hover:bg-purple-600' : ''}
              >
                Enviados
              </Button>
              <Button
                variant={filter === 'DELIVERED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('DELIVERED')}
                className={filter === 'DELIVERED' ? 'bg-green-500 hover:bg-green-600' : ''}
              >
                Entregues
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de Pedidos */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <div className="h-5 w-40 bg-gray-200 rounded"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                </div>
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Tente buscar por outro termo'
                : 'Você ainda não fez nenhum pedido'}
            </p>
            <Link href="/produtos">
              <Button className="bg-blue-400 hover:bg-blue-500">
                Explorar Produtos
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredOrders.map((order, index) => {
                const status = statusConfig[order.status]
                const StatusIcon = status.icon
                const isExpanded = expandedOrder === order.id
                const paymentStatus = paymentStatusConfig[order.paymentStatus]

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    {/* Header do Pedido */}
                    <div 
                      className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleOrderExpansion(order.id)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-gray-900">
                              Pedido #{order.id.slice(-8).toUpperCase()}
                            </h3>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${status.color}`}>
                              <StatusIcon className="w-4 h-4" />
                              {status.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(order.createdAt)}
                            </span>
                            <span className={`flex items-center gap-1 ${paymentStatus.color}`}>
                              <CreditCard className="w-4 h-4" />
                              {paymentStatus.label}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Total</p>
                            <p className="text-xl font-bold text-gray-900">{formatPrice(order.total)}</p>
                          </div>
                          <ChevronDown 
                            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                          />
                        </div>
                      </div>

                      {/* Preview dos Produtos */}
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-3">
                          {order.orderItems.slice(0, 4).map((item, i) => (
                            <div 
                              key={item.id}
                              className="w-12 h-12 rounded-lg bg-gray-100 border-2 border-white overflow-hidden"
                              style={{ zIndex: 4 - i }}
                            >
                              <Image
                                src={item.product.images?.[0] || '/fallback-product.png'}
                                alt={item.product.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          ))}
                          {order.orderItems.length > 4 && (
                            <div className="w-12 h-12 rounded-lg bg-gray-200 border-2 border-white flex items-center justify-center text-sm font-medium text-gray-600">
                              +{order.orderItems.length - 4}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'itens'}
                        </p>
                      </div>
                    </div>

                    {/* Detalhes Expandidos */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-100"
                        >
                          <div className="p-6 space-y-6">
                            {/* Lista de Produtos */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">Produtos</h4>
                              <div className="space-y-3">
                                {order.orderItems.map((item) => (
                                  <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                                    <div className="w-16 h-16 bg-white rounded-lg overflow-hidden">
                                      <Image
                                        src={item.product.images?.[0] || '/fallback-product.png'}
                                        alt={item.product.name}
                                        width={64}
                                        height={64}
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <Link 
                                        href={`/produto/${item.product.slug}`}
                                        className="font-medium text-gray-900 hover:text-blue-500 transition-colors"
                                      >
                                        {item.product.name}
                                      </Link>
                                      <p className="text-sm text-gray-500">
                                        Qtd: {item.quantity} × {formatPrice(item.price)}
                                      </p>
                                    </div>
                                    <p className="font-semibold text-gray-900">
                                      {formatPrice(item.price * item.quantity)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Resumo de Valores */}
                            <div className="bg-gray-50 rounded-xl p-4">
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Subtotal</span>
                                  <span>{formatPrice(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Frete</span>
                                  <span>{order.shipping === 0 ? 'Grátis' : formatPrice(order.shipping)}</span>
                                </div>
                                {order.discount > 0 && (
                                  <div className="flex justify-between text-green-600">
                                    <span>Desconto</span>
                                    <span>-{formatPrice(order.discount)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                                  <span>Total</span>
                                  <span>{formatPrice(order.total)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Endereço de Entrega */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Endereço de Entrega
                              </h4>
                              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                                <p>{order.shippingAddress.street}, {order.shippingAddress.number}</p>
                                {order.shippingAddress.complement && (
                                  <p>{order.shippingAddress.complement}</p>
                                )}
                                <p>{order.shippingAddress.neighborhood}</p>
                                <p>{order.shippingAddress.city} - {order.shippingAddress.state}</p>
                                <p>CEP: {order.shippingAddress.zipCode}</p>
                              </div>
                            </div>

                            {/* Código de Rastreio */}
                            {order.trackingCode && (
                              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                                <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                                  <Truck className="w-4 h-4" />
                                  Rastreamento
                                </h4>
                                <p className="text-sm text-purple-700 mb-3">
                                  Código: <span className="font-mono font-bold">{order.trackingCode}</span>
                                </p>
                                <Link href={`/rastreamento?code=${order.trackingCode}`}>
                                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                                    <Eye className="w-4 h-4 mr-2" />
                                    Rastrear Pedido
                                  </Button>
                                </Link>
                              </div>
                            )}

                            {/* Ações */}
                            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                              <Link href={`/pedido/${order.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver Detalhes
                                </Button>
                              </Link>
                              
                              {order.status === 'DELIVERED' && (
                                <Button variant="outline" size="sm">
                                  <RotateCcw className="w-4 h-4 mr-2" />
                                  Comprar Novamente
                                </Button>
                              )}
                              
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Nota Fiscal
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={page === currentPage ? 'bg-blue-500' : ''}
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

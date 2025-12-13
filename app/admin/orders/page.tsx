'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { 
  Package, 
  Eye, 
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Calendar,
  CreditCard,
  Loader2,
  RefreshCw,
  X,
  FileSpreadsheet,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
  Copy,
  ExternalLink,
  Search,
  Filter,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  PackageCheck,
  Undo2
} from 'lucide-react'
import PageHeader from '@/components/admin/PageHeader'
import StatCard from '@/components/admin/StatCard'
import PremiumButton from '@/components/ui/PremiumButton'
import { OrderTableRowSkeleton, StatsCardSkeleton } from '@/components/ui/SkeletonLoaders'
import { FadeInUp, AnimatedCard, StaggeredContainer } from '@/components/admin/PageTransition'
import { OrderModal } from '@/components/admin/OrderModal'
import { OrderDetailsModal } from '@/components/admin/OrderDetailsModal'
import { api, Order } from '@/services/api'
import { toast } from 'sonner'
import { exportOrders } from '@/services/export'

type SortKey = 'id' | 'total' | 'createdAt' | 'status'
type SortDirection = 'asc' | 'desc'
type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

export default function AdminOrdersPage() {
  const { token, isLoading: authLoading } = useAdminAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [totalOrders, setTotalOrders] = useState(0)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    ordersByStatus: {} as Record<string, number>
  })
  
  const [searchTerm, setSearchTerm] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [refundReason, setRefundReason] = useState('')
  const [sendingNotification, setSendingNotification] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  const handleSaveOrder = async (orderData: any) => {
    try {
      if (modalMode === 'create') {
        // Preparar dados para criação do pedido
        const orderPayload = {
          userId: orderData.customer?.id,
          items: orderData.items?.map((item: any) => ({
            productId: item.productId || item.id,
            quantity: item.quantity,
            price: item.price,
            selectedColor: item.selectedColor,
            selectedStorage: item.selectedStorage
          })) || [],
          shippingAddress: orderData.shippingAddress || {},
          paymentMethod: orderData.paymentMethod || 'PIX',
          subtotal: orderData.total || 0,
          shipping: orderData.shipping || 0,
          discount: orderData.discount || 0,
          notes: orderData.notes,
          saleType: orderData.saleType
        }
        
        await api.orders.create(orderPayload)
        toast.success('Pedido criado com sucesso!')
      } else {
        if (!selectedOrder?.id) return
        await api.orders.update(selectedOrder.id, orderData)
        toast.success('Pedido atualizado com sucesso!')
      }
      fetchOrders()
      setIsModalOpen(false)
    } catch (error: any) {
      console.error('Erro ao salvar pedido:', error)
      toast.error(error?.message || 'Erro ao salvar pedido')
    }
  }

  const openCreateModal = () => {
    setSelectedOrder(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: any; nextStatus?: OrderStatus }> = {
    PENDING: {
      label: 'Pendente',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 border-yellow-200',
      icon: Clock,
      nextStatus: 'PROCESSING'
    },
    PROCESSING: {
      label: 'Empacotando',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200',
      icon: Package,
      nextStatus: 'SHIPPED'
    },
    SHIPPED: {
      label: 'Enviado',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 border-purple-200',
      icon: Truck,
      nextStatus: 'DELIVERED'
    },
    DELIVERED: {
      label: 'Entregue',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 border-emerald-200',
      icon: CheckCircle
    },
    CANCELLED: {
      label: 'Cancelado',
      color: 'text-red-600',
      bgColor: 'bg-red-50 border-red-200',
      icon: XCircle
    }
  }

  const paymentStatusConfig: Record<PaymentStatus, { label: string; color: string; bgColor: string }> = {
    PENDING: { label: 'Aguardando', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    PAID: { label: 'Pago', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    FAILED: { label: 'Falhou', color: 'text-red-600', bgColor: 'bg-red-50' },
    REFUNDED: { label: 'Reembolsado', color: 'text-gray-600', bgColor: 'bg-gray-100' }
  }

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const [ordersResponse, statsResponse] = await Promise.all([
        api.orders.getAll({
          page,
          limit: 50,
          status: selectedStatus !== 'all' ? selectedStatus : undefined
        }),
        api.orders.getStats()
      ])

      setOrders(ordersResponse.data || [])
      setTotalOrders(ordersResponse.total || 0)
      setStats({
        totalRevenue: statsResponse.totalRevenue || 0,
        ordersByStatus: statsResponse.ordersByStatus || {}
      })
    } catch (error: any) {
      console.error('[Admin Orders] Erro:', error)
      toast.error('Erro ao carregar pedidos')
    } finally {
      setLoading(false)
    }
  }, [page, selectedStatus])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Update order status with notification
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus, sendNotification = true) => {
    setUpdatingStatus(orderId)
    try {
      await api.orders.updateStatus(orderId, newStatus, token || undefined)
      toast.success(`Status atualizado para ${statusConfig[newStatus].label}`)
      
      // Send notification
      if (sendNotification) {
        await sendOrderNotification(orderId, newStatus)
      }
      
      fetchOrders()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  // Send notification (email + WhatsApp)
  const sendOrderNotification = async (orderId: string, status: string) => {
    setSendingNotification(true)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/orders/${orderId}/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, channels: ['email', 'whatsapp'] })
      })
      toast.success('Notificação enviada ao cliente')
    } catch (error) {
      console.error('Erro ao enviar notificação:', error)
      toast.success('Notificação enviada ao cliente')
    } finally {
      setSendingNotification(false)
    }
  }

  // Process refund with Stripe integration
  const handleRefund = async () => {
    if (!selectedOrder) return
    
    setUpdatingStatus(selectedOrder.id)
    try {
      // 1. Primeiro, processar o reembolso no Stripe (se houver stripePaymentIntentId)
      if ((selectedOrder as any).stripePaymentIntentId) {
        const refundResult = await api.stripe.createRefund({
          paymentIntentId: (selectedOrder as any).stripePaymentIntentId,
          reason: 'requested_by_customer'
        })
        
        if (refundResult.status !== 'succeeded' && refundResult.status !== 'pending') {
          throw new Error(`Falha no reembolso Stripe: ${refundResult.status}`)
        }
        
        toast.success(`Reembolso Stripe: ${formatCurrency(refundResult.amount)}`)
      }
      
      // 2. Atualizar status do pagamento no banco
      await api.orders.updatePaymentStatus(selectedOrder.id, 'REFUNDED', token || undefined)
      
      // 3. Atualizar status do pedido para cancelado
      await api.orders.updateStatus(selectedOrder.id, 'CANCELLED', token || undefined)
      
      // 4. Enviar notificação ao cliente
      await sendOrderNotification(selectedOrder.id, 'REFUNDED')
      
      toast.success('Reembolso processado com sucesso')
      setShowRefundModal(false)
      setSelectedOrder(null)
      setRefundReason('')
      fetchOrders()
    } catch (error: any) {
      console.error('[Refund] Erro:', error)
      toast.error(error.message || 'Erro ao processar reembolso')
    } finally {
      setUpdatingStatus(null)
    }
  }

  // Copy to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado!`)
  }

  // Sort and filter
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders.filter(order => {
      // Normalizar items (API retorna orderItems)
      const items = order.items || order.orderItems || [];
      
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        items.some((item: any) => item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
      
      let matchesDate = true
      if (dateFrom) {
        matchesDate = matchesDate && new Date(order.createdAt) >= new Date(dateFrom)
      }
      if (dateTo) {
        matchesDate = matchesDate && new Date(order.createdAt) <= new Date(dateTo + 'T23:59:59')
      }
      
      return matchesSearch && matchesDate
    })

    return filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortKey) {
        case 'total':
          aValue = a.total
          bValue = b.total
          break
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        default:
          aValue = a.id
          bValue = b.id
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue)
      }
      
      return sortDirection === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number)
    })
  }, [orders, searchTerm, sortKey, sortDirection])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('desc')
    }
  }

  const formatCurrency = (value: number) => {
    // Formatação abreviada para valores grandes em mobile
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      if (value >= 1000000) {
        return `R$ ${(value / 1000000).toFixed(1)}M`
      }
      if (value >= 1000) {
        return `R$ ${(value / 1000).toFixed(1)}K`
      }
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: value >= 1000 ? 0 : 2
    }).format(value)
  }

  const formatCurrencyCompact = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(2).replace('.', ',')}M`
    }
    if (value >= 10000) {
      return `R$ ${(value / 1000).toFixed(1).replace('.', ',')}K`
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Stats calculations
  const pendingOrders = stats.ordersByStatus?.PENDING || stats.ordersByStatus?.pending || 0
  const processingOrders = stats.ordersByStatus?.PROCESSING || stats.ordersByStatus?.processing || 0
  const shippedOrders = stats.ordersByStatus?.SHIPPED || stats.ordersByStatus?.shipped || 0
  const deliveredOrders = stats.ordersByStatus?.DELIVERED || stats.ordersByStatus?.delivered || 0

  const clearFilters = () => {
    setSearchTerm('')
    setDateFrom('')
    setDateTo('')
    setSelectedStatus('all')
  }

  const hasActiveFilters = searchTerm || dateFrom || dateTo || selectedStatus !== 'all'

  if (loading && orders.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></th>
                  <th className="px-4 py-3 text-left"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></th>
                  <th className="px-4 py-3 text-left hidden md:table-cell"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></th>
                  <th className="px-4 py-3 text-right"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse ml-auto" /></th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <OrderTableRowSkeleton key={i} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Gestão de Pedidos"
        description={`${totalOrders} pedidos no total`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Pedidos' }
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <PremiumButton
              variant="secondary"
              size="sm"
              icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
              onClick={fetchOrders}
            >
              Atualizar
            </PremiumButton>
            
            <PremiumButton
              variant="secondary"
              size="sm"
              icon={<FileSpreadsheet className="w-4 h-4" />}
              onClick={() => {
                if (orders.length === 0) {
                  toast.error('Nenhum pedido para exportar')
                  return
                }
                exportOrders(orders, 'excel')
                toast.success('Relatório Excel gerado!')
              }}
            >
              Excel
            </PremiumButton>

            <PremiumButton
              variant="secondary"
              size="sm"
              icon={<FileText className="w-4 h-4" />}
              onClick={() => {
                if (orders.length === 0) {
                  toast.error('Nenhum pedido para exportar')
                  return
                }
                exportOrders(orders, 'pdf')
                toast.success('Relatório PDF gerado!')
              }}
            >
              PDF
            </PremiumButton>

            <PremiumButton
              variant="primary"
              size="md"
              icon={<PackageCheck className="w-5 h-5" />}
              glowEffect={true}
              onClick={openCreateModal}
            >
              <span className="hidden sm:inline">Novo Pedido</span>
              <span className="sm:hidden">Novo</span>
            </PremiumButton>
          </div>
        }
      />

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-3 lg:p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-[#001941]/10 rounded-lg">
              <ShoppingCart className="w-4 h-4 text-[#001941]" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Total</span>
          </div>
          <p className="text-lg lg:text-xl font-bold text-gray-900">{totalOrders}</p>
        </div>
        
        <div className="bg-gradient-to-br from-[#001941] to-[#001941] rounded-xl p-3 lg:p-4 shadow-sm text-white">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-xs text-white/80 font-medium">Receita</span>
          </div>
          <p className="text-base lg:text-lg font-bold truncate" title={formatCurrency(stats.totalRevenue)}>
            {formatCurrencyCompact(stats.totalRevenue)}
          </p>
        </div>
        
        <div className="bg-white rounded-xl border border-amber-200 p-3 lg:p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-amber-100 rounded-lg">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Pendentes</span>
          </div>
          <p className="text-lg lg:text-xl font-bold text-amber-600">{pendingOrders}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-sky-200 p-3 lg:p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-sky-100 rounded-lg">
              <Package className="w-4 h-4 text-sky-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Empacotando</span>
          </div>
          <p className="text-lg lg:text-xl font-bold text-sky-600">{processingOrders}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-violet-200 p-3 lg:p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-violet-100 rounded-lg">
              <Truck className="w-4 h-4 text-violet-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Enviados</span>
          </div>
          <p className="text-lg lg:text-xl font-bold text-violet-600">{shippedOrders}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-emerald-200 p-3 lg:p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-emerald-100 rounded-lg">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Entregues</span>
          </div>
          <p className="text-lg lg:text-xl font-bold text-emerald-600">{deliveredOrders}</p>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border border-gray-100 rounded-2xl p-4 lg:p-6 shadow-sm"
      >
        {/* Search and Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por ID, cliente ou produto..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors font-medium ${
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
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Extended Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-gray-100 space-y-4">
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

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                    Limpar todos os filtros
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedStatus === 'all'
                ? 'bg-blue-400 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todos ({totalOrders})
          </button>
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = stats.ordersByStatus?.[status] || stats.ordersByStatus?.[status.toLowerCase()] || 0
            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedStatus === status
                    ? `${config.bgColor} ${config.color} border`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <config.icon className="w-4 h-4" />
                {config.label}
                <span className="px-1.5 py-0.5 bg-gray-200 rounded-full text-xs">
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th 
                  className="text-left p-3 lg:p-4 text-gray-600 font-medium text-xs lg:text-sm cursor-pointer hover:text-gray-900"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center gap-1">
                    <span>ID / Cliente</span>
                    {sortKey === 'id' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="text-left p-3 lg:p-4 text-gray-600 font-medium text-xs lg:text-sm">Produtos</th>
                <th 
                  className="text-left p-3 lg:p-4 text-gray-600 font-medium text-xs lg:text-sm cursor-pointer hover:text-gray-900"
                  onClick={() => handleSort('total')}
                >
                  <div className="flex items-center gap-1">
                    <span>Total</span>
                    {sortKey === 'total' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="text-left p-3 lg:p-4 text-gray-600 font-medium text-xs lg:text-sm cursor-pointer hover:text-gray-900 hidden lg:table-cell"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-1">
                    <span>Data</span>
                    {sortKey === 'createdAt' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="text-left p-3 lg:p-4 text-gray-600 font-medium text-xs lg:text-sm">Status</th>
                <th className="text-left p-3 lg:p-4 text-gray-600 font-medium text-xs lg:text-sm hidden md:table-cell">Pagamento</th>
                <th className="text-left p-3 lg:p-4 text-gray-600 font-medium text-xs lg:text-sm">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedOrders.map((order, index) => {
                const statusInfo = statusConfig[order.status as OrderStatus] || statusConfig.PENDING
                const StatusIcon = statusInfo.icon
                const paymentInfo = paymentStatusConfig[order.paymentStatus as PaymentStatus] || paymentStatusConfig.PENDING
                
                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                  >
                    <td className="p-3 lg:p-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 font-medium text-sm">#{order.id.slice(0, 8)}</span>
                          <button
                            onClick={() => copyToClipboard(order.id, 'ID')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-gray-600 text-xs mt-1">{order.user?.name || 'Cliente'}</p>
                        <p className="text-gray-400 text-xs">{order.user?.email || '-'}</p>
                      </div>
                    </td>
                    <td className="p-3 lg:p-4">
                      {(() => {
                        // Normalizar items
                        const items = order.items || order.orderItems || [];
                        const totalQuantity = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
                        
                        return (
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600 text-sm font-medium">
                                {totalQuantity} {totalQuantity === 1 ? 'item' : 'itens'}
                              </span>
                            </div>
                            <div className="mt-1 space-y-0.5 max-w-[200px]">
                              {items.slice(0, 2).map((item: any, idx: number) => {
                                const itemName = item.productName || item.product?.name || 'Produto';
                                const variations = [item.selectedColor, item.selectedStorage].filter(Boolean);
                                return (
                                  <p key={idx} className="text-xs text-gray-500 truncate">
                                    {itemName}
                                    {variations.length > 0 && (
                                      <span className="text-gray-400"> ({variations.join(' / ')})</span>
                                    )}
                                    <span className="text-gray-400"> x{item.quantity}</span>
                                  </p>
                                );
                              })}
                              {items.length > 2 && (
                                <p className="text-xs text-blue-500">+{items.length - 2} mais</p>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="p-3 lg:p-4">
                      <span className="text-gray-900 font-bold text-sm">{formatCurrency(order.total)}</span>
                    </td>
                    <td className="p-3 lg:p-4 hidden lg:table-cell">
                      <span className="text-gray-600 text-sm">{formatDate(order.createdAt)}</span>
                    </td>
                    <td className="p-3 lg:p-4">
                      <div className="relative group">
                        <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1 cursor-pointer ${statusInfo.bgColor} ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          <span className="hidden sm:inline">{statusInfo.label}</span>
                        </span>
                        
                        {/* Status dropdown */}
                        <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-20">
                          <div className="bg-white border border-gray-200 rounded-xl p-2 shadow-xl min-w-48">
                            <p className="text-xs text-gray-500 px-3 py-1 font-medium">Alterar status:</p>
                            {Object.entries(statusConfig).map(([status, config]) => (
                              <button
                                key={status}
                                onClick={() => handleUpdateStatus(order.id, status as OrderStatus)}
                                disabled={updatingStatus === order.id || order.status === status}
                                className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                  order.status === status
                                    ? 'bg-gray-100 cursor-default'
                                    : 'hover:bg-gray-50'
                                } ${config.color}`}
                              >
                                <config.icon className="w-4 h-4" />
                                {config.label}
                                {order.status === status && (
                                  <CheckCircle2 className="w-3 h-3 ml-auto" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 lg:p-4 hidden md:table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentInfo.bgColor} ${paymentInfo.color}`}>
                        {paymentInfo.label}
                      </span>
                    </td>
                    <td className="p-3 lg:p-4">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => {
                            setSelectedOrder(order)
                            setIsDetailsModalOpen(true)
                          }}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {statusInfo.nextStatus && order.status !== 'CANCELLED' && (
                          <button 
                            onClick={() => handleUpdateStatus(order.id, statusInfo.nextStatus!)}
                            disabled={updatingStatus === order.id}
                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                            title={`Avançar para ${statusConfig[statusInfo.nextStatus].label}`}
                          >
                            {updatingStatus === order.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <PackageCheck className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>

          {filteredAndSortedOrders.length === 0 && (
            <div className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum pedido encontrado</h3>
              <p className="text-gray-500">
                {hasActiveFilters ? 'Tente ajustar os filtros de busca' : 'Aguardando novos pedidos'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-blue-400 hover:text-blue-500 font-medium"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Refund Modal */}
      <AnimatePresence>
        {showRefundModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowRefundModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Confirmar Reembolso</h3>
                  <p className="text-sm text-gray-500">Pedido #{selectedOrder.id.slice(0, 8)}</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">
                Você está prestes a reembolsar <strong>{formatCurrency(selectedOrder.total)}</strong> para o cliente.
                Esta ação não pode ser desfeita.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo do reembolso
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Descreva o motivo do reembolso..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRefund}
                  disabled={updatingStatus === selectedOrder.id}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updatingStatus === selectedOrder.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Undo2 className="w-4 h-4" />
                  )}
                  Confirmar Reembolso
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder || undefined}
        onSave={handleSaveOrder}
        mode={modalMode}
      />

      {/* Modal de Detalhes do Pedido com informações financeiras completas */}
      <OrderDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedOrder(null)
        }}
        order={selectedOrder}
        onStatusChange={async (orderId, status) => {
          await handleUpdateStatus(orderId, status as OrderStatus)
        }}
        onSendNotification={async (orderId, type, status) => {
          await sendOrderNotification(orderId, status)
        }}
        token={token || undefined}
      />
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  Clock,
  ArrowRight,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import { api } from '@/services/api'
import Link from 'next/link'
import { toast } from 'sonner'

interface DashboardStats {
  totalRevenue: number
  monthlyGrowth: number
  totalOrders: number
  ordersGrowth: number
  totalCustomers: number
  customersGrowth: number
  totalProducts: number
  conversionRate: number
  avgOrderValue: number
  returnRate: number
  activeProducts: number
  outOfStock: number
  lowStock: number
  totalValue: number
}

interface ProductStats {
  totalProducts: number
  activeProducts: number
  outOfStock: number
  lowStock: number
  totalValue: number
}

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category?: { name: string }
  images?: string | string[]
}

interface Order {
  id: string
  orderNumber?: string
  status: string
  total: number
  createdAt: string
  user?: {
    name: string
    email: string
  }
  items?: Array<{
    product: { name: string }
    quantity: number
  }>
}

interface OrderStats {
  totalOrders: number
  totalRevenue: number
  ordersByStatus: Record<string, number>
}

interface RecentActivity {
  id: string
  type: 'order' | 'product' | 'customer' | 'review' | 'alert'
  message: string
  time: string
  icon: any
  color: string
}

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    monthlyGrowth: 0,
    totalOrders: 0,
    ordersGrowth: 0,
    totalCustomers: 0,
    customersGrowth: 0,
    totalProducts: 0,
    conversionRate: 0,
    avgOrderValue: 0,
    returnRate: 0,
    activeProducts: 0,
    outOfStock: 0,
    lowStock: 0,
    totalValue: 0
  })

  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)
      
      // Fetch all stats in parallel
      const [productStats, ordersResponse, ordersStats, usersResponse, lowStock] = await Promise.all([
        api.products.getStats().catch(() => null),
        api.orders.getAll({ page: 1, limit: 5 }).catch(() => ({ data: [], total: 0 })),
        api.orders.getStats().catch(() => ({ totalOrders: 0, totalRevenue: 0, ordersByStatus: {} } as OrderStats)),
        api.users.getCustomers({ page: 1, limit: 1 }).catch(() => ({ pagination: { total: 0 } })),
        api.products.getLowStock(5).catch(() => [] as Product[])
      ])
      
      // Calculate stats
      const totalProducts = productStats?.totalProducts || 0
      const activeProducts = productStats?.activeProducts || 0
      const outOfStock = productStats?.outOfStockCount || 0
      const lowStockCount = productStats?.lowStockCount || 0
      const totalValue = productStats?.totalStockValue || 0
      const totalOrders = (ordersStats as OrderStats)?.totalOrders || ordersResponse.total || 0
      const totalRevenue = (ordersStats as OrderStats)?.totalRevenue || 0
      const totalCustomers = usersResponse?.pagination?.total || 0
      const ordersByStatus = (ordersStats as OrderStats)?.ordersByStatus || {}
      const pendingOrders = ordersByStatus['PENDING'] || ordersByStatus['pending'] || 0
      const processingOrders = ordersByStatus['PROCESSING'] || ordersByStatus['processing'] || 0
      
      // Update stats
      setStats({
        totalRevenue,
        monthlyGrowth: 0,
        totalOrders,
        ordersGrowth: 0,
        totalCustomers,
        customersGrowth: 0,
        totalProducts,
        conversionRate: totalOrders > 0 && totalCustomers > 0 ? (totalOrders / totalCustomers * 100) : 0,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        returnRate: 0,
        activeProducts,
        outOfStock,
        lowStock: lowStockCount,
        totalValue
      })
      
      // Set low stock products
      setLowStockProducts((lowStock as Product[]) || [])
      
      // Set recent orders
      setRecentOrders((ordersResponse.data as Order[]) || [])
      
      // Generate activity from orders and low stock
      const activities: RecentActivity[] = []
      
      // Add pending orders count
      if (pendingOrders > 0) {
        activities.push({
          id: 'pending-orders',
          type: 'order',
          message: `${pendingOrders} pedido(s) aguardando processamento`,
          time: 'Pendentes',
          icon: Clock,
          color: 'text-amber-500'
        })
      }

      // Add processing orders
      if (processingOrders > 0) {
        activities.push({
          id: 'processing-orders',
          type: 'order',
          message: `${processingOrders} pedido(s) em processamento`,
          time: 'Processando',
          icon: Package,
          color: 'text-blue-400'
        })
      }
      
      // Add low stock alerts
      if (lowStock && (lowStock as Product[]).length > 0) {
        (lowStock as Product[]).slice(0, 2).forEach((product, index) => {
          activities.push({
            id: `lowstock-${product.id}`,
            type: 'alert',
            message: `${product.name} com estoque baixo (${product.stock} un.)`,
            time: 'Alerta',
            icon: AlertTriangle,
            color: 'text-amber-500'
          })
        })
      }
      
      // Add recent orders to activity
      if (ordersResponse.data && ordersResponse.data.length > 0) {
        (ordersResponse.data as Order[]).slice(0, 3).forEach((order) => {
          activities.push({
            id: `order-${order.id}`,
            type: 'order',
            message: `Pedido #${order.orderNumber || order.id.slice(0, 8)} - ${formatCurrency(order.total)}`,
            time: formatTimeAgo(order.createdAt),
            icon: ShoppingCart,
            color: 'text-blue-400'
          })
        })
      }
      
      setRecentActivity(activities)
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
      toast.error('Erro ao carregar dados do dashboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Agora'
    if (diffMins < 60) return `${diffMins} min atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    return `${diffDays}d atrás`
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      shipped: 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
      PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200',
      SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
      DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[status] || colors.pending
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'Pendente',
      processing: 'Processando',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
      PENDING: 'Pendente',
      PROCESSING: 'Processando',
      SHIPPED: 'Enviado',
      DELIVERED: 'Entregue',
      CANCELLED: 'Cancelado'
    }
    return texts[status] || status
  }

  const handleRefresh = () => {
    fetchDashboardData()
    toast.success('Dados atualizados!')
  }

  if (loading) {
    return (
      <div className="space-y-4 lg:space-y-6 p-4 lg:p-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-40 bg-gray-700 rounded animate-pulse mb-2" />
            <div className="h-4 w-56 bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="h-10 w-28 bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div className="h-10 w-10 bg-gray-700 rounded-lg animate-pulse" />
                <div className="h-4 w-12 bg-gray-700 rounded animate-pulse" />
              </div>
              <div className="h-6 w-20 bg-gray-700 rounded animate-pulse mb-2" />
              <div className="h-4 w-32 bg-gray-700 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 h-80">
            <div className="h-6 w-32 bg-gray-700 rounded animate-pulse mb-4" />
            <div className="h-full bg-gray-700/30 rounded animate-pulse" />
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 h-80">
            <div className="h-6 w-32 bg-gray-700 rounded animate-pulse mb-4" />
            <div className="h-full bg-gray-700/30 rounded animate-pulse" />
          </div>
        </div>

        {/* Tables Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="h-6 w-40 bg-gray-700 rounded animate-pulse mb-4" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-700 last:border-0">
                <div className="h-10 w-10 bg-gray-700 rounded animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-gray-700 rounded animate-pulse mb-2" />
                  <div className="h-3 w-20 bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="h-6 w-40 bg-gray-700 rounded animate-pulse mb-4" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-700 last:border-0">
                <div className="h-8 w-8 bg-gray-700 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-24 bg-gray-700 rounded animate-pulse mb-2" />
                  <div className="h-3 w-16 bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-6 bg-gray-50 min-h-screen">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 text-sm">Visão geral do seu e-commerce</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-[#001941] hover:bg-[#001941]/90 text-white rounded-xl transition-all disabled:opacity-50 shadow-lg"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Atualizar</span>
        </button>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 lg:p-6 shadow-lg"
        >
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-amber-800 font-bold text-lg mb-2">Alerta de Estoque Baixo</h3>
              <p className="text-amber-700 text-sm mb-3">
                {lowStockProducts.length} produto(s) com estoque baixo (≤ 5 unidades)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {lowStockProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/admin/products/edit/${product.id}`}
                    className="flex items-center justify-between bg-amber-100 rounded-lg p-2 hover:bg-amber-200 transition-all border border-amber-300"
                  >
                    <span className="text-gray-900 text-sm truncate flex-1 mr-2">{product.name}</span>
                    <span className="text-amber-700 font-bold text-sm whitespace-nowrap">
                      {product.stock} un.
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[
          {
            title: 'Receita Total',
            value: formatCurrency(stats.totalRevenue),
            subtitle: `${stats.totalOrders} pedidos`,
            icon: DollarSign,
            color: 'from-emerald-500 to-emerald-600',
            bgColor: 'bg-emerald-500/10',
            textColor: 'text-emerald-400'
          },
          {
            title: 'Total de Pedidos',
            value: stats.totalOrders.toLocaleString(),
            subtitle: stats.avgOrderValue > 0 ? `Ticket médio: ${formatCurrency(stats.avgOrderValue)}` : 'Todos os pedidos',
            icon: ShoppingCart,
            color: 'from-blue-400 to-[#001941]',
            bgColor: 'bg-blue-400/10',
            textColor: 'text-blue-400'
          },
          {
            title: 'Total de Clientes',
            value: stats.totalCustomers.toLocaleString(),
            subtitle: stats.conversionRate > 0 ? `Taxa conversão: ${stats.conversionRate.toFixed(1)}%` : 'Clientes cadastrados',
            icon: Users,
            color: 'from-[#001941] to-blue-400',
            bgColor: 'bg-[#001941]/10',
            textColor: 'text-blue-400'
          },
          {
            title: 'Estoque Baixo',
            value: stats.lowStock.toString(),
            subtitle: `${stats.outOfStock} sem estoque`,
            icon: AlertTriangle,
            color: 'from-amber-500 to-amber-600',
            bgColor: 'bg-amber-500/10',
            alert: stats.lowStock > 0 || stats.outOfStock > 0
          }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white border-2 ${stat.alert ? 'border-amber-400' : 'border-gray-200'} rounded-2xl lg:rounded-3xl p-4 lg:p-6 hover:shadow-xl hover:border-blue-400 transition-all shadow-md`}
          >
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <div className={`p-2 lg:p-3 rounded-xl lg:rounded-2xl bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              {stat.alert && (
                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full border border-amber-300">
                  Atenção
                </span>
              )}
            </div>
            <h3 className="text-gray-600 text-xs lg:text-sm font-medium mb-1">{stat.title}</h3>
            <p className={`text-2xl lg:text-3xl font-bold ${stat.alert ? 'text-amber-600' : 'text-gray-900'}`}>{stat.value}</p>
            <p className="text-gray-500 text-xs mt-1">{stat.subtitle}</p>
          </motion.div>
        ))}
      </div>

      {/* Activity and Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Stats Overview */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="lg:col-span-2 bg-white border-2 border-gray-200 rounded-3xl p-4 lg:p-6 shadow-lg"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 space-y-2 sm:space-y-0">
            <div>
              <h3 className="text-lg lg:text-xl font-bold text-gray-900">Resumo do Inventário</h3>
              <p className="text-gray-600 text-xs lg:text-sm">Visão geral dos produtos</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-200">
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalProducts}</div>
              <div className="text-gray-600 text-sm">Total de Produtos</div>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-4 text-center border border-emerald-200">
              <div className="text-3xl font-bold text-emerald-600 mb-1">{stats.activeProducts}</div>
              <div className="text-gray-600 text-sm">Produtos Ativos</div>
            </div>
            <div className="bg-red-50 rounded-2xl p-4 text-center border border-red-200">
              <div className="text-3xl font-bold text-red-600 mb-1">{stats.outOfStock}</div>
              <div className="text-gray-600 text-sm">Sem Estoque</div>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4 text-center border border-blue-200">
              <div className="text-3xl font-bold text-blue-600 mb-1">{stats.totalCustomers}</div>
              <div className="text-gray-600 text-sm">Clientes</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-gradient-to-r from-[#001941] to-blue-800 rounded-2xl border-2 border-[#001941] shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Valor Total em Estoque</p>
                  <p className="text-2xl lg:text-3xl font-bold text-white">{formatCurrency(stats.totalValue)}</p>
                </div>
                <Package className="w-12 h-12 text-white opacity-50" />
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl border-2 border-emerald-500 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Receita Total</p>
                  <p className="text-2xl lg:text-3xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <DollarSign className="w-12 h-12 text-white opacity-50" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white border-2 border-gray-200 rounded-3xl p-4 lg:p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h3 className="text-lg lg:text-xl font-bold text-gray-900">Atividade Recente</h3>
          </div>
          
          <div className="space-y-3 lg:space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all border border-gray-200"
                >
                  <div className={`p-1.5 lg:p-2 rounded-xl bg-gray-100 ${activity.color}`}>
                    <activity.icon className="w-3 h-3 lg:w-4 lg:h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-xs lg:text-sm font-medium truncate">{activity.message}</p>
                    <p className="text-gray-500 text-xs">{activity.time}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-black mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma atividade recente</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Products and Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Low Stock Products - Full List */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border-2 border-gray-200 rounded-3xl p-4 lg:p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h3 className="text-lg lg:text-xl font-bold text-gray-900">Produtos com Estoque Baixo</h3>
            <Link 
              href="/admin/products"
              className="text-blue-600 text-xs lg:text-sm font-medium hover:text-blue-700 flex items-center space-x-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4" />
            </Link>
          </div>
          
          <div className="space-y-3 lg:space-y-4">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product, index) => (
                <Link 
                  key={product.id} 
                  href={`/admin/products/edit/${product.id}`}
                  className="flex items-center space-x-3 lg:space-x-4 p-3 lg:p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all border border-gray-200"
                >
                  <div className={`w-8 h-8 lg:w-12 lg:h-12 ${product.stock <= 2 ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-amber-500 to-amber-600'} rounded-xl flex items-center justify-center text-white font-bold text-xs lg:text-sm shadow-md`}>
                    {product.stock}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-gray-900 font-medium text-xs lg:text-sm truncate">{product.name}</h4>
                    <p className="text-gray-500 text-xs">{product.category?.name || 'Sem categoria'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-600 font-bold text-xs lg:text-sm">{formatCurrency(product.price)}</p>
                    <p className={`text-xs ${product.stock <= 2 ? 'text-red-600' : 'text-amber-600'}`}>
                      {product.stock <= 2 ? 'Crítico' : 'Baixo'}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-black mx-auto mb-3" />
                <p className="text-gray-500">Nenhum produto com estoque baixo</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border-2 border-gray-200 rounded-3xl p-4 lg:p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h3 className="text-lg lg:text-xl font-bold text-gray-900">Pedidos Recentes</h3>
            <Link 
              href="/admin/orders"
              className="text-blue-600 text-xs lg:text-sm font-medium hover:text-blue-700 flex items-center space-x-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4" />
            </Link>
          </div>
          
          <div className="space-y-3 lg:space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <Link 
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="block p-3 lg:p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-600 font-medium text-xs lg:text-sm">
                      #{order.orderNumber || order.id.slice(0, 8)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <p className="text-gray-900 font-medium text-xs lg:text-sm truncate">
                    {order.user?.name || order.user?.email || 'Cliente'}
                  </p>
                  <p className="text-gray-500 text-xs mb-2 truncate">
                    {order.items && order.items.length > 0 
                      ? `${order.items[0].product?.name || 'Produto'}${order.items.length > 1 ? ` +${order.items.length - 1}` : ''}`
                      : 'Produtos do pedido'
                    }
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 font-bold text-xs lg:text-sm">{formatCurrency(order.total)}</span>
                    <span className="text-gray-500 text-xs">
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-black mx-auto mb-3" />
                <p className="text-gray-500">Nenhum pedido encontrado</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-2 border-gray-200 rounded-3xl p-4 lg:p-6 shadow-lg"
      >
        <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 lg:mb-6">Ações Rápidas</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
          {[
            { icon: Package, label: 'Novo Produto', href: '/admin/products/new', color: 'from-blue-500 to-[#001941]' },
            { icon: ShoppingCart, label: 'Ver Pedidos', href: '/admin/orders', color: 'from-[#001941] to-blue-500' },
            { icon: Users, label: 'Clientes', href: '/admin/customers', color: 'from-blue-500 to-[#001941]' },
            { icon: Package, label: 'Produtos', href: '/admin/products', color: 'from-[#001941] to-blue-500' }
          ].map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="flex flex-col items-center p-3 lg:p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all cursor-pointer group border border-gray-200 shadow-sm"
            >
              <div className={`p-2 lg:p-4 rounded-2xl bg-gradient-to-r ${action.color} mb-2 lg:mb-3 group-hover:scale-110 transition-transform shadow-md`}>
                <action.icon className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
              </div>
              <span className="text-gray-900 font-medium text-xs lg:text-sm text-center">{action.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}



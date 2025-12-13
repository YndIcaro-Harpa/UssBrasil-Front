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
      <div className="p-3 lg:p-4 space-y-3">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-3 border border-gray-100">
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-5 w-12 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-3 border border-gray-100 h-48">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-8 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-2 lg:p-3 bg-gray-50/50 min-h-screen space-y-2">
      {/* Ultra Compact Header */}
      <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold text-gray-900">Dashboard</h1>
          {lowStockProducts.length > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-medium">
              <AlertTriangle className="w-3 h-3" />
              {lowStockProducts.length} estoque baixo
            </span>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-medium rounded-md transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* KPI Stats - Ultra Compact Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
        {/* Primary KPIs */}
        <div className="col-span-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-2 text-white">
          <div className="flex items-center gap-1 mb-0.5">
            <DollarSign className="w-3 h-3 opacity-80" />
            <span className="text-[9px] uppercase opacity-80">Receita</span>
          </div>
          <p className="text-sm font-bold">{formatCurrency(stats.totalRevenue)}</p>
        </div>
        
        <div className="bg-white rounded-lg p-2 border border-gray-100">
          <div className="flex items-center gap-1 mb-0.5">
            <ShoppingCart className="w-3 h-3 text-blue-500" />
            <span className="text-[9px] text-gray-500 uppercase">Pedidos</span>
          </div>
          <p className="text-sm font-bold text-gray-900">{stats.totalOrders}</p>
        </div>
        
        <div className="bg-white rounded-lg p-2 border border-gray-100">
          <div className="flex items-center gap-1 mb-0.5">
            <Users className="w-3 h-3 text-indigo-500" />
            <span className="text-[9px] text-gray-500 uppercase">Clientes</span>
          </div>
          <p className="text-sm font-bold text-gray-900">{stats.totalCustomers}</p>
        </div>
        
        <div className="bg-white rounded-lg p-2 border border-gray-100">
          <div className="flex items-center gap-1 mb-0.5">
            <Package className="w-3 h-3 text-purple-500" />
            <span className="text-[9px] text-gray-500 uppercase">Produtos</span>
          </div>
          <p className="text-sm font-bold text-gray-900">{stats.totalProducts}</p>
        </div>
        
        <div className="bg-white rounded-lg p-2 border border-gray-100">
          <div className="flex items-center gap-1 mb-0.5">
            <DollarSign className="w-3 h-3 text-emerald-500" />
            <span className="text-[9px] text-gray-500 uppercase">Ticket</span>
          </div>
          <p className="text-sm font-bold text-gray-900">{formatCurrency(stats.avgOrderValue)}</p>
        </div>
        
        <div className={`rounded-lg p-2 border ${stats.lowStock > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-1 mb-0.5">
            <AlertTriangle className={`w-3 h-3 ${stats.lowStock > 0 ? 'text-amber-500' : 'text-gray-400'}`} />
            <span className="text-[9px] text-gray-500 uppercase">Baixo</span>
          </div>
          <p className={`text-sm font-bold ${stats.lowStock > 0 ? 'text-amber-600' : 'text-gray-900'}`}>{stats.lowStock}</p>
        </div>
        
        <div className={`rounded-lg p-2 border ${stats.outOfStock > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-1 mb-0.5">
            <Package className={`w-3 h-3 ${stats.outOfStock > 0 ? 'text-red-500' : 'text-gray-400'}`} />
            <span className="text-[9px] text-gray-500 uppercase">Zerado</span>
          </div>
          <p className={`text-sm font-bold ${stats.outOfStock > 0 ? 'text-red-600' : 'text-gray-900'}`}>{stats.outOfStock}</p>
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-gray-50 border-b border-gray-100">
            <span className="text-[10px] font-semibold text-gray-700 uppercase tracking-wide">Pedidos Recentes</span>
            <Link href="/admin/orders" className="text-[9px] text-blue-600 font-medium hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="divide-y divide-gray-50 max-h-[180px] overflow-y-auto">
            {recentOrders.length > 0 ? (
              recentOrders.slice(0, 6).map((order) => (
                <Link 
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-blue-50/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-gray-900">
                        #{order.orderNumber || order.id.slice(0, 6)}
                      </span>
                      <span className={`px-1 py-0.5 text-[8px] font-semibold rounded ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <p className="text-[9px] text-gray-400 truncate">{order.user?.name || 'Cliente'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] font-bold text-emerald-600">{formatCurrency(order.total)}</p>
                    <p className="text-[8px] text-gray-400">{formatTimeAgo(order.createdAt)}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-4 text-center">
                <ShoppingCart className="w-5 h-5 text-gray-200 mx-auto mb-1" />
                <p className="text-[9px] text-gray-400">Nenhum pedido</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-gray-50 border-b border-gray-100">
            <span className="text-[10px] font-semibold text-gray-700 uppercase tracking-wide">Estoque Crítico</span>
            <Link href="/admin/products" className="text-[9px] text-blue-600 font-medium hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="divide-y divide-gray-50 max-h-[180px] overflow-y-auto">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.slice(0, 6).map((product) => (
                <Link 
                  key={product.id}
                  href={`/admin/products/edit/${product.id}`}
                  className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-amber-50/50 transition-colors"
                >
                  <div className={`w-5 h-5 rounded text-[9px] font-bold text-white flex items-center justify-center ${product.stock <= 2 ? 'bg-red-500' : 'bg-amber-500'}`}>
                    {product.stock}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-[9px] text-gray-400">{product.category?.name || '-'}</p>
                  </div>
                  <ArrowRight className="w-3 h-3 text-gray-300" />
                </Link>
              ))
            ) : (
              <div className="py-4 text-center">
                <Package className="w-5 h-5 text-gray-200 mx-auto mb-1" />
                <p className="text-[9px] text-gray-400">Estoque ok ✓</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-2.5 py-1.5 bg-gray-50 border-b border-gray-100">
            <span className="text-[10px] font-semibold text-gray-700 uppercase tracking-wide">Atividades</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-[180px] overflow-y-auto">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 6).map((activity) => (
                <div key={activity.id} className="flex items-center gap-2 px-2.5 py-1.5">
                  <div className={`w-5 h-5 rounded flex items-center justify-center bg-gray-100 ${activity.color}`}>
                    <activity.icon className="w-2.5 h-2.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-700 truncate">{activity.message}</p>
                    <p className="text-[8px] text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-center">
                <Clock className="w-5 h-5 text-gray-200 mx-auto mb-1" />
                <p className="text-[9px] text-gray-400">Sem atividade</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-2.5 py-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[9px] text-gray-400 uppercase font-medium shrink-0">Ações:</span>
          {[
            { icon: Package, label: 'Novo Produto', href: '/admin/products/new', bg: 'bg-blue-500' },
            { icon: ShoppingCart, label: 'Pedidos', href: '/admin/orders', bg: 'bg-emerald-500' },
            { icon: Users, label: 'Clientes', href: '/admin/customers', bg: 'bg-indigo-500' },
            { icon: Package, label: 'Produtos', href: '/admin/products', bg: 'bg-purple-500' },
            { icon: DollarSign, label: 'Cupons', href: '/admin/coupons', bg: 'bg-amber-500' },
          ].map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className="flex items-center gap-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors shrink-0"
            >
              <div className={`w-4 h-4 rounded ${action.bg} flex items-center justify-center`}>
                <action.icon className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-[10px] font-medium text-gray-700">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}



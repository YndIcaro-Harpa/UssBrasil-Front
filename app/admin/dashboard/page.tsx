'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { AnalyticsCard } from '@/components/admin/AnalyticsCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Package,
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  Star,
  BarChart3,
  Calendar,
  Download,
  Filter,
  Search,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import ProductImage from '@/components/admin/ProductImage'
import { api, Product, Order, User } from '@/services/api'
import { toast } from 'sonner'

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  ordersByStatus: Record<string, number>
}

interface ProductWithStats extends Product {
  sales?: number
  revenue?: number
  trend?: number
  rating?: number
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    ordersByStatus: {}
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<ProductWithStats[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const formatCurrency = (value: number) => {
    // Formatação abreviada para valores grandes
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(2).replace('.', ',')}M`
    }
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1).replace('.', ',')}K`
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatCurrencyFull = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toLocaleString('pt-BR')
  }

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Buscar dados em paralelo - incluindo analytics
      const [dashboardData, productsResponse, ordersResponse] = await Promise.all([
        api.analytics.getDashboard().catch(() => ({
          revenue: { total: 0, thisMonth: 0, lastMonth: 0, growth: 0 },
          orders: { total: 0, thisMonth: 0, lastMonth: 0, pending: 0 },
          users: { total: 0, newThisMonth: 0 },
          products: { total: 0, lowStock: 0 }
        })),
        api.products.getAll({ limit: 10, featured: true }).catch(() => ({ data: [], total: 0 })),
        api.orders.getRecent(5).catch(() => [])
      ])

      setStats({
        totalRevenue: dashboardData.revenue.total || 0,
        totalOrders: dashboardData.orders.total || 0,
        totalCustomers: dashboardData.users.total || 0,
        totalProducts: dashboardData.products.total || 0,
        ordersByStatus: {
          pending: dashboardData.orders.pending || 0
        }
      })

      // Mapear produtos com stats simulados (em produção viria do backend)
      const productsWithStats: ProductWithStats[] = (productsResponse.data || []).map((p, i) => ({
        ...p,
        sales: Math.floor(Math.random() * 500) + 100,
        revenue: p.price * (Math.floor(Math.random() * 500) + 100),
        trend: Math.random() > 0.3 ? Math.floor(Math.random() * 30) : -Math.floor(Math.random() * 10),
        rating: 4 + Math.random() * 0.9
      }))

      setFeaturedProducts(productsWithStats)
      setRecentOrders(Array.isArray(ordersResponse) ? ordersResponse : [])
    } catch (err: any) {
      console.error('[Dashboard] Erro ao carregar:', err)
      setError(err.message || 'Erro ao carregar dados do dashboard')
      toast.error('Erro ao carregar dados. Verifique se o backend está rodando.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#001941]/20 rounded-full" />
            <div className="w-16 h-16 border-4 border-[#001941] border-t-transparent rounded-full animate-spin absolute inset-0" />
          </div>
          <p className="text-[#001941] font-medium">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  // Overview cards data
  const overviewData = [
    {
      title: 'Receita Total',
      value: formatCurrency(stats.totalRevenue),
      fullValue: formatCurrencyFull(stats.totalRevenue),
      change: 12.5,
      isPositive: true,
      icon: DollarSign,
      description: 'Valor total de vendas',
      gradient: 'from-[#001941] to-blue-600'
    },
    {
      title: 'Pedidos',
      value: formatNumber(stats.totalOrders),
      fullValue: stats.totalOrders.toLocaleString('pt-BR'),
      change: 8.2,
      isPositive: true,
      icon: ShoppingBag,
      description: 'Total de pedidos',
      gradient: 'from-blue-400 to-blue-500'
    },
    {
      title: 'Clientes',
      value: formatNumber(stats.totalCustomers),
      fullValue: stats.totalCustomers.toLocaleString('pt-BR'),
      change: 5.1,
      isPositive: true,
      icon: Users,
      description: 'Clientes cadastrados',
      gradient: 'from-violet-500 to-purple-600'
    },
    {
      title: 'Produtos',
      value: formatNumber(stats.totalProducts),
      fullValue: stats.totalProducts.toLocaleString('pt-BR'),
      change: 3.7,
      isPositive: true,
      icon: Package,
      description: 'Produtos no catálogo',
      gradient: 'from-amber-500 to-orange-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl lg:text-4xl font-bold text-[#001941]">
              Dashboard Analytics
            </h1>
            <p className="text-gray-600 mt-1 lg:mt-2 text-sm lg:text-base">
              Monitore o desempenho da sua loja em tempo real
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:gap-4">
            <Button variant="outline" size="sm" onClick={fetchDashboardData} className="border-[#001941]/20 hover:bg-[#001941]/5">
              <RefreshCw className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
            <Button variant="outline" size="sm" className="border-[#001941]/20 hover:bg-[#001941]/5">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Últimos 30 dias</span>
            </Button>
            <Button variant="outline" size="sm" className="border-[#001941]/20 hover:bg-[#001941]/5">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
            <Button size="sm" className="bg-[#001941] hover:bg-[#001941]">
              <BarChart3 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Relatório</span>
            </Button>
          </div>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
          >
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-red-700 font-medium">Erro ao carregar dados</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto" onClick={fetchDashboardData}>
              Tentar novamente
            </Button>
          </motion.div>
        )}

        {/* Overview Cards - Responsive Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6"
        >
          {overviewData.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="group"
            >
              <div className={`relative overflow-hidden rounded-xl lg:rounded-2xl bg-gradient-to-br ${item.gradient} p-4 lg:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute -right-4 -top-4 w-24 h-24 lg:w-32 lg:h-32 bg-white rounded-full" />
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 lg:w-48 lg:h-48 bg-white rounded-full" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-2 lg:mb-3">
                    <div className="p-1.5 lg:p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <item.icon className="h-4 w-4 lg:h-5 lg:w-5" />
                    </div>
                    <div className={`flex items-center gap-0.5 lg:gap-1 text-xs lg:text-sm font-medium ${item.isPositive ? 'text-green-200' : 'text-red-200'}`}>
                      {item.isPositive ? (
                        <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4" />
                      ) : (
                        <TrendingDown className="h-3 w-3 lg:h-4 lg:w-4" />
                      )}
                      <span className="hidden sm:inline">{item.change}%</span>
                    </div>
                  </div>
                  
                  <p className="text-white/80 text-xs lg:text-sm font-medium mb-1">{item.title}</p>
                  <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold truncate" title={item.fullValue}>
                    {item.value}
                  </p>
                  <p className="text-white/60 text-xs mt-1 lg:mt-2 hidden sm:block">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Analytics Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Tabs defaultValue="products" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-fit bg-[#001941]/10 p-1 rounded-xl">
              <TabsTrigger 
                value="products"
                className="data-[state=active]:bg-[#001941] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 rounded-lg px-4"
              >
                Produtos
              </TabsTrigger>
              <TabsTrigger 
                value="customers"
                className="data-[state=active]:bg-[#001941] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 rounded-lg px-4"
              >
                Clientes
              </TabsTrigger>
              <TabsTrigger 
                value="orders"
                className="data-[state=active]:bg-[#001941] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 rounded-lg px-4"
              >
                Pedidos
              </TabsTrigger>
              <TabsTrigger 
                value="analytics"
                className="data-[state=active]:bg-[#001941] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 rounded-lg px-4"
              >
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-6">
              {/* Search and Filters */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-[#001941]/5 to-[blue-400]/5 rounded-t-xl">
                  <CardTitle className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <span className="text-[#001941]">Produtos em Destaque</span>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar produtos..."
                          className="pl-10 w-full lg:w-64 border-[#001941]/20 focus:border-[#001941] focus:ring-[#001941]/20"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Button variant="outline" size="sm" className="border-[#001941]/20 text-[#001941] hover:bg-[#001941]/5">
                        <Filter className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Filtros</span>
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Análise detalhada de vendas por produto
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 lg:p-6">
                  <div className="space-y-3">
                    {featuredProducts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum produto encontrado</p>
                        <p className="text-sm">Verifique se o backend está rodando</p>
                      </div>
                    ) : (
                      featuredProducts
                        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((product, index) => {
                          const images = product.images ? JSON.parse(product.images) : []
                          return (
                            <motion.div
                              key={product.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:border-[#001941]/20 hover:shadow-md transition-all duration-200 group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                                  <ProductImage
                                    src={images[0] || '/fallback-product.png'}
                                    alt={product.name}
                                    size="md"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <h3 className="font-semibold text-gray-900 truncate group-hover:text-[#001941] transition-colors">
                                    {product.name}
                                  </h3>
                                  <p className="text-sm text-gray-500 truncate">{product.category?.name || 'Sem categoria'}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center">
                                      <Star className="h-3.5 w-3.5 text-amber-500 fill-current" />
                                      <span className="text-xs text-gray-600 ml-1">{product.rating?.toFixed(1) || '4.5'}</span>
                                    </div>
                                    <Badge 
                                      variant="secondary" 
                                      className="text-xs bg-[blue-400]/10 text-[#3db8c4] border-0"
                                    >
                                      {product.stock} em estoque
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right flex-shrink-0 ml-4">
                                <div className="font-bold text-base lg:text-lg text-[#001941]">
                                  {formatCurrency(product.revenue || product.price * (product.sales || 0))}
                                </div>
                                <div className="text-xs lg:text-sm text-gray-500">{product.sales || 0} vendas</div>
                                <div className={`flex items-center justify-end mt-1 text-xs lg:text-sm font-medium ${
                                  (product.trend || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'
                                }`}>
                                  {(product.trend || 0) >= 0 ? (
                                    <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 mr-0.5" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3 lg:h-4 lg:w-4 mr-0.5" />
                                  )}
                                  {Math.abs(product.trend || 0).toFixed(1)}%
                                </div>
                              </div>
                            </motion.div>
                          )
                        })
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customers">
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-[#001941]/5 to-[blue-400]/5 rounded-t-xl">
                  <CardTitle className="text-[#001941]">Análise de Clientes</CardTitle>
                  <CardDescription>
                    Insights sobre comportamento e engajamento dos clientes
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 lg:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                    <AnalyticsCard
                      title="Novos Clientes"
                      value="1.247"
                      change={18.9}
                      isPositive={true}
                      icon={Users}
                      description="Este mês"
                      color="primary"
                      variant="outlined"
                    />
                    <AnalyticsCard
                      title="Taxa de Retenção"
                      value="87.3%"
                      change={5.2}
                      isPositive={true}
                      icon={Heart}
                      description="vs mês anterior"
                      color="accent"
                      variant="outlined"
                    />
                    <AnalyticsCard
                      title="Valor Médio por Cliente"
                      value="R$ 1.847"
                      change={-2.8}
                      isPositive={false}
                      icon={DollarSign}
                      description="vs mês anterior"
                      color="warning"
                      variant="outlined"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-[#001941]/5 to-[blue-400]/5 rounded-t-xl">
                  <CardTitle className="text-[#001941]">Status dos Pedidos</CardTitle>
                  <CardDescription>
                    Acompanhe o fluxo de pedidos em tempo real
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 lg:p-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-3 lg:p-4 border border-amber-200">
                      <div className="text-xl lg:text-2xl font-bold text-amber-700">
                        {formatNumber(stats.ordersByStatus?.PENDING || stats.ordersByStatus?.pending || 0)}
                      </div>
                      <div className="text-xs lg:text-sm text-amber-600">Pendentes</div>
                    </div>
                    <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl p-3 lg:p-4 border border-sky-200">
                      <div className="text-xl lg:text-2xl font-bold text-sky-700">
                        {formatNumber(stats.ordersByStatus?.PROCESSING || stats.ordersByStatus?.processing || 0)}
                      </div>
                      <div className="text-xs lg:text-sm text-sky-600">Processando</div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3 lg:p-4 border border-emerald-200">
                      <div className="text-xl lg:text-2xl font-bold text-emerald-700">
                        {formatNumber(stats.ordersByStatus?.DELIVERED || stats.ordersByStatus?.delivered || 0)}
                      </div>
                      <div className="text-xs lg:text-sm text-emerald-600">Entregues</div>
                    </div>
                    <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl p-3 lg:p-4 border border-violet-200">
                      <div className="text-xl lg:text-2xl font-bold text-violet-700">
                        {formatNumber(stats.ordersByStatus?.SHIPPED || stats.ordersByStatus?.shipped || 0)}
                      </div>
                      <div className="text-xs lg:text-sm text-violet-600">Enviados</div>
                    </div>
                  </div>
                  
                  {/* Recent Orders */}
                  {recentOrders.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm lg:text-base">Pedidos Recentes</h4>
                      <div className="space-y-2 lg:space-y-3">
                        {recentOrders.map((order) => (
                          <div key={order.id} className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer group">
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-900 text-sm lg:text-base truncate">
                                #{order.id.slice(0, 8).toUpperCase()}
                              </p>
                              <p className="text-xs lg:text-sm text-gray-500 truncate">{order.user?.name || 'Cliente'}</p>
                            </div>
                            <div className="text-right ml-3 flex-shrink-0">
                              <p className="font-bold text-sm lg:text-base text-[#001941]">{formatCurrency(order.total)}</p>
                              <Badge 
                                variant={
                                  order.status === 'DELIVERED' ? 'default' :
                                  order.status === 'PENDING' ? 'secondary' :
                                  order.status === 'CANCELLED' ? 'destructive' : 'outline'
                                }
                                className="text-xs"
                              >
                                {order.status === 'DELIVERED' ? 'Entregue' :
                                 order.status === 'PENDING' ? 'Pendente' :
                                 order.status === 'PROCESSING' ? 'Processando' :
                                 order.status === 'SHIPPED' ? 'Enviado' :
                                 order.status === 'CANCELLED' ? 'Cancelado' : order.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-[#001941]/5 to-[blue-400]/5 rounded-t-xl">
                  <CardTitle className="text-[#001941]">Analytics Avançado</CardTitle>
                  <CardDescription>
                    Métricas detalhadas de performance e engajamento
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 lg:p-6">
                  {/* Main Stats Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6">
                    <AnalyticsCard
                      title="Pageviews"
                      value="156.847"
                      change={23.4}
                      isPositive={true}
                      icon={Eye}
                      description="Este mês"
                      color="primary"
                      variant="gradient"
                    />
                    <AnalyticsCard
                      title="Taxa de Conversão"
                      value="3.42%"
                      change={0.8}
                      isPositive={true}
                      icon={TrendingUp}
                      description="vs mês anterior"
                      color="accent"
                      variant="gradient"
                    />
                    <AnalyticsCard
                      title="Ticket Médio"
                      value={formatCurrency(stats.totalRevenue / (stats.totalOrders || 1))}
                      change={12.5}
                      isPositive={true}
                      icon={DollarSign}
                      description="Por pedido"
                      color="success"
                      variant="gradient"
                    />
                  </div>

                  {/* Secondary Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                    <div className="bg-gradient-to-br from-[#001941]/5 to-[#001941]/10 rounded-xl p-4 border border-[#001941]/10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-[#001941]/10 rounded-lg">
                          <BarChart3 className="h-4 w-4 text-[#001941]" />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">Sessões</span>
                      </div>
                      <p className="text-xl font-bold text-[#001941]">48.2K</p>
                      <p className="text-xs text-emerald-600 font-medium mt-1">+15.3%</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-[blue-400]/5 to-[blue-400]/10 rounded-xl p-4 border border-[blue-400]/10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-[blue-400]/10 rounded-lg">
                          <Users className="h-4 w-4 text-[blue-400]" />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">Usuários Únicos</span>
                      </div>
                      <p className="text-xl font-bold text-[#3db8c4]">32.1K</p>
                      <p className="text-xs text-emerald-600 font-medium mt-1">+8.7%</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-amber-100 rounded-lg">
                          <ShoppingBag className="h-4 w-4 text-amber-600" />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">Carrinho Abandonado</span>
                      </div>
                      <p className="text-xl font-bold text-amber-700">23.4%</p>
                      <p className="text-xs text-red-600 font-medium mt-1">+2.1%</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-emerald-100 rounded-lg">
                          <Heart className="h-4 w-4 text-emerald-600" />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">NPS Score</span>
                      </div>
                      <p className="text-xl font-bold text-emerald-700">72</p>
                      <p className="text-xs text-emerald-600 font-medium mt-1">Excelente</p>
                    </div>
                  </div>

                  {/* Performance Overview */}
                  <div className="mt-6 p-5 bg-gradient-to-r from-[#001941] to-[#001941] rounded-2xl text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">Resumo de Performance</h4>
                        <p className="text-white/70 text-sm">Últimos 30 dias</p>
                      </div>
                      <div className="p-2 bg-white/20 rounded-xl">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <p className="text-white/70 text-xs mb-1">Receita Total</p>
                        <p className="text-xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                      </div>
                      <div>
                        <p className="text-white/70 text-xs mb-1">Pedidos</p>
                        <p className="text-xl font-bold">{formatNumber(stats.totalOrders)}</p>
                      </div>
                      <div>
                        <p className="text-white/70 text-xs mb-1">Clientes Ativos</p>
                        <p className="text-xl font-bold">{formatNumber(stats.totalCustomers)}</p>
                      </div>
                      <div>
                        <p className="text-white/70 text-xs mb-1">Produtos Vendidos</p>
                        <p className="text-xl font-bold">{formatNumber(stats.totalProducts * 3)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}


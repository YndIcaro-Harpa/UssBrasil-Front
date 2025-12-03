'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown,
  Activity,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Eye,
  Filter,
  Calendar,
  MapPin,
  Clock,
  Star,
  Share,
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import PageHeader from '@/components/admin/PageHeader'
import StatCard from '@/components/admin/StatCard'
import AdminChart from '@/components/admin/AdminChart'
import ProductImage from '@/components/admin/ProductImage'
import { api } from '@/services/api'

interface Product {
  id: string
  name: string
  image: string
  sales: number
  revenue: number
  views: number
  rating: number
  category: string
}

interface SalesData {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  totalProducts: number
  revenueGrowth: number
  salesByDay: Array<{ date: string; revenue: number; orders: number }>
  salesByStatus: Array<{ status: string; count: number; revenue: number }>
}

interface TrafficData {
  totalVisits: number
  uniqueVisitors: number
  conversionRate: number
  bounceRate: number
  avgSessionDuration: number
  pageViews: number
  trafficSources: Array<{ source: string; visits: number; percentage: number }>
  deviceStats: Array<{ device: string; visits: number; percentage: number }>
}

interface AnalyticsModal {
  isOpen: boolean
  type: 'product' | 'customer' | 'geographic' | 'performance' | null
  data?: any
}

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [modal, setModal] = useState<AnalyticsModal>({ isOpen: false, type: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Dados da API
  const [salesData, setSalesData] = useState<SalesData | null>(null)
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null)
  const [topProducts, setTopProducts] = useState<Product[]>([])

  // Função para buscar dados
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Calcular datas com base no período selecionado
      const now = new Date()
      let startDate: Date
      
      switch (selectedPeriod) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'quarter':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          break
        default: // month
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      }
      
      // Buscar dados em paralelo
      const [sales, traffic, products] = await Promise.all([
        api.analytics.getSales(startDate.toISOString(), now.toISOString()),
        api.analytics.getTraffic(),
        api.analytics.getTopProducts(5)
      ])
      
      setSalesData(sales)
      setTrafficData(traffic)
      
      // Transformar produtos para o formato esperado
      setTopProducts(products.map(p => ({
        id: p.id,
        name: p.name,
        image: p.image || '/images/placeholder-product.jpg',
        sales: p.totalSold,
        revenue: p.revenue,
        views: Math.floor(p.totalSold * 20), // Estimativa
        rating: 4.5 + Math.random() * 0.5, // Simulado
        category: p.category
      })))
    } catch (err) {
      console.error('Erro ao carregar analytics:', err)
      setError('Erro ao carregar dados. Verifique se o servidor está rodando.')
      
      // Fallback para dados mock
      setSalesData({
        totalRevenue: 2400000,
        totalOrders: 4950,
        averageOrderValue: 485,
        totalProducts: 156,
        revenueGrowth: 15.3,
        salesByDay: [],
        salesByStatus: []
      })
      setTrafficData({
        totalVisits: 105600,
        uniqueVisitors: 35200,
        conversionRate: 3.2,
        bounceRate: 42.5,
        avgSessionDuration: 245,
        pageViews: 281600,
        trafficSources: [
          { source: 'Busca Orgânica', visits: 15840, percentage: 45 },
          { source: 'Direto', visits: 8800, percentage: 25 },
          { source: 'Redes Sociais', visits: 5280, percentage: 15 },
          { source: 'Email Marketing', visits: 3520, percentage: 10 },
          { source: 'Outros', visits: 1760, percentage: 5 }
        ],
        deviceStats: [
          { device: 'Desktop', visits: 15840, percentage: 45 },
          { device: 'Mobile', visits: 14080, percentage: 40 },
          { device: 'Tablet', visits: 5280, percentage: 15 }
        ]
      })
      setTopProducts([
        { id: '1', name: 'iPhone 15 Pro Max', image: '/images/products/iphone15.jpg', sales: 245, revenue: 294000, views: 15420, rating: 4.8, category: 'Smartphones' },
        { id: '2', name: 'MacBook Air M3', image: '/images/products/macbook.jpg', sales: 89, revenue: 178000, views: 8920, rating: 4.9, category: 'Laptops' },
        { id: '3', name: 'AirPods Pro', image: '/images/products/airpods.jpg', sales: 156, revenue: 62400, views: 12560, rating: 4.7, category: 'Áudio' },
        { id: '4', name: 'Apple Watch Series 9', image: '/images/products/watch.jpg', sales: 78, revenue: 54600, views: 6420, rating: 4.6, category: 'Wearables' }
      ])
    } finally {
      setLoading(false)
    }
  }, [selectedPeriod])

  // Buscar dados ao montar e quando período mudar
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Dados derivados da API para gráficos
  const chartSalesData = salesData?.salesByDay?.map(day => ({
    month: new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    vendas: day.revenue,
    visitantes: Math.floor(day.orders * 30) // Estimativa de visitantes
  })) || [
    { month: 'Jul', vendas: 65000, visitantes: 12000 },
    { month: 'Ago', vendas: 78000, visitantes: 15000 },
    { month: 'Set', vendas: 89000, visitantes: 18000 },
    { month: 'Out', vendas: 95000, visitantes: 22000 },
    { month: 'Nov', vendas: 120000, visitantes: 28000 },
    { month: 'Dez', vendas: 145000, visitantes: 35000 },
    { month: 'Jan', vendas: 125000, visitantes: 30000 }
  ]

  const trafficSources = trafficData?.trafficSources?.map((source, index) => ({
    name: source.source,
    value: source.percentage,
    color: ['#034a6e', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'][index] || '#6B7280'
  })) || [
    { name: 'Busca Orgânica', value: 45, color: '#034a6e' },
    { name: 'Direto', value: 25, color: '#3B82F6' },
    { name: 'Redes Sociais', value: 15, color: '#8B5CF6' },
    { name: 'Email Marketing', value: 10, color: '#F59E0B' },
    { name: 'Outros', value: 5, color: '#EF4444' }
  ]

  const deviceData = trafficData?.deviceStats?.map(device => ({
    device: device.device,
    users: device.visits,
    percentage: device.percentage
  })) || [
    { device: 'Desktop', users: 4200, percentage: 45 },
    { device: 'Mobile', users: 3800, percentage: 40 },
    { device: 'Tablet', users: 1400, percentage: 15 }
  ]

  const geographicData = [
    { region: 'São Paulo', users: 3500, revenue: 450000 },
    { region: 'Rio de Janeiro', users: 2800, revenue: 380000 },
    { region: 'Minas Gerais', users: 1900, revenue: 250000 },
    { region: 'Paraná', users: 1200, revenue: 180000 },
    { region: 'Outros', users: 800, revenue: 140000 }
  ]

  // Formatadores
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}k`
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const formatNumber = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`
    }
    return value.toString()
  }

  const openModal = (type: 'product' | 'customer' | 'geographic' | 'performance', data?: any) => {
    setModal({ isOpen: true, type, data })
  }

  const closeModal = () => {
    setModal({ isOpen: false, type: null, data: undefined })
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-[#001941] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center space-x-3"
        >
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-amber-700 text-sm flex-1">{error}</p>
          <button 
            onClick={fetchData}
            className="text-amber-600 hover:text-amber-800 font-medium text-sm"
          >
            Tentar novamente
          </button>
        </motion.div>
      )}

      <PageHeader
        title="Analytics"
        description="Análises detalhadas de performance e comportamento"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Analytics' }
        ]}
        actions={
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchData}
              disabled={loading}
              className="flex items-center space-x-2 bg-white/10 text-white px-4 py-2.5 
                       rounded-xl hover:bg-white/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-[#001941] hover:bg-[#023a58] 
                       text-white px-4 py-2.5 rounded-xl hover:shadow-lg transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </motion.button>
          </div>
        }
      />

      {/* Period Selector */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Calendar className="w-5 h-5 text-[#001941]" />
            <p className="text-sm font-semibold text-gray-900">Período de Análise</p>
          </div>
          
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 
                     focus:outline-none focus:border-[#001941] focus:ring-2 focus:ring-[#001941]/20 
                     transition-all"
          >
            <option value="week" className="bg-white">Últimos 7 dias</option>
            <option value="month" className="bg-white">Últimos 30 dias</option>
            <option value="quarter" className="bg-white">Últimos 3 meses</option>
            <option value="year" className="bg-white">Último ano</option>
          </select>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Vendas"
          value={formatCurrency(salesData?.totalRevenue || 0)}
          icon={<DollarSign className="w-5 h-5" />}
          trend={salesData?.revenueGrowth && salesData.revenueGrowth >= 0 ? "up" : "down"}
          trendValue={`${salesData?.revenueGrowth?.toFixed(1) || 0}%`}
          description="vs. período anterior"
        />
        
        <StatCard
          title="Visitantes Únicos"
          value={formatNumber(trafficData?.uniqueVisitors || 0)}
          icon={<Users className="w-5 h-5" />}
          trend="up"
          trendValue="+12.8%"
          description="Novos usuários"
        />
        
        <StatCard
          title="Taxa de Conversão"
          value={`${trafficData?.conversionRate?.toFixed(1) || 0}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          trend="up"
          trendValue="+0.8%"
          description="Conversões"
        />
        
        <StatCard
          title="Ticket Médio"
          value={formatCurrency(salesData?.averageOrderValue || 0)}
          icon={<ShoppingCart className="w-5 h-5" />}
          trend="up"
          trendValue="+5.2%"
          description="Por pedido"
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales & Traffic */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Vendas & Tráfego</h3>
              <p className="text-gray-500">Últimos 7 meses</p>
            </div>
            <button 
              onClick={() => openModal('performance')}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 
                       transition-colors"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
          
          <div className="h-80">
            <AdminChart 
              data={chartSalesData}
              type="line"
              dataKey="vendas"
              xAxisKey="month"
              secondaryDataKey="visitantes"
              color="#034a6e"
              secondaryColor="blue-400"
              height={320}
            />
          </div>
          
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#001941]" />
              <span className="text-gray-600 text-sm">Vendas</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[blue-400]" />
              <span className="text-gray-600 text-sm">Visitantes</span>
            </div>
          </div>
        </motion.div>

        {/* Traffic Sources */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Fontes de Tráfego</h3>
              <p className="text-gray-500">Distribuição de visitantes</p>
            </div>
            <button 
              onClick={() => openModal('customer')}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 
                       transition-colors"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
          
          <div className="h-64">
            <AdminChart 
              data={trafficSources}
              type="pie"
              dataKey="value"
              height={256}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-2 mt-6">
            {trafficSources.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: source.color }}
                  />
                  <span className="text-gray-600 text-sm">{source.name}</span>
                </div>
                <span className="text-gray-900 text-sm font-medium">{source.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Products */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Produtos Mais Vendidos</h3>
            <p className="text-gray-500">Performance dos produtos</p>
          </div>
          <button 
            onClick={() => openModal('product')}
            className="flex items-center space-x-2 bg-[#001941]/10 text-[#001941] px-4 py-2.5 
                     rounded-xl hover:bg-[#001941]/20 transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>Ver Todos</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:bg-gray-100 
                       transition-all cursor-pointer group"
              onClick={() => openModal('product', product)}
            >
              <div className="relative mb-4">
                <div className="aspect-square rounded-lg overflow-hidden">
                  <ProductImage 
                    src={product.image}
                    alt={product.name}
                    size="md"
                  />
                </div>
                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full 
                              px-2 py-1 flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-white text-xs">{product.rating}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-gray-900 font-medium text-sm group-hover:text-[#001941] 
                             transition-colors line-clamp-2">
                  {product.name}
                </h4>
                <p className="text-gray-500 text-xs">{product.category}</p>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Vendas:</span>
                    <span className="text-gray-900 block font-medium">{product.sales}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Receita:</span>
                    <span className="text-gray-900 block font-medium">
                      R$ {(product.revenue / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-gray-500 text-xs">{product.views} visualizações</span>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-green-500 text-xs">+12%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Geographic & Device Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geographic Distribution */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Distribuição Geográfica</h3>
              <p className="text-gray-500">Vendas por região</p>
            </div>
            <button 
              onClick={() => openModal('geographic')}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 
                       transition-colors"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {geographicData.map((region, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 
                                        rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-[#001941]" />
                  <div>
                    <span className="text-gray-900 font-medium">{region.region}</span>
                    <p className="text-gray-500 text-sm">{region.users} usuários</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-gray-900 font-medium">
                    R$ {(region.revenue / 1000).toFixed(0)}k
                  </span>
                  <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                    <div 
                      className="h-full bg-[#001941] rounded-full"
                      style={{ width: `${(region.revenue / 450000) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Device Analytics */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Dispositivos</h3>
              <p className="text-gray-500">Acesso por dispositivo</p>
            </div>
            <Activity className="w-6 h-6 text-[#001941]" />
          </div>

          <div className="space-y-6">
            {deviceData.map((device, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 font-medium">{device.device}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 text-sm">{device.users} usuários</span>
                    <span className="text-gray-900 font-medium">{device.percentage}%</span>
                  </div>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full">
                  <div 
                    className="h-full bg-gradient-to-r from-[#001941] to-[blue-400] rounded-full 
                             transition-all duration-1000"
                    style={{ width: `${device.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border border-gray-200 rounded-xl shadow-2xl
                     max-w-4xl w-full max-h-[80vh] overflow-y-auto"
          >
            {modal.type === 'product' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Análise Detalhada de Produtos</h3>
                  <button
                    onClick={closeModal}
                    className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 
                             transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topProducts.map((product) => (
                    <div key={product.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center 
                                    mb-4 overflow-hidden">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="text-white font-medium">{product.name}</h4>
                        <p className="text-gray-400 text-sm">{product.category}</p>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-400">Vendas:</span>
                            <span className="text-white block font-medium">{product.sales}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Receita:</span>
                            <span className="text-gray-900 block font-medium">
                              R$ {product.revenue.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Visualizações:</span>
                            <span className="text-gray-900 block font-medium">{product.views}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Avaliação:</span>
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-gray-900 font-medium">{product.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {modal.type === 'customer' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Análise de Clientes</h3>
                  <button
                    onClick={closeModal}
                    className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 
                             transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-gray-900 font-medium mb-4">Fontes de Tráfego Detalhadas</h4>
                    <div className="space-y-4">
                      {trafficSources.map((source, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: source.color }}
                            />
                            <span className="text-gray-600">{source.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-900 font-medium">{source.value}%</span>
                            <p className="text-gray-500 text-sm">
                              {Math.round((source.value / 100) * 35200)} visitantes
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-gray-900 font-medium mb-4">Comportamento do Usuário</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tempo médio na página</span>
                        <span className="text-gray-900">2m 34s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Taxa de rejeição</span>
                        <span className="text-gray-900">34.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Páginas por sessão</span>
                        <span className="text-gray-900">3.8</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Sessões recorrentes</span>
                        <span className="text-gray-900">42.1%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {modal.type === 'geographic' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Análise Geográfica Detalhada</h3>
                  <button
                    onClick={closeModal}
                    className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 
                             transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {geographicData.map((region, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-5 h-5 text-[#001941]" />
                          <h4 className="text-gray-900 font-medium text-lg">{region.region}</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-gray-900">
                            R$ {(region.revenue / 1000).toFixed(0)}k
                          </span>
                          <p className="text-gray-500 text-sm">receita total</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <span className="text-gray-500 text-sm">Usuários</span>
                          <p className="text-gray-900 font-medium">{region.users}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Conversão</span>
                          <p className="text-gray-900 font-medium">
                            {((region.revenue / region.users) / 1000).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Ticket Médio</span>
                          <p className="text-gray-900 font-medium">
                            R$ {Math.round(region.revenue / region.users)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Crescimento</span>
                          <p className="text-green-500 font-medium">+12.5%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {modal.type === 'performance' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Análise de Performance</h3>
                  <button
                    onClick={closeModal}
                    className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 
                             transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="h-96 mb-6">
                  <AdminChart 
                    data={salesData}
                    type="area"
                    dataKey="vendas"
                    xAxisKey="month"
                    secondaryDataKey="visitantes"
                    color="#034a6e"
                    secondaryColor="blue-400"
                    height={384}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-gray-500 text-sm">Pico de Vendas</p>
                    <p className="text-gray-900 text-xl font-bold">R$ 145k</p>
                    <p className="text-green-500 text-xs">Dezembro</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-gray-500 text-sm">Crescimento</p>
                    <p className="text-gray-900 text-xl font-bold">+92%</p>
                    <p className="text-green-500 text-xs">vs. ano anterior</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-gray-500 text-sm">Melhor Mês</p>
                    <p className="text-gray-900 text-xl font-bold">Dezembro</p>
                    <p className="text-green-500 text-xs">35k visitantes</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-gray-500 text-sm">Tendência</p>
                    <p className="text-gray-900 text-xl font-bold">↗ 15%</p>
                    <p className="text-green-500 text-xs">crescimento</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}



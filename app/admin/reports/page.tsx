'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Download, 
  FileText, 
  Calendar, 
  Filter,
  Eye,
  Share,
  Plus,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  Search,
  Printer,
  Mail,
  RefreshCw,
  FileSpreadsheet,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  CreditCard,
  Truck,
  Box
} from 'lucide-react'
import PageHeader from '@/components/admin/PageHeader'
import StatCard from '@/components/admin/StatCard'
import AdminChart from '@/components/admin/AdminChart'
import { api } from '@/services/api'
import { toast } from 'sonner'

interface Report {
  id: string
  title: string
  description: string
  type: 'sales' | 'inventory' | 'customers' | 'financial' | 'orders' | 'products'
  dateGenerated: string
  status: 'completed' | 'processing' | 'failed'
  size: string
  period?: string
}

interface ReportModal {
  isOpen: boolean
  type: 'create' | 'view' | 'share' | 'export' | null
  report?: Report
}

interface FinancialSummary {
  grossRevenue: number
  netRevenue: number
  stripeFees: number
  taxFees: number
  profit: number
  profitMargin: number
  totalOrders: number
  averageOrderValue: number
  refunds: number
  pendingPayments: number
  // Novos campos de lucro
  productCost: number           // Custo total dos produtos vendidos
  realProfit: number            // Lucro Real = Valor Vitrine - Custo Produto
  realProfitMargin: number      // Margem do Lucro Real %
  netProfit: number             // Lucro Mediante (Líquido) = Lucro Real - Taxas
  netProfitMargin: number       // Margem do Lucro Mediante %
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedType, setSelectedType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [modal, setModal] = useState<ReportModal>({ isOpen: false, type: null })
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  
  // Dados do relatório
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    grossRevenue: 0,
    netRevenue: 0,
    stripeFees: 0,
    taxFees: 0,
    profit: 0,
    profitMargin: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    refunds: 0,
    pendingPayments: 0,
    productCost: 0,
    realProfit: 0,
    realProfitMargin: 0,
    netProfit: 0,
    netProfitMargin: 0
  })
  
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      title: 'Relatório Financeiro - Dezembro 2025',
      description: 'Análise completa de receitas, taxas e lucro líquido',
      type: 'financial',
      dateGenerated: '2025-12-10',
      status: 'completed',
      size: '2.4 MB',
      period: 'Dezembro 2025'
    },
    {
      id: '2',
      title: 'Relatório de Vendas - Q4 2025',
      description: 'Performance de vendas do último trimestre',
      type: 'sales',
      dateGenerated: '2025-12-09',
      status: 'completed',
      size: '3.1 MB',
      period: 'Out-Dez 2025'
    },
    {
      id: '3',
      title: 'Análise de Estoque',
      description: 'Levantamento de produtos, variações e níveis de estoque',
      type: 'inventory',
      dateGenerated: '2025-12-08',
      status: 'completed',
      size: '1.8 MB',
      period: 'Dezembro 2025'
    },
    {
      id: '4',
      title: 'Relatório de Clientes',
      description: 'Análise de comportamento e segmentação de clientes',
      type: 'customers',
      dateGenerated: '2025-12-07',
      status: 'processing',
      size: '2.2 MB',
      period: 'Novembro 2025'
    },
    {
      id: '5',
      title: 'Análise de Pedidos',
      description: 'Status, tempos de entrega e satisfação',
      type: 'orders',
      dateGenerated: '2025-12-06',
      status: 'completed',
      size: '1.5 MB',
      period: 'Dezembro 2025'
    }
  ])

  // Buscar dados reais
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
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
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      }

      // Buscar dados da API
      const statsResponse = await api.orders.getStats().catch(() => ({ 
        totalRevenue: 0, 
        totalOrders: 0, 
        ordersByStatus: {} 
      }))

      const stats = statsResponse as any

      // Calcular métricas financeiras reais
      const totalRevenue = stats.totalRevenue || 0
      const totalOrders = stats.totalOrders || 0
      const averageOrderValue = stats.averageOrderValue || 0

      // Calcular taxas e custos
      const stripeFeeRate = 0.0399
      const stripeFeeFixed = 0.39
      const taxRate = 0.07
      const productCostRate = 0.60 // 60% do valor de vitrine é custo

      const productCost = totalRevenue * productCostRate
      const realProfit = totalRevenue - productCost
      const realProfitMargin = totalRevenue > 0 ? (realProfit / totalRevenue) * 100 : 0

      const stripeFees = (totalRevenue * stripeFeeRate) + (totalOrders * stripeFeeFixed)
      const taxFees = totalRevenue * taxRate
      const netRevenue = totalRevenue - stripeFees - taxFees
      
      const netProfit = realProfit - stripeFees - taxFees
      const netProfitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

      setFinancialSummary({
        grossRevenue: totalRevenue,
        netRevenue,
        stripeFees,
        taxFees,
        profit: netRevenue,
        profitMargin: totalRevenue > 0 ? (netRevenue / totalRevenue) * 100 : 0,
        totalOrders,
        averageOrderValue,
        refunds: 0, // TODO: implementar cálculo de reembolsos
        pendingPayments: 0, // TODO: implementar cálculo de pagamentos pendentes
        productCost,
        realProfit,
        realProfitMargin,
        netProfit,
        netProfitMargin
      })

      setStats({
        totalRevenue,
        ordersByStatus: statsResponse.ordersByStatus || {}
      })
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      // Em caso de erro, definir valores padrão
      setFinancialSummary({
        grossRevenue: 0,
        netRevenue: 0,
        stripeFees: 0,
        taxFees: 0,
        profit: 0,
        profitMargin: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        refunds: 0,
        pendingPayments: 0,
        productCost: 0,
        realProfit: 0,
        realProfitMargin: 0,
        netProfit: 0,
        netProfitMargin: 0
      })
    } finally {
      setLoading(false)
    }
  }, [selectedPeriod])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Configurações de tipos de relatório
  const reportTypeConfig = {
    sales: { 
      label: 'Vendas', 
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: TrendingUp 
    },
    inventory: { 
      label: 'Estoque', 
      color: 'bg-green-100 text-green-700 border-green-200',
      icon: Package 
    },
    customers: { 
      label: 'Clientes', 
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      icon: Users 
    },
    financial: { 
      label: 'Financeiro', 
      color: 'bg-orange-100 text-orange-700 border-orange-200',
      icon: DollarSign 
    },
    orders: { 
      label: 'Pedidos', 
      color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      icon: ShoppingCart 
    },
    products: { 
      label: 'Produtos', 
      color: 'bg-pink-100 text-pink-700 border-pink-200',
      icon: Box 
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Concluído' }
      case 'processing':
        return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Processando' }
      case 'failed':
        return { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', label: 'Erro' }
      default:
        return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', label: status }
    }
  }

  // Formatadores
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  // Filtrar relatórios
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || report.type === selectedType
    return matchesSearch && matchesType
  })

  // Gerar novo relatório
  const handleGenerateReport = async (type: string) => {
    setGenerating(true)
    try {
      // Simular geração
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newReport: Report = {
        id: Date.now().toString(),
        title: `Relatório de ${reportTypeConfig[type as keyof typeof reportTypeConfig]?.label || type} - ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
        description: `Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}`,
        type: type as any,
        dateGenerated: new Date().toISOString().split('T')[0],
        status: 'completed',
        size: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
        period: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      }
      
      setReports(prev => [newReport, ...prev])
      toast.success('Relatório gerado com sucesso!')
      setModal({ isOpen: false, type: null })
    } catch (error) {
      toast.error('Erro ao gerar relatório')
    } finally {
      setGenerating(false)
    }
  }

  // Exportar relatório
  const handleExport = (report: Report, format: 'pdf' | 'excel' | 'csv') => {
    toast.success(`Exportando ${report.title} em formato ${format.toUpperCase()}...`)
    // Aqui implementaria a exportação real
  }

  // Dados para gráficos
  const revenueByMonth = [
    { month: 'Jul', receita: 185000, lucro: 164500 },
    { month: 'Ago', receita: 198000, lucro: 176000 },
    { month: 'Set', receita: 215000, lucro: 191300 },
    { month: 'Out', receita: 232000, lucro: 206500 },
    { month: 'Nov', receita: 258000, lucro: 229600 },
    { month: 'Dez', receita: 245780, lucro: 218244 }
  ]

  const expenseBreakdown = [
    { name: 'Taxa Stripe (3.99%)', value: financialSummary.stripeFees, color: '#6366F1' },
    { name: 'Imposto NF (7%)', value: financialSummary.taxFees, color: '#F59E0B' },
    { name: 'Lucro Líquido', value: financialSummary.profit, color: '#10B981' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-uss-900 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando relatórios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Gerencie relatórios financeiros, vendas e análises detalhadas"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Relatórios' }
        ]}
        actions={
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchData}
              className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2.5 
                       rounded-xl hover:bg-gray-200 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Atualizar</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setModal({ isOpen: true, type: 'create' })}
              className="flex items-center space-x-2 bg-uss-900 hover:bg-uss-800 
                       text-white px-4 py-2.5 rounded-xl transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Relatório</span>
            </motion.button>
          </div>
        }
      />

      {/* Resumo Financeiro - Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Receita Bruta"
          value={formatCurrency(financialSummary.grossRevenue)}
          icon={<DollarSign className="w-5 h-5" />}
          trend="up"
          trendValue="+12.5%"
          description="Total em vendas"
        />
        
        <StatCard
          title="Receita Líquida"
          value={formatCurrency(financialSummary.netRevenue)}
          icon={<TrendingUp className="w-5 h-5" />}
          trend="up"
          trendValue={`${financialSummary.profitMargin.toFixed(1)}% margem`}
          description="Após taxas e impostos"
        />
        
        <StatCard
          title="Total de Pedidos"
          value={formatNumber(financialSummary.totalOrders)}
          icon={<ShoppingCart className="w-5 h-5" />}
          trend="up"
          trendValue="+8.3%"
          description="No período"
        />
        
        <StatCard
          title="Ticket Médio"
          value={formatCurrency(financialSummary.averageOrderValue)}
          icon={<CreditCard className="w-5 h-5" />}
          trend="up"
          trendValue="+3.2%"
          description="Por pedido"
        />
      </div>

      {/* Controle de Lucro - Valor Produto x Valor Vitrine */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Controle de Lucro</h3>
            <p className="text-sm text-gray-500">Análise de margem: Valor Vitrine vs Custo do Produto</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">
              Margem média: 40%
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Custo dos Produtos */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Custo dos Produtos</span>
              <Box className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(financialSummary.productCost)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              60% do valor de vitrine
            </p>
          </div>

          {/* Lucro Real */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-700 font-medium">Lucro Real</span>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-700">
              {formatCurrency(financialSummary.realProfit)}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded">
                {financialSummary.realProfitMargin.toFixed(1)}% margem
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Vitrine - Custo = Lucro Bruto
            </p>
          </div>

          {/* Total de Taxas */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-red-700 font-medium">Total de Taxas</span>
              <Percent className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-700">
              {formatCurrency(financialSummary.stripeFees + financialSummary.taxFees)}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded">
                {financialSummary.grossRevenue > 0 
                  ? (((financialSummary.stripeFees + financialSummary.taxFees) / financialSummary.grossRevenue) * 100).toFixed(1)
                  : '0'}%
              </span>
            </div>
            <p className="text-xs text-red-600 mt-2">
              Stripe + NF deduzidos
            </p>
          </div>

          {/* Lucro Mediante (Líquido) */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-green-700 font-medium">Lucro Mediante</span>
              <DollarSign className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-700">
              {formatCurrency(financialSummary.netProfit)}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded">
                {financialSummary.netProfitMargin.toFixed(1)}% margem
              </span>
            </div>
            <p className="text-xs text-green-600 mt-2">
              Lucro líquido no faturamento
            </p>
          </div>
        </div>

        {/* Barra de composição visual */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 mb-3">Composição do Faturamento</p>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
            <div 
              className="bg-gray-400 h-full transition-all" 
              style={{ width: `${(financialSummary.productCost / financialSummary.grossRevenue) * 100}%` }}
              title={`Custo: ${formatCurrency(financialSummary.productCost)}`}
            />
            <div 
              className="bg-red-400 h-full transition-all" 
              style={{ width: `${((financialSummary.stripeFees + financialSummary.taxFees) / financialSummary.grossRevenue) * 100}%` }}
              title={`Taxas: ${formatCurrency(financialSummary.stripeFees + financialSummary.taxFees)}`}
            />
            <div 
              className="bg-green-500 h-full transition-all" 
              style={{ width: `${(financialSummary.netProfit / financialSummary.grossRevenue) * 100}%` }}
              title={`Lucro: ${formatCurrency(financialSummary.netProfit)}`}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-400 rounded" />
                <span className="text-gray-600">Custo (60%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-400 rounded" />
                <span className="text-gray-600">Taxas (~11%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span className="text-gray-600">Lucro (~29%)</span>
              </div>
            </div>
            <span className="text-gray-500">
              Total: {formatCurrency(financialSummary.grossRevenue)}
            </span>
          </div>
        </div>
      </div>

      {/* Detalhamento de Taxas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Taxa Stripe</h3>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">3.99% + R$0.39</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {formatCurrency(financialSummary.stripeFees)}
          </p>
          <p className="text-sm text-gray-500">
            Cobrado pela API de pagamentos
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">% da receita</span>
              <span className="font-medium text-gray-900">
                {financialSummary.grossRevenue > 0 
                  ? ((financialSummary.stripeFees / financialSummary.grossRevenue) * 100).toFixed(2)
                  : '0'}%
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Imposto NF</h3>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">7%</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {formatCurrency(financialSummary.taxFees)}
          </p>
          <p className="text-sm text-gray-500">
            Nota fiscal sobre vendas
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Taxa fixa</span>
              <span className="font-medium text-gray-900">7.00%</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-green-900">Receita Líquida</h3>
            <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
              {financialSummary.profitMargin.toFixed(1)}%
            </span>
          </div>
          <p className="text-3xl font-bold text-green-700 mb-2">
            {formatCurrency(financialSummary.netRevenue)}
          </p>
          <p className="text-sm text-green-600">
            Receita após taxas (sem custo produto)
          </p>
          <div className="mt-4 pt-4 border-t border-green-200">
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Margem sobre receita</span>
              <span className="font-medium text-green-800">
                {financialSummary.profitMargin.toFixed(2)}%
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receita vs Lucro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Receita vs Lucro</h3>
              <p className="text-sm text-gray-500">Últimos 6 meses</p>
            </div>
            <BarChart3 className="w-6 h-6 text-uss-900" />
          </div>
          <div className="h-80">
            <AdminChart 
              data={revenueByMonth}
              type="bar"
              dataKey="receita"
              secondaryDataKey="lucro"
              xAxisKey="month"
              color="#034a6e"
              secondaryColor="#10B981"
              height={320}
            />
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-uss-900 rounded-full" />
              <span className="text-sm text-gray-600">Receita Bruta</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#10B981] rounded-full" />
              <span className="text-sm text-gray-600">Lucro Líquido</span>
            </div>
          </div>
        </motion.div>

        {/* Distribuição de Custos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Composição da Receita</h3>
              <p className="text-sm text-gray-500">Distribuição de custos</p>
            </div>
            <PieChart className="w-6 h-6 text-uss-900" />
          </div>
          <div className="h-64">
            <AdminChart 
              data={expenseBreakdown}
              type="pie"
              dataKey="value"
              height={256}
            />
          </div>
          <div className="space-y-3 mt-6">
            {expenseBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar relatórios..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl 
                         text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 
                         focus:ring-uss-900/20 focus:border-uss-900 transition-all"
              />
            </div>
          </div>

          {/* Período */}
          <div className="w-full lg:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Período</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl 
                       text-gray-900 focus:outline-none focus:ring-2 focus:ring-uss-900/20 
                       focus:border-uss-900 transition-all"
            >
              <option value="week">Última semana</option>
              <option value="month">Último mês</option>
              <option value="quarter">Último trimestre</option>
              <option value="year">Último ano</option>
            </select>
          </div>

          {/* Tipo */}
          <div className="w-full lg:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl 
                       text-gray-900 focus:outline-none focus:ring-2 focus:ring-uss-900/20 
                       focus:border-uss-900 transition-all"
            >
              <option value="all">Todos os tipos</option>
              <option value="financial">Financeiro</option>
              <option value="sales">Vendas</option>
              <option value="inventory">Estoque</option>
              <option value="customers">Clientes</option>
              <option value="orders">Pedidos</option>
              <option value="products">Produtos</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Lista de Relatórios */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Relatórios Gerados</h3>
              <p className="text-sm text-gray-500">{filteredReports.length} relatório(s) encontrado(s)</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredReports.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum relatório encontrado</p>
            </div>
          ) : (
            filteredReports.map((report, index) => {
              const typeConfig = reportTypeConfig[report.type]
              const statusConfig = getStatusConfig(report.status)
              const TypeIcon = typeConfig?.icon || FileText
              const StatusIcon = statusConfig.icon

              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-xl border ${typeConfig?.color || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        <TypeIcon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-medium text-gray-900 truncate">{report.title}</h4>
                          <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{report.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(report.dateGenerated).toLocaleDateString('pt-BR')}
                          </span>
                          {report.period && (
                            <span>Período: {report.period}</span>
                          )}
                          <span>{report.size}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setModal({ isOpen: true, type: 'view', report })}
                        className="p-2 rounded-lg text-gray-400 hover:text-uss-900 hover:bg-gray-100 
                                 transition-colors"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleExport(report, 'pdf')}
                        className="p-2 rounded-lg text-gray-400 hover:text-uss-900 hover:bg-gray-100 
                                 transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleExport(report, 'excel')}
                        className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 
                                 transition-colors"
                        title="Exportar Excel"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setModal({ isOpen: true, type: 'share', report })}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 
                                 transition-colors"
                        title="Compartilhar"
                      >
                        <Share className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </motion.div>

      {/* Modais */}
      <AnimatePresence>
        {modal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setModal({ isOpen: false, type: null })}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Criar Relatório */}
              {modal.type === 'create' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Gerar Novo Relatório</h3>
                    <button
                      onClick={() => setModal({ isOpen: false, type: null })}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <p className="text-gray-600">Selecione o tipo de relatório que deseja gerar:</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(reportTypeConfig).map(([key, config]) => {
                        const Icon = config.icon
                        return (
                          <button
                            key={key}
                            onClick={() => handleGenerateReport(key)}
                            disabled={generating}
                            className={`p-4 rounded-xl border-2 text-left transition-all hover:border-uss-900 
                                      hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                                      ${config.color.replace('text-', 'border-').split(' ')[2]}`}
                          >
                            <Icon className={`w-6 h-6 mb-2 ${config.color.split(' ')[1]}`} />
                            <p className="font-medium text-gray-900">{config.label}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Relatório de {config.label.toLowerCase()}
                            </p>
                          </button>
                        )
                      })}
                    </div>

                    {generating && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 text-uss-900 animate-spin" />
                        <span className="ml-3 text-gray-600">Gerando relatório...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Modal Visualizar */}
              {modal.type === 'view' && modal.report && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Detalhes do Relatório</h3>
                    <button
                      onClick={() => setModal({ isOpen: false, type: null })}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{modal.report.title}</h4>
                      <p className="text-gray-600 text-sm">{modal.report.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Tipo</p>
                        <p className="font-medium text-gray-900 capitalize">
                          {reportTypeConfig[modal.report.type]?.label || modal.report.type}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-medium text-gray-900">{getStatusConfig(modal.report.status).label}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Gerado em</p>
                        <p className="font-medium text-gray-900">
                          {new Date(modal.report.dateGenerated).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tamanho</p>
                        <p className="font-medium text-gray-900">{modal.report.size}</p>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleExport(modal.report!, 'pdf')}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 
                                 bg-uss-900 text-white rounded-xl hover:bg-uss-800 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Download PDF
                      </button>
                      <button
                        onClick={() => handleExport(modal.report!, 'excel')}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 
                                 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        Exportar Excel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Compartilhar */}
              {modal.type === 'share' && modal.report && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Compartilhar Relatório</h3>
                    <button
                      onClick={() => setModal({ isOpen: false, type: null })}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="font-medium text-gray-900">{modal.report.title}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email do destinatário
                      </label>
                      <input
                        type="email"
                        placeholder="email@exemplo.com"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl 
                                 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 
                                 focus:ring-uss-900/20 focus:border-uss-900 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mensagem (opcional)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Adicione uma mensagem..."
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl 
                                 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 
                                 focus:ring-uss-900/20 focus:border-uss-900 transition-all resize-none"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setModal({ isOpen: false, type: null })}
                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl 
                                 hover:bg-gray-200 transition-all"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          toast.success('Relatório enviado por email!')
                          setModal({ isOpen: false, type: null })
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 
                                 bg-uss-900 text-white rounded-xl hover:bg-uss-800 transition-all"
                      >
                        <Mail className="w-4 h-4" />
                        Enviar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}



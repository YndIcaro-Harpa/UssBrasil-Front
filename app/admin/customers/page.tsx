'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Users, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  DollarSign,
  Star,
  TrendingUp,
  UserCheck,
  UserX,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { exportToExcel, exportToPDF } from '@/services/export'
import { api } from '@/services/api'
import { CustomerModal } from '@/components/admin/CustomerModal'
import { Customer as ModalCustomer } from '@/hooks/use-admin-crud'
import { toast } from 'sonner'
import { TableSkeleton, StatsCardSkeleton } from '@/components/ui/SkeletonLoaders'
import { FadeInUp, AnimatedCard, StaggeredContainer } from '@/components/admin/PageTransition'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  status: 'active' | 'inactive'
  totalOrders: number
  totalSpent: number
  lastOrder: string
  registeredAt: string
  location: {
    city: string
    state: string
  }
  loyaltyPoints: number
  averageRating: number
}

interface UserStats {
  totalUsers: number
  activeUsers: number
  totalSpent: number
  avgOrderValue: number
  loyaltyPoints: number
  newUsersThisMonth: number
}

type SortKey = 'name' | 'totalSpent' | 'totalOrders' | 'registeredAt' | 'lastOrder'
type SortDirection = 'asc' | 'desc'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('totalSpent')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<ModalCustomer | undefined>(undefined)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')

  const statuses = ['all', 'active', 'inactive']

  // Função para buscar dados da API
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Buscar usuários e estatísticas em paralelo
      const [customersResponse, statsResponse] = await Promise.all([
        api.users.getCustomers({ limit: 100 }), // Fetch customers with stats
        api.users.getStats()
      ])
      
      // Transformar dados do backend para o formato esperado pelo componente
      const customersList = customersResponse.customers || []
      const transformedCustomers: Customer[] = customersList.map((customer: any) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        avatar: customer.avatar, // Check if CustomerStats has avatar
        status: customer.status === 'active' ? 'active' : 'inactive',
        totalOrders: customer.totalOrders,
        totalSpent: customer.totalSpent,
        lastOrder: customer.lastOrder || customer.registeredAt,
        registeredAt: customer.registeredAt,
        location: {
          city: customer.location?.city || 'N/A',
          state: customer.location?.state || 'N/A'
        },
        loyaltyPoints: customer.loyaltyPoints || 0,
        averageRating: customer.averageRating || 5.0
      }))
      
      setCustomers(transformedCustomers)
      setStats({
        totalUsers: statsResponse.totalUsers,
        activeUsers: statsResponse.activeUsers,
        totalSpent: (statsResponse as any).totalSpent || statsResponse.totalRevenue || 0,
        avgOrderValue: (statsResponse as any).avgOrderValue || statsResponse.averageRevenuePerUser || 0,
        loyaltyPoints: (statsResponse as any).loyaltyPoints || 0,
        newUsersThisMonth: statsResponse.newUsersThisMonth
      })
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar dados dos clientes. Verifique se o servidor está rodando.')
      toast.error('Erro ao carregar clientes')
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar dados ao montar componente
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Export functions
  const handleExportExcel = () => {
    const columns = [
      { key: 'name', label: 'Nome' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Telefone' },
      { key: 'status', label: 'Status', format: (v: string) => v === 'active' ? 'Ativo' : 'Inativo' },
      { key: 'totalOrders', label: 'Pedidos' },
      { key: 'totalSpent', label: 'Total Gasto', format: (v: number) => formatCurrency(v) },
      { key: 'city', label: 'Cidade' },
      { key: 'state', label: 'Estado' },
      { key: 'registeredAt', label: 'Cadastro', format: (v: string) => formatDate(v) }
    ]
    const data = filteredAndSortedCustomers.map(c => ({
      name: c.name,
      email: c.email,
      phone: c.phone,
      status: c.status,
      totalOrders: c.totalOrders,
      totalSpent: c.totalSpent,
      city: c.location.city,
      state: c.location.state,
      registeredAt: c.registeredAt
    }))
    exportToExcel(data, columns, 'clientes')
    setShowExportMenu(false)
  }

  const handleExportPDF = () => {
    const columns = [
      { key: 'name', label: 'Nome' },
      { key: 'email', label: 'Email' },
      { key: 'status', label: 'Status', format: (v: string) => v === 'active' ? 'Ativo' : 'Inativo' },
      { key: 'totalOrders', label: 'Pedidos', format: (v: number) => v.toString() },
      { key: 'totalSpent', label: 'Total Gasto', format: (v: number) => formatCurrency(v) }
    ]
    const data = filteredAndSortedCustomers.map(c => ({
      name: c.name,
      email: c.email,
      status: c.status,
      totalOrders: c.totalOrders,
      totalSpent: c.totalSpent
    }))
    exportToPDF(data, {
      title: 'Relatório de Clientes',
      columns
    })
    setShowExportMenu(false)
  }

  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = customers.filter(customer => 
      (customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
       customer.phone.includes(searchTerm)) &&
      (statusFilter === 'all' || customer.status === statusFilter)
    )

    return filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortKey) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'registeredAt':
        case 'lastOrder':
          aValue = new Date(a[sortKey]).getTime()
          bValue = new Date(b[sortKey]).getTime()
          break
        default:
          aValue = a[sortKey]
          bValue = b[sortKey]
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
  }, [customers, searchTerm, statusFilter, sortKey, sortDirection])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('desc')
    }
  }

  const handleOpenModal = (mode: 'create' | 'edit' | 'view', customer?: Customer) => {
    setModalMode(mode)
    if (customer) {
      // Map local Customer to ModalCustomer
      const modalCustomer: ModalCustomer = {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        avatar: customer.avatar,
        address: {
          street: '', // Not available in list view
          city: customer.location.city,
          state: customer.location.state,
          zipCode: '',
          country: 'Brasil'
        },
        totalOrders: customer.totalOrders,
        totalSpent: customer.totalSpent,
        isVip: customer.loyaltyPoints > 1000, // Example logic
        lastOrderDate: customer.lastOrder,
        createdAt: customer.registeredAt,
        updatedAt: customer.registeredAt
      }
      setSelectedCustomer(modalCustomer)
    } else {
      setSelectedCustomer(undefined)
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCustomer(undefined)
  }

  const handleSaveCustomer = async (data: any) => {
    try {
      if (modalMode === 'create') {
        await api.auth.register({
          name: data.name,
          email: data.email,
          password: data.password || 'Mudar123!', // Fallback if not provided
          phone: data.phone
        })
        toast.success('Cliente criado com sucesso!')
      } else if (modalMode === 'edit' && selectedCustomer) {
        await api.users.update(selectedCustomer.id, {
          name: data.name,
          email: data.email,
          phone: data.phone,
          // Map address fields if API supports updating address via user update
          // Otherwise might need separate address update call
        })
        toast.success('Cliente atualizado com sucesso!')
      }
      fetchData()
      handleCloseModal()
    } catch (error: any) {
      console.error('Erro ao salvar cliente:', error)
      if (error.message?.includes('Email already in use') || error.message?.includes('Email já está em uso')) {
        toast.error('Este email já está cadastrado.')
      } else {
        toast.error('Erro ao salvar cliente')
      }
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'inactive':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo'
      case 'inactive':
        return 'Inativo'
      default:
        return status
    }
  }

  const getCustomerTier = (totalSpent: number) => {
    if (totalSpent >= 50000) return { tier: 'VIP', color: 'text-purple-400' }
    if (totalSpent >= 20000) return { tier: 'Gold', color: 'text-yellow-400' }
    if (totalSpent >= 5000) return { tier: 'Silver', color: 'text-gray-300' }
    return { tier: 'Bronze', color: 'text-amber-600' }
  }

  // Estatísticas - usar dados da API ou calcular dos clientes locais
  const totalCustomers = stats?.totalUsers || customers.length
  const activeCustomers = stats?.activeUsers || customers.filter(c => c.status === 'active').length
  const totalRevenue = stats?.totalSpent || customers.reduce((sum, c) => sum + c.totalSpent, 0)
  const avgCustomerValue = stats?.avgOrderValue || (totalRevenue / (totalCustomers || 1))

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-56 bg-gray-200 rounded animate-pulse" />
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
        <TableSkeleton rows={8} columns={6} />
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
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-amber-700 text-xs flex-1">{error}</p>
          <button 
            onClick={fetchData}
            className="text-amber-600 hover:text-amber-800 font-medium text-xs"
          >
            Tentar novamente
          </button>
        </motion.div>
      )}
      
      {/* Compact Header */}
      <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold text-gray-900">Clientes</h1>
          <span className="text-[10px] text-gray-500">{totalCustomers} total</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          {/* Export Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-md text-[10px] text-gray-600 transition-colors"
            >
              <Download className="w-3 h-3" />
              <ChevronDown className="w-3 h-3" />
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-t-lg"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />
                  <span>Excel</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-b-lg"
                >
                  <FileText className="w-3.5 h-3.5 text-red-600" />
                  <span>PDF</span>
                </button>
              </div>
            )}
          </div>
          
          <button
            onClick={() => handleOpenModal('create')}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-medium rounded-md transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Novo</span>
          </button>
        </div>
      </div>

      {/* Mini Stats - 4 columns */}
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { label: 'Total', value: totalCustomers, icon: Users, color: 'text-blue-500' },
          { label: 'Ativos', value: activeCustomers, icon: UserCheck, color: 'text-emerald-500' },
          { label: 'Receita', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-purple-500' },
          { label: 'Ticket', value: formatCurrency(avgCustomerValue), icon: TrendingUp, color: 'text-amber-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-lg p-2 border border-gray-100">
            <div className="flex items-center gap-1 mb-0.5">
              <stat.icon className={`w-3 h-3 ${stat.color}`} />
              <span className="text-[9px] text-gray-500 uppercase">{stat.label}</span>
            </div>
            <p className="text-xs font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Compact Filters */}
      <div className="bg-white border border-gray-100 rounded-lg p-2 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'Todos' : getStatusText(status)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Compact Customers Table */}
      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th 
                  className="text-left px-2.5 py-2 text-[10px] font-semibold text-gray-600 uppercase cursor-pointer hover:text-gray-900"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    <span>Cliente</span>
                    {sortKey === 'name' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
                <th className="text-left px-2.5 py-2 text-[10px] font-semibold text-gray-600 uppercase hidden md:table-cell">Contato</th>
                <th 
                  className="text-left px-2.5 py-2 text-[10px] font-semibold text-gray-600 uppercase cursor-pointer hover:text-gray-900"
                  onClick={() => handleSort('totalOrders')}
                >
                  <div className="flex items-center gap-1">
                    <span>Pedidos</span>
                    {sortKey === 'totalOrders' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
                <th 
                  className="text-left px-2.5 py-2 text-[10px] font-semibold text-gray-600 uppercase cursor-pointer hover:text-gray-900 hidden sm:table-cell"
                  onClick={() => handleSort('totalSpent')}
                >
                  <div className="flex items-center gap-1">
                    <span>Total</span>
                    {sortKey === 'totalSpent' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 lg:w-4 lg:h-4" /> : <ArrowDown className="w-3 h-3 lg:w-4 lg:h-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="text-left p-2 lg:p-4 text-gray-700 font-medium text-xs lg:text-sm cursor-pointer hover:text-gray-900 transition-colors hidden sm:table-cell"
                  onClick={() => handleSort('lastOrder')}
                >
                  <div className="flex items-center space-x-1">
                    <span className="hidden lg:inline">Último Pedido</span>
                    <span className="lg:hidden">Último</span>
                    {sortKey === 'lastOrder' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 lg:w-4 lg:h-4" /> : <ArrowDown className="w-3 h-3 lg:w-4 lg:h-4" />
                    )}
                  </div>
                </th>
                <th className="text-left p-2 lg:p-4 text-gray-700 font-medium text-xs lg:text-sm hidden md:table-cell">Status</th>
                <th className="text-left p-2 lg:p-4 text-gray-700 font-medium text-xs lg:text-sm">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedCustomers.map((customer, index) => {
                const tier = getCustomerTier(customer.totalSpent)
                return (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                  >
                    <td className="p-2 lg:p-4">
                      <div className="flex items-center space-x-2 lg:space-x-3">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-r from-[#001941] to-[blue-400] flex items-center justify-center text-white text-xs lg:text-sm font-medium flex-shrink-0">
                          {customer.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-gray-900 font-medium text-xs lg:text-sm truncate">{customer.name}</h4>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-medium ${tier.color}`}>
                              {tier.tier}
                            </span>
                            <div className="hidden sm:flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-gray-400 text-xs">{customer.averageRating}</span>
                            </div>
                          </div>
                          <p className="text-gray-400 text-xs md:hidden truncate">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 lg:p-4 hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-600 text-xs lg:text-sm truncate max-w-[150px]">{customer.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-600 text-xs lg:text-sm">{customer.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 lg:p-4 hidden lg:table-cell">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600 text-xs lg:text-sm">
                          {customer.location.city}, {customer.location.state}
                        </span>
                      </div>
                    </td>
                    <td className="p-2 lg:p-4">
                      <div className="flex items-center space-x-1">
                        <ShoppingBag className="w-3 h-3 lg:w-4 lg:h-4 text-blue-500" />
                        <span className="text-gray-900 font-medium text-xs lg:text-sm">{customer.totalOrders}</span>
                      </div>
                    </td>
                    <td className="p-2 lg:p-4 hidden sm:table-cell">
                      <div>
                        <span className="text-gray-900 font-bold text-xs lg:text-sm">{formatCurrency(customer.totalSpent)}</span>
                        <p className="text-gray-500 text-xs hidden lg:block">
                          {customer.loyaltyPoints} pontos
                        </p>
                      </div>
                    </td>
                    <td className="p-2 lg:p-4 hidden sm:table-cell">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600 text-xs lg:text-sm">{formatDate(customer.lastOrder)}</span>
                      </div>
                    </td>
                    <td className="p-2 lg:p-4 hidden md:table-cell">
                      <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(customer.status)}`}>
                        {getStatusText(customer.status)}
                      </span>
                    </td>
                    <td className="p-2 lg:p-4">
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => handleOpenModal('view', customer)}
                          className="p-1.5 lg:p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                        >
                          <Eye className="w-3 h-3 lg:w-4 lg:h-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenModal('edit', customer)}
                          className="p-1.5 lg:p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all hidden sm:block"
                        >
                          <Edit className="w-3 h-3 lg:w-4 lg:h-4" />
                        </button>
                        <button className="p-1.5 lg:p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
                          <MoreHorizontal className="w-3 h-3 lg:w-4 lg:h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>

          {filteredAndSortedCustomers.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum cliente encontrado</h3>
              <p className="text-gray-500">Tente ajustar os filtros ou adicione novos clientes</p>
            </div>
          )}
        </div>
      </div>

      {/* Customer Modal */}
      {isModalOpen && (
        <CustomerModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          customer={selectedCustomer}
          mode={modalMode}
          onSave={handleSaveCustomer}
        />
      )}
    </div>
  )
}


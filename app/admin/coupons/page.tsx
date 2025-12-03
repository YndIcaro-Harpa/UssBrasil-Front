'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { 
  Plus,
  Ticket,
  Percent,
  DollarSign,
  Truck,
  Calendar,
  Users,
  Copy,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'
import PageHeader from '@/components/admin/PageHeader'
import StatCard from '@/components/admin/StatCard'
import PremiumButton from '@/components/ui/PremiumButton'
import { StatCardSkeleton, TableSkeleton } from '@/components/ui/SkeletonLoaders'
import { FadeInUp } from '@/components/admin/PageTransition'
import { toast } from 'sonner'

interface Coupon {
  id: string
  code: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING'
  value: number
  description?: string
  minAmount?: number
  maxAmount?: number
  usageLimit?: number
  usageCount: number
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
}

export default function AdminCouponsPage() {
  const { token, isLoading: authLoading } = useAdminAuth()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)

  // Mock data para demonstração
  const mockCoupons: Coupon[] = [
    {
      id: '1',
      code: 'PRIMEIRACOMPRA',
      type: 'PERCENTAGE',
      value: 10,
      description: 'Desconto de 10% na primeira compra',
      minAmount: 100,
      usageLimit: 1000,
      usageCount: 245,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      isActive: true,
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      code: 'FRETEGRATIS',
      type: 'FREE_SHIPPING',
      value: 0,
      description: 'Frete grátis em compras acima de R$ 200',
      minAmount: 200,
      usageCount: 158,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      isActive: true,
      createdAt: '2024-01-01'
    },
    {
      id: '3',
      code: 'DESCONTO50',
      type: 'FIXED_AMOUNT',
      value: 50,
      description: 'R$ 50 de desconto em compras acima de R$ 500',
      minAmount: 500,
      maxAmount: 50,
      usageLimit: 500,
      usageCount: 312,
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      isActive: false,
      createdAt: '2024-01-01'
    }
  ]

  const fetchCoupons = useCallback(async () => {
    setLoading(true)
    try {
      // Em produção, buscar do backend
      await new Promise(resolve => setTimeout(resolve, 500))
      setCoupons(mockCoupons)
    } catch (error) {
      toast.error('Erro ao carregar cupons')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCoupons()
  }, [fetchCoupons])

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          coupon.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterStatus === 'all') return matchesSearch
    if (filterStatus === 'active') return matchesSearch && coupon.isActive && new Date(coupon.endDate) >= new Date()
    if (filterStatus === 'expired') return matchesSearch && (!coupon.isActive || new Date(coupon.endDate) < new Date())
    
    return matchesSearch
  })

  const activeCoupons = coupons.filter(c => c.isActive && new Date(c.endDate) >= new Date()).length
  const totalUsage = coupons.reduce((sum, c) => sum + c.usageCount, 0)
  const expiredCoupons = coupons.filter(c => !c.isActive || new Date(c.endDate) < new Date()).length

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Código copiado!')
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'PERCENTAGE': return 'Percentual'
      case 'FIXED_AMOUNT': return 'Valor Fixo'
      case 'FREE_SHIPPING': return 'Frete Grátis'
      default: return type
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PERCENTAGE': return <Percent className="w-4 h-4" />
      case 'FIXED_AMOUNT': return <DollarSign className="w-4 h-4" />
      case 'FREE_SHIPPING': return <Truck className="w-4 h-4" />
      default: return <Ticket className="w-4 h-4" />
    }
  }

  const formatValue = (coupon: Coupon) => {
    switch (coupon.type) {
      case 'PERCENTAGE': return `${coupon.value}%`
      case 'FIXED_AMOUNT': return `R$ ${coupon.value.toFixed(2)}`
      case 'FREE_SHIPPING': return 'Grátis'
      default: return coupon.value
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <TableSkeleton rows={5} columns={7} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Cupons de Desconto"
        description={`Gerencie ${coupons.length} cupons`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Cupons' }
        ]}
        showSearch={true}
        onSearch={setSearchTerm}
        searchPlaceholder="Buscar cupons..."
        actions={
          <PremiumButton
            variant="primary"
            size="md"
            icon={<Plus className="w-5 h-5" />}
            onClick={() => setShowCreateModal(true)}
            glowEffect={true}
          >
            <span className="hidden sm:inline">Novo Cupom</span>
            <span className="sm:hidden">Novo</span>
          </PremiumButton>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Cupons Ativos"
          value={activeCoupons}
          icon={<CheckCircle className="w-5 h-5" />}
          trend="up"
          trendValue={`${Math.round((activeCoupons / coupons.length) * 100) || 0}%`}
        />
        <StatCard
          title="Usos Totais"
          value={totalUsage.toLocaleString()}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          title="Expirados"
          value={expiredCoupons}
          icon={<XCircle className="w-5 h-5" />}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'active', 'expired'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filterStatus === status
                ? 'bg-[#001941] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'all' && 'Todos'}
            {status === 'active' && 'Ativos'}
            {status === 'expired' && 'Expirados'}
          </button>
        ))}
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Código</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Valor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Usos</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden lg:table-cell">Validade</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCoupons.map((coupon) => {
                const isExpired = !coupon.isActive || new Date(coupon.endDate) < new Date()
                
                return (
                  <motion.tr
                    key={coupon.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Código */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                          <Ticket className="w-4 h-4 text-[#001941]" />
                          <span className="font-mono font-bold text-gray-800">{coupon.code}</span>
                        </div>
                        <button
                          onClick={() => copyCode(coupon.code)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Copiar código"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      {coupon.description && (
                        <p className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">
                          {coupon.description}
                        </p>
                      )}
                    </td>

                    {/* Tipo */}
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${
                          coupon.type === 'PERCENTAGE' ? 'bg-blue-100 text-blue-600' :
                          coupon.type === 'FIXED_AMOUNT' ? 'bg-green-100 text-green-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          {getTypeIcon(coupon.type)}
                        </div>
                        <span className="text-sm text-gray-700">{getTypeLabel(coupon.type)}</span>
                      </div>
                    </td>

                    {/* Valor */}
                    <td className="px-4 py-4">
                      <span className="font-semibold text-gray-900">{formatValue(coupon)}</span>
                      {coupon.minAmount && (
                        <p className="text-xs text-gray-500">Mín: R$ {coupon.minAmount}</p>
                      )}
                    </td>

                    {/* Usos */}
                    <td className="px-4 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">
                          {coupon.usageCount}
                          {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                        </span>
                      </div>
                      {coupon.usageLimit && (
                        <div className="w-20 h-1.5 bg-gray-200 rounded-full mt-1">
                          <div 
                            className="h-full bg-[#001941] rounded-full"
                            style={{ width: `${Math.min((coupon.usageCount / coupon.usageLimit) * 100, 100)}%` }}
                          />
                        </div>
                      )}
                    </td>

                    {/* Validade */}
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {formatDate(coupon.startDate)} - {formatDate(coupon.endDate)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        isExpired
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {isExpired ? (
                          <><XCircle className="w-3 h-3" /> Expirado</>
                        ) : (
                          <><CheckCircle className="w-3 h-3" /> Ativo</>
                        )}
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingCoupon(coupon)}
                          className="p-2 text-gray-500 hover:text-[#001941] hover:bg-gray-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredCoupons.length === 0 && (
          <div className="text-center py-12">
            <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum cupom encontrado</p>
          </div>
        )}
      </div>
    </div>
  )
}


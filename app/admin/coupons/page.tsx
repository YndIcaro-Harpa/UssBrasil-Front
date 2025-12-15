'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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
  CheckCircle,
  XCircle,
  Loader2,
  X,
  Save
} from 'lucide-react'
import PageHeader from '@/components/admin/PageHeader'
import StatCard from '@/components/admin/StatCard'
import PremiumButton from '@/components/ui/PremiumButton'
import { StatCardSkeleton, TableSkeleton } from '@/components/ui/SkeletonLoaders'
import { FadeInUp, AnimatedCard, StaggeredContainer } from '@/components/admin/PageTransition'
import { api, Coupon } from '@/services/api'
import { toast } from 'sonner'

export default function AdminCouponsPage() {
  const { token, isLoading: authLoading } = useAdminAuth()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all')
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING',
    value: 0,
    minAmount: 0,
    maxAmount: 0,
    usageLimit: 0,
    userLimit: 0,
    startDate: '',
    endDate: '',
    isActive: true
  })

  // Fetch coupons from API
  const fetchCoupons = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.coupons.getAll()
      setCoupons(response?.coupons || [])
    } catch (error: any) {
      console.error('[Admin Coupons] Erro:', error)
      toast.error('Erro ao carregar cupons')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCoupons()
  }, [fetchCoupons])

  // Handle delete
  const handleDelete = async (couponId: string, couponCode: string) => {
    if (!confirm(`Tem certeza que deseja excluir o cupom "${couponCode}"?`)) return

    setDeleting(couponId)
    try {
      await api.coupons.delete(couponId, token || undefined)
      toast.success('Cupom excluído com sucesso!')
      fetchCoupons()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir cupom')
    } finally {
      setDeleting(null)
    }
  }

  // Open modal for create/edit
  const openModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon)
      setFormData({
        code: coupon.code,
        description: coupon.description || '',
        type: coupon.type,
        value: coupon.value,
        minAmount: coupon.minAmount || 0,
        maxAmount: coupon.maxAmount || 0,
        usageLimit: coupon.usageLimit || 0,
        userLimit: coupon.userLimit || 0,
        startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
        endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : '',
        isActive: coupon.isActive
      })
    } else {
      setEditingCoupon(null)
      const today = new Date().toISOString().split('T')[0]
      const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      setFormData({
        code: '',
        description: '',
        type: 'PERCENTAGE',
        value: 10,
        minAmount: 100,
        maxAmount: 0,
        usageLimit: 100,
        userLimit: 1,
        startDate: today,
        endDate: nextMonth,
        isActive: true
      })
    }
    setShowModal(true)
  }

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        minAmount: formData.minAmount || undefined,
        maxAmount: formData.maxAmount || undefined,
        usageLimit: formData.usageLimit || undefined,
        userLimit: formData.userLimit || undefined,
      }

      if (editingCoupon) {
        await api.coupons.update(editingCoupon.id, payload, token || undefined)
        toast.success('Cupom atualizado com sucesso!')
      } else {
        await api.coupons.create(payload, token || undefined)
        toast.success('Cupom criado com sucesso!')
      }
      setShowModal(false)
      fetchCoupons()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar cupom')
    } finally {
      setSaving(false)
    }
  }

  // Filter coupons
  const filteredCoupons = useMemo(() => {
    return coupons.filter(coupon => {
      const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            coupon.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const isExpired = !coupon.isActive || new Date(coupon.endDate) < new Date()
      
      if (filterStatus === 'all') return matchesSearch
      if (filterStatus === 'active') return matchesSearch && !isExpired
      if (filterStatus === 'expired') return matchesSearch && isExpired
      
      return matchesSearch
    })
  }, [coupons, searchTerm, filterStatus])

  // Stats
  const stats = useMemo(() => {
    const total = coupons.length
    const active = coupons.filter(c => c.isActive && new Date(c.endDate) >= new Date()).length
    const expired = coupons.filter(c => !c.isActive || new Date(c.endDate) < new Date()).length
    const totalUsage = coupons.reduce((sum, c) => sum + c.usageCount, 0)
    return { total, active, expired, totalUsage }
  }, [coupons])

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

  if (loading || authLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
      <FadeInUp>
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
            <div className="flex gap-2">
              <PremiumButton
                variant="secondary"
                size="md"
                icon={<RefreshCw className="w-4 h-4" />}
                onClick={fetchCoupons}
              >
                <span className="hidden sm:inline">Atualizar</span>
              </PremiumButton>
              <PremiumButton
                variant="primary"
                size="md"
                icon={<Plus className="w-5 h-5" />}
                onClick={() => openModal()}
                glowEffect={true}
              >
                <span className="hidden sm:inline">Novo Cupom</span>
                <span className="sm:hidden">Novo</span>
              </PremiumButton>
            </div>
          }
        />
      </FadeInUp>

      {/* Stats */}
      <StaggeredContainer className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <AnimatedCard>
          <StatCard
            title="Total de Cupons"
            value={stats.total}
            icon={<Ticket className="w-5 h-5" />}
          />
        </AnimatedCard>
        <AnimatedCard>
          <StatCard
            title="Cupons Ativos"
            value={stats.active}
            icon={<CheckCircle className="w-5 h-5" />}
            trend="up"
            trendValue={`${Math.round((stats.active / stats.total) * 100) || 0}%`}
          />
        </AnimatedCard>
        <AnimatedCard>
          <StatCard
            title="Usos Totais"
            value={stats.totalUsage.toLocaleString()}
            icon={<Users className="w-5 h-5" />}
          />
        </AnimatedCard>
        <AnimatedCard>
          <StatCard
            title="Expirados"
            value={stats.expired}
            icon={<XCircle className="w-5 h-5" />}
          />
        </AnimatedCard>
      </StaggeredContainer>

      {/* Filter Tabs */}
      <AnimatedCard>
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
              {status === 'all' && `Todos (${stats.total})`}
              {status === 'active' && `Ativos (${stats.active})`}
              {status === 'expired' && `Expirados (${stats.expired})`}
            </button>
          ))}
        </div>
      </AnimatedCard>

      {/* Coupons Table */}
      <AnimatedCard>
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
                      <td className="px-4 py-4">
                        <span className="font-semibold text-gray-900">{formatValue(coupon)}</span>
                        {coupon.minAmount && (
                          <p className="text-xs text-gray-500">Mín: R$ {coupon.minAmount}</p>
                        )}
                      </td>
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
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {formatDate(coupon.startDate)} - {formatDate(coupon.endDate)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          isExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {isExpired ? (
                            <><XCircle className="w-3 h-3" /> Expirado</>
                          ) : (
                            <><CheckCircle className="w-3 h-3" /> Ativo</>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openModal(coupon)}
                            className="p-2 text-gray-500 hover:text-[#001941] hover:bg-gray-100 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id, coupon.code)}
                            disabled={deleting === coupon.id}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Excluir"
                          >
                            {deleting === coupon.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
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
      </AnimatedCard>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001941] focus:border-[#001941] font-mono uppercase"
                  placeholder="EX: DESCONTO10"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001941] focus:border-[#001941]"
                  placeholder="Descrição do cupom"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001941] focus:border-[#001941]"
                    required
                  >
                    <option value="PERCENTAGE">Percentual (%)</option>
                    <option value="FIXED_AMOUNT">Valor Fixo (R$)</option>
                    <option value="FREE_SHIPPING">Frete Grátis</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor {formData.type === 'PERCENTAGE' ? '(%)' : formData.type === 'FIXED_AMOUNT' ? '(R$)' : ''}
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001941] focus:border-[#001941]"
                    min="0"
                    step={formData.type === 'PERCENTAGE' ? '1' : '0.01'}
                    disabled={formData.type === 'FREE_SHIPPING'}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Mínimo (R$)</label>
                  <input
                    type="number"
                    value={formData.minAmount}
                    onChange={(e) => setFormData({ ...formData, minAmount: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001941] focus:border-[#001941]"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Limite de Usos</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001941] focus:border-[#001941]"
                    min="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Início *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001941] focus:border-[#001941]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001941] focus:border-[#001941]"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-[#001941] focus:ring-[#001941] border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Cupom ativo</label>
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-[#001941] text-white rounded-lg hover:bg-[#002a6b] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                  ) : (
                    <><Save className="w-4 h-4" /> {editingCoupon ? 'Atualizar' : 'Criar'}</>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}


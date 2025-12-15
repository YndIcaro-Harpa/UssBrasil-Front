'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  ArrowUp,
  ArrowDown,
  Package,
  Tag,
  Grid,
  Download,
  Loader2,
  RefreshCw,
  X,
  Save,
  FileSpreadsheet,
  FileText,
  Palette,
  Globe,
  Image
} from 'lucide-react'
import Link from 'next/link'
import PageHeader from '@/components/admin/PageHeader'
import StatCard from '@/components/admin/StatCard'
import PremiumButton from '@/components/ui/PremiumButton'
import { TableSkeleton, StatsCardSkeleton } from '@/components/ui/SkeletonLoaders'
import { FadeInUp, AnimatedCard, StaggeredContainer } from '@/components/admin/PageTransition'
import { api, Brand } from '@/services/api'
import { toast } from 'sonner'

type SortKey = 'name' | 'products' | 'createdAt'
type SortDirection = 'asc' | 'desc'

export default function BrandsPage() {
  const { token, isLoading: authLoading } = useAdminAuth()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logo: '',
    color: '#000000',
    website: '',
    isActive: true
  })

  // Fetch brands
  const fetchBrands = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.brands.getAll()
      setBrands(response || [])
    } catch (error: any) {
      console.error('[Admin Brands] Erro:', error)
      toast.error('Erro ao carregar marcas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBrands()
  }, [fetchBrands])

  // Handle delete
  const handleDelete = async (brandId: string, brandName: string) => {
    if (!confirm(`Tem certeza que deseja excluir a marca "${brandName}"?`)) return

    setDeleting(brandId)
    try {
      await api.brands.delete(brandId, token || undefined)
      toast.success('Marca excluída com sucesso!')
      fetchBrands()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir marca')
    } finally {
      setDeleting(null)
    }
  }

  // Open modal for create/edit
  const openModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand)
      setFormData({
        name: brand.name,
        slug: brand.slug || '',
        description: brand.description || '',
        logo: brand.logo || '',
        color: brand.color || '#000000',
        website: '',
        isActive: brand.isActive
      })
    } else {
      setEditingBrand(null)
      setFormData({
        name: '',
        slug: '',
        description: '',
        logo: '',
        color: '#000000',
        website: '',
        isActive: true
      })
    }
    setShowModal(true)
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (editingBrand) {
        await api.brands.update(editingBrand.id, formData, token || undefined)
        toast.success('Marca atualizada com sucesso!')
      } else {
        await api.brands.create(formData, token || undefined)
        toast.success('Marca criada com sucesso!')
      }
      setShowModal(false)
      fetchBrands()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar marca')
    } finally {
      setSaving(false)
    }
  }

  // Filter and sort brands
  const filteredBrands = useMemo(() => {
    let filtered = [...brands]

    // Filter by search
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(b => 
        b.name.toLowerCase().includes(search) ||
        b.slug?.toLowerCase().includes(search)
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => 
        statusFilter === 'active' ? b.isActive : !b.isActive
      )
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortKey) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'products':
          comparison = (a._count?.products || 0) - (b._count?.products || 0)
          break
        case 'createdAt':
          comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [brands, searchTerm, statusFilter, sortKey, sortDirection])

  // Stats
  const stats = useMemo(() => {
    const total = brands.length
    const active = brands.filter(b => b.isActive).length
    const totalProducts = brands.reduce((sum, b) => sum + (b._count?.products || 0), 0)
    return { total, active, totalProducts }
  }, [brands])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return null
    return sortDirection === 'asc' ? 
      <ArrowUp className="w-4 h-4" /> : 
      <ArrowDown className="w-4 h-4" />
  }

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <StatsCardSkeleton key={i} />)}
        </div>
        <TableSkeleton rows={5} columns={6} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeInUp>
        <PageHeader
          title="Marcas"
          description="Gerencie as marcas dos seus produtos"
          actions={
            <div className="flex gap-2">
              <PremiumButton
                variant="outline"
                onClick={fetchBrands}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </PremiumButton>
              <PremiumButton onClick={() => openModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Marca
              </PremiumButton>
            </div>
          }
        />
      </FadeInUp>

      {/* Stats */}
      <StaggeredContainer className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AnimatedCard>
          <StatCard
            title="Total de Marcas"
            value={stats.total}
            icon={<Tag className="w-5 h-5" />}
          />
        </AnimatedCard>
        <AnimatedCard>
          <StatCard
            title="Marcas Ativas"
            value={stats.active}
            icon={<Grid className="w-5 h-5" />}
          />
        </AnimatedCard>
        <AnimatedCard>
          <StatCard
            title="Total de Produtos"
            value={stats.totalProducts}
            icon={<Package className="w-5 h-5" />}
          />
        </AnimatedCard>
      </StaggeredContainer>

      {/* Filters */}
      <AnimatedCard>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Buscar marcas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
        </div>
      </AnimatedCard>

      {/* Table */}
      <AnimatedCard>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => toggleSort('name')}
                      className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      Marca
                      <SortIcon columnKey="name" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cor
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => toggleSort('products')}
                      className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      Produtos
                      <SortIcon columnKey="products" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBrands.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Tag className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">Nenhuma marca encontrada</p>
                    </td>
                  </tr>
                ) : (
                  filteredBrands.map((brand) => (
                    <motion.tr
                      key={brand.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {brand.logo ? (
                            <img
                              src={brand.logo}
                              alt={brand.name}
                              className="w-10 h-10 rounded-lg object-contain border"
                            />
                          ) : (
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: brand.color || '#000' }}
                            >
                              {brand.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{brand.name}</p>
                            <p className="text-sm text-gray-500">{brand.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: brand.color || '#000' }}
                          />
                          <span className="text-sm text-gray-600 font-mono">
                            {brand.color || '#000000'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-gray-600">
                          <Package className="w-4 h-4" />
                          {brand._count?.products || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          brand.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {brand.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal(brand)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(brand.id, brand.name)}
                            disabled={deleting === brand.id}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Excluir"
                          >
                            {deleting === brand.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AnimatedCard>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingBrand ? 'Editar Marca' : 'Nova Marca'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Apple, Samsung..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrição da marca..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor da Marca
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL do Logo
                </label>
                <input
                  type="text"
                  value={formData.logo}
                  onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {editingBrand ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

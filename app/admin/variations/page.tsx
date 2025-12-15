'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { 
  Edit, 
  Trash2, 
  Plus,
  ArrowUp,
  ArrowDown,
  Package,
  Palette,
  HardDrive,
  Loader2,
  RefreshCw,
  X,
  Save,
  Layers,
  Search
} from 'lucide-react'
import PageHeader from '@/components/admin/PageHeader'
import StatCard from '@/components/admin/StatCard'
import PremiumButton from '@/components/ui/PremiumButton'
import { TableSkeleton, StatsCardSkeleton } from '@/components/ui/SkeletonLoaders'
import { FadeInUp, AnimatedCard, StaggeredContainer } from '@/components/admin/PageTransition'
import { api, Variation, Product, Supplier } from '@/services/api'
import { toast } from 'sonner'

type SortKey = 'name' | 'price' | 'stock' | 'createdAt'
type SortDirection = 'asc' | 'desc'

export default function VariationsPage() {
  const { token, isLoading: authLoading } = useAdminAuth()
  const [variations, setVariations] = useState<Variation[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 })
  
  const [searchTerm, setSearchTerm] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [productFilter, setProductFilter] = useState<string>('all')
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [editingVariation, setEditingVariation] = useState<Variation | null>(null)
  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    sku: '',
    colorName: '',
    colorCode: '#000000',
    storage: '',
    size: '',
    price: 0,
    discountPrice: 0,
    stock: 0,
    image: '',
    supplierId: '',
    isActive: true,
    condition: 'new' as 'new' | 'semi_new' | 'used'
  })

  // Fetch data
  const fetchVariations = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const [variationsResponse, productsResponse, suppliersResponse] = await Promise.all([
        api.variations.getAll({ page, limit: 50 }),
        api.products.getAll({ limit: 100 }),
        api.suppliers.getAll()
      ])

      setVariations(variationsResponse || [])
      setPagination({
        page: page,
        total: (variationsResponse || []).length,
        pages: 1
      })
      setProducts(productsResponse?.data || [])
      setSuppliers(suppliersResponse || [])
    } catch (error: any) {
      console.error('[Admin Variations] Erro:', error)
      toast.error('Erro ao carregar variações')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) {
      fetchVariations()
    }
  }, [fetchVariations, token])

  // Handle delete
  const handleDelete = async (variationId: string, variationName: string) => {
    if (!confirm(`Tem certeza que deseja excluir a variação "${variationName}"?`)) return

    setDeleting(variationId)
    try {
      await api.variations.delete(variationId, token || undefined)
      toast.success('Variação excluída com sucesso!')
      fetchVariations()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir variação')
    } finally {
      setDeleting(null)
    }
  }

  // Open modal for create/edit
  const openModal = (variation?: Variation) => {
    if (variation) {
      setEditingVariation(variation)
      setFormData({
        productId: variation.productId,
        name: variation.name,
        sku: variation.sku || '',
        colorName: variation.colorName || '',
        colorCode: variation.colorCode || '#000000',
        storage: variation.storage || '',
        size: variation.size || '',
        price: variation.price,
        discountPrice: variation.discountPrice || 0,
        stock: variation.stock,
        image: variation.image || '',
        supplierId: variation.supplierId || '',
        isActive: variation.isActive,
        condition: (variation.condition as 'new' | 'semi_new' | 'used') || 'new'
      })
    } else {
      setEditingVariation(null)
      setFormData({
        productId: '',
        name: '',
        sku: '',
        colorName: '',
        colorCode: '#000000',
        storage: '',
        size: '',
        price: 0,
        discountPrice: 0,
        stock: 0,
        image: '',
        supplierId: '',
        isActive: true,
        condition: 'new'
      })
    }
    setShowModal(true)
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
        stock: Number(formData.stock)
      }

      if (editingVariation) {
        await api.variations.update(editingVariation.id, payload, token || undefined)
        toast.success('Variação atualizada com sucesso!')
      } else {
        await api.variations.create(payload, token || undefined)
        toast.success('Variação criada com sucesso!')
      }
      setShowModal(false)
      fetchVariations()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar variação')
    } finally {
      setSaving(false)
    }
  }

  // Filter and sort variations
  const filteredVariations = useMemo(() => {
    let filtered = [...variations]

    // Filter by search
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(v => 
        v.name.toLowerCase().includes(search) ||
        v.sku?.toLowerCase().includes(search) ||
        v.colorName?.toLowerCase().includes(search) ||
        v.product?.name?.toLowerCase().includes(search)
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(v => 
        statusFilter === 'active' ? v.isActive : !v.isActive
      )
    }

    // Filter by product
    if (productFilter !== 'all') {
      filtered = filtered.filter(v => v.productId === productFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortKey) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'price':
          comparison = a.price - b.price
          break
        case 'stock':
          comparison = a.stock - b.stock
          break
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [variations, searchTerm, statusFilter, productFilter, sortKey, sortDirection])

  // Stats
  const stats = useMemo(() => {
    const total = variations.length
    const active = variations.filter(v => v.isActive).length
    const totalStock = variations.reduce((sum, v) => sum + v.stock, 0)
    const lowStock = variations.filter(v => v.stock < 10 && v.stock > 0).length
    return { total, active, totalStock, lowStock }
  }, [variations])

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

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <StatsCardSkeleton key={i} />)}
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
          title="Variações de Produtos"
          description="Gerencie cores, tamanhos e armazenamento dos produtos"
          actions={
            <div className="flex gap-2">
              <PremiumButton
                variant="outline"
                onClick={() => fetchVariations()}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </PremiumButton>
              <PremiumButton onClick={() => openModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Variação
              </PremiumButton>
            </div>
          }
        />
      </FadeInUp>

      {/* Stats */}
      <StaggeredContainer className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <AnimatedCard>
          <StatCard
            title="Total de Variações"
            value={pagination.total}
            icon={<Layers className="w-5 h-5" />}
          />
        </AnimatedCard>
        <AnimatedCard>
          <StatCard
            title="Variações Ativas"
            value={stats.active}
            icon={<Package className="w-5 h-5" />}
          />
        </AnimatedCard>
        <AnimatedCard>
          <StatCard
            title="Estoque Total"
            value={stats.totalStock}
            icon={<HardDrive className="w-5 h-5" />}
          />
        </AnimatedCard>
        <AnimatedCard>
          <StatCard
            title="Estoque Baixo"
            value={stats.lowStock}
            icon={<Palette className="w-5 h-5" />}
          />
        </AnimatedCard>
      </StaggeredContainer>

      {/* Filters */}
      <AnimatedCard>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar variações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-w-[200px]"
            >
              <option value="all">Todos os Produtos</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
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
                      Variação
                      <SortIcon columnKey="name" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cor / Storage
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => toggleSort('price')}
                      className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      Preço
                      <SortIcon columnKey="price" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => toggleSort('stock')}
                      className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      Estoque
                      <SortIcon columnKey="stock" />
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
                {filteredVariations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Layers className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">Nenhuma variação encontrada</p>
                    </td>
                  </tr>
                ) : (
                  filteredVariations.map((variation) => (
                    <motion.tr
                      key={variation.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {variation.image ? (
                            <img
                              src={variation.image}
                              alt={variation.name}
                              className="w-12 h-12 rounded-lg object-cover border"
                            />
                          ) : (
                            <div 
                              className="w-12 h-12 rounded-lg flex items-center justify-center border"
                              style={{ backgroundColor: variation.colorCode || '#f3f4f6' }}
                            >
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">{variation.name}</p>
                            <p className="text-sm text-gray-500 font-mono">{variation.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {variation.product?.name || '-'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {variation.colorCode && (
                            <div 
                              className="w-5 h-5 rounded-full border"
                              style={{ backgroundColor: variation.colorCode }}
                              title={variation.colorName || ''}
                            />
                          )}
                          <span className="text-sm text-gray-600">
                            {variation.colorName || '-'} 
                            {variation.storage && ` / ${variation.storage}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatCurrency(variation.price)}
                          </p>
                          {variation.discountPrice && variation.discountPrice < variation.price && (
                            <p className="text-sm text-green-600">
                              {formatCurrency(variation.discountPrice)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          variation.stock === 0 
                            ? 'bg-red-100 text-red-800'
                            : variation.stock < 10
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {variation.stock} un.
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          variation.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {variation.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal(variation)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(variation.id, variation.name)}
                            disabled={deleting === variation.id}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Excluir"
                          >
                            {deleting === variation.id ? (
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
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Mostrando {filteredVariations.length} de {pagination.total} variações
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchVariations(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Anterior
                </button>
                <span className="px-3 py-1">
                  {pagination.page} / {pagination.pages}
                </span>
                <button
                  onClick={() => fetchVariations(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
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
            className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingVariation ? 'Editar Variação' : 'Nova Variação'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Produto *
                  </label>
                  <select
                    value={formData.productId}
                    onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione um produto</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Variação *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: iPhone 16 Pro Max 256GB Preto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: IP16PM-256-BLK"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fornecedor
                  </label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplierId: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Cor
                  </label>
                  <input
                    type="text"
                    value={formData.colorName}
                    onChange={(e) => setFormData(prev => ({ ...prev, colorName: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Titânio Preto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código da Cor
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.colorCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, colorCode: e.target.value }))}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.colorCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, colorCode: e.target.value }))}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Armazenamento
                  </label>
                  <input
                    type="text"
                    value={formData.storage}
                    onChange={(e) => setFormData(prev => ({ ...prev, storage: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 256GB, 512GB, 1TB"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tamanho
                  </label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 41mm, 45mm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço Promocional
                  </label>
                  <input
                    type="number"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountPrice: Number(e.target.value) }))}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estoque *
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: Number(e.target.value) }))}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condição
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value as any }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="new">Novo</option>
                    <option value="semi_new">Semi-novo</option>
                    <option value="used">Usado</option>
                  </select>
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

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL da Imagem
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="/Produtos/Apple/iphone-16-pro.webp"
                  />
                </div>
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
                  {editingVariation ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

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
  FolderOpen,
  Loader2,
  RefreshCw,
  X,
  Save,
  FileSpreadsheet,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import PageHeader from '@/components/admin/PageHeader'
import StatCard from '@/components/admin/StatCard'
import PremiumButton from '@/components/ui/PremiumButton'
import { TableSkeleton, StatsCardSkeleton } from '@/components/ui/SkeletonLoaders'
import { FadeInUp, AnimatedCard, StaggeredContainer } from '@/components/admin/PageTransition'
import { api, Category, Brand } from '@/services/api'
import { toast } from 'sonner'
import { exportCategories } from '@/services/export'

type SortKey = 'name' | 'products' | 'createdAt'
type SortDirection = 'asc' | 'desc'

export default function CategoriesPage() {
  const { token, isLoading: authLoading } = useAdminAuth()
  const [categories, setCategories] = useState<Category[]>([])
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
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    color: '#034a6e',
    isActive: true,
    sortOrder: 0,
    brandId: ''
  })

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const [categoriesResponse, brandsResponse] = await Promise.all([
        api.categories.getAll(),
        api.brands.getAll()
      ])

      setCategories(categoriesResponse || [])
      setBrands(brandsResponse || [])
    } catch (error: any) {
      console.error('[Admin Categories] Erro:', error)
      toast.error('Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Handle delete
  const handleDelete = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${categoryName}"?`)) return

    setDeleting(categoryId)
    try {
      await api.categories.delete(categoryId, token || undefined)
      toast.success('Categoria excluída com sucesso!')
      fetchCategories()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir categoria')
    } finally {
      setDeleting(null)
    }
  }

  // Handle save (create/update)
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    setSaving(true)
    try {
      const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      
      const data = {
        ...formData,
        slug,
        brandId: formData.brandId || undefined
      }

      if (editingCategory) {
        await api.categories.update(editingCategory.id, data, token || undefined)
        toast.success('Categoria atualizada com sucesso!')
      } else {
        await api.categories.create(data, token || undefined)
        toast.success('Categoria criada com sucesso!')
      }

      setShowModal(false)
      setEditingCategory(null)
      resetForm()
      fetchCategories()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar categoria')
    } finally {
      setSaving(false)
    }
  }

  // Handle edit
  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      color: category.color || '#034a6e',
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      brandId: category.brandId || ''
    })
    setShowModal(true)
  }

  // Handle new
  const handleNew = () => {
    setEditingCategory(null)
    resetForm()
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '',
      color: '#034a6e',
      isActive: true,
      sortOrder: 0,
      brandId: ''
    })
  }

  // Sort and filter
  const filteredAndSortedCategories = useMemo(() => {
    let filtered = categories.filter(category => {
      const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (category.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && category.isActive) ||
        (statusFilter === 'inactive' && !category.isActive)
      return matchesSearch && matchesStatus
    })

    return filtered.sort((a, b) => {
      let aValue: any
      let bValue: any
      
      switch (sortKey) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'products':
          aValue = a._count?.products || 0
          bValue = b._count?.products || 0
          break
        default:
          aValue = a.sortOrder
          bValue = b.sortOrder
      }

      if (typeof aValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue)
      }
      
      return sortDirection === 'asc' 
        ? aValue - bValue 
        : bValue - aValue
    })
  }, [categories, searchTerm, sortKey, sortDirection, statusFilter])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
      : 'bg-red-50 text-red-600 border-red-200'
  }

  // Stats
  const totalCategories = categories.length
  const activeCategories = categories.filter(c => c.isActive).length
  const totalProducts = categories.reduce((sum, c) => sum + (c._count?.products || 0), 0)

  if (loading && categories.length === 0) {
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
            <div className="h-10 w-36 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        {/* Table Skeleton */}
        <TableSkeleton rows={6} columns={5} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Categorias"
        description={`Gerencie ${totalCategories} categorias`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Categorias' }
        ]}
        showSearch={true}
        onSearch={setSearchTerm}
        searchPlaceholder="Buscar categorias..."
        actions={
          <>
            <PremiumButton
              variant="secondary"
              size="sm"
              icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
              onClick={fetchCategories}
            >
              Atualizar
            </PremiumButton>

            <PremiumButton
              variant="secondary"
              size="sm"
              icon={<FileSpreadsheet className="w-4 h-4" />}
              onClick={() => {
                if (categories.length === 0) {
                  toast.error('Nenhuma categoria para exportar')
                  return
                }
                exportCategories(categories, 'excel')
                toast.success('Relatório Excel gerado!')
              }}
            >
              Excel
            </PremiumButton>

            <PremiumButton
              variant="secondary"
              size="sm"
              icon={<FileText className="w-4 h-4" />}
              onClick={() => {
                if (categories.length === 0) {
                  toast.error('Nenhuma categoria para exportar')
                  return
                }
                exportCategories(categories, 'pdf')
                toast.success('Relatório PDF gerado!')
              }}
            >
              PDF
            </PremiumButton>
            
            <PremiumButton
              variant="primary"
              size="md"
              icon={<Plus className="w-5 h-5" />}
              onClick={handleNew}
              glowEffect={true}
            >
              Nova Categoria
            </PremiumButton>
          </>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard
          title="Total de Categorias"
          value={totalCategories}
          icon={<Grid className="w-5 h-5" />}
        />
        
        <StatCard
          title="Categorias Ativas"
          value={activeCategories}
          icon={<Tag className="w-5 h-5" />}
          trend="up"
          trendValue={totalCategories > 0 ? `${Math.round((activeCategories / totalCategories) * 100)}%` : '0%'}
        />
        
        <StatCard
          title="Total de Produtos"
          value={totalProducts}
          icon={<Package className="w-5 h-5" />}
        />
        
        <StatCard
          title="Marcas"
          value={brands.length}
          icon={<FolderOpen className="w-5 h-5" />}
        />
      </div>

      {/* Filters */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border border-gray-100 rounded-2xl p-4 lg:p-6 shadow-sm"
      >
        <div className="flex flex-wrap gap-3">
          {['all', 'active', 'inactive'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === status
                  ? 'bg-blue-400 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'Todas' : status === 'active' ? 'Ativas' : 'Inativas'}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Categories Table */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th 
                  className="text-left p-2 lg:p-4 text-gray-600 font-medium text-xs lg:text-sm cursor-pointer hover:text-gray-900"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Categoria</span>
                    {sortKey === 'name' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="text-left p-2 lg:p-4 text-gray-600 font-medium text-xs lg:text-sm hidden md:table-cell">Slug</th>
                <th 
                  className="text-left p-2 lg:p-4 text-gray-600 font-medium text-xs lg:text-sm cursor-pointer hover:text-gray-900 hidden sm:table-cell"
                  onClick={() => handleSort('products')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Produtos</span>
                    {sortKey === 'products' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="text-left p-2 lg:p-4 text-gray-600 font-medium text-xs lg:text-sm hidden lg:table-cell">Marca</th>
                <th className="text-left p-2 lg:p-4 text-gray-600 font-medium text-xs lg:text-sm">Status</th>
                <th className="text-left p-2 lg:p-4 text-gray-600 font-medium text-xs lg:text-sm">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedCategories.map((category, index) => (
                <motion.tr
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                >
                  <td className="p-2 lg:p-4">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl text-white"
                        style={{ backgroundColor: category.color || '#034a6e' }}
                      >
                        {category.icon || '●'}
                      </div>
                      <div>
                        <h4 className="text-gray-900 font-medium text-sm">{category.name}</h4>
                        {category.description && (
                          <p className="text-gray-500 text-xs truncate max-w-48">{category.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-2 lg:p-4 hidden md:table-cell">
                    <span className="text-gray-500 text-sm font-mono">{category.slug}</span>
                  </td>
                  <td className="p-2 lg:p-4 hidden sm:table-cell">
                    <span className="text-gray-900 font-medium">{category._count?.products || 0}</span>
                  </td>
                  <td className="p-2 lg:p-4 hidden lg:table-cell">
                    <span className="text-gray-600 text-sm">{category.brand?.name || '-'}</span>
                  </td>
                  <td className="p-2 lg:p-4">
                    <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(category.isActive)}`}>
                      {category.isActive ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="p-2 lg:p-4">
                    <div className="flex items-center space-x-1 lg:space-x-2">
                      <button 
                        onClick={() => handleEdit(category)}
                        className="p-1 lg:p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(category.id, category.name)}
                        disabled={deleting === category.id}
                        className="p-1 lg:p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                      >
                        {deleting === category.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredAndSortedCategories.length === 0 && (
            <div className="p-6 lg:p-12 text-center">
              <Grid className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-3 lg:mb-4" />
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2">Nenhuma categoria encontrada</h3>
              <p className="text-gray-500 text-sm lg:text-base">
                {searchTerm ? 'Tente ajustar os filtros' : 'Crie sua primeira categoria'}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-[10%]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-gray-200 rounded-xl w-full max-w-md max-h-[85vh] overflow-y-auto"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              <div>
                <p className="text-[10px] font-semibold text-black mb-1">Nome <span className="text-red-500">*</span></p>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Nome da categoria"
                />
              </div>

              <div>
                <p className="text-[10px] font-semibold text-black mb-1">Slug</p>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="categoria-slug (auto-gerado se vazio)"
                />
              </div>

              <div>
                <p className="text-[10px] font-semibold text-black mb-1">Descrição</p>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  rows={2}
                  placeholder="Descrição da categoria"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-semibold text-black mb-1">Ícone</p>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="●"
                    maxLength={2}
                  />
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-black mb-1">Cor</p>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-7 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-black mb-1">Marca (opcional)</p>
                <select
                  value={formData.brandId}
                  onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                  className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Nenhuma</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-black mb-1">Ordem</p>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                  min="0"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-3.5 h-3.5 text-blue-400 rounded focus:ring-blue-400"
                />
                <label htmlFor="isActive" className="ml-2 text-[10px] font-semibold text-black">
                  Categoria ativa
                </label>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1.5 bg-blue-400 hover:bg-blue-500 rounded-lg text-white text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {editingCategory ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}


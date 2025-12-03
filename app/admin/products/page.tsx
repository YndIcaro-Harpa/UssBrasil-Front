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
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Download,
  Loader2,
  RefreshCw,
  FileSpreadsheet,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import PageHeader from '@/components/admin/PageHeader'
import StatCard from '@/components/admin/StatCard'
import ProductImage from '@/components/admin/ProductImage'
import { ProductModal } from '@/components/admin/ProductModal'
import PremiumButton from '@/components/ui/PremiumButton'
import { api, Product, Category } from '@/services/api'
import { toast } from 'sonner'
import { exportProducts } from '@/services/export'

type SortKey = 'name' | 'price' | 'stock' | 'createdAt'
type SortDirection = 'asc' | 'desc'

// Skeleton components
function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-8 w-8 bg-gray-200 rounded-lg" />
      </div>
      <div className="h-8 w-16 bg-gray-200 rounded mt-2" />
    </div>
  )
}

function ProductTableRowSkeleton() {
  return (
    <tr className="border-b border-gray-100">
      <td className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
          <div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </td>
      <td className="p-4 hidden md:table-cell"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></td>
      <td className="p-4"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></td>
      <td className="p-4 hidden sm:table-cell"><div className="h-4 w-12 bg-gray-200 rounded animate-pulse" /></td>
      <td className="p-4 hidden lg:table-cell"><div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" /></td>
      <td className="p-4">
        <div className="flex space-x-2">
          <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </td>
    </tr>
  )
}

export default function AdminProductsPage() {
  const { token, isLoading: authLoading } = useAdminAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [totalProducts, setTotalProducts] = useState(0)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')

  const handleSaveProduct = async (productData: any) => {
    try {
      // Serialize complex data (variants) into specifications
      const complexSpecs = {
        _isComplexSpecs: true,
        specifications: productData.specifications || {},
        colors: productData.colors || [],
        storage: productData.storage || []
      }

      const payload = {
        ...productData,
        specifications: JSON.stringify(complexSpecs),
        isActive: productData.status === 'active',
        // Ensure images are string if API expects string
        images: typeof productData.images === 'object' && productData.images.gallery 
          ? productData.images.gallery.join(',') 
          : productData.images
      }

      // Remove fields that shouldn't be sent directly if they are not in API schema
      delete payload.colors
      delete payload.storage
      delete payload.status // mapped to isActive

      if (modalMode === 'create') {
        await api.products.create(payload)
        toast.success('Produto criado com sucesso!')
      } else {
        if (!selectedProduct?.id) return
        await api.products.update(selectedProduct.id, payload)
        toast.success('Produto atualizado com sucesso!')
      }
      fetchProducts()
      setIsModalOpen(false)
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
      toast.error('Erro ao salvar produto')
    }
  }

  const openCreateModal = () => {
    setSelectedProduct(undefined)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setSelectedProduct(product)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        api.products.getAll({
          page,
          limit: 20,
          categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchTerm || undefined
        }),
        api.categories.getAll()
      ])

      setProducts(productsResponse.data || [])
      setTotalProducts(productsResponse.total || 0)
      setCategories(categoriesResponse || [])
    } catch (error: any) {
      console.error('[Admin Products] Erro:', error)
      toast.error('Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }, [page, selectedCategory, searchTerm])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Handle delete
  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${productName}"?`)) return

    setDeleting(productId)
    try {
      await api.products.delete(productId, token || undefined)
      toast.success('Produto excluído com sucesso!')
      fetchProducts()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir produto')
    } finally {
      setDeleting(null)
    }
  }

  // Sort and filter
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === 'all' || 
        (selectedStatus === 'active' && product.isActive) ||
        (selectedStatus === 'inactive' && !product.isActive)
      return matchesSearch && matchesStatus
    })

    return filtered.sort((a, b) => {
      let aValue: any = a[sortKey]
      let bValue: any = b[sortKey]
      
      if (sortKey === 'createdAt') {
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
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
  }, [products, searchTerm, sortKey, sortDirection, selectedStatus])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('desc')
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
      : 'bg-red-50 text-red-600 border-red-200'
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'text-red-600', text: 'Sem estoque' }
    if (stock <= 10) return { color: 'text-amber-600', text: 'Estoque baixo' }
    return { color: 'text-emerald-600', text: 'Em estoque' }
  }

  const getProductImage = (product: Product) => {
    if (!product.images) return '/fallback-product.png'
    
    try {
      // Try parsing as JSON array
      if (product.images.startsWith('[')) {
        const images = JSON.parse(product.images)
        return images[0] || '/fallback-product.png'
      }
      // Try as comma-separated string
      if (product.images.includes(',')) {
        return product.images.split(',')[0].trim() || '/fallback-product.png'
      }
      // Single URL string
      return product.images || '/fallback-product.png'
    } catch {
      // If parsing fails, treat as single URL
      return product.images || '/fallback-product.png'
    }
  }

  // Exportar produtos para Excel
  const handleExportExcel = () => {
    if (products.length === 0) {
      toast.error('Nenhum produto para exportar')
      return
    }
    exportProducts(products, 'excel')
    toast.success('Relatório Excel gerado com sucesso!')
  }

  // Exportar produtos para PDF
  const handleExportPDF = () => {
    if (products.length === 0) {
      toast.error('Nenhum produto para exportar')
      return
    }
    exportProducts(products, 'pdf')
    toast.success('Relatório PDF gerado com sucesso!')
  }

  // Stats
  const activeProducts = products.filter(p => p.isActive).length
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  const lowStockProducts = products.filter(p => p.stock <= 10 && p.stock > 0).length
  const outOfStockProducts = products.filter(p => p.stock === 0).length

  const transformedProduct = useMemo(() => {
    if (!selectedProduct) return undefined;
    
    let specs: any = {};
    let colors = [];
    let storage = [];
    
    try {
      if (selectedProduct.specifications) {
        const parsed = JSON.parse(selectedProduct.specifications);
        // Check if it has our special structure
        if (parsed._isComplexSpecs) {
          specs = parsed.specifications || {};
          colors = parsed.colors || [];
          storage = parsed.storage || [];
        } else {
          // Legacy or simple key-value
          specs = parsed;
        }
      }
    } catch (e) {
      // If not JSON, maybe just treat as empty or try to parse if it's a string representation
    }

    // Handle images which might be comma separated string or JSON array string
    let images = { main: '', gallery: [] as string[] };
    if (selectedProduct.images) {
        if (selectedProduct.images.startsWith('[')) {
             try {
                 const parsedImgs = JSON.parse(selectedProduct.images);
                 images.main = parsedImgs[0] || '';
                 images.gallery = parsedImgs;
             } catch (e) {}
        } else {
            const split = selectedProduct.images.split(',');
            images.main = split[0] || '';
            images.gallery = split;
        }
    }

    return {
      ...selectedProduct,
      specifications: specs,
      colors: colors,
      storage: storage,
      status: selectedProduct.isActive ? 'active' : 'inactive',
      images: images
    } as any; // Cast to any to satisfy ProductModal's Product type
  }, [selectedProduct]);

  if (loading && products.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></th>
                  <th className="px-4 py-3 text-left hidden md:table-cell"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></th>
                  <th className="px-4 py-3 text-left"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></th>
                  <th className="px-4 py-3 text-right"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse ml-auto" /></th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductTableRowSkeleton key={i} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Produtos"
        description={`Gerencie seu catálogo de ${totalProducts} produtos`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Produtos' }
        ]}
        showSearch={true}
        onSearch={setSearchTerm}
        searchPlaceholder="Pesquisar produtos..."
        actions={
          <>
            <PremiumButton
              variant="secondary"
              size="sm"
              icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
              onClick={fetchProducts}
              className="hidden sm:flex"
            >
              Atualizar
            </PremiumButton>
            
            <PremiumButton
              variant="secondary"
              size="sm"
              icon={<FileSpreadsheet className="w-4 h-4" />}
              onClick={handleExportExcel}
              className="hidden sm:flex"
            >
              Excel
            </PremiumButton>

            <PremiumButton
              variant="secondary"
              size="sm"
              icon={<FileText className="w-4 h-4" />}
              onClick={handleExportPDF}
              className="hidden sm:flex"
            >
              PDF
            </PremiumButton>
            
            <PremiumButton
              variant="primary"
              size="md"
              icon={<Plus className="w-5 h-5" />}
              glowEffect={true}
              onClick={openCreateModal}
            >
              <span className="hidden sm:inline">Novo Produto</span>
              <span className="sm:hidden">Novo</span>
            </PremiumButton>
          </>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
        <StatCard
          title="Total de Produtos"
          value={totalProducts}
          icon={<Package className="w-5 h-5" />}
        />
        
        <StatCard
          title="Produtos Ativos"
          value={activeProducts}
          icon={<CheckCircle className="w-5 h-5" />}
          trend="up"
          trendValue={totalProducts > 0 ? `${Math.round((activeProducts / totalProducts) * 100)}%` : '0%'}
        />
        
        <StatCard
          title="Valor do Estoque"
          value={formatCurrency(totalValue)}
          icon={<DollarSign className="w-5 h-5" />}
        />
        
        <StatCard
          title="Estoque Baixo"
          value={lowStockProducts}
          icon={<AlertTriangle className="w-5 h-5" />}
          trend={lowStockProducts > 5 ? "down" : "neutral"}
        />
        
        <StatCard
          title="Sem Estoque"
          value={outOfStockProducts}
          icon={<Trash2 className="w-5 h-5" />}
          trend="neutral"
        />
      </div>

      {/* Filters */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border border-gray-100 rounded-2xl p-4 lg:p-6 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
          {/* Category Filter */}
          <div className="min-w-0 lg:min-w-48">
            <p className="text-sm font-semibold text-black mb-1.5">Categoria</p>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 lg:px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            >
              <option value="all">
                Todas as categorias
              </option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="min-w-0 lg:min-w-40">
            <p className="text-sm font-semibold text-black mb-1.5">Status</p>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 lg:px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-2 lg:p-4 text-gray-600 font-medium text-xs lg:text-sm">Produto</th>
                <th className="text-left p-2 lg:p-4 text-gray-600 font-medium text-xs lg:text-sm hidden md:table-cell">Categoria</th>
                <th 
                  className="text-left p-2 lg:p-4 text-gray-600 font-medium text-xs lg:text-sm cursor-pointer hover:text-gray-900 transition-colors"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Preço</span>
                    {sortKey === 'price' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 lg:w-4 lg:h-4" /> : <ArrowDown className="w-3 h-3 lg:w-4 lg:h-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="text-left p-2 lg:p-4 text-gray-600 font-medium text-xs lg:text-sm cursor-pointer hover:text-gray-900 transition-colors hidden sm:table-cell"
                  onClick={() => handleSort('stock')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Estoque</span>
                    {sortKey === 'stock' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 lg:w-4 lg:h-4" /> : <ArrowDown className="w-3 h-3 lg:w-4 lg:h-4" />
                    )}
                  </div>
                </th>
                <th className="text-left p-2 lg:p-4 text-gray-600 font-medium text-xs lg:text-sm hidden md:table-cell">Status</th>
                <th className="text-left p-2 lg:p-4 text-gray-600 font-medium text-xs lg:text-sm">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedProducts.map((product, index) => {
                const stockStatus = getStockStatus(product.stock)
                return (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                  >
                    <td className="p-2 lg:p-4">
                      <div className="flex items-center space-x-2 lg:space-x-3">
                        <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-xl overflow-hidden">
                          <ProductImage
                            src={getProductImage(product)}
                            alt={product.name}
                            size="sm"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-gray-900 font-medium text-xs lg:text-sm truncate">{product.name}</h4>
                          <p className="text-gray-500 text-xs hidden lg:block">SKU: {product.slug}</p>
                          <p className="text-gray-500 text-xs md:hidden">{product.category?.name || 'Sem categoria'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 lg:p-4 hidden md:table-cell">
                      <span className="text-gray-600 text-xs lg:text-sm">{product.category?.name || 'Sem categoria'}</span>
                    </td>
                    <td className="p-2 lg:p-4">
                      <div>
                        <span className="text-gray-900 font-bold text-xs lg:text-sm">{formatCurrency(product.price)}</span>
                        {product.discountPrice && (
                          <span className="text-emerald-600 text-xs block">{formatCurrency(product.discountPrice)}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-2 lg:p-4 hidden sm:table-cell">
                      <div className="flex items-center space-x-1 lg:space-x-2">
                        <span className={`font-medium text-xs lg:text-sm ${stockStatus.color}`}>
                          {product.stock}
                        </span>
                        <span className={`text-xs hidden lg:inline ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </div>
                    </td>
                    <td className="p-2 lg:p-4 hidden md:table-cell">
                      <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(product.isActive)}`}>
                        {product.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="p-2 lg:p-4">
                      <div className="flex items-center space-x-1 lg:space-x-2">
                        <Link href={`/produto/${product.slug}`}>
                          <button className="p-1 lg:p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                            <Eye className="w-3 h-3 lg:w-4 lg:h-4" />
                          </button>
                        </Link>
                        <button 
                          onClick={() => openEditModal(product)}
                          className="p-1 lg:p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                        >
                          <Edit className="w-3 h-3 lg:w-4 lg:h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={deleting === product.id}
                          className="p-1 lg:p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                        >
                          {deleting === product.id ? (
                            <Loader2 className="w-3 h-3 lg:w-4 lg:h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>

          {filteredAndSortedProducts.length === 0 && (
            <div className="p-6 lg:p-12 text-center">
              <Package className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-3 lg:mb-4" />
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-500 text-sm lg:text-base">
                {searchTerm ? 'Tente ajustar os filtros de busca' : 'Adicione novos produtos ao catálogo'}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={transformedProduct}
        onSave={handleSaveProduct}
        mode={modalMode}
      />
    </div>
  )
}


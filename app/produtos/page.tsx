'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Grid3X3, List, Star, ShoppingCart, Filter, Heart, Eye, X, ChevronDown, Tag
} from 'lucide-react'

import apiClient, { Product, Category, Brand, formatPrice } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useModal } from '@/contexts/ModalContext'
import { toast } from 'sonner'

// Componente de Card de Produto com Slug Correto
function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false)
  const { addToCart } = useCart()
  const { favorites, toggleFavorite, user } = useAuth()
  const { openAuthModal } = useModal()
  
  const isFavorite = favorites.includes(product.id)
  const discountPercentage = product.discountPrice 
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0

  const handleViewProduct = () => {
    // Usar slug do produto para navegação correta
    window.location.href = `/produto/${product.slug}`
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart({
      id: Number(product.id),
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.images?.[0] || '/fallback-product.png',
      category: product.category?.name || 'Geral'
    })
    toast.success(`${product.name} adicionado ao carrinho!`)
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      openAuthModal()
      return
    }
    toggleFavorite(product.id)
    toast.success(isFavorite ? 'Removido dos favoritos' : 'Adicionado aos favoritos')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewProduct}
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <Image
          src={product.images?.[0] || '/fallback-product.png'}
          alt={product.name}
          fill
          className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.featured && (
            <Badge className="bg-blue-600 text-white">
              <Tag className="h-3 w-3 mr-1" />
              Destaque
            </Badge>
          )}
          {discountPercentage > 0 && (
            <Badge className="bg-red-500 text-white">
              -{discountPercentage}%
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className={`absolute top-4 right-4 flex flex-col gap-2 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        }`}>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleToggleFavorite}
            className="h-10 w-10 p-0 rounded-full bg-white/95 hover:bg-white"
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
          </Button>
          
          <Button
            size="sm"
            variant="secondary"
            className="h-10 w-10 p-0 rounded-full bg-white/95 hover:bg-white"
          >
            <Eye className="h-4 w-4 text-gray-500" />
          </Button>
        </div>

        {/* Stock Warning */}
        {product.stock < 10 && product.stock > 0 && (
          <div className="absolute bottom-4 left-4">
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              Últimas {product.stock} unidades
            </Badge>
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Brand & Category */}
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
            {product.brand?.name || 'Marca'}
          </Badge>
          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
            {product.category?.name || 'Categoria'}
          </Badge>
        </div>

        {/* Product Name */}
        <h3 className="font-bold text-lg line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors text-gray-900">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-sm text-gray-600">4.5 (127)</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          {product.discountPrice ? (
            <div className="flex flex-col">
              <span className="text-sm line-through text-gray-500">
                {formatPrice(product.price)}
              </span>
              <span className="text-xl font-bold text-blue-600">
                {formatPrice(product.discountPrice)}
              </span>
            </div>
          ) : (
            <span className="text-xl font-bold text-blue-600">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Action Button */}
        <Button 
          onClick={handleAddToCart}
          className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold transition-colors"
          disabled={product.stock === 0}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stock === 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
        </Button>
      </div>
    </motion.div>
  )
}

// Página Principal de Produtos
export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showOnlyFeatured, setShowOnlyFeatured] = useState(false)
  const [showOnlyInStock, setShowOnlyInStock] = useState(true)
  
  const searchParams = useSearchParams()

  // Carregar dados do backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Buscar produtos
        const productsResponse = await apiClient.getProducts({
          limit: 50,
          search: searchParams.get('search') || undefined,
          categoryId: searchParams.get('category') || undefined,
          brandId: searchParams.get('brand') || undefined
        })
        setProducts(productsResponse || [])
        
        // Buscar categorias
        const categoriesResponse = await apiClient.getCategories()
        setCategories(categoriesResponse || [])
        
        // Buscar marcas
        const brandsResponse = await apiClient.getBrands()
        setBrands(brandsResponse || [])
        
        // Aplicar filtros da URL
        if (searchParams.get('search')) {
          setSearchTerm(searchParams.get('search')!)
        }
        if (searchParams.get('category')) {
          setSelectedCategory(searchParams.get('category')!)
        }
        if (searchParams.get('brand')) {
          setSelectedBrand(searchParams.get('brand')!)
        }
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast.error('Erro ao carregar produtos')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [searchParams])

  // Filtrar e ordenar produtos
  const processedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = !selectedCategory || product.category?.id === selectedCategory
      const matchesBrand = !selectedBrand || product.brand?.id === selectedBrand
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
      const matchesFeatured = !showOnlyFeatured || product.featured
      const matchesStock = !showOnlyInStock || product.stock > 0

      return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesFeatured && matchesStock
    })

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'price':
          const priceA = a.discountPrice || a.price
          const priceB = b.discountPrice || b.price
          comparison = priceA - priceB
          break
        case 'featured':
          comparison = Number(b.featured) - Number(a.featured)
          break
        default:
          comparison = 0
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })

    return filtered
  }, [products, searchTerm, selectedCategory, selectedBrand, priceRange, sortBy, sortOrder, showOnlyFeatured, showOnlyInStock])

  useEffect(() => {
    setFilteredProducts(processedProducts)
  }, [processedProducts])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedBrand('')
    setPriceRange([0, 10000])
    setShowOnlyFeatured(false)
    setShowOnlyInStock(true)
    setSortBy('name')
    setSortOrder('asc')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900"></div>
          <p className="mt-4 text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Todos os Produtos
          </h1>
          <p className="text-gray-600">
            Encontre os melhores produtos em tecnologia premium
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar de Filtros */}
          <div className="lg:w-80 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  Limpar
                </Button>
              </div>

              {/* Busca */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="Nome, marca ou categoria..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as categorias</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Marca */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca
                  </label>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as marcas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as marcas</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Faixa de Preço */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Faixa de Preço: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    max={10000}
                    min={0}
                    step={50}
                    className="mt-2"
                  />
                </div>

                {/* Filtros Booleanos */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="featured"
                      checked={showOnlyFeatured}
                      onCheckedChange={setShowOnlyFeatured}
                    />
                    <label htmlFor="featured" className="text-sm text-gray-700">
                      Apenas produtos em destaque
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="instock"
                      checked={showOnlyInStock}
                      onCheckedChange={setShowOnlyInStock}
                    />
                    <label htmlFor="instock" className="text-sm text-gray-700">
                      Apenas em estoque
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Área Principal */}
          <div className="flex-1">
            {/* Barra de Controles */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {filteredProducts.length} produto(s) encontrado(s)
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Ordenação */}
                  <div className="flex items-center gap-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Nome</SelectItem>
                        <SelectItem value="price">Preço</SelectItem>
                        <SelectItem value="featured">Destaque</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </Button>
                  </div>

                  {/* View Mode */}
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="px-3"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="px-3"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid de Produtos */}
            <AnimatePresence>
              {filteredProducts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <div className="bg-white rounded-xl border border-gray-200 p-12">
                    <div className="text-gray-400 mb-4">
                      <Search className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Nenhum produto encontrado
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Tente ajustar os filtros ou buscar por outros termos
                    </p>
                    <Button onClick={clearFilters} className="bg-blue-900 hover:bg-blue-800">
                      Limpar Filtros
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  layout
                  className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                      : 'grid-cols-1'
                  }`}
                >
                  {filteredProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { 
  ArrowLeft, ShoppingCart, Heart, Package, 
  Star, Filter, Grid, List, Search,
  ChevronRight, Sparkles, SlidersHorizontal,
  ArrowUpDown, X, Loader2, ExternalLink,
  Shield, Award, Truck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { brandsApi, api, Brand, Product } from '@/services/api'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useModal } from '@/contexts/ModalContext'
import { toast } from 'sonner'

// Animações
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
}

// Logos e cores das marcas
const brandLogos: Record<string, string> = {
  apple: '/images/brands/apple.png',
  jbl: '/images/brands/jbl.png',
  xiaomi: '/images/brands/xiaomi.png',
  samsung: '/images/brands/samsung.png',
  beats: '/images/brands/beats.png',
  sony: '/images/brands/sony.png',
  bose: '/images/brands/bose.png',
}

const brandColors: Record<string, { primary: string; gradient: string; light: string }> = {
  apple: { primary: '#000000', gradient: 'from-gray-900 to-gray-800', light: 'bg-gray-100' },
  jbl: { primary: '#FF6600', gradient: 'from-orange-600 to-orange-500', light: 'bg-orange-50' },
  xiaomi: { primary: '#FF6700', gradient: 'from-orange-500 to-amber-500', light: 'bg-orange-50' },
  samsung: { primary: '#1428A0', gradient: 'from-blue-700 to-blue-600', light: 'bg-blue-50' },
  beats: { primary: '#E31937', gradient: 'from-red-600 to-red-500', light: 'bg-red-50' },
  default: { primary: '#001941', gradient: 'from-[#001941] to-[#023a58]', light: 'bg-blue-50' }
}

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'name' | 'newest'
type ViewMode = 'grid' | 'list'

export default function BrandPage() {
  const params = useParams()
  const router = useRouter()
  const brandSlug = params.brand as string

  const [brand, setBrand] = useState<Brand | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(false)
  
  // Filtros e ordenação
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('relevance')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000])

  const { addToCart } = useCart()
  const { user, favorites, toggleFavorite } = useAuth()
  const { openModal } = useModal()

  const whatsappNumber = '5548991832760'

  // Carregar dados da marca e produtos
  useEffect(() => {
    const loadBrandData = async () => {
      try {
        setLoading(true)
        
        // Buscar marca por slug
        const brandData = await brandsApi.getBySlug(brandSlug)
        setBrand(brandData)

        // Buscar produtos da marca
        setLoadingProducts(true)
        const productsResponse = await api.products.getAll({ 
          brandId: brandData.id,
          limit: 100
        })
        const productsList = Array.isArray(productsResponse) 
          ? productsResponse 
          : productsResponse.data || []
        
        setProducts(productsList)
      } catch (error) {
        console.error('Erro ao carregar marca:', error)
        toast.error('Marca não encontrada')
      } finally {
        setLoading(false)
        setLoadingProducts(false)
      }
    }

    if (brandSlug) {
      loadBrandData()
    }
  }, [brandSlug])

  // Produtos filtrados e ordenados
  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Filtro de busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query)
      )
    }

    // Filtro de preço
    filtered = filtered.filter(p => {
      const price = p.discountPrice || p.price
      return price >= priceRange[0] && price <= priceRange[1]
    })

    // Ordenação
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price))
        break
      case 'price-desc':
        filtered.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price))
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      default:
        // Relevância: featured primeiro
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }

    return filtered
  }, [products, searchQuery, sortBy, priceRange])

  // Helpers
  const getBrandLogo = () => {
    if (brand?.logo) return brand.logo
    return brandLogos[brandSlug.toLowerCase()] || '/images/brands/default.png'
  }

  const getBrandColors = () => {
    return brandColors[brandSlug.toLowerCase()] || brandColors.default
  }

  const parseProductImage = (images: string | undefined): string | null => {
    if (!images) return null
    try {
      const parsed = JSON.parse(images)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0]
      return null
    } catch {
      return images.startsWith('http') ? images : null
    }
  }

  const handleAddToCart = (product: Product) => {
    if (!user) {
      openModal('auth')
      return
    }
    // Converter para o formato esperado pelo CartContext
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      image: parseProductImage(product.images) || '/fallback-product.png',
      images: product.images,
      stock: product.stock
    }
    addToCart(cartProduct as any, 1)
    toast.success('Produto adicionado ao carrinho!')
  }

  const handleToggleFavorite = (productId: string) => {
    if (!user) {
      openModal('auth')
      return
    }
    toggleFavorite(productId)
  }

  const handleWhatsApp = (product: Product) => {
    const message = encodeURIComponent(
      `Olá! Tenho interesse no produto: ${product.name}\n` +
      `Preço: R$ ${(product.discountPrice || product.price).toFixed(2)}\n` +
      `Link: ${window.location.origin}/produto/${product.slug}`
    )
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank')
  }

  const colors = getBrandColors()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center pt-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#001941]/20 border-t-[#001941] rounded-full animate-spin" />
            <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-[#001941]" />
          </div>
          <p className="text-gray-500 font-medium">Carregando marca...</p>
        </motion.div>
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Marca não encontrada</h2>
          <p className="text-gray-500 mb-6">A marca que você procura não existe ou foi removida.</p>
          <Button onClick={() => router.push('/brands')} className="bg-[#001941] hover:bg-[#023a58]">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Ver todas as marcas
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Hero Banner */}
      <section className={`relative pt-20 pb-16 bg-gradient-to-r ${colors.gradient} overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '30px 30px'
          }} />
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-white/70 text-sm mb-8"
          >
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/brands" className="hover:text-white transition-colors">Marcas</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white font-medium">{brand.name}</span>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Brand Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex-shrink-0"
            >
              <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-3xl shadow-2xl flex items-center justify-center p-6">
                <Image
                  src={getBrandLogo()}
                  alt={brand.name}
                  width={120}
                  height={120}
                  className="object-contain"
                />
              </div>
            </motion.div>

            {/* Brand Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1 text-center md:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                <Award className="h-4 w-4 text-yellow-400" />
                <span className="text-white text-sm font-medium">Marca Oficial</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {brand.name}
              </h1>
              
              {brand.description && (
                <p className="text-white/80 text-lg mb-6 max-w-2xl">
                  {brand.description}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                <div className="flex items-center gap-2 text-white/90">
                  <Package className="h-5 w-5" />
                  <span className="font-semibold">{products.length}</span>
                  <span className="text-white/70">produtos</span>
                </div>
                
                <div className="flex items-center gap-2 text-white/90">
                  <Shield className="h-5 w-5 text-green-400" />
                  <span className="text-white/70">100% Original</span>
                </div>

                <div className="flex items-center gap-2 text-white/90">
                  <Truck className="h-5 w-5" />
                  <span className="text-white/70">Entrega Rápida</span>
                </div>
              </div>

              {brand.website && (
                <a 
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-6 text-white/80 hover:text-white transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="text-sm">Site oficial</span>
                </a>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Filters & Products */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          {/* Filters Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8"
          >
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder={`Buscar em ${brand.name}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 border-gray-200 focus:border-[#001941] focus:ring-[#001941]/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="h-11 px-4 border border-gray-200 rounded-lg bg-white text-sm focus:border-[#001941] focus:ring-[#001941]/20 focus:outline-none"
                >
                  <option value="relevance">Relevância</option>
                  <option value="price-asc">Menor preço</option>
                  <option value="price-desc">Maior preço</option>
                  <option value="name">Nome A-Z</option>
                  <option value="newest">Mais recentes</option>
                </select>
              </div>

              {/* View Mode */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#001941]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-[#001941]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Active Filters */}
            {(searchQuery || sortBy !== 'relevance') && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">Filtros:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Busca: {searchQuery}
                    <button onClick={() => setSearchQuery('')}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSortBy('relevance')
                  }}
                  className="text-sm text-[#001941] hover:underline ml-auto"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </motion.div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{filteredProducts.length}</span> produto(s) encontrado(s)
            </p>
          </div>

          {/* Products Grid */}
          {loadingProducts ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#001941]" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchQuery 
                  ? `Não encontramos produtos para "${searchQuery}". Tente outro termo.`
                  : 'Esta marca ainda não possui produtos cadastrados.'
                }
              </p>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchQuery('')}
                  className="mt-4"
                >
                  Limpar busca
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className={viewMode === 'grid' 
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6'
                : 'flex flex-col gap-4'
              }
            >
              {filteredProducts.map((product, index) => {
                const productImage = parseProductImage(product.images)
                const isFavorite = favorites?.includes(product.id)
                const hasDiscount = product.discountPrice && product.discountPrice < product.price
                const discountPercent = hasDiscount 
                  ? Math.round((1 - product.discountPrice! / product.price) * 100) 
                  : 0

                return (
                  <motion.div
                    key={product.id}
                    variants={fadeInUp}
                    className={viewMode === 'grid' ? '' : 'bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow'}
                  >
                    {viewMode === 'grid' ? (
                      // Grid Card
                      <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                        {/* Image */}
                        <Link href={`/produto/${product.slug}`}>
                          <div className="relative aspect-square bg-gradient-to-b from-gray-50 to-white p-4 overflow-hidden">
                            {hasDiscount && (
                              <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                                -{discountPercent}%
                              </div>
                            )}
                            
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                handleToggleFavorite(product.id)
                              }}
                              className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                            >
                              <Heart className={`h-5 w-5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
                            </button>

                            <Image
                              src={productImage || '/fallback-product.png'}
                              alt={product.name}
                              fill
                              className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        </Link>

                        {/* Info */}
                        <div className="p-4">
                          <Link href={`/produto/${product.slug}`}>
                            <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-[#001941] transition-colors">
                              {product.name}
                            </h3>
                          </Link>

                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-lg font-bold text-[#001941]">
                              R$ {(product.discountPrice || product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            {hasDiscount && (
                              <span className="text-sm text-gray-400 line-through">
                                R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleAddToCart(product)}
                              size="sm"
                              className="flex-1 bg-[#001941] hover:bg-[#023a58] text-xs h-9"
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Comprar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // List Card
                      <div className="flex gap-4 p-4">
                        <Link href={`/produto/${product.slug}`} className="flex-shrink-0">
                          <div className="relative w-32 h-32 bg-gray-50 rounded-xl overflow-hidden">
                            <Image
                              src={productImage || '/fallback-product.png'}
                              alt={product.name}
                              fill
                              className="object-contain p-2"
                            />
                            {hasDiscount && (
                              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                                -{discountPercent}%
                              </div>
                            )}
                          </div>
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link href={`/produto/${product.slug}`}>
                            <h3 className="font-semibold text-gray-900 mb-1 hover:text-[#001941] transition-colors line-clamp-2">
                              {product.name}
                            </h3>
                          </Link>
                          
                          {product.description && (
                            <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                              {product.description}
                            </p>
                          )}

                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl font-bold text-[#001941]">
                              R$ {(product.discountPrice || product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            {hasDiscount && (
                              <span className="text-sm text-gray-400 line-through">
                                R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleAddToCart(product)}
                              size="sm"
                              className="bg-[#001941] hover:bg-[#023a58]"
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Adicionar ao carrinho
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleFavorite(product.id)}
                            >
                              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* Back to Brands */}
      <section className="py-8 px-4">
        <div className="container mx-auto text-center">
          <Link href="/brands">
            <Button variant="outline" size="lg" className="group">
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Ver todas as marcas
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

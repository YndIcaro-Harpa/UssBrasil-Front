'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Heart, Grid, List, Search, Filter, Package, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useModal } from '@/contexts/ModalContext'
import { toast } from 'sonner'
import apiClient, { Product, Brand } from '@/lib/api-client'

function ProdutosPageContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(true)
  const [isFiltering, setIsFiltering] = useState(false)
  const [sortBy, setSortBy] = useState('name')
  const { addToCart } = useCart()
  const { user, favorites, toggleFavorite } = useAuth()
  const { openModal } = useModal()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const whatsappNumber = '5548991832760'

  // Carregar marcas primeiro
  useEffect(() => {
    const loadBrands = async () => {
      try {
        const brandsRes = await apiClient.getBrands()
        setBrands(brandsRes)
      } catch (error) {
        console.error('Erro ao carregar marcas:', error)
      }
    }
    loadBrands()
  }, [])

  // Capturar parâmetros da URL
  useEffect(() => {
    if (brands.length === 0) return

    const searchParam = searchParams.get('search')
    const brandSlugParam = searchParams.get('brand')
    
    if (searchParam) {
      setSearchQuery(searchParam)
      setDebouncedSearch(searchParam)
    }
    
    if (brandSlugParam) {
      const brand = brands.find(b => b.slug === brandSlugParam)
      if (brand) {
        setSelectedBrand(brand.id)
      }
    }
  }, [brands, searchParams])

  // Debounce para busca - atualiza após 400ms de pausa na digitação
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Carregar produtos quando filtros mudarem
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsFiltering(true)
        let queryParams: any = { limit: 100 }
        
        if (debouncedSearch) {
          queryParams.search = debouncedSearch
        }
        if (selectedBrand) {
          queryParams.brandId = selectedBrand
        }

        const productsRes = await apiClient.getProducts(queryParams)
        setProducts(productsRes)
        setFilteredProducts(productsRes)
      } catch (error) {
        console.error('Erro ao carregar produtos:', error)
        toast.error('Erro ao carregar produtos')
      } finally {
        setLoading(false)
        setIsFiltering(false)
      }
    }

    loadProducts()
  }, [debouncedSearch, selectedBrand])

  // Aplicar ordenação localmente
  useEffect(() => {
    let sorted = [...products]

    if (sortBy === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price)
    } else {
      sorted.sort((a, b) => a.name.localeCompare(b.name))
    }

    setFilteredProducts(sorted)
  }, [sortBy, products])

  // Atualizar URL quando filtros mudarem
  const updateURL = useCallback((search: string, brandId: string | null) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (brandId) {
      const brand = brands.find(b => b.id === brandId)
      if (brand) params.set('brand', brand.slug)
    }
    const newUrl = params.toString() ? `/produtos?${params.toString()}` : '/produtos'
    router.replace(newUrl, { scroll: false })
  }, [brands, router])

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
  }

  const handleBrandSelect = (brandId: string | null) => {
    setSelectedBrand(brandId)
    updateURL(debouncedSearch, brandId)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setDebouncedSearch('')
    setSelectedBrand(null)
    router.replace('/produtos', { scroll: false })
  }

  const getWhatsAppLink = (product: Product) => {
    const message = `*USS Brasil Tecnologia*\n\nOlá! Tenho interesse neste produto:\n\n*${product.name}*\nMarca: ${product.brand?.name || 'N/A'}\nPreço: R$ ${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\nEstá disponível?`
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
  }

  const handleAddToCart = (product: Product) => {
    const images = product.images && product.images.length > 0 ? product.images : []
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: images[0] || '/fallback-product.png',
      category: product.category?.name || 'Geral',
      stock: product.stock
    })
    const whatsappLink = getWhatsAppLink(product)
    toast.success(`${product.name} adicionado ao carrinho!`, {
      description: 'Finalize a compra pelo WhatsApp',
      action: {
        label: 'WhatsApp',
        onClick: () => window.open(whatsappLink, '_blank')
      }
    })
  }

  const handleToggleFavorite = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Validar se usuário está logado
    if (!user) {
      toast.error('Faça login para adicionar aos favoritos', {
        description: 'É necessário estar logado para salvar produtos favoritos'
      })
      openModal('auth')
      return
    }
    
    const isFav = favorites.includes(product.id)
    toggleFavorite(product.id)
    toast.success(isFav ? 'Removido dos favoritos' : 'Adicionado aos favoritos!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
     

      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          <motion.aside
            className="w-full lg:w-56 xl:w-64 flex-shrink-0 space-y-4"
          >
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-1.5 mb-3">
                <Search className="h-4 w-4 text-blue-600" />
                <h3 className="font-bold text-sm text-gray-900">Buscar</h3>
                {searchQuery !== debouncedSearch && (
                  <div className="ml-auto flex items-center gap-1 text-blue-500">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-[10px]">...</span>
                  </div>
                )}
              </div>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Nome do produto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 pr-7 h-8 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-sm mb-3 text-gray-900 flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-blue-400" />
                Marcas
              </h3>
              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                <button
                  onClick={() => handleBrandSelect(null)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium ${
                    selectedBrand === null
                      ? 'bg-blue-400 text-white'
                      : 'hover:bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  Todas as Marcas
                </button>
                {brands.map(brand => (
                  <button
                    key={brand.id}
                    onClick={() => handleBrandSelect(brand.id)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium ${
                      selectedBrand === brand.id
                        ? 'bg-blue-400 text-white'
                        : 'hover:bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.aside>

          <div className="flex-1 min-w-0">
            {/* Indicador de filtros ativos */}
            {(selectedBrand || debouncedSearch) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex flex-wrap items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl p-4"
              >
                <span className="text-sm text-blue-700 font-medium">Filtros ativos:</span>
                {selectedBrand && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {brands.find(b => b.id === selectedBrand)?.name || 'Marca'}
                    <button onClick={() => handleBrandSelect(null)} className="hover:text-blue-600">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {debouncedSearch && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    "{debouncedSearch}"
                    <button onClick={() => setSearchQuery('')} className="hover:text-blue-600">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="ml-auto text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Limpar tudo
                </button>
              </motion.div>
            )}

            {/* Loading overlay quando filtrando */}
            {isFiltering && (
              <div className="mb-4 flex items-center justify-center gap-2 text-blue-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Filtrando produtos...</span>
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-gray-700 font-medium">
                  <span className="text-blue-600 font-bold">{filteredProducts.length}</span> produto(s)
                </span>
                <span className="text-gray-300">|</span>
                <Filter className="h-5 w-5 text-blue-400" />
                <span className="text-gray-700 font-medium">Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2.5 border-gray-200 border rounded-lg text-gray-700 bg-white focus:border-blue-400 focus:ring-blue-400 transition-all font-medium"
                >
                  <option value="name">Nome (A-Z)</option>
                  <option value="price-asc">Menor Preço</option>
                  <option value="price-desc">Maior Preço</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-gray-100 rounded-lg border border-gray-200 p-1.5">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2.5 rounded-lg transition-all duration-200 ${
                    view === 'grid'
                      ? 'bg-blue-400 text-white'
                      : 'text-gray-600 hover:text-blue-400 hover:bg-white'
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2.5 rounded-lg transition-all duration-200 ${
                    view === 'list'
                      ? 'bg-blue-400 text-white'
                      : 'text-gray-600 hover:text-blue-400 hover:bg-white'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </motion.div>

            {filteredProducts.length > 0 ? (
              <motion.div
                variants={{
                  animate: {
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
                initial="initial"
                animate="animate"
                className={view === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3'
                  : 'space-y-3'
                }
              >
                {filteredProducts.map(product => {
                  const images = product.images || []
                  const imageUrl = (images[0] || '/fallback-product.png').trim()
                  const isFavorite = favorites.includes(product.id)
                  const whatsappLink = getWhatsAppLink(product)
                  const displayPrice = product.discountPrice || product.price

                  if (view === 'list') {
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-300 flex gap-4"
                      >
                        <Link href={`/produto/${product.slug}`} className="flex-shrink-0">
                          <div className="w-24 h-24 relative overflow-hidden bg-gray-50 rounded-lg">
                            <Image
                              src={imageUrl}
                              alt={product.name}
                              fill
                              className="object-contain p-4"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement
                                img.src = '/fallback-product.png'
                              }}
                            />
                          </div>
                        </Link>

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="text-xs font-semibold bg-blue-100 text-blue-700 border-0">
                                {product.brand?.name || 'Marca'}
                              </Badge>
                            </div>
                            <Link href={`/produto/${product.slug}`}>
                              <h3 className="font-bold text-lg mb-2 hover:text-blue-400 transition-colors text-gray-900">
                                {product.name}
                              </h3>
                            </Link>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {product.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-4">
                            <div>
                              {product.discountPrice ? (
                                <div>
                                  <div className="text-xs text-gray-400 line-through">
                                    R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </div>
                                  <div className="text-2xl font-black text-gray-900">
                                    R$ {product.discountPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-2xl font-black text-gray-900">
                                  R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                ou 12x de R$ {(displayPrice / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={(e) => handleToggleFavorite(product, e)}
                                className="w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:scale-110 hover:bg-white transition-all"
                              >
                                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                              </button>
                              <Button
                                onClick={() => handleAddToCart(product)}
                                className="bg-blue-400 hover:bg-blue-500 text-white px-6 rounded-full font-semibold"
                                disabled={product.stock <= 0}
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                {product.stock <= 0 ? 'Indisponível' : 'Adicionar'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  }

                  return (
                    <Link key={product.id} href={`/produto/${product.slug}`} className="block h-full">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -4, scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                        className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col h-full border border-gray-100"
                      >
                        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement
                              img.src = '/fallback-product.png'
                            }}
                          />
                          
                          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                            {product.discountPrice && (
                              <div className="px-1.5 py-0.5 bg-blue-400 text-white text-[10px] font-bold rounded-full shadow">
                                -{Math.round((1 - product.discountPrice / product.price) * 100)}%
                              </div>
                            )}
                          </div>

                          <button
                            onClick={(e) => handleToggleFavorite(product, e)}
                            className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/90 shadow-sm flex items-center justify-center hover:scale-110 hover:bg-white transition-all duration-200 z-10"
                          >
                            <Heart className={`h-3 w-3 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                          </button>
                        </div>

                        <div className="p-2 flex flex-col flex-1">
                          <div className="mb-1">
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-blue-400">
                              {product.brand?.name || 'Premium'}
                            </span>
                          </div>

                          <h3 className="font-bold text-xs mb-2 text-gray-900 line-clamp-2 group-hover:text-blue-400 transition-colors leading-tight">
                            {product.name}
                          </h3>

                          <div className="mt-auto space-y-1.5">
                            <div>
                              {product.discountPrice ? (
                                <div className="space-y-0">
                                  <div className="text-[10px] text-gray-400 line-through">
                                    R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </div>
                                  <div className="text-sm font-black text-gray-900">
                                    R$ {product.discountPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm font-black text-gray-900">
                                  R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                              )}
                              <p className="text-[9px] text-gray-500">
                                ou 12x de R$ {(displayPrice / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>

                            <button 
                              onClick={(e) => {
                                e.preventDefault()
                                handleAddToCart(product)
                              }}
                              className="w-full bg-blue-400 hover:bg-blue-500 active:bg-blue-600 text-white py-1.5 rounded-full font-semibold text-[10px] shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1"
                              disabled={product.stock <= 0}
                            >
                              <ShoppingCart className="h-3 w-3" />
                              {product.stock <= 0 ? 'Indisponível' : 'Comprar'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  )
                })}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-500 font-medium">
            Nenhum produto encontrado
          </p>
          <p className="text-gray-400 mt-2">
            Tente ajustar seus filtros ou buscar por outro termo
          </p>
        </motion.div>
      )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProdutosLoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Carregando produtos...</p>
      </div>
    </div>
  )
}

// Wrapper component to handle searchParams
function SearchParamsWrapper({ children }: { children: (params: { search: string | null, brand: string | null }) => React.ReactNode }) {
  const searchParams = useSearchParams()
  return <>{children({ search: searchParams.get('search'), brand: searchParams.get('brand') })}</>
}

export default function ProdutosPage() {
  return (
    <Suspense fallback={<ProdutosLoadingFallback />}>
      <ProdutosPageContent />
    </Suspense>
  )
}


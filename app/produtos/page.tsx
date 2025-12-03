'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Heart, Grid, List, Search, Filter, Package } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useModal } from '@/contexts/ModalContext'
import { toast } from 'sonner'
import apiClient, { Product, Brand } from '@/lib/api-client'

function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('name')
  const { addToCart } = useCart()
  const { user, favorites, toggleFavorite } = useAuth()
  const { openModal } = useModal()
  
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

  // Capturar parâmetros da URL e processar depois que marcas carregarem
  useEffect(() => {
    if (brands.length === 0) return

    const urlParams = new URLSearchParams(window.location.search)
    const searchParam = urlParams.get('search')
    const brandSlugParam = urlParams.get('brand')
    
    if (searchParam) {
      setSearchQuery(searchParam)
    }
    
    // Se tem slug de marca, buscar o ID da marca
    if (brandSlugParam) {
      const brand = brands.find(b => b.slug === brandSlugParam)
      if (brand) {
        setSelectedBrand(brand.id)
      }
    }
  }, [brands])

  // Carregar produtos quando filtros mudarem
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        let queryParams: any = { limit: 100 }
        
        // Adicionar search e brand aos parâmetros da API
        if (searchQuery) {
          queryParams.search = searchQuery
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
      }
    }

    loadProducts()
  }, [searchQuery, selectedBrand])

  // Aplicar ordenação localmente
  useEffect(() => {
    let sorted = [...filteredProducts]

    if (sortBy === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price)
    } else {
      sorted.sort((a, b) => a.name.localeCompare(b.name))
    }

    setFilteredProducts(sorted)
  }, [sortBy])

  const getWhatsAppLink = (product: Product) => {
    const message = `🛒 *USS Brasil Tecnologia*\n\nOlá! Tenho interesse neste produto:\n\n📱 *${product.name}*\n🏷️ Marca: ${product.brand?.name || 'N/A'}\n💰 Preço: R$ ${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\nEstá disponível?`
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
    toast.success(isFav ? 'Removido dos favoritos' : 'Adicionado aos favoritos!', {
      icon: isFav ? '💔' : '❤️'
    })
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
     

      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <motion.aside
            className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-6"
          >
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-lg text-gray-900">Buscar</h3>
              </div>
              <Input
                type="text"
                placeholder="Nome do produto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-gray-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-400" />
                Marcas
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <button
                  onClick={() => setSelectedBrand(null)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
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
                    onClick={() => setSelectedBrand(brand.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-blue-400" />
                <span className="text-gray-700 font-medium">Ordenar por:</span>
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
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-4'
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
                        className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 flex gap-6"
                      >
                        <Link href={`/produto/${product.slug}`} className="flex-shrink-0">
                          <div className="w-36 h-36 relative overflow-hidden bg-gray-50 rounded-lg">
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
                        whileHover={{ y: -8, scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                        className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col h-full border border-gray-100"
                      >
                        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement
                              img.src = '/fallback-product.png'
                            }}
                          />
                          
                          <div className="absolute top-3 left-3 flex flex-col gap-2">
                            {product.discountPrice && (
                              <div className="px-3 py-1 bg-blue-400 text-white text-xs font-bold rounded-full shadow-lg">
                                -{Math.round((1 - product.discountPrice / product.price) * 100)}%
                              </div>
                            )}
                          </div>

                          <button
                            onClick={(e) => handleToggleFavorite(product, e)}
                            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:scale-110 hover:bg-white transition-all duration-200 z-10"
                          >
                            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                          </button>
                        </div>

                        <div className="p-4 flex flex-col flex-1">
                          <div className="mb-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-blue-400">
                              {product.brand?.name || 'Premium'}
                            </span>
                          </div>

                          <h3 className="font-bold text-base mb-3 text-gray-900 line-clamp-2 group-hover:text-blue-400 transition-colors leading-tight">
                            {product.name}
                          </h3>

                          <div className="mt-auto space-y-3">
                            <div>
                              {product.discountPrice ? (
                                <div className="space-y-0.5">
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

                            <button 
                              onClick={(e) => {
                                e.preventDefault()
                                handleAddToCart(product)
                              }}
                              className="w-full bg-blue-400 hover:bg-blue-500 active:bg-blue-600 text-white py-3 rounded-full font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                              disabled={product.stock <= 0}
                            >
                              <ShoppingCart className="h-4 w-4" />
                              {product.stock <= 0 ? 'Indisponível' : 'Adicionar'}
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

export default ProdutosPage


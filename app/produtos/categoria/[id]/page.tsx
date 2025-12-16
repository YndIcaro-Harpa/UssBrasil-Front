'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Heart, Grid, List, Search, Filter, Package, X, Loader2, ArrowLeft } from 'lucide-react'
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
import apiClient, { Product, Category } from '@/lib/api-client'

const whatsappNumber = '5548991832760'

interface CategoryPageProps {
  params: {
    id: string
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
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

  // Carregar categoria e produtos
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [categoryRes, productsRes] = await Promise.all([
          apiClient.getCategoryById(params.id),
          apiClient.getProducts({ categoryId: params.id, limit: 100 })
        ])

        setCategory(categoryRes)
        setProducts(productsRes)
        setFilteredProducts(productsRes)
      } catch (error) {
        console.error('Erro ao carregar categoria:', error)
        toast.error('Erro ao carregar categoria')
        router.push('/produtos/categoria')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id, router])

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Aplicar filtros e ordenação
  useEffect(() => {
    let filtered = products.filter(product =>
      product.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      product.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
    )

    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price)
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    }

    setFilteredProducts(filtered)
  }, [debouncedSearch, sortBy, products])

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setDebouncedSearch('')
  }

  const getWhatsAppLink = (product: Product) => {
    const message = `*USS Brasil Tecnologia*\n\nOlá! Tenho interesse neste produto da categoria ${category?.name}:\n\n*${product.name}*\nPreço: R$ ${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\nEstá disponível?`
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
  }

  const handleAddToCart = (product: Product) => {
    const images = product.images && product.images.length > 0 ? product.images : []
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: images[0] || '/fallback-product.png',
      category: category?.name || 'Geral',
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
          <div className="w-12 h-12 rounded-full border-4 border-[#54c4cf] border-t-[#034a6e] animate-spin mx-auto mb-4" />
          <p className="text-[#6b7280]">Carregando categoria...</p>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <Package className="h-16 w-16 text-[#9ca3af] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">Categoria não encontrada</h2>
          <p className="text-[#6b7280] mb-6">A categoria que você está procurando não existe.</p>
          <Link href="/produtos/categoria">
            <Button className="bg-[#034a6e] hover:bg-[#065a84] text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Categorias
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e5e8eb]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#034a6e] to-[#54c4cf] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20"
          >
            <div className="flex items-center gap-4 mb-4">
              <Link href="/produtos/categoria" className="text-white hover:text-[#d1d5db] transition-colors">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div className="w-px h-8 bg-white/30" />
              <span className="text-[#d1d5db] text-sm">Categorias</span>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Category Image */}
              <div className="flex-shrink-0">
                {category.image ? (
                  <div className="w-24 h-24 md:w-32 md:h-32 relative rounded-2xl overflow-hidden bg-white/20">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Package className="h-12 w-12 md:h-16 md:w-16 text-white" />
                  </div>
                )}
              </div>

              {/* Category Info */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {category.name}
                </h1>
                <p className="text-xl text-[#d1d5db] mb-4">
                  {category.description || 'Explore nossa seleção de produtos nesta categoria.'}
                </p>
                <div className="flex items-center gap-6 text-sm text-[#d1d5db]">
                  <span>{filteredProducts.length} produto(s) disponível(is)</span>
                  <span>•</span>
                  <span>Qualidade Premium</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Filters and Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col lg:flex-row gap-4 lg:gap-6"
          >
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#9ca3af]" />
                <Input
                  type="text"
                  placeholder={`Buscar em ${category.name}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-[#e5e8eb] focus:border-[#54c4cf] focus:ring-[#54c4cf] pr-10 h-12 text-base"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#1a1a1a]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Sort and View */}
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border-[#e5e8eb] border rounded-lg text-[#1a1a1a] bg-white focus:border-[#54c4cf] focus:ring-[#54c4cf] font-medium"
              >
                <option value="name">Nome (A-Z)</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
              </select>

              <div className="flex items-center gap-1 bg-[#f5f7fa] rounded-lg border border-[#e5e8eb] p-1">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    view === 'grid'
                      ? 'bg-[#034a6e] text-white'
                      : 'text-[#6b7280] hover:text-[#034a6e] hover:bg-white'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    view === 'list'
                      ? 'bg-[#034a6e] text-white'
                      : 'text-[#6b7280] hover:text-[#034a6e] hover:bg-white'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Active Filters */}
          {(searchQuery || debouncedSearch) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex flex-wrap items-center gap-2 bg-[#034a6e]/5 border border-[#034a6e]/20 rounded-xl p-4"
            >
              <span className="text-sm text-[#1a1a1a] font-medium">Filtros ativos:</span>
              {debouncedSearch && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#034a6e] text-white rounded-full text-sm">
                  "{debouncedSearch}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-[#d1d5db]">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="ml-auto text-sm text-[#034a6e] hover:text-[#065a84] font-medium"
              >
                Limpar tudo
              </button>
            </motion.div>
          )}

          {/* Loading overlay */}
          {isFiltering && (
            <div className="mb-6 flex items-center justify-center gap-2 text-[#54c4cf]">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Filtrando produtos...</span>
            </div>
          )}

          {/* Products Grid/List */}
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
                      className="bg-white rounded-lg p-4 border border-[#e5e8eb] hover:border-[#54c4cf] hover:shadow-md transition-all duration-300 flex gap-4"
                    >
                      <Link href={`/produto/${product.slug}`} className="flex-shrink-0">
                        <div className="w-24 h-24 relative overflow-hidden bg-[#f5f7fa] rounded-lg">
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
                          <Link href={`/produto/${product.slug}`}>
                            <h3 className="font-bold text-lg mb-2 hover:text-[#034a6e] transition-colors text-[#1a1a1a]">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="text-[#6b7280] text-sm mb-4 line-clamp-2">
                            {product.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div>
                            {product.discountPrice ? (
                              <div>
                                <div className="text-xs text-[#9ca3af] line-through">
                                  R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                                <div className="text-2xl font-black text-[#1a1a1a]">
                                  R$ {product.discountPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                              </div>
                            ) : (
                              <div className="text-2xl font-black text-[#1a1a1a]">
                                R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                            )}
                            <p className="text-xs text-[#6b7280] mt-1">
                              ou 12x de R$ {(displayPrice / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={(e) => handleToggleFavorite(product, e)}
                              className="w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:scale-110 hover:bg-white transition-all"
                            >
                              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-[#6b7280]'}`} />
                            </button>
                            <Button
                              onClick={() => handleAddToCart(product)}
                              className="bg-[#034a6e] hover:bg-[#065a84] text-white px-6 rounded-full font-semibold"
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
                      className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col h-full border border-[#e5e8eb]"
                    >
                      <div className="relative aspect-square bg-gradient-to-br from-[#f5f7fa] to-[#e5e8eb] overflow-hidden">
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
                            <div className="px-1.5 py-0.5 bg-[#034a6e] text-white text-[10px] font-bold rounded-full shadow">
                              -{Math.round((1 - product.discountPrice / product.price) * 100)}%
                            </div>
                          )}
                        </div>

                        <button
                          onClick={(e) => handleToggleFavorite(product, e)}
                          className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/90 shadow-sm flex items-center justify-center hover:scale-110 hover:bg-white transition-all duration-200 z-10"
                        >
                          <Heart className={`h-3 w-3 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-[#6b7280]'}`} />
                        </button>
                      </div>

                      <div className="p-2 flex flex-col flex-1">
                        <h3 className="font-bold text-xs mb-2 text-[#1a1a1a] line-clamp-2 group-hover:text-[#034a6e] transition-colors leading-tight">
                          {product.name}
                        </h3>

                        <div className="mt-auto space-y-1.5">
                          <div>
                            {product.discountPrice ? (
                              <div className="space-y-0">
                                <div className="text-[10px] text-[#9ca3af] line-through">
                                  R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                                <div className="text-sm font-black text-[#1a1a1a]">
                                  R$ {product.discountPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm font-black text-[#1a1a1a]">
                                R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                            )}
                            <p className="text-[9px] text-[#6b7280]">
                              ou 12x de R$ {(displayPrice / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>

                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              handleAddToCart(product)
                            }}
                            className="w-full bg-[#034a6e] hover:bg-[#065a84] active:bg-[#022a3d] text-white py-1.5 rounded-full font-semibold text-[10px] shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1"
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
              <Package className="h-16 w-16 text-[#9ca3af] mx-auto mb-4" />
              <p className="text-xl text-[#6b7280] font-medium">
                Nenhum produto encontrado
              </p>
              <p className="text-[#9ca3af] mt-2">
                Tente ajustar sua busca ou explore outras categorias
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <Link href="/produtos/categoria">
                  <Button className="bg-[#034a6e] hover:bg-[#065a84] text-white">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Ver Todas as Categorias
                  </Button>
                </Link>
                <Link href="/produtos">
                  <Button variant="outline" className="border-[#034a6e] text-[#034a6e] hover:bg-[#034a6e] hover:text-white">
                    Ver Todos os Produtos
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-[#034a6e] to-[#54c4cf] rounded-2xl p-8 md:p-12 text-white"
          >
            <h2 className="text-3xl font-bold mb-4">
              Precisa de ajuda com {category.name}?
            </h2>
            <p className="text-xl mb-8 text-[#d1d5db]">
              Nossa equipe está pronta para tirar suas dúvidas sobre os produtos desta categoria
            </p>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Olá! Gostaria de saber mais sobre os produtos da categoria ${category.name}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-[#28a745] hover:bg-[#218838] text-white font-semibold rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Falar no WhatsApp
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

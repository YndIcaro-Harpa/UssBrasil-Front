'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Newspaper, Calendar, ArrowRight, Tag, Sparkles, Star, Package, ShoppingCart, Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { api, Product } from '@/services/api'
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

// Helper para parsear imagens
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

// Lógica para determinar se um produto é "Novo"
// Um produto mantém a tag "Novo" até que 5 outros produtos sejam cadastrados após ele
const isProductNew = (product: Product, allProducts: Product[]): boolean => {
  // Ordenar produtos por data de criação (mais recentes primeiro)
  const sortedProducts = [...allProducts].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  // Encontrar a posição deste produto na lista ordenada
  const productIndex = sortedProducts.findIndex(p => p.id === product.id)

  // Se o produto não for encontrado, não é novo
  if (productIndex === -1) return false

  // Um produto é considerado "Novo" se houver menos de 5 produtos criados após ele
  // Ou seja, se ele estiver entre os 5 mais recentes
  return productIndex < 5
}

export default function NovidadesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('Todos')

  const { addToCart } = useCart()
  const { user, favorites, toggleFavorite } = useAuth()
  const { openModal } = useModal()

  const whatsappNumber = '5548991832760'

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        // Buscar produtos com limite alto para ter dados suficientes para a lógica de "Novo"
        const productsResponse = await api.products.getAll({
          limit: 100
        })

        const productsList = Array.isArray(productsResponse)
          ? productsResponse
          : productsResponse.data || []

        // Ordenar produtos por data de criação (mais recentes primeiro)
        productsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        setProducts(productsList)
      } catch (error) {
        console.error('Erro ao carregar produtos:', error)
        toast.error('Erro ao carregar produtos')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  // Produtos com tag "Novo" baseado na lógica
  const newProducts = useMemo(() => {
    return products.filter(product => isProductNew(product, products))
  }, [products])

  // Produtos filtrados por categoria
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'Todos') {
      return products
    }

    return products.filter(product => {
      if (selectedCategory === 'Apple') return product.brand?.slug === 'apple'
      if (selectedCategory === 'Xiaomi') return product.brand?.slug === 'xiaomi'
      if (selectedCategory === 'Áudio') return product.category?.name?.toLowerCase().includes('fone') || product.category?.name?.toLowerCase().includes('audio')
      if (selectedCategory === 'Wearables') return product.category?.name?.toLowerCase().includes('watch') || product.category?.name?.toLowerCase().includes('smartwatch')
      if (selectedCategory === 'Acessórios') return product.category?.name?.toLowerCase().includes('acessório') || product.category?.name?.toLowerCase().includes('case')
      if (selectedCategory === 'Promoções') return product.discountPrice && product.discountPrice < product.price

      return true
    })
  }, [products, selectedCategory])

  // Categorias disponíveis baseado nos produtos
  const availableCategories = useMemo(() => {
    const categories = ['Todos']

    if (products.some(p => p.brand?.slug === 'apple')) categories.push('Apple')
    if (products.some(p => p.brand?.slug === 'xiaomi')) categories.push('Xiaomi')
    if (products.some(p => p.category?.name?.toLowerCase().includes('fone') || p.category?.name?.toLowerCase().includes('audio'))) categories.push('Áudio')
    if (products.some(p => p.category?.name?.toLowerCase().includes('watch') || p.category?.name?.toLowerCase().includes('smartwatch'))) categories.push('Wearables')
    if (products.some(p => p.category?.name?.toLowerCase().includes('acessório') || p.category?.name?.toLowerCase().includes('case'))) categories.push('Acessórios')
    if (products.some(p => p.discountPrice && p.discountPrice < p.price)) categories.push('Promoções')

    return categories
  }, [products])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const handleAddToCart = (product: Product) => {
    if (!user) {
      openModal('auth')
      return
    }

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
          <p className="text-gray-500 font-medium">Carregando novidades...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #001941 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#001941]/5 backdrop-blur-sm border border-[#001941]/10 rounded-full mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Newspaper className="h-4 w-4 text-[#001941]" />
              <span className="text-sm font-semibold text-[#001941] tracking-wide">
                FIQUE ATUALIZADO
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Nossas{' '}
              <span className="bg-gradient-to-r from-[#001941] to-blue-600 bg-clip-text text-transparent">
                Novidades
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              className="text-lg md:text-xl text-gray-600 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Acompanhe os produtos mais recentes com a tag{' '}
              <span className="font-semibold text-[#001941]">Novo</span>
            </motion.p>

            {/* Stats */}
            <motion.div
              className="flex items-center justify-center gap-8 mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <div className="text-center">
                <p className="text-3xl font-bold text-[#001941]">{newProducts.length}</p>
                <p className="text-sm text-gray-500">Produtos Novos</p>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div className="text-center">
                <p className="text-3xl font-bold text-[#001941]">{products.length}</p>
                <p className="text-sm text-gray-500">Total de Produtos</p>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Sparkles className="h-5 w-5 text-green-500" />
                  <p className="text-3xl font-bold text-[#001941]">Atualizado</p>
                </div>
                <p className="text-sm text-gray-500">Diariamente</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <motion.div
            className="flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {availableCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedCategory === category
                    ? 'bg-[#001941] text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Produtos Novos */}
      {newProducts.length > 0 && (
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Tag className="h-5 w-5 text-green-500" />
                Produtos com a tag <span className="text-green-500">Novo</span>
              </h2>
              <p className="text-gray-600">
                Os {Math.min(5, newProducts.length)} produtos mais recentes da nossa loja
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {newProducts.slice(0, 8).map((product, index) => {
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
                    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <Link href={`/produto/${product.slug}`}>
                      <div className="relative aspect-square bg-gradient-to-b from-gray-50 to-white p-4 overflow-hidden">
                        {hasDiscount && (
                          <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                            -{discountPercent}%
                          </div>
                        )}

                        <div className="absolute top-3 right-3 z-10 flex gap-2">
                          <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full flex items-center gap-1 shadow-lg">
                            <Sparkles className="h-3 w-3" /> Novo
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            handleToggleFavorite(product.id)
                          }}
                          className="absolute top-3 right-3 z-20 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
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

                      <div className="flex items-center gap-2 mb-3">
                        {product.brand && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {product.brand.name}
                          </span>
                        )}
                        {product.category && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                            {product.category.name}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex-1 bg-[#001941] hover:bg-[#023a58] text-white text-xs h-9 rounded-lg font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Comprar
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </section>
      )}

      {/* Todos os Produtos */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {selectedCategory === 'Todos' ? 'Todos os Produtos' : `Produtos ${selectedCategory}`}
            </h2>
            <p className="text-gray-600">
              {filteredProducts.length} produto(s) encontrado(s)
            </p>
          </motion.div>

          {filteredProducts.length === 0 ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {selectedCategory === 'Todos'
                  ? 'Não há produtos cadastrados ainda.'
                  : `Não encontramos produtos na categoria "${selectedCategory}".`
                }
              </p>
              {selectedCategory !== 'Todos' && (
                <button
                  onClick={() => setSelectedCategory('Todos')}
                  className="mt-4 px-6 py-3 bg-[#001941] text-white rounded-full font-semibold hover:bg-[#023a58] transition-colors"
                >
                  Ver todos os produtos
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {filteredProducts.map((product, index) => {
                const productImage = parseProductImage(product.images)
                const isFavorite = favorites?.includes(product.id)
                const hasDiscount = product.discountPrice && product.discountPrice < product.price
                const discountPercent = hasDiscount
                  ? Math.round((1 - product.discountPrice! / product.price) * 100)
                  : 0
                const isNew = isProductNew(product, products)

                return (
                  <motion.div
                    key={product.id}
                    variants={fadeInUp}
                    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <Link href={`/produto/${product.slug}`}>
                      <div className="relative aspect-square bg-gradient-to-b from-gray-50 to-white p-4 overflow-hidden">
                        {hasDiscount && (
                          <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                            -{discountPercent}%
                          </div>
                        )}

                        <div className="absolute top-3 right-3 z-10 flex gap-2">
                          {isNew && (
                            <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full flex items-center gap-1 shadow-lg">
                              <Sparkles className="h-3 w-3" /> Novo
                            </span>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            handleToggleFavorite(product.id)
                          }}
                          className="absolute top-3 right-3 z-20 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
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

                      <div className="flex items-center gap-2 mb-3">
                        {product.brand && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {product.brand.name}
                          </span>
                        )}
                        {product.category && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                            {product.category.name}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(product.createdAt)}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex-1 bg-[#001941] hover:bg-[#023a58] text-white text-xs h-9 rounded-lg font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Comprar
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-gradient-to-r from-[#001941] to-[#023a58]">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles className="h-12 w-12 text-white/80 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Receba as novidades em primeira mão
            </h2>
            <p className="text-white/70 mb-6">
              Inscreva-se em nossa newsletter e fique por dentro de todas as novidades, lançamentos e ofertas exclusivas.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="flex-1 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <button className="px-8 py-3 bg-white text-[#001941] rounded-full font-semibold hover:bg-gray-100 transition-colors">
                Inscrever-se
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

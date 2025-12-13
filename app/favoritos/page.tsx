'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, Trash2, ArrowLeft, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { api, WishlistItem } from '@/services/api'

// Helper para extrair imagem principal
const getPrimaryImage = (images?: Array<{ url: string; isPrimary?: boolean }> | string): string => {
  if (!images) return '/placeholder.png'
  
  if (typeof images === 'string') {
    // Primeiro, tentar parse como JSON
    try {
      const parsed = JSON.parse(images)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const primary = parsed.find((img: any) => img.isPrimary)
        return primary?.url || parsed[0]?.url || parsed[0] || '/placeholder.png'
      }
    } catch {
      // Não é JSON - verificar se é lista separada por vírgula
      if (images.includes(',')) {
        const imageList = images.split(',').map(img => img.trim()).filter(Boolean)
        if (imageList.length > 0) {
          return imageList[0]
        }
      }
      // String única - retornar diretamente
      return images || '/placeholder.png'
    }
  }
  
  if (Array.isArray(images) && images.length > 0) {
    const primary = images.find(img => img.isPrimary)
    return primary?.url || images[0]?.url || '/placeholder.png'
  }
  
  return '/placeholder.png'
}

interface FavoriteProduct {
  id: string
  name: string
  brand: string
  price: number
  originalPrice: number | null
  image: string
  slug: string
  stock: number
  status: string
}

export default function FavoritosPage() {
  const [favoriteProducts, setFavoriteProducts] = useState<FavoriteProduct[]>([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()
  const { favorites, favoriteItems, toggleFavorite, token, isAuthenticated, syncFavorites } = useAuth()

  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true)
      
      try {
        if (isAuthenticated && token) {
          // Usuário logado - usar dados da API (já sincronizados no contexto)
          const products = favoriteItems.map((item: WishlistItem) => ({
            id: item.productId,
            name: item.product.name,
            brand: item.product.brand?.name || 'USS Brasil',
            price: item.product.originalPrice ?? item.product.price,
            originalPrice: item.product.price < (item.product.originalPrice ?? item.product.price) 
              ? (item.product.originalPrice ?? null)
              : null,
            image: getPrimaryImage(item.product.images),
            slug: item.product.slug || item.productId,
            stock: item.product.stock || 99,
            status: item.product.status || 'ACTIVE'
          }))
          
          setFavoriteProducts(products)
        } else {
          // Usuário não logado - buscar do localStorage/API pública
          if (favorites.length > 0) {
            // Buscar produtos individualmente da API pública
            const productPromises = favorites.map(async (id) => {
              try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/products/${id}`)
                if (!response.ok) return null
                const product = await response.json()
                return {
                  id: String(product.id),
                  name: product.name,
                  brand: product.brand?.name || product.brand || 'USS Brasil',
                  price: product.originalPrice || product.price,
                  originalPrice: product.discountPrice || (product.price < product.originalPrice ? product.originalPrice : null),
                  image: getPrimaryImage(product.images) || product.image || '/placeholder.png',
                  slug: product.slug || product.id,
                  stock: product.stock || 99,
                  status: product.status || 'ACTIVE'
                }
              } catch {
                return null
              }
            })
            
            const products = (await Promise.all(productPromises)).filter(Boolean) as FavoriteProduct[]
            setFavoriteProducts(products)
          } else {
            setFavoriteProducts([])
          }
        }
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error)
        setFavoriteProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [favorites, favoriteItems, isAuthenticated, token])

  const handleRemoveFavorite = async (productId: string) => {
    await toggleFavorite(productId)
    setFavoriteProducts(prev => prev.filter(p => p.id !== productId))
    toast.success('Removido dos favoritos')
  }

  const handleAddToCart = (product: FavoriteProduct) => {
    if (product.stock <= 0 || (product.status !== 'ACTIVE' && product.status !== 'active')) {
      toast.error('Produto indisponível')
      return
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.originalPrice || product.price,
      discountPrice: product.price,
      image: product.image,
      stock: product.stock,
      slug: product.slug,
      brand: product.brand
    })
    toast.success('Adicionado ao carrinho!')
  }

  const handleMoveToCart = async (product: FavoriteProduct) => {
    if (product.stock <= 0 || (product.status !== 'ACTIVE' && product.status !== 'active')) {
      toast.error('Produto indisponível')
      return
    }

    // Se usuário estiver logado, usar a API de mover para carrinho
    if (isAuthenticated && token) {
      try {
        await api.wishlist.moveToCart(token, product.id)
        setFavoriteProducts(prev => prev.filter(p => p.id !== product.id))
        toast.success('Produto movido para o carrinho!')
        // Sincronizar favoritos após a operação
        await syncFavorites()
      } catch (error: any) {
        console.error('Erro ao mover para carrinho:', error)
        toast.error(error.message || 'Erro ao mover para carrinho')
      }
    } else {
      // Não logado - adicionar ao carrinho e remover dos favoritos
      handleAddToCart(product)
      await handleRemoveFavorite(product.id)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
          <p className="text-gray-500">Carregando favoritos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para home
          </Link>
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900">
              Meus Favoritos
            </h1>
          </div>
          <p className="text-gray-600 mt-2">
            {favoriteProducts.length === 0
              ? 'Você ainda não tem produtos favoritos'
              : `${favoriteProducts.length} ${favoriteProducts.length === 1 ? 'produto' : 'produtos'} salvos`}
          </p>
          {!isAuthenticated && (
            <p className="text-amber-600 text-sm mt-2">
              💡 Faça login para sincronizar seus favoritos em todos os dispositivos
            </p>
          )}
        </div>

        {/* Empty State */}
        {favoriteProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Nenhum favorito ainda
            </h2>
            <p className="text-gray-600 mb-8">
              Adicione produtos aos favoritos para vê-los aqui
            </p>
            <Link
              href="/produtos"
              className="inline-flex items-center gap-2 bg-blue-400 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-500 transition-colors"
            >
              Ver Produtos
            </Link>
          </motion.div>
        )}

        {/* Products Grid */}
        {favoriteProducts.length > 0 && (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteProducts.map((product) => {
                const displayPrice = product.originalPrice && product.originalPrice > product.price 
                  ? product.price 
                  : product.price
                const hasDiscount = product.originalPrice && product.originalPrice > product.price
                const discountPercent = hasDiscount && product.originalPrice
                  ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                  : 0

                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden"
                  >
                    <Link href={`/produto/${product.slug}`} className="block">
                      {/* Image Container */}
                      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {hasDiscount && discountPercent > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                              -{discountPercent}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        {/* Brand */}
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">
                          {product.brand}
                        </span>

                        {/* Title */}
                        <h3 className="font-bold text-gray-900 mt-2 mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors">
                          {product.name}
                        </h3>

                        {/* Price */}
                        <div className="mb-4">
                          {hasDiscount && product.originalPrice && (
                            <p className="text-sm text-gray-400 line-through">
                              R$ {product.originalPrice.toFixed(2)}
                            </p>
                          )}
                          <p className="text-2xl font-black text-blue-400">
                            R$ {displayPrice.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            em até 12x de R$ {(displayPrice / 12).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </Link>

                    {/* Actions */}
                    <div className="px-4 pb-4 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          handleRemoveFavorite(product.id)
                        }}
                        className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-full font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remover
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          handleMoveToCart(product)
                        }}
                        disabled={product.stock <= 0 || (product.status !== 'ACTIVE' && product.status !== 'active')}
                        className="flex-1 bg-blue-400 text-white px-4 py-2 rounded-full font-bold hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Carrinho
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}


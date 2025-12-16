'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Heart, 
  ShoppingCart, 
  Trash2,
  Eye,
  Loader2,
  HeartOff
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import data from '@/db.json'

interface FavoriteProduct {
  id: string
  name: string
  slug: string
  price: number
  discountPrice?: number
  image: string
  brand: string
  inStock: boolean
}

export default function ProfileFavorites() {
  const [favoriteProducts, setFavoriteProducts] = useState<FavoriteProduct[]>([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()
  const { favorites, favoriteItems, toggleFavorite, syncFavorites, isAuthenticated, token } = useAuth()

  useEffect(() => {
    // Carregar produtos dos favoritos usando o AuthContext e API
    const loadFavorites = async () => {
      try {
        console.log('ProfileFavorites - Loading favorites:', favorites)
        console.log('ProfileFavorites - Favorite items:', favoriteItems)
        console.log('ProfileFavorites - Is authenticated:', isAuthenticated)

        if (isAuthenticated && token) {
          // Usuário logado - sincronizar com backend
          console.log('ProfileFavorites - Syncing with backend...')
          await syncFavorites()
        } else {
          // Usuário não logado - usar dados locais
          console.log('ProfileFavorites - Using local data...')
          // Buscar produtos do db.json que estão nos favoritos
          const products = data.products.filter((p: any) => {
            const productId = String(p.id)
            const isInFavorites = favorites.includes(productId)
            console.log(`Checking product ${productId}:`, isInFavorites)
            return isInFavorites
          }).map((p: any) => ({
            id: String(p.id),
            name: p.name,
            slug: p.slug || String(p.id),
            price: p.price,
            discountPrice: p.discountPrice || undefined,
            image: p.image || p.images?.[0] || '/placeholder.png',
            brand: p.brand || 'USS Brasil',
            inStock: (p.stock || 99) > 0
          }))
          
          setFavoriteProducts(products)
        }
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error)
        // Fallback para dados locais em caso de erro
        const products = data.products.filter((p: any) => {
          const productId = String(p.id)
          const isInFavorites = favorites.includes(productId)
          return isInFavorites
        }).map((p: any) => ({
          id: String(p.id),
          name: p.name,
          slug: p.slug || String(p.id),
          price: p.price,
          discountPrice: p.discountPrice || undefined,
          image: p.image || p.images?.[0] || '/placeholder.png',
          brand: p.brand || 'USS Brasil',
          inStock: (p.stock || 99) > 0
        }))
        setFavoriteProducts(products)
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [favorites, favoriteItems, isAuthenticated, token, syncFavorites])

  // Atualizar produtos quando os favoriteItems do backend mudarem
  useEffect(() => {
    if (isAuthenticated && favoriteItems.length > 0) {
      console.log('ProfileFavorites - Updating products from backend items:', favoriteItems)
      
      const products: FavoriteProduct[] = favoriteItems.map((item) => {
        // Parse das imagens (vem como string JSON do backend)
        let images: string[] = []
        try {
          images = JSON.parse(item.product.images || '[]')
        } catch (e) {
          images = []
        }

        return {
          id: item.productId,
          name: item.product.name,
          slug: item.product.slug,
          price: item.product.price,
          discountPrice: item.product.originalPrice || undefined,
          image: images[0] || '/placeholder.png',
          brand: item.product.brand?.name || 'USS Brasil',
          inStock: item.product.stock > 0
        }
      })
      
      setFavoriteProducts(products)
      setLoading(false)
    }
  }, [favoriteItems, isAuthenticated])

  // Função para forçar reload dos favoritos
  const reloadFavorites = async () => {
    console.log('ProfileFavorites - Reloading favorites manually')
    setLoading(true)
    
    try {
      if (isAuthenticated && token) {
        // Usuário logado - sincronizar com backend
        await syncFavorites()
      } else {
        // Usuário não logado - recarregar dados locais
        const products = data.products.filter((p: any) => {
          const productId = String(p.id)
          const isInFavorites = favorites.includes(productId)
          return isInFavorites
        }).map((p: any) => ({
          id: String(p.id),
          name: p.name,
          slug: p.slug || String(p.id),
          price: p.price,
          discountPrice: p.discountPrice || undefined,
          image: p.image || p.images?.[0] || '/placeholder.png',
          brand: p.brand || 'USS Brasil',
          inStock: (p.stock || 99) > 0
        }))
        setFavoriteProducts(products)
      }
    } catch (error) {
      console.error('Erro ao recarregar favoritos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = (id: string) => {
    console.log('ProfileFavorites - Removing favorite:', id)
    toggleFavorite(id)
    toast.success('Removido dos favoritos')
    
    // Atualizar lista localmente também
    setFavoriteProducts(prev => prev.filter(product => product.id !== id))
  }

  const handleAddToCart = (product: FavoriteProduct) => {
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      image: product.image,
      stock: 99
    }

    addToCart(cartProduct as any, 1)
    toast.success('Adicionado ao carrinho!')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const calculateDiscount = (original: number, discounted: number) => {
    return Math.round(((original - discounted) / original) * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#034a6e]" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Meus Favoritos</h2>
          <p className="text-sm text-gray-500 mt-1">
            {favoriteProducts.length} {favoriteProducts.length === 1 ? 'produto salvo' : 'produtos salvos'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={reloadFavorites}
            className="gap-2"
          >
            <Loader2 className="h-4 w-4" />
            Atualizar
          </Button>
          <Link href="/favoritos">
            <Button variant="outline" className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
              <Heart className="h-4 w-4" />
              Ver Página Completa
            </Button>
          </Link>
        </div>
      </div>

      {/* Favorites List */}
      {favoriteProducts.length === 0 ? (
        <div className="text-center py-16">
          <HeartOff className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum favorito ainda
          </h3>
          <p className="text-gray-500 mb-6">
            Explore nossos produtos e salve seus favoritos
          </p>
          <Link href="/produtos">
            <Button className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
              Explorar Produtos
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden group hover:shadow-lg transition-all"
            >
              {/* Image */}
              <div className="relative aspect-square bg-gray-100">
                <Link href={`/produto/${product.slug}`}>
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </Link>
                
                {/* Discount Badge */}
                {product.discountPrice && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    -{calculateDiscount(product.price, product.discountPrice)}%
                  </div>
                )}

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveFavorite(product.id)}
                  className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                </button>
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  {product.brand}
                </p>
                <Link href={`/produto/${product.slug}`}>
                  <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>

                {/* Price */}
                <div className="mt-2">
                  {product.discountPrice ? (
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(product.discountPrice)}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                    className="flex-1 gap-2"
                    size="sm"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Adicionar
                  </Button>
                  <Link href={`/produto/${product.slug}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

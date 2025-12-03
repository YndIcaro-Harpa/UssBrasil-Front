"use client"
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Star, Eye, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useModal } from '@/contexts/ModalContext'
import { slugifyCategory } from '@/lib/slugify'
import { toast } from 'sonner'
import { getMediaUrl } from '@/lib/media-utils'

interface Product {
  id: string
  name: string
  price: number
  discountPrice?: number
  image: string
  images?: string[]
  category: string
  marca: string
  rating?: number
  stock: number
  featured?: boolean
  description?: string
}

interface ProductCardProps {
  product: Product
  variant?: 'default' | 'compact' | 'featured'
  showQuickView?: boolean
  className?: string
}

export default function ProductCard({ 
  product, 
  variant = 'default', 
  showQuickView = false,
  className = '' 
}: ProductCardProps) {
  const { addToCart } = useCart()
  const { user, favorites, toggleFavorite } = useAuth()
  const { openModal } = useModal()
  const [imageLoading, setImageLoading] = useState(true)
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  const isFavorite = favorites.includes(product.id)
  const discountPercentage = product.discountPrice 
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0

  const productLink = `/produtos/${slugifyCategory(product.category)}/${product.id}`

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      id: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.image,
      category: product.category,
      stock: product.stock
    })
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Validar se usuário está logado
    if (!user) {
      toast.error('Faça login para adicionar aos favoritos')
      openModal('auth')
      return
    }
    
    const wasFavorite = favorites.includes(product.id)
    toggleFavorite(product.id)
    toast.success(wasFavorite ? 'Removido dos favoritos' : 'Adicionado aos favoritos', {
      icon: wasFavorite ? '💔' : '❤️'
    })
  }

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        className={`group relative bg-gray-50/50 rounded-lg border border-gray-200 hover:border-uss-primary/30 hover:shadow-md transition-all duration-300 shadow-sm ${className}`}
      >
        <Link href={productLink} className="block p-3">
          <div className="aspect-square relative mb-2 rounded-md overflow-hidden bg-uss-gray-50">
            <OptimizedImage
              src={getMediaUrl(product.image, 'image')}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100px, 150px"
              className="object-contain group-hover:scale-105 transition-transform duration-300"
              onLoad={() => setImageLoading(false)}
            />
            {product.featured && (
              <Badge className="absolute top-1 left-1 bg-uss-secondary text-white text-xs">
                Destaque
              </Badge>
            )}
            {discountPercentage > 0 && (
              <Badge className="absolute top-1 right-1 bg-uss-danger text-white text-xs">
                -{discountPercentage}%
              </Badge>
            )}
          </div>
          
          <h3 className="font-medium text-sm text-uss-gray-800 line-clamp-2 mb-1">{product.name}</h3>
          
          <div className="flex items-center justify-between">
            <div>
              {product.discountPrice ? (
                <div className="flex flex-col">
                  <span className="text-xs text-uss-gray-500 line-through">
                    R$ {product.price.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-sm font-bold text-uss-primary">
                    R$ {product.discountPrice.toLocaleString('pt-BR')}
                  </span>
                </div>
              ) : (
                <span className="text-sm font-bold text-uss-gray-800">
                  R$ {product.price.toLocaleString('pt-BR')}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleToggleFavorite}
                className="h-6 w-6 p-0"
              >
                <Heart 
                  className={`h-3 w-3 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                />
              </Button>
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="h-6 px-2 bg-uss-primary hover:bg-uss-primary-dark text-white text-xs shadow-sm hover:shadow-md transition-all"
                disabled={product.stock <= 0}
              >
                <ShoppingCart className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  if (variant === 'featured') {
    return (
      <motion.div
        whileHover={{ y: -8 }}
        className={`group relative bg-gray-50/50 rounded-xl border border-gray-200 hover:border-uss-primary/50 hover:shadow-md transition-all duration-300 overflow-hidden shadow-sm ${className}`}
      >
        <Link href={productLink} className="block">
          <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-uss-gray-50 to-uss-gray-100">
            <OptimizedImage
              src={getMediaUrl(product.image, 'image')}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-contain group-hover:scale-105 transition-transform duration-500"
              onLoad={() => setImageLoading(false)}
            />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {product.featured && (
                <Badge className="bg-gradient-to-r from-uss-secondary to-uss-secondary-light text-white border-0">
                  <Zap className="h-3 w-3 mr-1" />
                  Destaque
                </Badge>
              )}
              {discountPercentage > 0 && (
                <Badge className="bg-gradient-to-r from-uss-danger to-uss-danger-light text-white border-0">
                  -{discountPercentage}%
                </Badge>
              )}
            </div>

            {/* Quick Actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleToggleFavorite}
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md"
              >
                <Heart 
                  className={`h-4 w-4 ${isFavorite ? 'fill-uss-danger text-uss-danger' : 'text-uss-gray-600'}`} 
                />
              </Button>
              {showQuickView && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md"
                >
                  <Eye className="h-4 w-4 text-uss-gray-600" />
                </Button>
              )}
            </div>

            {/* Stock status */}
            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="secondary" className="bg-white text-gray-900">
                  Esgotado
                </Badge>
              </div>
            )}
          </div>
          
          <div className="p-4">
            <div className="mb-2 flex flex-col gap-1">
              <Badge variant="outline" className="text-xs font-semibold text-uss-primary bg-uss-primary/5 border-uss-primary/20 w-fit">
                {product.marca}
              </Badge>
              <Badge className="text-xs text-gray-700 bg-gray-200 border-gray-200 w-fit">
                {product.category}
              </Badge>
              <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-uss-primary transition-colors mt-1">
                {product.name}
              </h3>
            </div>
            
            {product.rating && (
              <div className="flex items-center mb-3">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= product.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-2">({product.rating})</span>
              </div>
            )}
            
            <div className="flex items-center justify-between mb-4">
              <div>
                {product.discountPrice ? (
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 line-through">
                      R$ {product.price.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-xl font-bold text-uss-primary">
                      R$ {product.discountPrice.toLocaleString('pt-BR')}
                    </span>
                  </div>
                ) : (
                  <span className="text-xl font-bold text-gray-900">
                    R$ {product.price.toLocaleString('pt-BR')}
                  </span>
                )}
              </div>
              
              <div className="text-right">
                <div className="text-xs text-gray-500">Estoque</div>
                <div className={`text-sm font-medium ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {product.stock} unidades
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-uss-primary hover:bg-uss-primary-dark text-white font-semibold shadow-md hover:shadow-lg transition-all"
                disabled={product.stock <= 0}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.stock <= 0 ? 'Indisponível' : 'Comprar'}
              </Button>
              <Link href={productLink} className="flex-shrink-0">
                <Button
                  variant="outline"
                  className="bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 font-medium shadow-md hover:shadow-lg transition-all h-full px-4"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  // Default variant
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setShowQuickAdd(true)}
      onHoverEnd={() => setShowQuickAdd(false)}
      className={`group relative bg-white rounded-2xl border border-gray-200 hover:border-uss-primary/50 hover:shadow-2xl hover:shadow-uss-primary/10 transition-all duration-500 overflow-hidden shadow-md ${className} h-full flex flex-col`}
    >
      <Link href={productLink} className="block flex-1 flex flex-col">
        <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <OptimizedImage
            src={getMediaUrl(product.image, 'image')}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-contain p-3 sm:p-4 group-hover:scale-110 transition-transform duration-700"
            onLoad={() => setImageLoading(false)}
          />
          
          {/* Badges */}
          {product.featured && (
            <Badge className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[10px] sm:text-xs font-bold shadow-lg px-2 py-1">
              <Star className="h-3 w-3 mr-1 inline" />
              Destaque
            </Badge>
          )}
          {discountPercentage > 0 && (
            <Badge className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs sm:text-sm font-bold shadow-lg px-2 sm:px-3 py-1">
              -{discountPercentage}%
            </Badge>
          )}
          
          {/* Favorite button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleToggleFavorite}
            className="absolute bottom-2 right-2 h-8 w-8 p-0 bg-white hover:bg-gray-50 shadow-md hover:shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-all duration-300"
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart 
              className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
            />
          </Button>
        </div>
        
        <div className="p-3 sm:p-4 flex-1 flex flex-col">
          <div className="mb-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Badge variant="outline" className="text-[10px] sm:text-xs font-bold text-white bg-gradient-to-r from-uss-primary to-uss-primary-dark border-0 px-2 py-0.5">
              {product.marca}
            </Badge>
            <Badge className="text-[10px] sm:text-xs font-semibold text-uss-primary bg-uss-primary/10 border border-uss-primary/30 px-2 py-0.5">
              {product.category}
            </Badge>
          </div>
          <h3 className="font-bold text-sm sm:text-base text-gray-900 line-clamp-2 group-hover:text-uss-primary transition-colors mb-2 leading-snug flex-1">
            {product.name}
          </h3>
          
          {product.rating && (
            <div className="flex items-center mb-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${
                      star <= product.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600 ml-1">({product.rating})</span>
            </div>
          )}
          
          <div className="flex items-end justify-between mb-3">
            <div className="flex-1">
              {product.discountPrice ? (
                <div className="flex flex-col">
                  <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                    R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-base sm:text-lg md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-uss-primary to-uss-cyan">
                    R$ {product.discountPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ) : (
                <span className="text-base sm:text-lg md:text-xl font-black text-gray-900">
                  R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
            
            <div className="text-right">
              <div className={`text-[10px] sm:text-xs font-medium ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                {product.stock > 0 ? (product.stock <= 5 ? `Últimas ${product.stock}!` : 'Em estoque') : 'Esgotado'}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-auto">
            <Button
              onClick={handleAddToCart}
              className="flex-1 bg-gradient-to-r from-uss-primary via-uss-primary-dark to-uss-primary hover:shadow-xl hover:shadow-uss-primary/30 text-white font-bold text-xs sm:text-sm transition-all duration-300 hover:scale-105 py-2 sm:py-2.5"
              disabled={product.stock <= 0}
            >
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">{product.stock <= 0 ? 'Indisponível' : 'Adicionar'}</span>
              <span className="sm:hidden">+</span>
            </Button>
            <Button
              onClick={handleToggleFavorite}
              variant="outline"
              className="px-2 sm:px-3 hover:bg-red-50 hover:border-red-300 transition-all duration-300"
            >
              <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}


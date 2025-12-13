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
    toast.success(wasFavorite ? 'Removido dos favoritos' : 'Adicionado aos favoritos')
  }

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className={`group relative bg-gray-50/50 rounded-md border border-gray-200 hover:border-uss-primary/30 hover:shadow-sm transition-all duration-300 shadow-sm ${className}`}
      >
        <Link href={productLink} className="block p-2">
          <div className="aspect-square relative mb-1.5 rounded overflow-hidden bg-uss-gray-50">
            <OptimizedImage
              src={getMediaUrl(product.image, 'image')}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100px, 150px"
              className="object-contain group-hover:scale-105 transition-transform duration-300"
              onLoad={() => setImageLoading(false)}
            />
            {product.featured && (
              <Badge className="absolute top-0.5 left-0.5 bg-uss-secondary text-white text-[9px] px-1 py-0">
                Destaque
              </Badge>
            )}
            {discountPercentage > 0 && (
              <Badge className="absolute top-0.5 right-0.5 bg-uss-danger text-white text-[9px] px-1 py-0">
                -{discountPercentage}%
              </Badge>
            )}
          </div>
          
          <h3 className="font-medium text-xs text-uss-gray-800 line-clamp-2 mb-0.5">{product.name}</h3>
          
          <div className="flex items-center justify-between">
            <div>
              {product.discountPrice ? (
                <div className="flex flex-col">
                  <span className="text-[9px] text-uss-gray-500 line-through">
                    R$ {product.price.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-xs font-bold text-uss-primary">
                    R$ {product.discountPrice.toLocaleString('pt-BR')}
                  </span>
                </div>
              ) : (
                <span className="text-xs font-bold text-uss-gray-800">
                  R$ {product.price.toLocaleString('pt-BR')}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-0.5">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleToggleFavorite}
                className="h-5 w-5 p-0"
              >
                <Heart 
                  className={`h-2.5 w-2.5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                />
              </Button>
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="h-5 px-1.5 bg-uss-primary hover:bg-uss-primary-dark text-white text-[10px] shadow-sm hover:shadow-md transition-all"
                disabled={product.stock <= 0}
              >
                <ShoppingCart className="h-2.5 w-2.5" />
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
        whileHover={{ y: -4 }}
        className={`group relative bg-gray-50/50 rounded-lg border border-gray-200 hover:border-uss-primary/50 hover:shadow-md transition-all duration-300 overflow-hidden shadow-sm ${className}`}
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
            <div className="absolute top-2 left-2 flex flex-col gap-0.5">
              {product.featured && (
                <Badge className="bg-gradient-to-r from-uss-secondary to-uss-secondary-light text-white border-0 text-[10px] px-1.5 py-0">
                  <Zap className="h-2.5 w-2.5 mr-0.5" />
                  Destaque
                </Badge>
              )}
              {discountPercentage > 0 && (
                <Badge className="bg-gradient-to-r from-uss-danger to-uss-danger-light text-white border-0 text-[10px] px-1.5 py-0">
                  -{discountPercentage}%
                </Badge>
              )}
            </div>

            {/* Quick Actions */}
            <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleToggleFavorite}
                className="h-6 w-6 p-0 bg-white/90 hover:bg-white shadow-sm"
              >
                <Heart 
                  className={`h-3 w-3 ${isFavorite ? 'fill-uss-danger text-uss-danger' : 'text-uss-gray-600'}`} 
                />
              </Button>
              {showQuickView && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-6 w-6 p-0 bg-white/90 hover:bg-white shadow-sm"
                >
                  <Eye className="h-3 w-3 text-uss-gray-600" />
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
          
          <div className="p-3">
            <div className="mb-1.5 flex flex-col gap-0.5">
              <Badge variant="outline" className="text-[10px] font-semibold text-uss-primary bg-uss-primary/5 border-uss-primary/20 w-fit px-1.5 py-0">
                {product.marca}
              </Badge>
              <Badge className="text-[10px] text-gray-700 bg-gray-200 border-gray-200 w-fit px-1.5 py-0">
                {product.category}
              </Badge>
              <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-uss-primary transition-colors mt-0.5">
                {product.name}
              </h3>
            </div>
            
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
            
            <div className="flex items-center justify-between mb-2">
              <div>
                {product.discountPrice ? (
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 line-through">
                      R$ {product.price.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-base font-bold text-uss-primary">
                      R$ {product.discountPrice.toLocaleString('pt-BR')}
                    </span>
                  </div>
                ) : (
                  <span className="text-base font-bold text-gray-900">
                    R$ {product.price.toLocaleString('pt-BR')}
                  </span>
                )}
              </div>
              
              <div className="text-right">
                <div className="text-[9px] text-gray-500">Estoque</div>
                <div className={`text-[10px] font-medium ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {product.stock} un.
                </div>
              </div>
            </div>
            
            <div className="flex gap-1.5">
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-uss-primary hover:bg-uss-primary-dark text-white font-semibold text-xs py-1.5 shadow-sm hover:shadow-md transition-all"
                disabled={product.stock <= 0}
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                {product.stock <= 0 ? 'Indisponível' : 'Comprar'}
              </Button>
              <Link href={productLink} className="flex-shrink-0">
                <Button
                  variant="outline"
                  className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-medium shadow-sm hover:shadow-md transition-all h-full px-2"
                >
                  <Eye className="h-3 w-3" />
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
      whileHover={{ y: -4, scale: 1.01 }}
      onHoverStart={() => setShowQuickAdd(true)}
      onHoverEnd={() => setShowQuickAdd(false)}
      className={`group relative bg-white rounded-xl border border-gray-200 hover:border-uss-primary/50 hover:shadow-lg hover:shadow-uss-primary/10 transition-all duration-300 overflow-hidden shadow-sm ${className} h-full flex flex-col`}
    >
      <Link href={productLink} className="block flex-1 flex flex-col">
        <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <OptimizedImage
            src={getMediaUrl(product.image, 'image')}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-contain p-2 sm:p-3 group-hover:scale-105 transition-transform duration-500"
            onLoad={() => setImageLoading(false)}
          />
          
          {/* Badges */}
          {product.featured && (
            <Badge className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[9px] sm:text-[10px] font-bold shadow-md px-1.5 py-0.5">
              <Star className="h-2.5 w-2.5 mr-0.5 inline" />
              Destaque
            </Badge>
          )}
          {discountPercentage > 0 && (
            <Badge className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-[9px] sm:text-[10px] font-bold shadow-md px-1.5 py-0.5">
              -{discountPercentage}%
            </Badge>
          )}
          
          {/* Favorite button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleToggleFavorite}
            className="absolute bottom-1.5 right-1.5 h-6 w-6 p-0 bg-white hover:bg-gray-50 shadow-sm hover:shadow-md border border-gray-200 opacity-0 group-hover:opacity-100 transition-all duration-300"
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart 
              className={`h-3 w-3 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
            />
          </Button>
        </div>
        
        <div className="p-2 sm:p-2.5 flex-1 flex flex-col">
          <div className="mb-1 flex flex-wrap items-center gap-1">
            <Badge variant="outline" className="text-[9px] sm:text-[10px] font-bold text-white bg-gradient-to-r from-uss-primary to-uss-primary-dark border-0 px-1.5 py-0">
              {product.marca}
            </Badge>
            <Badge className="text-[9px] sm:text-[10px] font-semibold text-uss-primary bg-uss-primary/10 border border-uss-primary/30 px-1.5 py-0">
              {product.category}
            </Badge>
          </div>
          <h3 className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-2 group-hover:text-uss-primary transition-colors mb-1 leading-snug flex-1">
            {product.name}
          </h3>
          
          {product.rating && (
            <div className="flex items-center mb-1">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-2.5 w-2.5 ${
                      star <= product.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-gray-600 ml-0.5">({product.rating})</span>
            </div>
          )}
          
          <div className="flex items-end justify-between mb-1.5">
            <div className="flex-1">
              {product.discountPrice ? (
                <div className="flex flex-col">
                  <span className="text-[9px] sm:text-[10px] text-gray-400 line-through">
                    R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-uss-primary to-uss-cyan">
                    R$ {product.discountPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ) : (
                <span className="text-sm sm:text-base font-black text-gray-900">
                  R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
            
            <div className="text-right">
              <div className={`text-[9px] sm:text-[10px] font-medium ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                {product.stock > 0 ? (product.stock <= 5 ? `Últimas ${product.stock}!` : 'Em estoque') : 'Esgotado'}
              </div>
            </div>
          </div>
          
          <div className="flex gap-1 mt-auto">
            <Button
              onClick={handleAddToCart}
              className="flex-1 bg-gradient-to-r from-uss-primary via-uss-primary-dark to-uss-primary hover:shadow-md hover:shadow-uss-primary/30 text-white font-bold text-[10px] sm:text-xs transition-all duration-300 py-1.5"
              disabled={product.stock <= 0}
            >
              <ShoppingCart className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5" />
              <span className="hidden sm:inline">{product.stock <= 0 ? 'Indisponível' : 'Adicionar'}</span>
              <span className="sm:hidden">+</span>
            </Button>
            <Button
              onClick={handleToggleFavorite}
              variant="outline"
              className="px-1.5 sm:px-2 hover:bg-red-50 hover:border-red-300 transition-all duration-300"
            >
              <Heart className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}


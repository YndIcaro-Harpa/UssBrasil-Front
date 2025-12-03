'use client'

export const runtime = 'edge'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, ShoppingCart, Star, Share2, Truck, Shield, CheckCircle, 
  ChevronLeft, ChevronRight, Package, CreditCard, Tag, Eye,
  Award, RotateCcw, Minus, Plus, MessageCircle
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import apiClient, { formatPrice } from '@/lib/api-client'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useModal } from '@/contexts/ModalContext'
import { toast } from 'sonner'

// Types
interface ColorVariation {
  name: string
  hexCode?: string
  images: string[]
}

interface Product {
  id: number
  name: string
  slug: string
  description?: string
  price: number
  discountPrice?: number
  stock: number
  images?: string[] | string
  colors?: string | ColorVariation[]
  sizes?: string | string[]
  storage?: string | string[]
  specifications?: string | Record<string, string>
  category?: { id: number; name: string }
  brand?: { id: number; name: string }
  featured?: boolean
  isPreOrder?: boolean
  sku?: string
}

// Animations
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as any }
}

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

// Components
function ProductGallery({ 
  images, 
  name, 
  colorVariations,
  selectedColor,
  onSelectColor 
}: { 
  images: string[]
  name: string
  colorVariations?: ColorVariation[]
  selectedColor?: string | null
  onSelectColor?: (color: string) => void
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  // Determinar quais imagens mostrar baseado na cor selecionada
  const getDisplayImages = () => {
    if (selectedColor && colorVariations && colorVariations.length > 0) {
      const colorVar = colorVariations.find(c => c.name === selectedColor)
      if (colorVar && colorVar.images.length > 0) {
        return colorVar.images
      }
    }
    return images.length > 0 ? images : ['/fallback-product.png']
  }

  const displayImages = getDisplayImages()

  // Reset index quando mudar de cor
  useEffect(() => {
    setSelectedIndex(0)
  }, [selectedColor])

  const nextImage = () => setSelectedIndex((prev) => (prev + 1) % displayImages.length)
  const prevImage = () => setSelectedIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length)

  return (
    <motion.div {...fadeInUp} className="sticky top-24 space-y-4">
      {/* Main Image */}
      <div 
        className="relative aspect-square max-w-xl mx-auto bg-white rounded-2xl overflow-hidden group cursor-zoom-in shadow-lg"
        onClick={() => setIsZoomed(!isZoomed)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: isZoomed ? 1.5 : 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="relative w-full h-full"
          >
            <Image
              src={displayImages[selectedIndex]}
              alt={`${name} - Imagem ${selectedIndex + 1}`}
              fill
              className="object-contain p-6"
              priority
              quality={95}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prevImage() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
            >
              <ChevronLeft className="h-6 w-6 text-gray-900" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
            >
              <ChevronRight className="h-6 w-6 text-gray-900" />
            </button>
          </>
        )}

        {/* Counter */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
            {selectedIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center">
          {displayImages.map((image, idx) => (
            <motion.button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all duration-300 ${
                idx === selectedIndex 
                  ? 'ring-2 ring-blue-400/10 shadow-lg shadow-blue-400/20' 
                  : ''
              }`}
            >
              <Image
                src={image}
                alt={`Thumbnail ${idx + 1}`}
                fill
                className="object-contain p-2"
                quality={90}
              />
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  )
}

function ProductInfo({ 
  product, 
  colorVariations,
  selectedColor,
  onSelectColor 
}: { 
  product: Product; 
  colorVariations?: ColorVariation[];
  selectedColor?: string | null;
  onSelectColor?: (color: string) => void;
}) {
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string | undefined>()
  const [selectedStorage, setSelectedStorage] = useState<string | undefined>()
  const { addToCart } = useCart()
  const { favorites, toggleFavorite, user } = useAuth()
  const { openAuthModal } = useModal()
  
  // Processar tamanhos
  const sizes: string[] = (() => {
    if (!product.sizes) return []
    if (typeof product.sizes === 'string') {
      try { return JSON.parse(product.sizes) } catch { return [] }
    }
    return product.sizes
  })()

  // Processar armazenamento
  const storageOptions: string[] = (() => {
    if (!product.storage) return []
    if (typeof product.storage === 'string') {
      try { return JSON.parse(product.storage) } catch { return [] }
    }
    return product.storage
  })()
  
  const isFavorite = favorites.includes(String(product.id))
  const discountPercentage = product.discountPrice 
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      image: product.images?.[0] || '/fallback-product.png',
      category: product.category?.name || 'Geral',
      brand: product.brand?.name || '',
      slug: product.slug,
      stock: product.stock || 10,
      quantity,
      selectedColor: selectedColor || undefined,
      selectedSize,
      selectedStorage
    })
    toast.success(`${quantity}x ${product.name} adicionado ao carrinho!`, {
      icon: '🛒'
    })
  }

  const handleToggleFavorite = () => {
    if (!user) {
      openAuthModal()
      return
    }
    toggleFavorite(String(product.id))
    toast.success(isFavorite ? 'Removido dos favoritos' : 'Adicionado aos favoritos', {
      icon: isFavorite ? '💔' : '❤️'
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copiado!', { icon: '📋' })
    }
  }

  return (
    <motion.div 
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      {/* Breadcrumb */}
      <motion.div variants={fadeInUp} className="flex items-center gap-2 text-sm">
        <Link href="/" className="text-gray-500 hover:text-blue-400 transition-colors">
          Home
        </Link>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <Link href="/produtos" className="text-gray-500 hover:text-blue-400 transition-colors">
          Produtos
        </Link>
        {product.category && (
          <>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 font-medium">{product.category.name}</span>
          </>
        )}
      </motion.div>

      {/* Badges */}
      <motion.div variants={fadeInUp} className="flex flex-wrap gap-2">
        {product.brand && (
          <Badge variant="outline" className="px-4 py-1.5 text-sm border-blue-200 text-blue-700">
            {product.brand.name}
          </Badge>
        )}
        {product.featured && (
          <Badge className="px-4 py-1.5 text-sm bg-blue-400 text-white border-0">
            <Star className="h-3 w-3 mr-1 fill-current" />
            Destaque
          </Badge>
        )}
        {product.stock > 0 && product.stock < 10 && (
          <Badge className="px-4 py-1.5 text-sm bg-amber-100 text-amber-900 border-amber-200">
            Últimas {product.stock} unidades
          </Badge>
        )}
      </motion.div>

      {/* Title */}
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
          {product.name}
        </h1>
        {product.description && (
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed">
            {product.description}
          </p>
        )}
      </motion.div>

      {/* Rating */}
      <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-3 sm:gap-6 pb-4 sm:pb-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-sm sm:text-base font-semibold text-gray-900">4.8</span>
        </div>
        <Separator orientation="vertical" className="h-5 sm:h-6 hidden sm:block" />
        <button className="text-sm sm:text-base text-gray-600 hover:text-blue-400 transition-colors flex items-center gap-2">
          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>324 avaliações</span>
        </button>
      </motion.div>

      {/* Price */}
      <motion.div variants={fadeInUp} className="bg-gray-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
        <div className="space-y-3 sm:space-y-4">
          {product.discountPrice ? (
            <>
              <div className="flex flex-wrap items-baseline gap-2 sm:gap-4">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-400">
                  {formatPrice(product.discountPrice)}
                </span>
                <Badge className="bg-red-500 text-white text-xs sm:text-sm lg:text-base px-2 sm:px-3 py-1">
                  -{discountPercentage}% OFF
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-base sm:text-lg lg:text-xl line-through text-gray-500">
                  {formatPrice(product.price)}
                </span>
                <span className="text-sm sm:text-base text-green-600 font-semibold">
                  Economize {formatPrice(product.price - product.discountPrice)}
                </span>
              </div>
            </>
          ) : (
            <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-400">
              {formatPrice(product.price)}
            </span>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-gray-700">
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
              <span className="text-xs sm:text-sm lg:text-base font-medium">Em até 12x sem juros</span>
            </div>
            <Separator orientation="vertical" className="h-5 hidden sm:block" />
            <div className="flex items-center gap-2 text-gray-700">
              <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              <span className="text-xs sm:text-sm lg:text-base font-medium">5% OFF no PIX</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stock */}
      <motion.div 
        variants={fadeInUp}
        className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl ${
          product.stock > 0 
            ? product.stock < 10 
              ? 'bg-amber-50 border border-amber-200' 
              : 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}
      >
        {product.stock > 0 ? (
          <>
            <CheckCircle className={`h-5 w-5 sm:h-6 sm:w-6 ${product.stock < 10 ? 'text-amber-600' : 'text-green-600'}`} />
            <span className={`text-sm sm:text-base font-semibold ${product.stock < 10 ? 'text-amber-900' : 'text-green-900'}`}>
              {product.stock < 10 
                ? `Apenas ${product.stock} unidades disponíveis` 
                : 'Disponível em estoque'
              }
            </span>
          </>
        ) : (
          <>
            <Package className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
            <span className="text-sm sm:text-base font-semibold text-red-900">Produto esgotado</span>
          </>
        )}
      </motion.div>

      {/* Variações de Cor */}
      {colorVariations && colorVariations.length > 0 && (
        <motion.div variants={fadeInUp} className="space-y-3">
          <label className="font-semibold text-gray-900 text-base sm:text-lg">Cor:</label>
          <div className="flex flex-wrap gap-3">
            {colorVariations.map((colorVar) => (
              <button
                key={colorVar.name}
                onClick={() => onSelectColor?.(colorVar.name)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all ${
                  selectedColor === colorVar.name
                    ? 'border-blue-400 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: colorVar.hexCode || '#ccc' }}
                />
                <span className={`text-sm font-medium ${
                  selectedColor === colorVar.name ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  {colorVar.name}
                </span>
                {colorVar.images.length > 0 && (
                  <span className="text-xs text-gray-400">
                    ({colorVar.images.length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tamanhos */}
      {sizes.length > 0 && (
        <motion.div variants={fadeInUp} className="space-y-3">
          <label className="font-semibold text-gray-900 text-base sm:text-lg">Tamanho:</label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2.5 rounded-xl border-2 font-medium transition-all ${
                  selectedSize === size
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Armazenamento */}
      {storageOptions.length > 0 && (
        <motion.div variants={fadeInUp} className="space-y-3">
          <label className="font-semibold text-gray-900 text-base sm:text-lg">Armazenamento:</label>
          <div className="flex flex-wrap gap-2">
            {storageOptions.map((storage) => (
              <button
                key={storage}
                onClick={() => setSelectedStorage(storage)}
                className={`px-4 py-2.5 rounded-xl border-2 font-medium transition-all ${
                  selectedStorage === storage
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {storage}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quantity & Actions */}
      <motion.div variants={fadeInUp} className="space-y-4 sm:space-y-5">
        {product.stock > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
            <label className="font-semibold text-gray-900 text-base sm:text-lg">Quantidade:</label>
            <div className="flex text-black items-center bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl overflow-hidden">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 hover:bg-gray-50"
              >
                <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <span className="w-14 sm:w-16 lg:w-20 text-center font-bold text-lg sm:text-xl">{quantity}</span>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
                className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 hover:bg-gray-50"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
            <span className="text-sm sm:text-base text-gray-600">
              {product.stock} disponíveis
            </span>
          </div>
        )}

        <div className="flex gap-2 sm:gap-3 lg:gap-4">
          {product.isPreOrder ? (
            <Button 
              asChild
              size="lg"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-12 sm:h-14 lg:h-16 text-sm sm:text-base lg:text-lg rounded-xl sm:rounded-2xl shadow-lg transition-all duration-300"
            >
              <a
                href={`https://wa.me/5548991832760?text=${encodeURIComponent(
                  `🛒 *USS Brasil Tecnologia*\n\nOlá! Vim do site e gostaria de saber mais sobre:\n\n📱 *${product.name}*\n💰 Preço visto: ${formatPrice(product.discountPrice || product.price)}\n\nEsse modelo está disponível?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-2 sm:mr-3" />
                <span className="hidden sm:inline">Falar no WhatsApp</span>
                <span className="sm:hidden">WhatsApp</span>
              </a>
            </Button>
          ) : (
            <Button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              size="lg"
              className="flex-1 bg-blue-400 hover:bg-blue-500 text-white font-bold h-12 sm:h-14 lg:h-16 text-sm sm:text-base lg:text-lg rounded-xl sm:rounded-2xl shadow-lg transition-all duration-300"
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-2 sm:mr-3" />
              <span className="hidden sm:inline">{product.stock === 0 ? 'Produto Esgotado' : 'Adicionar ao Carrinho'}</span>
              <span className="sm:hidden">{product.stock === 0 ? 'Esgotado' : 'Adicionar'}</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="lg"
            onClick={handleToggleFavorite}
            className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 border-2 rounded-xl sm:rounded-2xl hover:border-red-300 hover:bg-red-50 transition-all duration-300"
          >
            <Heart className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={handleShare}
            className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 border-2 rounded-xl sm:rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
          >
            <Share2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-gray-500" />
          </Button>
        </div>
      </motion.div>

      {/* Benefits */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 pt-4 sm:pt-6 lg:pt-8 border-t border-gray-200">
        {[
          { icon: Truck, title: 'Entrega Rápida', desc: 'Em até 2 dias úteis', color: 'blue' },
          { icon: Shield, title: 'Garantia', desc: '12 meses', color: 'green' },
          { icon: RotateCcw, title: 'Troca Grátis', desc: '7 dias', color: 'purple' },
          { icon: Award, title: 'Qualidade Premium', desc: 'Certificado', color: 'amber' }
        ].map((benefit, idx) => (
          <div key={idx} className="flex items-start gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-3 lg:p-4 rounded-xl sm:rounded-2xl hover:bg-gray-50 transition-colors">
            <div className={`bg-${benefit.color}-100 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl`}>
              <benefit.icon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-${benefit.color}-600`} />
            </div>
            <div>
              <div className="text-xs sm:text-sm lg:text-base font-semibold text-gray-900">{benefit.title}</div>
              <div className="text-xs sm:text-sm text-gray-600">{benefit.desc}</div>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}

export default function ProdutoPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const data = await apiClient.getProductBySlug(slug)
        setProduct(data)

        // Definir cor inicial se houver variações
        if (data?.colors) {
          try {
            const colors = typeof data.colors === 'string' ? JSON.parse(data.colors) : data.colors
            if (Array.isArray(colors) && colors.length > 0) {
              setSelectedColor(colors[0].name)
            }
          } catch {}
        }

        if (data?.category?.id) {
          const related = await apiClient.getProducts({
            categoryId: data.category.id,
            limit: 4
          })
          setRelatedProducts(related.filter((p: Product) => p.id !== data.id))
        }
      } catch (error) {
        console.error('Erro ao buscar produto:', error)
        toast.error('Erro ao carregar produto')
      } finally {
        setLoading(false)
      }
    }

    if (slug) fetchProduct()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-16 w-16 border-4 border-blue-400 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-20">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Produto não encontrado</h1>
          <Link href="/produtos">
            <Button size="lg" className="rounded-full bg-blue-400 hover:bg-blue-500">Ver Produtos</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Processar imagens corretamente
  const processImages = () => {
    if (!product.images) return ['/fallback-product.png']
    
    if (typeof product.images === 'string') {
      try {
        const parsed = JSON.parse(product.images)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch {
        const imageArray = product.images.split(',').map(img => img.trim()).filter(Boolean)
        return imageArray.length > 0 ? imageArray : ['/fallback-product.png']
      }
    }
    
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images
    }
    
    return ['/fallback-product.png']
  }

  // Processar variações de cor
  const processColorVariations = (): ColorVariation[] => {
    if (!product.colors) return []
    
    if (typeof product.colors === 'string') {
      try {
        const parsed = JSON.parse(product.colors)
        if (Array.isArray(parsed)) return parsed
      } catch {
        return []
      }
    }
    
    if (Array.isArray(product.colors)) {
      return product.colors
    }
    
    return []
  }

  const images = processImages()
  const colorVariations = processColorVariations()

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8 lg:py-12 pt-24 sm:pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-12 mb-8 sm:mb-12 lg:mb-16 xl:mb-24">
          <ProductGallery 
            images={images} 
            name={product.name}
            colorVariations={colorVariations}
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
          />
          <ProductInfo 
            product={product} 
            colorVariations={colorVariations}
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
          />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="pt-8 sm:pt-12 lg:pt-16 border-t border-gray-200"
          >
            <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8 xl:mb-12 text-center">
              Você também pode gostar
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {relatedProducts.map((relatedProduct, idx) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link href={`/produto/${relatedProduct.slug}`}>
                    <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-500">
                      <div className="relative aspect-square bg-gray-50 overflow-hidden">
                        <Image
                          src={typeof relatedProduct.images === 'string' 
                            ? relatedProduct.images.split(',')[0]?.trim() || '/fallback-product.png'
                            : relatedProduct.images?.[0] || '/fallback-product.png'}
                          alt={relatedProduct.name}
                          fill
                          className="object-contain p-4 group-hover:scale-110 transition-transform duration-700"
                          quality={90}
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        />
                      </div>
                      <div className="p-4 sm:p-5">
                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2 mb-2 sm:mb-3">
                          {relatedProduct.name}
                        </h3>
                        <div className="text-lg sm:text-xl font-bold text-blue-400">
                          {formatPrice(relatedProduct.discountPrice || relatedProduct.price)}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

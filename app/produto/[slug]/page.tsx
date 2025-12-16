'use client'

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
  images: string | string[]
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
  quantity?: number
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

  // Debug log
  console.log('ProductGallery - colorVariations:', colorVariations)
  console.log('ProductGallery - selectedColor:', selectedColor)

  // Determinar quais imagens mostrar baseado na cor selecionada
  const displayImages = (() => {
    if (selectedColor && colorVariations && colorVariations.length > 0) {
      const colorVar = colorVariations.find(c => c.name === selectedColor)
      console.log('ProductGallery - colorVar encontrado:', colorVar)
      
      if (colorVar && colorVar.images) {
        // Processar imagens da variação de cor
        let colorImages: string[] = []
        
        if (typeof colorVar.images === 'string') {
          // Se images for uma string, tentar fazer parse ou split
          try {
            colorImages = JSON.parse(colorVar.images)
          } catch {
            colorImages = colorVar.images.split(',').map(img => img.trim()).filter(Boolean)
          }
        } else if (Array.isArray(colorVar.images)) {
          colorImages = colorVar.images.map(img => {
            if (typeof img === 'string') return img.trim()
            return img
          }).filter(Boolean)
        }
        
        console.log('ProductGallery - colorImages processadas:', colorImages)
        if (colorImages.length > 0) return colorImages
      }
    }
    return images.length > 0 ? images : ['/fallback-product.png']
  })()

  // Reset index quando mudar de cor
  useEffect(() => {
    setSelectedIndex(0)
  }, [selectedColor])

  const nextImage = () => setSelectedIndex((prev) => (prev + 1) % displayImages.length)
  const prevImage = () => setSelectedIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length)

  return (
    <motion.div {...fadeInUp} className="sticky top-20 space-y-3">
      {/* Main Image */}
      <div 
        className="relative aspect-square max-w-md mx-auto bg-white rounded-xl overflow-hidden group cursor-zoom-in shadow-md"
        onClick={() => setIsZoomed(!isZoomed)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedColor}-${selectedIndex}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: isZoomed ? 1.5 : 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full"
          >
            <Image
              src={displayImages[selectedIndex]}
              alt={`${name}${selectedColor ? ` - ${selectedColor}` : ''} - Imagem ${selectedIndex + 1}`}
              fill
              className="object-contain p-6"
              priority
              quality={95}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
            />
          </motion.div>
        </AnimatePresence>

        {/* Selected Color Badge */}
        {selectedColor && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
            {selectedColor}
          </div>
        )}

        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <div className="navigation-arrows">
            <button
              onClick={(e) => { e.stopPropagation(); prevImage() }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              <ChevronLeft className="h-5 w-5 text-gray-900" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage() }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              <ChevronRight className="h-5 w-5 text-gray-900" />
            </button>
          </div>
        )}

        {/* Counter */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
            {selectedIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide justify-center">
          {displayImages.map((image, idx) => (
            <motion.button
              key={`${selectedColor}-${idx}`}
              onClick={() => setSelectedIndex(idx)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all duration-300 ${
                idx === selectedIndex 
                  ? 'ring-2 ring-blue-400 shadow-md' 
                  : 'border border-gray-200'
              }`}
            >
              <Image
                src={image}
                alt={`Thumbnail ${idx + 1}`}
                fill
                className="object-contain p-1"
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
    addToCart(product, quantity)
    toast.success(`${quantity}x ${product.name} adicionado ao carrinho!`)
  }

  const handleToggleFavorite = () => {
    if (!user) {
      openAuthModal()
      return
    }
    toggleFavorite(String(product.id))
    toast.success(isFavorite ? 'Removido dos favoritos' : 'Adicionado aos favoritos')
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
      toast.success('Link copiado!')
    }
  }

  return (
    <motion.div 
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-4"
    >
      {/* Breadcrumb */}
      <motion.div variants={fadeInUp} className="flex items-center gap-1.5 text-xs">
        <Link href="/" className="text-gray-500 hover:text-blue-500 transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3 w-3 text-gray-400" />
        <Link href="/produtos" className="text-gray-500 hover:text-blue-500 transition-colors">
          Produtos
        </Link>
        {product.category && (
          <span className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3 text-gray-400" />
            <span className="text-gray-900 font-medium">{product.category.name}</span>
          </span>
        )}
      </motion.div>

      {/* Badges */}
      <motion.div variants={fadeInUp} className="flex flex-wrap gap-1.5">
        {product.brand && (
          <Badge variant="outline" className="px-2.5 py-1 text-xs border-blue-200 text-blue-700">
            {product.brand.name}
          </Badge>
        )}
        {product.featured && (
          <Badge className="px-2.5 py-1 text-xs bg-blue-500 text-white border-0">
            <Star className="h-3 w-3 mr-1 fill-current" />
            Destaque
          </Badge>
        )}
        {product.stock > 0 && product.stock < 10 && (
          <Badge className="px-2.5 py-1 text-xs bg-amber-100 text-amber-900 border-amber-200">
            Últimas {product.stock} un.
          </Badge>
        )}
      </motion.div>

      {/* Title */}
      <motion.div variants={fadeInUp}>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">
          {product.name}
        </h1>
        {product.description && (
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed line-clamp-3">
            {product.description}
          </p>
        )}
      </motion.div>

      {/* Rating */}
      <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-2 sm:gap-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-xs font-semibold text-gray-900">4.8</span>
        </div>
        <Separator orientation="vertical" className="h-4 hidden sm:block" />
        <button className="text-xs text-gray-600 hover:text-blue-500 transition-colors flex items-center gap-1">
          <Eye className="h-3 w-3" />
          <span>324 avaliações</span>
        </button>
      </motion.div>

      {/* Price */}
      <motion.div variants={fadeInUp} className="bg-gray-50 rounded-xl p-3 sm:p-4">
        <div className="space-y-2">
          {product.discountPrice ? (
            <>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-blue-500">
                  {formatPrice(product.discountPrice)}
                </span>
                <Badge className="bg-red-500 text-white text-xs px-2 py-0.5">
                  -{discountPercentage}%
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm line-through text-gray-500">
                  {formatPrice(product.price)}
                </span>
                <span className="text-xs text-green-600 font-semibold">
                  Economize {formatPrice(product.price - product.discountPrice)}
                </span>
              </div>
            </>
          ) : (
            <span className="text-2xl sm:text-3xl font-bold text-blue-500">
              {formatPrice(product.price)}
            </span>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-200">
            <div className="flex items-center gap-1.5 text-gray-700">
              <CreditCard className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs font-medium">12x sem juros</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-700">
              <Tag className="h-3.5 w-3.5 text-green-600" />
              <span className="text-xs font-medium">5% PIX</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stock */}
      <motion.div 
        variants={fadeInUp}
        className={`flex items-center justify-between gap-2 p-2.5 rounded-lg ${
          product.stock > 0 
            ? product.stock < 10 
              ? 'bg-amber-50 border border-amber-200' 
              : 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}
      >
        {product.stock > 0 ? (
          <div className="flex items-center gap-2">
            <CheckCircle className={`h-4 w-4 ${product.stock < 10 ? 'text-amber-600' : 'text-green-600'}`} />
            <span className={`text-xs font-semibold ${product.stock < 10 ? 'text-amber-900' : 'text-green-900'}`}>
              {product.stock < 10 
                ? `Últimas ${product.stock} un.` 
                : 'Em estoque'
              }
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-red-600" />
              <span className="text-xs font-semibold text-red-900">Indisponível</span>
            </div>
            <a
              href={`https://wa.me/5548991832760?text=${encodeURIComponent(
                `*USS Brasil*\n\nOlá! Vi o produto *${product.name}* no site mas está indisponível.\n\nQuando terá novamente em estoque?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Avise-me
            </a>
          </div>
        )}
      </motion.div>

      {/* Variações de Cor */}
      {colorVariations && colorVariations.length > 0 && (
        <motion.div variants={fadeInUp} className="space-y-3">
          <label className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            Cor: 
            {selectedColor && (
              <span className="font-normal text-gray-600">{selectedColor}</span>
            )}
          </label>
          <div className="flex flex-wrap gap-3">
            {colorVariations.map((colorVar) => (
              <button
                key={colorVar.name}
                onClick={() => onSelectColor?.(colorVar.name)}
                title={colorVar.name}
                className={`w-10 h-10 rounded-full border-2 border-black transition-all ${
                  selectedColor === colorVar.name
                    ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: colorVar.hexCode || '#ccc' }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Tamanhos */}
      {sizes.length > 0 && (
        <motion.div variants={fadeInUp} className="space-y-2">
          <label className="font-semibold text-gray-900 text-sm">Tamanho:</label>
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
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
        <motion.div variants={fadeInUp} className="space-y-2">
          <label className="font-semibold text-gray-900 text-sm">Armazenamento:</label>
          <div className="flex flex-wrap gap-1.5">
            {storageOptions.map((storage) => (
              <button
                key={storage}
                onClick={() => setSelectedStorage(storage)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
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
      <motion.div variants={fadeInUp} className="space-y-3">
        {product.stock > 0 && (
          <div className="flex items-center gap-3">
            <label className="font-semibold text-gray-900 text-sm">Qtd:</label>
            <div className="flex text-black items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="h-8 w-8 hover:bg-gray-50"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="w-10 text-center font-bold text-sm">{quantity}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
                className="h-8 w-8 hover:bg-gray-50"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            <span className="text-xs text-gray-500">{product.stock} disp.</span>
          </div>
        )}

        <div className="flex gap-2">
          {product.isPreOrder || product.stock === 0 ? (
            <Button 
              asChild
              size="default"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold h-10 text-sm rounded-lg shadow-md"
            >
              <a
                href={`https://wa.me/5548991832760?text=${encodeURIComponent(
                  `*USS Brasil*\n\nOlá! ${product.stock === 0 ? 'Vi que o produto está indisponível' : 'Vim do site'}.\n\n*${product.name}*\nPreço: ${formatPrice(product.discountPrice || product.price)}\n\n${product.stock === 0 ? 'Quando terá disponível?' : 'Está disponível?'}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {product.stock === 0 ? 'Consultar Disponibilidade' : 'Falar no WhatsApp'}
              </a>
            </Button>
          ) : (
            <Button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              size="default"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold h-10 text-sm rounded-lg shadow-md"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Adicionar ao Carrinho
            </Button>
          )}

          <Button
            variant="outline"
            size="default"
            onClick={handleToggleFavorite}
            className="h-10 w-10 border rounded-lg hover:border-red-300 hover:bg-red-50"
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
          </Button>

          <Button
            variant="outline"
            size="default"
            onClick={handleShare}
            className="h-10 w-10 border rounded-lg hover:border-blue-300 hover:bg-blue-50"
          >
            <Share2 className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </motion.div>

      {/* Benefits */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-200">
        {[
          { icon: Truck, title: 'Entrega Rápida', desc: '2 dias úteis', color: 'blue' },
          { icon: Shield, title: 'Garantia', desc: '12 meses', color: 'green' },
          { icon: RotateCcw, title: 'Troca Grátis', desc: '7 dias', color: 'purple' },
          { icon: Award, title: 'Premium', desc: 'Certificado', color: 'amber' }
        ].map((benefit, idx) => (
          <div key={idx} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className={`bg-${benefit.color}-100 p-1.5 rounded-md`}>
              <benefit.icon className={`h-3.5 w-3.5 text-${benefit.color}-600`} />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-900">{benefit.title}</div>
              <div className="text-[10px] text-gray-500">{benefit.desc}</div>
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
              // Se for array de strings, pegar o primeiro elemento diretamente
              // Se for array de objetos, pegar o name do primeiro
              const firstColor = typeof colors[0] === 'string' ? colors[0] : colors[0].name
              setSelectedColor(firstColor)
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

  // Mapeamento de nomes de cores para códigos hex
  const colorNameToHex: Record<string, string> = {
    // Básicas
    'preto': '#000000',
    'black': '#000000',
    'branco': '#FFFFFF',
    'white': '#FFFFFF',
    'cinza': '#808080',
    'gray': '#808080',
    'grey': '#808080',
    'prata': '#C0C0C0',
    'silver': '#C0C0C0',
    'grafite': '#41424C',
    'graphite': '#41424C',
    
    // Azuis
    'azul': '#007AFF',
    'blue': '#007AFF',
    'azul claro': '#5AC8FA',
    'azul escuro': '#001F5C',
    'azul marinho': '#001F5C',
    'navy': '#001F5C',
    'azul titânio': '#394867',
    'blue titanium': '#394867',
    
    // Verdes
    'verde': '#34C759',
    'green': '#34C759',
    'verde menta': '#98FF98',
    'mint': '#98FF98',
    'verde escuro': '#006400',
    
    // Rosas e Roxos
    'rosa': '#FF2D55',
    'pink': '#FF2D55',
    'rose': '#FFB6C1',
    'roxo': '#AF52DE',
    'purple': '#AF52DE',
    'lilás': '#C8A2C8',
    
    // Amarelos e Laranjas
    'amarelo': '#FFCC00',
    'yellow': '#FFCC00',
    'dourado': '#FFD700',
    'gold': '#FFD700',
    'laranja': '#FF9500',
    'orange': '#FF9500',
    
    // Vermelhos
    'vermelho': '#FF3B30',
    'red': '#FF3B30',
    'product red': '#FF0000',
    
    // Cores Apple específicas
    'meia-noite': '#1C1C1E',
    'midnight': '#1C1C1E',
    'estelar': '#F5F5F0',
    'starlight': '#F5F5F0',
    'titânio natural': '#B8B8B8',
    'natural titanium': '#B8B8B8',
    'titânio preto': '#3C3C3C',
    'black titanium': '#3C3C3C',
    'titânio branco': '#F5F5F5',
    'white titanium': '#F5F5F5',
    'titânio deserto': '#C4A77D',
    'desert titanium': '#C4A77D',
    'coral': '#FF7F50',
    'lavanda': '#E6E6FA',
    'lavender': '#E6E6FA',
    
    // Samsung/Android
    'phantom black': '#1C1C1C',
    'cream': '#FFFDD0',
    'burgundy': '#800020',
  }

  // Processar variações de cor
  const processColorVariations = (): ColorVariation[] => {
    if (!product.colors) return []
    
    console.log('processColorVariations - product.colors raw:', product.colors)
    
    let colorsArray: any[] = []
    
    if (typeof product.colors === 'string') {
      try {
        colorsArray = JSON.parse(product.colors)
      } catch {
        console.log('Erro ao fazer parse de colors')
        return []
      }
    } else if (Array.isArray(product.colors)) {
      colorsArray = product.colors
    }
    
    if (!Array.isArray(colorsArray)) return []
    
    // Processar cada cor
    const processed = colorsArray.map((color: any) => {
      // Se for apenas uma string (nome da cor)
      if (typeof color === 'string') {
        const colorLower = color.toLowerCase().trim()
        return {
          name: color,
          hexCode: colorNameToHex[colorLower] || '#ccc',
          images: [] as string[]
        }
      }
      
      // Se for um objeto com propriedades
      let images: string[] = []
      if (color.images) {
        if (typeof color.images === 'string') {
          try {
            images = JSON.parse(color.images)
          } catch {
            images = color.images.split(',').map((img: string) => img.trim()).filter(Boolean)
          }
        } else if (Array.isArray(color.images)) {
          images = color.images
        }
      }
      
      const colorName = color.name || color.color || ''
      const colorLower = colorName.toLowerCase().trim()
      
      return {
        name: colorName,
        hexCode: color.hexCode || color.hex || color.code || colorNameToHex[colorLower] || '#ccc',
        images: images
      }
    }).filter((c: ColorVariation) => c.name)
    
    console.log('processColorVariations - processed:', processed)
    return processed
  }

  const images = processImages()
  const colorVariations = processColorVariations()

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-5 pt-20 sm:pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-10">
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="pt-6 border-t border-gray-200"
          >
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 text-center">
              Você também pode gostar
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              {relatedProducts.map((relatedProduct, idx) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link href={`/produto/${relatedProduct.slug}`}>
                    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
                      <div className="relative aspect-square bg-gray-50 overflow-hidden">
                        <Image
                          src={typeof relatedProduct.images === 'string' 
                            ? relatedProduct.images.split(',')[0]?.trim() || '/fallback-product.png'
                            : relatedProduct.images?.[0] || '/fallback-product.png'}
                          alt={relatedProduct.name}
                          fill
                          className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                          quality={90}
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      </div>
                      <div className="p-2.5">
                        <h3 className="font-medium text-xs text-gray-900 line-clamp-2 mb-1">
                          {relatedProduct.name}
                        </h3>
                        <div className="text-sm font-bold text-blue-500">
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
